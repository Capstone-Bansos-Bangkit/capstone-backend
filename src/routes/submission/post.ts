import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@db/database";
import { bansos_event, user_submission, bansos_provider } from "@db/schema";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Request and Response schema
const postRequestSchema = z.object({
    bansos_id: z.coerce.number(),
});

const postResponseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.object({
        nik: z.string().nullish(),
        bansos_name: z.string().nullish(),
        bansos_event_id: z.number().nullish(),
        status: z.string().nullish(),
    }),
});

export default async function route(fastify: FastifyInstance, _opts: any, done: any) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/submission",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["submission"],
            description: "post user submission",
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

            const bansosEvent = await db
                .select({ id: bansos_event.id, bansos_name: bansos_provider.name })
                .from(bansos_event)
                .innerJoin(bansos_provider, d.eq(bansos_provider.id, bansos_event.bansos_provider_id))
                .where(d.eq(bansos_provider.id, request.query.bansos_id))
                .orderBy(sql`start_date DESC`)
                .limit(1);

            if (bansosEvent.length === 0) {
                reply.notFound("Bansos event not found");
                return;
            }

            const existingSubmission = await db
                .select({ nik: user_submission.nik })
                .from(user_submission)
                .where(d.and(d.eq(user_submission.nik, request.user.nik), d.eq(user_submission.bansos_event_id, bansosEvent[0].id)));

            if (existingSubmission.length > 0) {
                reply.badRequest("Submission already exists");
                return;
            }

            const inserted = await db
                .insert(user_submission)
                .values({
                    nik: request.user.nik,
                    bansos_event_id: bansosEvent[0].id,
                    status: "unsubmitted",
                })
                .returning();

            return reply.send({
                message: "success",
                result: {
                    nik: inserted[0].nik,
                    bansos_name: bansosEvent[0].bansos_name,
                    bansos_event_id: inserted[0].bansos_event_id,
                    status: inserted[0].status,
                },
            });
        },
    });
}
