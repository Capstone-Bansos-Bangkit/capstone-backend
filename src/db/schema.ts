import { integer, pgEnum, pgTable, serial, uniqueIndex, varchar, text, date, boolean, primaryKey } from "drizzle-orm/pg-core";

export const user = pgTable('users', {
    nik: text('nik').primaryKey(),
    mother_name: text('mother_name').notNull(),
    birth_date: date('birth_date').notNull(),
    name: text('name').notNull(),
    address: text('address'),
    phone_number: text('phone_number'),
    email: text('email'),
    created_at: date('created_at').defaultNow(),
    updated_at: date('updated_at').defaultNow(),
});

export const admin = pgTable('admins', {
    id: serial('id').primaryKey(),
    username: text('username').notNull().unique(),
    password_hash: text('password_hash').notNull(),
});

export const user_information = pgTable('user_information', {
    nik: text('nik').references(() => user.nik),
    created_at: date('created_at').defaultNow(),
    updated_at: date('updated_at').defaultNow(),
    // TODO: add columns
    salary: integer('salary'),
});

export const aid_event = pgTable('aid_event', {
    id: serial('id').primaryKey(),
    name: text('name'),
    description: text('description'),
    address: text('address'),
    start_date: date('start_date'),
    end_date: date('end_date'),
    created_at: date('created_at').defaultNow(),
    updated_at: date('updated_at').defaultNow(),
});

export const user_information_submission = pgTable('user_information_submission', {
    nik: text('nik').references(() => user.nik),
    aid_id: integer('aid_id').references(() => aid_event.id),
    verified: boolean('verified').default(false),
    created_at: date('created_at').defaultNow(),
    updated_at: date('updated_at').defaultNow(),
    // TODO: add columns    
    salary: integer('salary'),
}, (table) => {
    return {
        pk: primaryKey({columns:[table.nik, table.aid_id]}),
    }
});

