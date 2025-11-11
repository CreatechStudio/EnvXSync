import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";

export const agentTable = pgTable("agent", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => randomUUID()),
    name: text("name").notNull(),
    status: text("status").notNull().default("pending"),
    lastSeen: timestamp("last_seen").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    ipAddress: text("ip_address").default(sql`NULL`),
    os: text("os").default(sql`NULL`),
    arch: text("arch").default(sql`NULL`),
    version: text("version").default(sql`NULL`),
    projectIDs: text("project_ids")
        .array()
        .notNull()
        .default(sql`'{}'::text[]`),
    taskIDs: text("task_ids")
        .array()
        .notNull()
        .default(sql`'{}'::text[]`),
});
