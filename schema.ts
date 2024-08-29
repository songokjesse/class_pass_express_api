import {sqliteTable, integer, text} from "drizzle-orm/sqlite-core";
import {sql} from "drizzle-orm";

const users = sqliteTable('users', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').unique().notNull(),
    password: text('password').notNull(),
    created_at: text('created_at').notNull().default(sql`(current_timestamp)`),
    updated_at: text('updated_at').notNull().default(sql`(current_timestamp)`),
});

module.exports = { users };