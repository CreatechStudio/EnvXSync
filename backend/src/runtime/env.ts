import { db } from "../db";
import { envVarTable } from "../db/env_var";
import { sql } from "drizzle-orm";
import { EnvVar } from "../../../lib/types/env_var";
import dotenv from "dotenv";
import {
    createCipheriv,
    createDecipheriv,
    createHash,
    randomBytes,
} from "crypto";
import { projectTable } from "../db/project";

dotenv.config();
const EXS_ENCRYPT_SECRET = process.env.EXS_ENCRYPT_SECRET || undefined;

export default class EnvRuntime {
    private static readonly IV_LENGTH = 12; // recommended for GCM
    private static readonly AUTH_TAG_LENGTH = 16;
    private getKey(): Buffer {
        if (!EXS_ENCRYPT_SECRET) throw new Error("Encryption secret not set");
        return createHash("sha256").update(EXS_ENCRYPT_SECRET).digest();
    }

    private encrypt(plain: string): string {
        const key = this.getKey();
        const iv = randomBytes(EnvRuntime.IV_LENGTH);
        const cipher = createCipheriv("aes-256-gcm", key, iv);
        const encrypted = Buffer.concat([
            cipher.update(plain, "utf8"),
            cipher.final(),
        ]);
        const authTag = cipher.getAuthTag();
        // store as: iv | authTag | ciphertext, then base64
        const payload = Buffer.concat([iv, authTag, encrypted]);
        return payload.toString("base64");
    }

    private decrypt(payloadB64: string): string {
        const key = this.getKey();
        const payload = Buffer.from(payloadB64, "base64");
        const iv = payload.slice(0, EnvRuntime.IV_LENGTH);
        const authTag = payload.slice(
            EnvRuntime.IV_LENGTH,
            EnvRuntime.IV_LENGTH + EnvRuntime.AUTH_TAG_LENGTH,
        );
        const ciphertext = payload.slice(
            EnvRuntime.IV_LENGTH + EnvRuntime.AUTH_TAG_LENGTH,
        );
        const decipher = createDecipheriv("aes-256-gcm", key, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([
            decipher.update(ciphertext),
            decipher.final(),
        ]);
        return decrypted.toString("utf8");
    }

    async _isDuplicateInProject(
        projectID: string,
        key: string,
        excludeEnvVarID?: string,
    ): Promise<boolean> {
        let projectEnvIDs: string[] = [];
        await db
            .select()
            .from(projectTable)
            .where(sql`${projectTable.id} = ${projectID}`)
            .then((res) => {
                if (res[0]) {
                    projectEnvIDs = res[0].envVarIDs || [];
                }
            });
        let envVarsInProject: EnvVar[] = [];
        if (projectEnvIDs.length === 0) {
            return false;
        }
        await db
            .select()
            .from(envVarTable)
            .where(
                sql`${envVarTable.id} IN (${sql.join(projectEnvIDs, sql`,`)})`,
            )
            .then((res) => {
                envVarsInProject = res as EnvVar[];
            });
        for (let envVar of envVarsInProject) {
            if (envVar.key === key) {
                if (excludeEnvVarID && envVar.id === excludeEnvVarID) continue;
                return true;
            }
        }
        return false;
    }

    async getEnvVarByID(envVarID: string) {
        try {
            let env = (await db
                .select()
                .from(envVarTable)
                .where(sql`${envVarTable.id} = ${envVarID}`)
                .then((res) => res[0])) as EnvVar;
            if (env) {
                if (env.isSecret) {
                    env.value = "";
                }
            }
            return env;
        } catch (error) {
            throw "Could not find env var";
        }
    }

    async getBatchEnvVarsByIDs(envVarIDs: string[]) {
        try {
            let envVars = await db
                .select()
                .from(envVarTable)
                .where(
                    sql`${envVarTable.id} IN (${sql.join(envVarIDs, sql`,`)})`,
                )
                .then((res) => res as EnvVar[]);
            envVars = envVars.map((env) => {
                if (env.isSecret) {
                    env.value = "";
                }
                return env;
            });
            return envVars;
        } catch (error) {
            throw "Could not find env vars";
        }
    }

    async getSecretEnvVarValue(envVarID: string) {
        try {
            let env = (await db
                .select()
                .from(envVarTable)
                .where(sql`${envVarTable.id} = ${envVarID}`)
                .then((res) => res[0])) as EnvVar;
            if (env) {
                if (env.isSecret) {
                    return this.decrypt(env.value);
                } else {
                    return env.value;
                }
            } else {
                throw "Env var not found";
            }
        } catch (error) {
            throw "Could not find env var";
        }
    }

    async createEnvVar(
        key: string,
        value: string,
        isSecret: boolean,
        bindTo: string,
    ) {
        if (await this._isDuplicateInProject(bindTo, key)) {
            throw "Duplicate env var key in project";
        }
        let storedValue = value;
        if (isSecret) {
            if (!EXS_ENCRYPT_SECRET) {
                throw "Encryption Secret not set";
            }
            storedValue = this.encrypt(value);
        }
        const currentTime = new Date();
        try {
            let newEnvVar = (await db
                .insert(envVarTable)
                .values({
                    key: key,
                    value: storedValue,
                    isSecret: isSecret,
                    createdAt: currentTime,
                    updatedAt: currentTime,
                })
                .returning()
                .then((res) => res[0])) as EnvVar;
            let project = await db
                .select()
                .from(projectTable)
                .where(sql`${projectTable.id} = ${bindTo}`)
                .then((res) => res[0]);
            if (!project) {
                throw "Project not found";
            }
            let projectEnvVars = project.envVarIDs || [];
            projectEnvVars.push(newEnvVar.id);
            await db
                .update(projectTable)
                .set({
                    envVarIDs: projectEnvVars,
                    updatedAt: currentTime,
                })
                .where(sql`${projectTable.id} = ${bindTo}`);
            if (newEnvVar.isSecret) {
                newEnvVar.value = "";
            }
            return newEnvVar;
        } catch (error) {
            throw "Could not create env var";
        }
    }

    async deleteEnvVar(envVarID: string) {
        try {
            await db
                .delete(envVarTable)
                .where(sql`${envVarTable.id} = ${envVarID}`);
            let projects = await db
                .select()
                .from(projectTable)
                .where(
                    sql`${projectTable.envVarIDs} @> ARRAY[${envVarID}]::text[]`,
                );
            for (let project of projects) {
                let envVarIDs = project.envVarIDs || [];
                envVarIDs = envVarIDs.filter((id: string) => id !== envVarID);
                await db
                    .update(projectTable)
                    .set({
                        envVarIDs: envVarIDs,
                        updatedAt: new Date(),
                    })
                    .where(sql`${projectTable.id} = ${project.id}`);
            }
        } catch (error) {
            throw "Could not delete env var";
        }
    }

    async updateEnvVar(
        envVarID: string,
        key: string,
        value: string,
        isSecret: boolean,
        bindTo: string,
    ) {
        if (await this._isDuplicateInProject(bindTo, key, envVarID)) {
            throw "Duplicate env var key in project";
        }
        let storedValue = value;
        if (isSecret) {
            if (!EXS_ENCRYPT_SECRET) {
                throw "Encryption Secret not set";
            }
            storedValue = this.encrypt(value);
        }
        const currentTime = new Date();
        try {
            let updatedEnvVar = (await db
                .update(envVarTable)
                .set({
                    key: key,
                    value: storedValue,
                    isSecret: isSecret,
                    updatedAt: currentTime,
                })
                .where(sql`${envVarTable.id} = ${envVarID}`)
                .returning()
                .then((res) => res[0])) as EnvVar;
            if (updatedEnvVar.isSecret) {
                updatedEnvVar.value = "";
            }
            return updatedEnvVar;
        } catch (error) {
            throw "Could not update env var";
        }
    }
}
