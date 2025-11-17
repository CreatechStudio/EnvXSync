import base64 from "base-64";
import { Elysia, status, t } from "elysia";
import AgentRuntime from "../runtime/agent";
import PermissionRuntime from "../runtime/permission";
import { ApiResponse } from "../../../lib/types/api";
import { Agent, AgentKeyPair } from "../../../lib/types/agent";

export const AgentRoute = new Elysia()
    .decorate("agent", new AgentRuntime())
    .group("agent", (app) =>
        app
            .post(
                "client/login",
                async ({ agent, body }) => {
                    try {
                        const loginResult = await agent.agentLogin(
                            body.agentId,
                            body.accessKey,
                            body.ipAddress,
                            body.os,
                            body.arch,
                            body.version,
                        );
                        return {
                            success: true,
                            data: loginResult,
                        } as ApiResponse<Agent>;
                    } catch (e) {
                        return {
                            success: false,
                            error: e,
                        } as ApiResponse;
                    }
                },
                {
                    body: t.Object({
                        agentId: t.String(),
                        accessKey: t.String(),
                        ipAddress: t.String(),
                        os: t.String(),
                        arch: t.String(),
                        version: t.String(),
                    }),
                },
            )
            .post(
                "client/refresh",
                async ({ agent, body }) => {
                    try {
                        const refreshResult =
                            await agent.refreshAgentAccessToken(
                                body.agentId,
                                body.refreshKey,
                            );
                        return {
                            success: true,
                            data: refreshResult,
                        } as ApiResponse<AgentKeyPair>;
                    } catch (e) {
                        return {
                            success: false,
                            error: e,
                        } as ApiResponse;
                    }
                },
                {
                    body: t.Object({
                        agentId: t.String(),
                        refreshKey: t.String(),
                    }),
                },
            )
            .guard(
                {
                    async beforeHandle({ cookie: { auth } }) {
                        if (auth) {
                            try {
                                let permissionRuntime = new PermissionRuntime();
                                if (
                                    await permissionRuntime.verifyJWT(
                                        auth.toString() || "",
                                    )
                                ) {
                                    return;
                                } else {
                                    return status(401, "Unauthorized");
                                }
                            } catch (e) {
                                return {
                                    success: false,
                                    error: e,
                                };
                            }
                        } else {
                            return status(401, "Unauthorized");
                        }
                    },
                },
                (app) =>
                    app
                        .get("admin/fetch/all", async ({ agent }) => {
                            try {
                                const agents = await agent.getAllAgents();
                                return {
                                    success: true,
                                    data: agents,
                                } as ApiResponse<Agent[]>;
                            } catch (e) {
                                return {
                                    success: false,
                                    error: e,
                                } as ApiResponse;
                            }
                        })
                        .get("admin/fetch/:id", async ({ agent, params }) => {
                            try {
                                const agentDetail = await agent.getAgentById(
                                    params.id,
                                );
                                return {
                                    success: true,
                                    data: agentDetail,
                                } as ApiResponse<Agent>;
                            } catch (e) {
                                return {
                                    success: false,
                                    error: e,
                                } as ApiResponse;
                            }
                        })
                        .get(
                            "admin/fetch/project/:projectId",
                            async ({ agent, params }) => {
                                try {
                                    const agents =
                                        await agent.getAgentByProjectId(
                                            params.projectId,
                                        );
                                    return {
                                        success: true,
                                        data: agents,
                                    } as ApiResponse<Agent[]>;
                                } catch (e) {
                                    return {
                                        success: false,
                                        error: e,
                                    } as ApiResponse;
                                }
                            },
                        )
                        .post(
                            "admin/create",
                            async ({ agent, body, cookie: { auth } }) => {
                                try {
                                    const decodedId: string = JSON.parse(
                                        base64.decode(
                                            auth.toString().split(".")[1],
                                        ),
                                    ).id;
                                    const keypair = await agent.newAgent(
                                        body.name,
                                        decodedId,
                                    );
                                    return {
                                        success: true,
                                        data: keypair,
                                    } as ApiResponse<AgentKeyPair>;
                                } catch (e) {
                                    return {
                                        success: false,
                                        error: e,
                                    } as ApiResponse;
                                }
                            },
                            {
                                body: t.Object({
                                    name: t.String(),
                                }),
                            },
                        )
                        .post(
                            "admin/bind",
                            async ({ agent, body, cookie: { auth } }) => {
                                try {
                                    const decodedId: string = JSON.parse(
                                        base64.decode(
                                            auth.toString().split(".")[1],
                                        ),
                                    ).id;
                                    const boundAgent =
                                        await agent.bindAgentToProject(
                                            decodedId,
                                            body.agentId,
                                            body.projectId,
                                        );
                                    return {
                                        success: true,
                                        data: boundAgent,
                                    } as ApiResponse<Agent>;
                                } catch (e) {
                                    return {
                                        success: false,
                                        error: e,
                                    } as ApiResponse;
                                }
                            },
                            {
                                body: t.Object({
                                    agentId: t.String(),
                                    projectId: t.String(),
                                }),
                            },
                        )
                        .post(
                            "admin/revoke",
                            async ({ agent, body, cookie: { auth } }) => {
                                try {
                                    const decodedId: string = JSON.parse(
                                        base64.decode(
                                            auth.toString().split(".")[1],
                                        ),
                                    ).id;
                                    const revokedAgent =
                                        await agent.revokeAgent(
                                            body.agentId,
                                            decodedId,
                                        );
                                    return {
                                        success: true,
                                        data: revokedAgent,
                                    } as ApiResponse<Agent>;
                                } catch (e) {
                                    return {
                                        success: false,
                                        error: e,
                                    } as ApiResponse;
                                }
                            },
                            {
                                body: t.Object({
                                    agentId: t.String(),
                                }),
                            },
                        ),
            ),
    );
