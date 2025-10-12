import {boolean, pgTable, text, timestamp} from "drizzle-orm/pg-core";
import {randomUUID} from "crypto";
import {sql} from "drizzle-orm";

export const projectTable = pgTable(
    'project',
    {
        id: text('id').primaryKey()
            .$defaultFn(() => randomUUID()),
        name: text('name').notNull(),
        description: text('description').default(sql`NULL`),
        reloadOnChange: boolean('reload_on_change').notNull().default(false),
        reloadCommand: text('reload_command').default(sql`NULL`),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
        creatorID: text('creator_id').notNull(),
        updatedBy: text('updated_by').notNull(),
        envVarIDs: text('env_var_ids').array().notNull().default(sql`'{}'::text[]`),
    }
);
