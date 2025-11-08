import {db} from "../db";
import {envVarTable} from "../db/env_var";
import {sql} from "drizzle-orm";
import {EnvVar} from "../../../lib/types/env_var";
import dotenv from "dotenv";
import { randomUUID, createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

dotenv.config()
const EXS_ENCRYPT_SECRET = process.env.EXS_ENCRYPT_SECRET || undefined

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
        const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
        const authTag = cipher.getAuthTag();
        // store as: iv | authTag | ciphertext, then base64
        const payload = Buffer.concat([iv, authTag, encrypted]);
        return payload.toString("base64");
    }

    private decrypt(payloadB64: string): string {
        const key = this.getKey();
        const payload = Buffer.from(payloadB64, "base64");
        const iv = payload.slice(0, EnvRuntime.IV_LENGTH);
        const authTag = payload.slice(EnvRuntime.IV_LENGTH, EnvRuntime.IV_LENGTH + EnvRuntime.AUTH_TAG_LENGTH);
        const ciphertext = payload.slice(EnvRuntime.IV_LENGTH + EnvRuntime.AUTH_TAG_LENGTH);
        const decipher = createDecipheriv("aes-256-gcm", key, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        return decrypted.toString("utf8");
    }

    async getEnvVarByID(envVarID: string) {
        try {
            let env =  await db
                .select()
                .from(envVarTable)
                .where(sql`${envVarTable.id} = ${envVarID}`)
                .then(res => res[0]) as EnvVar;
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

    async getSecretEnvVarValue(envVarID: string) {
        try {
            let env =  await db
                .select()
                .from(envVarTable)
                .where(sql`${envVarTable.id} = ${envVarID}`)
                .then(res => res[0]) as EnvVar;
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

    async createEnvVar(key: string, value: string, isSecret: boolean) {
        let storedValue = value
        if (isSecret) {
            if (!EXS_ENCRYPT_SECRET) {
                throw "Encryption Secret not set";
            }
            storedValue = this.encrypt(value);
        }
        const currentTime = new Date();
        try {
            let newEnvVar = await db
                .insert(envVarTable)
                .values({
                    key: key,
                    value: storedValue,
                    isSecret: isSecret,
                    createdAt: currentTime,
                    updatedAt: currentTime,
                })
                .returning()
                .then(res => res[0]) as EnvVar;
            if (newEnvVar.isSecret) {
                newEnvVar.value = "";
            }
            return newEnvVar;
        } catch (error) {
            throw "Could not create env var";
        }
    }
}
