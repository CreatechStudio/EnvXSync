import {numeric, pgTable, text, timestamp} from "drizzle-orm/pg-core";
import {randomUUID} from "crypto";
import {sql} from "drizzle-orm";

export const permissionTable = pgTable(
    'permission',
    {
        id: text('id').primaryKey()
            .$defaultFn(() => randomUUID()),
        name: text('name').notNull(),
        description: text('description').default(sql`NULL`),
        priority: numeric('priority').notNull().default(sql`0`),
        userIDs: text('user_ids').array().notNull().default(sql`'{}'::text[]`),
        groupIDs: text('group_ids').array().notNull().default(sql`'{}'::text[]`),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
        updatedBy: text('updated_by').notNull(),
        resourceType: text('resource_type').notNull().default('project'),
        resourceIDs: text('resource_ids').array().notNull().default(sql`'{}'::text[]`),
        level: text('level').notNull().default('deny')
    }
);
