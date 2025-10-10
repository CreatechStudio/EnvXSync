import {pgTable, text, timestamp} from "drizzle-orm/pg-core";
import {randomUUID} from "crypto";
import {sql} from "drizzle-orm";

export const groupTable = pgTable(
    'group',
    {
        id: text('id').primaryKey()
            .$defaultFn(() => randomUUID()),
        name: text('name').notNull(),
        description: text('description').default(sql`NULL`),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    }
);
