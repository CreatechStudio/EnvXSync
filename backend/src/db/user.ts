import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";

export const userTable = pgTable("user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    isDisabled: boolean("is_disabled").notNull().default(false),
    isVerified: boolean("is_verified").notNull().default(false),
    password: text("password").default(sql`NULL`),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    oidcID: text("oidc_id")
        .unique()
        .default(sql`NULL`),
    role: text("role").notNull().default("user"),
    groupIDs: text("group_ids")
        .array()
        .notNull()
        .default(sql`'{}'::text[]`),
    avatarURL: text("avatar_url").default(sql`NULL`),
});
