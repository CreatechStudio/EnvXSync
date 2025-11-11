import { Elysia } from "elysia";
import { db } from "../db";
import { userTable } from "../db/user";
import { ApiResponse } from "../../../lib/types/api";
import { User } from "../../../lib/types/user";
import { sql } from "drizzle-orm";

export const TestRoute = new Elysia().group("test", (app) =>
    app.get("/new-default-user", async () => {
        const random = Math.floor(Math.random() * 10000);
        let user = {};

        try {
            const shouldBeAdmin =
                (
                    await db
                        .select()
                        .from(userTable)
                        .where(sql`${userTable.role} = 'admin'`)
                        .limit(1)
                ).length === 0;
            user = await db
                .insert(userTable)
                .values({
                    name: `Test User ${random}`,
                    email: `testuser${random}@example.com`,
                    role: shouldBeAdmin ? "admin" : "user",
                })
                .returning();
        } catch (e) {
            return {
                success: false,
                error: e,
            } as ApiResponse;
        }

        return {
            success: true,
            data: user,
        } as ApiResponse<User>;
    }),
);
