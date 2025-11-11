import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";

export const envVarTable = pgTable("env_var", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => randomUUID()),
    key: text("key").notNull(),
    value: text("value").notNull(),
    isSecret: boolean("is_secret").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
