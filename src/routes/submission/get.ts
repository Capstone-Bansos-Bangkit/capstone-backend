import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@db/database";
import { user, bansos_event, user_submission, user_submission_answer, question, question_choice, attachment, bansos_provider } from "@db/schema";
import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Request and Response schema
const postRequestSchema = z.object({
    bansos_provider_id: z.coerce.number().optional(),
    bansos_event_id: z.coerce.number().optional(),
    status: z.string().optional(),
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
            bansos_provider_id: z.number(),
            bansos_provider_name: z.string().nullable(),
            bansos_event_id: z.number(),
            bansos_event_period: z.string(),
            status: z.string().nullable(),
            created_at: z.string(),
        })
    ),
    total: z.number(),
});

export default async function route(fastify: FastifyInstance, _opts: any, done: any) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/submission",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["submission"],
            description: "(USER ONLY) get user submission list",
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
            if (request.user.role == "admin") {
                reply.unauthorized("Admin is not allowed to access this route");
            }

            let query = db
                .select({
                    id: user_submission.id,
                    nik: user.nik,
                    name: user.name,
                    bansos_provider_id: bansos_provider.id,
                    bansos_provider_name: bansos_provider.name,
                    bansos_event_id: bansos_event.id,
                    bansos_event_period: sql<string>`to_char(${bansos_event.start_date}, 'Mon YYYY')`,
                    status: user_submission.status,
                    created_at: sql<string>`to_char(${user_submission.created_at}, 'DD-MM-YYYY HH24:MI:SS')`,
                })
                .from(user_submission)
                .$dynamic()
                .innerJoin(user, d.eq(user.nik, user_submission.nik))
                .innerJoin(bansos_event, d.eq(bansos_event.id, user_submission.bansos_event_id))
                .innerJoin(bansos_provider, d.eq(bansos_provider.id, bansos_event.bansos_provider_id));

            let queryCount = db
                .select({
                    total: sql<number>`cast(count(${user_submission.id}) as int)`,
                })
                .from(user_submission)
                .$dynamic()
                .innerJoin(user, d.eq(user.nik, user_submission.nik))
                .innerJoin(bansos_event, d.eq(bansos_event.id, user_submission.bansos_event_id))
                .innerJoin(bansos_provider, d.eq(bansos_provider.id, bansos_event.bansos_provider_id));

            const whereFilters: d.SQL[] = [];

            whereFilters.push(d.eq(user_submission.nik, request.user.nik));

            if (request.query.bansos_provider_id !== undefined) {
                whereFilters.push(d.eq(bansos_provider.id, request.query.bansos_provider_id));
            }

            if (request.query.bansos_event_id !== undefined) {
                whereFilters.push(d.eq(user_submission.bansos_event_id, request.query.bansos_event_id));
            }

            if (request.query.status !== undefined) {
                whereFilters.push(d.eq(user_submission.status, request.query.status));
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
