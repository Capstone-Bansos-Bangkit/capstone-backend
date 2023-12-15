import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@db/database";
import { user, bansos_event, user_submission, user_submission_answer, question, question_choice, attachment, bansos_provider } from "@db/schema";
import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { log } from "console";

// Request and Response schema
const postRequestSchema = z.object({});

const postResponseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.object({
        name: z.string().nullable(),
        age: z.number().nullable(),
        status_list: z.array(
            z.object({
                submission_id: z.number().nullable(),
                bansos_name: z.string().nullable(),
                logo_url: z.string().nullable(),
                status: z.string().nullable(),
                periode: z.string().nullable(),
            })
        ),
    }),
});

export default async function route(fastify: FastifyInstance, _opts: any, done: any) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/submission/latest_status",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["submission"],
            description: "get user latest submission status",
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
            if (request.user.role !== "user") {
                reply.forbidden("Only user can submit");
                return;
            }

            type LatestStatus = {
                submission_id: number | null;
                bansos_name: string;
                logo_url: string | null;
                status: "PENDING" | "TIDAK" | "YA" | null;
                periode: string | null;
            };

            const ageEntries = await db
                .select({
                    age: sql<string>`extract('year' from justify_interval(now() - ${user.birth_date}))`,
                })
                .from(user)
                .where(d.eq(user.nik, request.user.nik));

            const age = parseInt(ageEntries[0].age);

            const latest_statuses = await db.execute<LatestStatus>(
                sql`with latest_event as (
                    select
                        be.bansos_provider_id,
                        be.name,
                        be.id,
                        row_number() over (partition by bansos_provider_id order by start_date desc) as rank
                    from bansos_event be
                ), latest_submission as (
                    select
                        us.id as submission_id,
                        us.status,
                        le."name" as bansos_name,
                        be.start_date,
                        le.bansos_provider_id
                    from latest_event le 
                    join user_submission us ON le.id = us.bansos_event_id 
                    join bansos_event be on be.id = us.bansos_event_id 
                    where le.rank = 1 and us.status != 'unsubmitted' and nik = ${request.user.nik}
                ), latest_all as (
                    select
                        bp.name as bansos_name,
                        bp.logo_url,
                        l.submission_id,
                        case 
                            when l.status = 'pending' then 'PENDING'
                            when l.status = 'rejected' then 'TIDAK'
                            when l.status = 'approved' then 'YA'
                            when l.status is null then null
                            else 'OTHER'
                        end as status,
                        to_char(l.start_date, 'Mon YYYY') as periode
                    from bansos_provider bp
                    left join latest_submission l on l.bansos_provider_id = bp.id
                ) select * from latest_all`
            );

            return reply.send({
                message: "success",
                result: {
                    name: request.user.name,
                    age: age,
                    status_list: latest_statuses,
                },
            });
        },
    });
}
