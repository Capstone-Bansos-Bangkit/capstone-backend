import { FastifyInstance } from "fastify";

import { sql } from "drizzle-orm";
import { db } from "@db/database";
import { user } from "@db/schema";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Request and Response schema
const responseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.object({
        total_all: z.coerce.number(),
        total_eligible: z.coerce.number(),
        total_not_eligible: z.coerce.number(),
        per_bansos: z.array(
            z.object({
                bansos_name: z.string(),
                total_eligible: z.coerce.number(),
            })
        ),
    }),
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/admin/submission/summary",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["admin"],
            description: "submission summary",
            // querystring: requestSchema,
            response: {
                "2xx": responseSchema,
            },
            security: [
                {
                    Bearer: [],
                },
            ],
        },
        handler: async (request, reply) => {
            if (request.user.role !== "admin") {
                return reply.forbidden("Access denied");
            }

            type PerBansos = {
                bansos_name: string;
                total_eligible: number;
            };

            type Result = {
                all: number;
                eligible: number;
                non_eligible: number;
                per_bansos_json: PerBansos[];
            };
            const queryResult = await db.execute<Result>(sql`
                with eligible_count as (
                    select count(distinct no_kk) as eligible from user_submission us
                    join users u on u.nik = us.nik 
                    where status = 'approved'
                ), total_count as (
                    select count(distinct no_kk) as "all" from users
                ), summary as (
                    select "all", eligible, "all" - eligible as non_eligible from eligible_count, total_count
                ), per_bansos as (
                    select be.bansos_provider_id, count(distinct no_kk) as eligible from user_submission us
                    join users u on u.nik = us.nik 
                    join bansos_event be ON be.id = us.bansos_event_id 
                    where status = 'approved'
                    group by 1
                ), per_bansos_json as (
                    select 
                        jsonb_agg(
                            jsonb_build_object(
                                'bansos_name', bp.name,
                                'total_eligible', coalesce(pb.eligible, 0)
                            ) 
                        ) as per_bansos_json
                    from per_bansos pb
                    full outer join bansos_provider bp on bp.id = pb.bansos_provider_id
                ) select * from summary, per_bansos_json
            `);

            if (queryResult.length === 0) {
                return reply.notFound("Data not found");
            }

            const res = {
                message: "success",
                result: {
                    total_all: queryResult[0].all,
                    total_eligible: queryResult[0].eligible,
                    total_not_eligible: queryResult[0].non_eligible,
                    per_bansos: queryResult[0].per_bansos_json,
                },
            };

            return res;
        },
    });
}
