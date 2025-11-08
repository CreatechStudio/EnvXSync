import base64 from "base-64";
import {db} from "../db";
import {userTable} from "../db/user";
import {sql} from "drizzle-orm";
import {User, UserGroup} from "../../../lib/types/user";
import {groupTable} from "../db/group";
import {tokenTable} from "../db/token";
import dayjs from "dayjs";
import {Token} from "../../../lib/types/token";
import * as argon2 from "argon2";

export class UserRuntime {
    async _isFirstUser() {
        const adminUser = await db
            .select()
            .from(userTable)
            .where(sql`${userTable.role} = 'admin'`)
            .limit(1);
        return adminUser.length === 0;
    }

    async _isFirstGroup() {
        const group = await db.select().from(groupTable);
        return group.length === 0;
    }

    async isUserAdmin(userId: string) {
        const user = await db
            .select()
            .from(userTable)
            .where(sql`${userTable.id} = ${userId}`)
            .limit(1)
            .then(res => res[0]) as User;
        if (user && user.role === 'admin') {
            return true;
        }
        return false;
    }

    async fetch(cookie: string) {
        try {
            let decodedId: string = JSON.parse(base64.decode(cookie.split(".")[1])).id;
            let me = await db
                .select()
                .from(userTable)
                .where(sql`${userTable.id} = ${decodedId}`)
                .limit(1)
                .then(res => res[0]) as User;
            if (me) me.password = "";
            return me
        } catch (e) {
            throw "Could not fetch user";
        }
    }

    async getUser(id: string) {
        try {
            let user = await db
                .select()
                .from(userTable)
                .where(sql`${userTable.id} = ${id}`)
                .limit(1)
                .then(res => res[0]) as User;
            if (user) user.password = "";
            return user
        } catch (e) {
            throw "Could not fetch user";
        }
    }

    async doLogin(email: string, passwordHash: string) {
        const user = await db
            .select()
            .from(userTable)
            .where(sql`${userTable.email} = ${email}`)
            .limit(1)
            .then(res => res[0]) as User;
        if (!user) {
            throw "Email or password is incorrect";
        }
        let valid = false;
        if (user.password != null) {
            valid = await argon2.verify(user.password, passwordHash);
        }
        if (!valid) {
            throw "Email or password is incorrect";
        }
        user.password = "";
        return user;
    }

    async newUserGroup(name: string, description?: string, id?: string) {
        let group;
        try {
            if (id) {
                group = await db.insert(groupTable).values({
                    id: id,
                    name: name,
                    description: description,
                }).returning().then(res => res[0]) as UserGroup;
                return group;
            } else {
                group = await db.insert(groupTable).values({
                    name: name,
                    description: description,
                }).returning().then(res => res[0]) as UserGroup;
            }
        } catch (e) {
            throw "Failed to create user group";
        }
        return group;
    }

    async newPasswordUser(name: string, email: string, passwordHash: string) {
        const shouldBeAdmin = await this._isFirstUser();
        try {
            const argonPasswordHash = await argon2.hash(passwordHash);
            let newUser = await db.insert(userTable).values({
                name: name,
                email: email,
                password: argonPasswordHash,
                role: shouldBeAdmin ? 'admin' : 'user',
                groupIDs: ["0"]
            }).returning().then(res => res[0]) as User;
            if (await this._isFirstGroup()) {
                await this.newUserGroup("Default", "Default user group", "0");
            }
            return newUser;
        } catch (e) {
            // @ts-ignore
            if (e.cause?.code === "23505") {
                throw "Email already exists";
            }
            throw "Failed to create user";
        }
    }

    async updateAvatar(userId: string, avatarUrl: string) {
        try {
            let user = await db
                .update(userTable)
                .set({
                    avatarURL: avatarUrl
                })
                .where(sql`${userTable.id} = ${userId}`)
                .returning()
                .then(res => res[0]) as User;
            return user;
        } catch (e) {
            throw "Failed to update avatar";
        }
    }

    async resetPassword(tokenId: string, email: string, passwordHash: string) {
        try {
            let thisUser = await db
                .select()
                .from(userTable)
                .where(sql`${userTable.email} = ${email}`)
                .limit(1)
                .then(res => res[0]) as User;
            if (!thisUser) {
                throw "User not found";
            }
            const usedToken = await db
                .select()
                .from(tokenTable)
                .where(sql`${tokenTable.id} = ${tokenId} and ${tokenTable.user_id} = ${thisUser.id} and ${tokenTable.type} = 'password_reset'`)
                .limit(1)
                .then(res => res[0]) as Token;
            console.log(usedToken);
            if (!usedToken) {
                throw "Invalid token";
            }
            if (usedToken.used) {
                console.log("token used", usedToken.used);
                if (dayjs(usedToken.expires_at).isBefore(dayjs())) {
                    throw "Token expired or used for once";
                }
                let user = await db
                    .update(userTable)
                    .set({
                        password: passwordHash
                    })
                    .where(sql`${userTable.id} = ${thisUser.id}`)
                    .returning()
                    .then(res => res[0]) as User;
                user.password = "";
                await db
                    .update(tokenTable)
                    .set({
                        expires_at: dayjs(0).toDate()
                    })
                    .where(sql`${tokenTable.id} = ${tokenId}`)
                return user;
            } else {
                throw "Invalid or not used token";
            }
        } catch (e) {
            throw e;
        }
    }
}
