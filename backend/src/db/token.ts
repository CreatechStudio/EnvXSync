import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";

export const tokenTable = pgTable("token", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => randomUUID()),
    user_id: text("user_id").notNull(),
    token: text("token").notNull(),
    type: text("type").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    expires_at: timestamp("expires_at").notNull(),
    used: boolean("used").notNull().default(false),
});
