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

    async generateToken(type: string, user_id?: string, email?: string) {
        const token = this.generateTokenContent(6);
        const expires_at = new Date(Date.now() + 15 * 60 * 1000);
        if (type == "password_reset" && email) {
            const thisUser = await db
                .select()
                .from(userTable)
                .where(sql`${userTable.email} = ${email}`)
                .then(res => res[0]) as User
            user_id = thisUser.id;
        }
        if (!user_id) {
            throw "user_id is required";
        }
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
            let templatePath = "";
            let emailSubject = "";
            if (type == "email_verification") {
                templatePath = path.join(__dirname, "email-template/token/email_verification.html");
                emailSubject = "EnvXSync Email Verification";
            } else if (type == "password_reset") {
                templatePath = path.join(__dirname, "email-template/token/password_reset.html");
                emailSubject = "EnvXSync Password Reset";
            }
            let emailContent = fs.readFileSync(templatePath, "utf-8");
            emailContent = emailContent.replace("REPLACE_CODE", token);
            await mailer.sendMail(thisUser.email, emailSubject, emailContent);
            newToken.token = "";
            newToken.id = "";
            return newToken;
        } catch (e) {
            throw "Failed to create token";
        }
    }

    async verifyToken(type: string, token: string, user_id?: string, email?: string) {
        try {
            console.log("2222", type, email)
            if (type === "password_reset" && email) {
                console.log("11111111111111")
                const thisUser = await db
                    .select()
                    .from(userTable)
                    .where(sql`${userTable.email} = ${email}`)
                    .then(res => res[0]) as User;
                if (!thisUser) {
                    throw "User not found";
                }
                console.log(thisUser)
                user_id = thisUser.id;
            }
            if (type === "email_verification" && !user_id) {
                throw "user_id is required";
            }
            const existingToken = await db
                .select()
                .from(tokenTable)
                .where(sql`${tokenTable.user_id} = ${user_id} and ${tokenTable.token} = ${token} and ${tokenTable.type} = ${type} and ${tokenTable.used} = false`)
                .then(res => res[0]) as Token;
            console.log(user_id, token, type);
            if (!existingToken) {
                throw "Invalid or expired token";
            }
            await db.update(tokenTable).set({
                used: true,
            }).where(sql`${tokenTable.id} = ${existingToken.id}`);
            if (type === "email_verification") {
                await db.update(userTable).set({
                    isVerified: true,
                }).where(sql`${userTable.id} = ${user_id}`);
            }
            return existingToken.id;
        } catch (e) {
            throw e;
        }
    }
}
