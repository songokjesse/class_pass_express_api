const {sqliteTable, integer, text} = require("drizzle-orm/sqlite-core");
const {sql,relations} = require("drizzle-orm");

const users = sqliteTable('users', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').unique().notNull(),
    password: text('password').notNull(),
    created_at: text('created_at').notNull().default(sql`(current_timestamp)`),
    updated_at: text('updated_at').notNull().default(sql`(current_timestamp)`),
});

const usersRelations = relations(users, ({ one }) => ({
    students: one(students),
}));

const students = sqliteTable('students', {
    id: integer('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    admission_number: text('admission_number').notNull(),
    created_at: text('created_at').notNull().default(sql`(current_timestamp)`),
    updated_at: text('updated_at').notNull().default(sql`(current_timestamp)`),
})

const studentsRelations = relations(students, ({ one }) => ({
    user: one(users, { fields: [students.userId], references: [users.id] }),
}));


module.exports = { users, students, usersRelations, studentsRelations };