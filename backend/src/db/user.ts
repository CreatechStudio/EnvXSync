import {pgTable, text, timestamp} from "drizzle-orm/pg-core";

export const userTable = pgTable(
    'user',
    {
        id: text('id').primaryKey()
            // .$defaultFn(() => generate_uuid())
        ,
        name: text('name').notNull(),
        email: text('email').notNull().unique(),
        password: text('password'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
        oidcID: text('oidc_id').unique(),
        groupIDs: text('group_ids').array().notNull().default([]),
    }
);
