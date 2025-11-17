import { db } from "../db";
import { agentTable } from "../db/agent";
import { Agent, AgentKeyPair } from "../../../lib/types/agent";
import { sql } from "drizzle-orm";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { UserRuntime } from "./user";
import { projectTable } from "../db/project";

export default class AgentRuntime {
    private async generateToken(): Promise<{ value: string; hash: string }> {
        const value = randomBytes(32).toString("base64url");
        const hash = await bcrypt.hash(value, 10);
        return { value, hash };
    }

    private verifyKeyHash(key: string, hash: string) {
        return bcrypt.compare(key, hash);
    }

    private _redactedAgent(agent: Agent): Agent {
        return {
            ...agent,
            accessKeyHash: "",
            refreshKeyHash: "",
        };
    }

    async getAllAgents() {
        const agents = (await db.select().from(agentTable)) as Agent[];
        return agents.map((a) => this._redactedAgent(a));
    }

    async getAgentById(agentId: string) {
        const agent = (await db
            .select()
            .from(agentTable)
            .where(sql`${agentTable.id} = ${agentId}`)
            .then((res) => res[0])) as Agent | undefined;
        if (!agent) {
            throw "Agent not found";
        } else {
            return this._redactedAgent(agent);
        }
    }

    async getAgentByProjectId(projectId: string) {
        const agents = (await db
            .select()
            .from(agentTable)
            .where(
                sql`${agentTable.projectIDs} @> ARRAY[${projectId}]`,
            )) as Agent[];
        return agents.map((a) => this._redactedAgent(a));
    }

    async newAgent(name: string, userId: string) {
        const user = new UserRuntime();
        const isCreatorAdmin = await user.isUserAdmin(userId);
        if (!isCreatorAdmin) throw "Only admin users can create agents";
        if (!name || name.trim() === "") throw "Agent name cannot be empty";

        const now = new Date();
        const { value: accessKey, hash: accessKeyHash } =
            await this.generateToken();
        const { value: refreshKey, hash: refreshKeyHash } =
            await this.generateToken();
        const accessKeyExpiresAt = new Date(now.getTime() + 15 * 60 * 1000);
        const refreshKeyExpiresAt = new Date(
            now.getTime() + 3 * 24 * 60 * 60 * 1000,
        );

        try {
            const createdAgent = (await db
                .insert(agentTable)
                .values({
                    name,
                    status: "pending",
                    lastSeen: new Date(0),
                    createdAt: now,
                    updatedAt: now,
                    projectIDs: [],
                    taskIDs: [],
                    creatorID: userId,
                    accessKeyHash,
                    refreshKeyHash,
                    accessKeyExpiresAt,
                    refreshKeyExpiresAt,
                    revoked: false,
                })
                .returning()
                .then((res) => res[0])) as Agent;
            if (!createdAgent) throw "Failed to create new agent";
            return {
                agentId: createdAgent.id,
                accessToken: accessKey,
                refreshToken: refreshKey,
                accessKeyExpiresAt,
                refreshKeyExpiresAt,
            };
        } catch (e) {
            // @ts-ignore
            if (e.cause?.code === "23505") {
                throw "Agent name already exists";
            }
            throw "Failed to create new agent";
        }
    }

    async bindAgentToProject(
        userId: string,
        agentId: string,
        projectId: string,
    ) {
        const user = new UserRuntime();
        const isCreatorAdmin = await user.isUserAdmin(userId);
        if (!isCreatorAdmin) throw "Only admin users can create agents";

        const agent = (await db
            .select()
            .from(agentTable)
            .where(sql`${agentTable.id} = ${agentId}`)
            .then((res) => res[0])) as Agent | undefined;

        if (!agent) throw "Agent not found";

        const project = (await db
            .select()
            .from(projectTable)
            .where(sql`id = ${projectId}`)
            .then((res) => res[0])) as { id: string } | undefined;

        if (!project) throw "Project not found";

        if (agent.projectIDs.includes(projectId)) {
            throw "Agent already bound to this project";
        }

        const updatedProjectIDs = [...agent.projectIDs, projectId];

        try {
            const updated = (await db
                .update(agentTable)
                .set({
                    projectIDs: updatedProjectIDs,
                    updatedAt: new Date(),
                })
                .where(sql`${agentTable.id} = ${agentId}`)
                .returning()
                .then((res) => res[0])) as Agent;

            return this._redactedAgent(updated);
        } catch {
            throw "Failed to bind agent to project";
        }
    }

    async agentLogin(
        agentId: string,
        accessKey: string,
        ipAddress: string,
        os: string,
        arch: string,
        version: string,
    ) {
        const agent = (await db
            .select()
            .from(agentTable)
            .where(sql`${agentTable.id} = ${agentId}`)
            .then((res) => res[0])) as Agent | undefined;

        if (!agent) throw "Agent not found";
        if (agent.revoked) throw "Agent revoked";

        const now = new Date();
        if (agent.accessKeyExpiresAt <= now) throw "Access key expired";

        const isKeyValid = await this.verifyKeyHash(
            accessKey,
            agent.accessKeyHash,
        );
        if (!isKeyValid) throw "Invalid access key";

        try {
            const updated = (await db
                .update(agentTable)
                .set({
                    ipAddress,
                    os,
                    arch,
                    version,
                    lastSeen: now,
                    status: "online",
                    updatedAt: now,
                })
                .where(sql`${agentTable.id} = ${agentId}`)
                .returning()
                .then((res) => res[0])) as Agent;
            return this._redactedAgent(updated);
        } catch {
            throw "Failed to login agent";
        }
    }

    async refreshAgentAccessToken(
        agentId: string,
        refreshKey: string,
    ): Promise<AgentKeyPair> {
        const agent = (await db
            .select()
            .from(agentTable)
            .where(sql`${agentTable.id} = ${agentId}`)
            .then((res) => res[0])) as Agent | undefined;

        if (!agent) throw "Agent not found";
        if (agent.revoked) throw "Agent revoked";

        const now = new Date();

        const isRefreshKeyValid = await this.verifyKeyHash(
            refreshKey,
            agent.refreshKeyHash,
        );
        if (!isRefreshKeyValid) throw "Invalid refresh key";

        const GRACE_MS = 5 * 60 * 1000;
        const expired = agent.refreshKeyExpiresAt <= now;
        if (
            expired &&
            now.getTime() - agent.refreshKeyExpiresAt.getTime() > GRACE_MS
        ) {
            throw "Refresh key expired";
        }

        const { value: newAccessKey, hash: newAccessKeyHash } =
            await this.generateToken();
        const { value: newRefreshKey, hash: newRefreshKeyHash } =
            await this.generateToken();
        const newAccessKeyExpiresAt = new Date(now.getTime() + 15 * 60 * 1000);
        const newRefreshKeyExpiresAt = new Date(
            now.getTime() + 3 * 24 * 60 * 60 * 1000,
        );

        try {
            const updatedAgent = (await db
                .update(agentTable)
                .set({
                    accessKeyHash: newAccessKeyHash,
                    refreshKeyHash: newRefreshKeyHash,
                    accessKeyExpiresAt: newAccessKeyExpiresAt,
                    refreshKeyExpiresAt: newRefreshKeyExpiresAt,
                    updatedAt: now,
                })
                .where(sql`${agentTable.id} = ${agentId}`)
                .returning()
                .then((res) => res[0])) as Agent;

            return {
                agentId: updatedAgent.id,
                accessToken: newAccessKey,
                refreshToken: newRefreshKey,
                accessKeyExpiresAt: newAccessKeyExpiresAt,
                refreshKeyExpiresAt: newRefreshKeyExpiresAt,
            };
        } catch {
            throw "Failed to refresh tokens";
        }
    }

    async revokeAgent(agentId: string, userId: string) {
        const user = new UserRuntime();
        const isUserAdmin = await user.isUserAdmin(userId);
        if (!isUserAdmin) throw "Only admin users can revoke agents";

        const now = new Date();
        try {
            const updated = (await db
                .update(agentTable)
                .set({
                    revoked: true,
                    status: "offline",
                    updatedAt: now,
                })
                .where(sql`${agentTable.id} = ${agentId}`)
                .returning()
                .then((res) => res[0])) as Agent;

            return this._redactedAgent(updated);
        } catch {
            throw "Failed to revoke agent";
        }
    }

    async deleteAgent(agentId: string, userId: string) {
        const user = new UserRuntime();
        const isUserAdmin = await user.isUserAdmin(userId);
        if (!isUserAdmin) throw "Only admin users can delete agents";

        try {
            await db
                .delete(agentTable)
                .where(sql`${agentTable.id} = ${agentId}`);
            return;
        } catch {
            throw "Failed to delete agent";
        }
    }
}
