import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@db/database";
import {
    user,
    bansos_event,
    user_submission,
    bansos_provider,
    wilayah_desa,
    wilayah_kecamatan,
    wilayah_kabupaten,
    wilayah_provinsi,
} from "@db/schema";
import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Request and Response schema
const postRequestSchema = z.object({
    nik: z.string().optional(),
    bansos_provider_id: z.coerce.number().optional(),
    bansos_event_id: z.coerce.number().optional(),
    status: z.enum(["unsubmitted", "pending", "rejected", "approved"]).optional(),

    provinsi_id: z.coerce.number().optional().describe("id provinsi"),
    kabupaten_id: z.coerce.number().optional().describe("id kabupaten"),
    kecamatan_id: z.coerce.number().optional().describe("id kecamatan"),
    desa_id: z.coerce.number().optional().describe("id desa"),

    limit: z.coerce.number().max(100).optional().default(10),
    offset: z.coerce.number().optional().default(0),
});

const postResponseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.array(
        z.object({
            id: z.number(),
            nik: z.string(),
            name: z.string(),

            desa: z.string().nullable(),
            provinsi: z.string().nullable(),
            kabupaten: z.string().nullable(),
            kecamatan: z.string().nullable(),

            bansos_provider_id: z.number(),
            bansos_provider_name: z.string().nullable(),
            bansos_event_id: z.number(),
            bansos_event_periode: z.string(),

            status: z.string().nullable(),
            created_at: z.string(),
        })
    ),
    total: z.number(),
});

export default async function route(fastify: FastifyInstance, _opts: any, done: any) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/admin/submission/list",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["admin"],
            description: "(ADMIN ONLY) get user submission list",
            querystring: postRequestSchema,
            response: {
                "2xx": postResponseSchema,
            },
            security: [
                {
                    Bearer: [],
                },
            ],
        },
        handler: async (request, reply) => {
            if (request.user.role !== "admin") {
                reply.forbidden("Non-admin user can only access their own submission. Make sure your NIK is correct");
                return;
            }

            let query = db
                .select({
                    id: user_submission.id,
                    nik: user.nik,
                    name: user.name,

                    desa: wilayah_desa.name,
                    kecamatan: wilayah_kecamatan.name,
                    kabupaten: wilayah_kabupaten.name,
                    provinsi: wilayah_provinsi.name,

                    bansos_provider_id: bansos_provider.id,
                    bansos_provider_name: bansos_provider.name,
                    bansos_event_id: bansos_event.id,
                    bansos_event_periode: sql<string>`to_char(${bansos_event.start_date}, 'Mon YYYY')`,

                    status: user_submission.status,
                    created_at: sql<string>`to_char(${user_submission.created_at}, 'DD-MM-YYYY HH24:MI:SS')`,
                })
                .from(user_submission)
                .$dynamic()
                .innerJoin(user, d.eq(user.nik, user_submission.nik))
                .innerJoin(bansos_event, d.eq(bansos_event.id, user_submission.bansos_event_id))
                .innerJoin(bansos_provider, d.eq(bansos_provider.id, bansos_event.bansos_provider_id))
                .innerJoin(wilayah_desa, d.eq(wilayah_desa.id, user.desa_id))
                .innerJoin(wilayah_kecamatan, d.eq(wilayah_kecamatan.id, wilayah_desa.kecamatan_id))
                .innerJoin(wilayah_kabupaten, d.eq(wilayah_kabupaten.id, wilayah_kecamatan.kabupaten_id))
                .innerJoin(wilayah_provinsi, d.eq(wilayah_provinsi.id, wilayah_kabupaten.provinsi_id));

            let queryCount = db
                .select({
                    total: sql<number>`cast(count(${user_submission.id}) as int)`,
                })
                .from(user_submission)
                .$dynamic()
                .innerJoin(user, d.eq(user.nik, user_submission.nik))
                .innerJoin(bansos_event, d.eq(bansos_event.id, user_submission.bansos_event_id))
                .innerJoin(bansos_provider, d.eq(bansos_provider.id, bansos_event.bansos_provider_id))
                .innerJoin(wilayah_desa, d.eq(wilayah_desa.id, user.desa_id))
                .innerJoin(wilayah_kecamatan, d.eq(wilayah_kecamatan.id, wilayah_desa.kecamatan_id))
                .innerJoin(wilayah_kabupaten, d.eq(wilayah_kabupaten.id, wilayah_kecamatan.kabupaten_id))
                .innerJoin(wilayah_provinsi, d.eq(wilayah_provinsi.id, wilayah_kabupaten.provinsi_id));

            const whereFilters: d.SQL[] = [];

            if (request.query.nik !== undefined) {
                whereFilters.push(d.eq(user_submission.nik, request.query.nik));
            }

            if (request.query.bansos_provider_id !== undefined) {
                whereFilters.push(d.eq(bansos_provider.id, request.query.bansos_provider_id));
            }

            if (request.query.bansos_event_id !== undefined) {
                whereFilters.push(d.eq(user_submission.bansos_event_id, request.query.bansos_event_id));
            }

            if (request.query.status !== undefined) {
                whereFilters.push(d.eq(user_submission.status, request.query.status));
            }

            if (request.query.provinsi_id !== undefined) {
                whereFilters.push(d.eq(wilayah_provinsi.id, request.query.provinsi_id));
            }

            if (request.query.kabupaten_id !== undefined) {
                whereFilters.push(d.eq(wilayah_kabupaten.id, request.query.kabupaten_id));
            }

            if (request.query.kecamatan_id !== undefined) {
                whereFilters.push(d.eq(wilayah_kecamatan.id, request.query.kecamatan_id));
            }

            if (request.query.desa_id !== undefined) {
                whereFilters.push(d.eq(wilayah_desa.id, request.query.desa_id));
            }

            if (whereFilters.length > 0) {
                query = query.where(d.and(...whereFilters));
                queryCount = queryCount.where(d.and(...whereFilters));
            }

            query = query.limit(request.query.limit).offset(request.query.offset).orderBy(d.desc(user_submission.created_at));
            const [result, total] = await Promise.all([query, queryCount]);

            return reply.send({
                message: "success",
                result: result,
                total: total[0].total,
            });
        },
    });
}
