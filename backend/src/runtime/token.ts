import {db} from "../db";
import {randomBytes} from "crypto";
import {Token} from "../../../lib/types/token";
import {tokenTable} from "../db/token";
import {Mailer} from "./mailer";
import {userTable} from "../db/user";
import {sql} from "drizzle-orm";
import {User} from "../../../lib/types/user";
import * as path from "node:path";
import * as fs from "node:fs";

export class TokenRuntime {
    generateTokenContent(length = 6) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const bytes = randomBytes(length);
        let code = "";

        for (let i = 0; i < length; i++) {
            code += chars[bytes[i] % chars.length];
        }

        return code;
    }

    async generateToken(user_id: string, type: string) {
        const token = this.generateTokenContent(6);
        const expires_at = new Date(Date.now() + 15 * 60 * 1000);
        try {
            const newToken = await db.insert(tokenTable).values({
                user_id: user_id,
                token: token,
                type: type,
                expires_at: expires_at,
                used: false,
            }).returning().then(res => res[0]) as Token;
            const mailer = new Mailer()
            const thisUser = await db
                .select()
                .from(userTable)
                .where(sql`${userTable.id} = ${user_id}`)
                .then(res => res[0]) as User
            const templatePath = path.join(__dirname, "email-template/token/email_verification.html");
            let emailContent = fs.readFileSync(templatePath, "utf-8");
            emailContent = emailContent.replace("REPLACE_CODE", token);
            await mailer.sendMail(thisUser.email, "EnvXSync Verification Code", emailContent);
            newToken.token = "";
            return newToken;
        } catch (e) {
            throw "Failed to create token";
        }
    }

    async verifyToken(user_id: string, token: string, type: string) {
        try {
            const existingToken = await db
                .select()
                .from(tokenTable)
                .where(sql`${tokenTable.user_id} = ${user_id} AND ${tokenTable.token} = ${token} AND ${tokenTable.type} = ${type} AND ${tokenTable.used} = false AND ${tokenTable.expires_at} > NOW()`)
                .then(res => res[0]) as Token;
            if (!existingToken) {
                throw "Invalid or expired token";
            }
            await db.update(tokenTable).set({
                used: true,
            }).where(sql`${tokenTable.id} = ${existingToken.id}`);
            if (type == "email_verification") {
                await db.update(userTable).set({
                    isVerified: true,
                }).where(sql`${userTable.id} = ${user_id}`);
            }
            return true;
        } catch (e) {
            throw e;
        }
    }
}
