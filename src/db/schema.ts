import { integer, pgEnum, pgTable, serial, uniqueIndex, varchar, text, date, boolean, primaryKey, jsonb, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable('users', {
    nik: text('nik').primaryKey(),
    mother_name: text('mother_name').notNull(),
    birth_date: date('birth_date').notNull(),
    no_kk: text('no_kk').notNull(),
    name: text('name').notNull(),
    jenis_kelamin: text('jenis_kelamin').notNull(),
    status_dalam_keluarga: text('status_dalam_keluarga'), // KEPALA KELUARGA, ISTRI, ANAK

    profile_pic_url: text('profile_pic_url'),
    alamat: text('alamat'),
    desa_id: integer('desa_id').references(() => wilayah_desa.id),

    phone_number: text('phone_number'),
    email: text('email'),
    
    created_at: timestamp('created_at').defaultNow(),
});

export const admin = pgTable('admins', {
    id: serial('id').primaryKey(),
    username: text('username').notNull().unique(),
    password_hash: text('password_hash').notNull(),
    created_at: timestamp('created_at').defaultNow(),
});

export const bansos_event = pgTable('bansos_event', {
    id: serial('id').primaryKey(),
    bansos_provider_id: integer('bansos_provider_id').references(() => bansos_provider.id),
    name: text('name'),
    start_date: date('start_date'),
    end_date: date('end_date'),
    created_at: timestamp('created_at').defaultNow(),
});

export const bansos_provider = pgTable('bansos_provider', {
    id: serial('id').primaryKey(),
    name: text('name'),
    alias: text('alias'),
    description: text('description'),
    logo_url: text('logo_url'),
})

export const user_submission = pgTable('user_submission', {
    id: serial('id').primaryKey(),
    nik: text('nik').references(() => user.nik),
    bansos_event_id: integer('bansos_event_id').references(() => bansos_event.id),
    status: text('status'), // unsubmitted, pending, rejected, approved
    ml_result: boolean('ml_result'), 
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
});

export const user_submission_answer = pgTable('user_submission_answer', {
    user_submission_id: integer('user_submission_id').references(() => user_submission.id),
    question_id: text('question_id').references(() => question.id),
    answer: text('answer'), // bisa value choice, atau url file
}, (table) => {
    return {
        pk: primaryKey({columns:[table.user_submission_id, table.question_id]}),
    }
});

export const attachment = pgTable('attachment', {
    id: serial('id').primaryKey(),
    uploader_nik: text('uploader_nik').references(() => user.nik),
    mime_type: text('mime_type'),
    real_filename: text('real_filename'),
    path: text('path'),
    data: jsonb('data'),
    created_at: timestamp('created_at').defaultNow(),
})

export const question = pgTable('question', {
    id: text('id').primaryKey(),
    question: text('question'),
    type: text('type'), // choice, file, value
    is_required: boolean('is_required'),
})

export const question_choice = pgTable('question_choice', {
    id: serial('id').primaryKey(),
    question_id: text('question_id').references(() => question.id),
    value: integer('value'),
    alias: text('alias'),
})

export const wilayah_provinsi = pgTable('wilayah_provinsi', {
    id: integer('id').primaryKey(),
    name: text('name'),
})

export const wilayah_kabupaten = pgTable('wilayah_kabupaten', {
    id: integer('id').primaryKey(),
    provinsi_id: integer('provinsi_id').references(() => wilayah_provinsi.id),
    name: text('name'),
})

export const wilayah_kecamatan = pgTable('wilayah_kecamatan', {
    id: integer('id').primaryKey(),
    kabupaten_id: integer('kabupaten_id').references(() => wilayah_kabupaten.id),
    name: text('name'),
})

export const wilayah_desa = pgTable('wilayah_desa', {
    id: integer('id').primaryKey(),
    kecamatan_id: integer('kecamatan_id').references(() => wilayah_kecamatan.id),
    name: text('name'),
})

