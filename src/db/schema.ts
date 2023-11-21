import { integer, pgEnum, pgTable, serial, uniqueIndex, varchar, text, date, boolean, primaryKey, jsonb, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable('users', {
    nik: text('nik').primaryKey(),
    mother_name: text('mother_name').notNull(),
    birth_date: date('birth_date').notNull(),
    name: text('name').notNull(),
    address: text('address'),
    phone_number: text('phone_number'),
    email: text('email'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
});

export const admin = pgTable('admins', {
    id: serial('id').primaryKey(),
    username: text('username').notNull().unique(),
    password_hash: text('password_hash').notNull(),
});

export const aid_event = pgTable('aid_event', {
    id: serial('id').primaryKey(),
    name: text('name'),
    description: text('description'),
    address: text('address'),
    start_date: date('start_date'),
    end_date: date('end_date'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
});

export const user_answer = pgTable('user_answer', {
    nik: text('nik').references(() => user.nik),
    question_id: text('question_id').references(() => question.id),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
    answer: text('answer'),
}, (table) => {
    return {
        pk: primaryKey({columns:[table.nik, table.question_id]}),
    }
});

export const user_submission = pgTable('user_submission', {
    id: serial('id').primaryKey(),
    nik: text('nik').references(() => user.nik),
    aid_id: integer('aid_id').references(() => aid_event.id),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
});

export const user_submission_answer = pgTable('user_submission_answer', {
    user_submission_id: integer('user_submission_id').references(() => user_submission.id),
    question_id: text('question_id').references(() => question.id),
    answer: integer('answer'),
}, (table) => {
    return {
        pk: primaryKey({columns:[table.user_submission_id, table.question_id]}),
    }
});

export const attachment = pgTable('attachment', {
    id: serial('id').primaryKey(),
    type: text('type'),
    path: text('path'),
    data: jsonb('data'),
})

export const question = pgTable('question', {
    id: text('id').primaryKey(),
    question: text('question'),
})

export const question_choice = pgTable('question_choice', {
    id: serial('id').primaryKey(),
    question_id: text('question_id').references(() => question.id),
    value: integer('value'),
    alias: text('alias'),
})
