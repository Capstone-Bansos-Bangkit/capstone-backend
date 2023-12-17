import { FastifyInstance } from "fastify";

import { sql } from "drizzle-orm";
import * as d from "drizzle-orm";
import { db } from "@db/database";
import { bansos_event, user_submission } from "@db/schema";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Request and Response schema
const requestSchema = z.object({
    user_submission_id: z.coerce.number(),
    status: z.enum(["accept", "reject"]),
});
const responseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.object({
        nik: z.string().nullish(),
        bansos_event: z.string().nullish(),
        status: z.enum(["accept", "reject"]),
    }),
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "PUT",
        url: "/admin/submission/approve",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["admin"],
            description: "Approve user submission",
            querystring: requestSchema,
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
            const user_submission_id = request.query.user_submission_id;
            const status = request.query.status;

            if (request.user.role !== "admin") {
                return reply.forbidden("Access denied");
            }

            const user_approval = await db
                .select({
                    nik: user_submission.nik,
                    status: user_submission.status,
                    bansos_event: bansos_event.name,
                })
                .from(user_submission)
                .where(d.eq(user_submission.id, user_submission_id))
                .innerJoin(bansos_event, d.eq(user_submission.bansos_event_id, bansos_event.id));

            if (user_approval.length === 0) {
                reply.notFound("id user_submission not found");
                return;
            }

            await db
                .update(user_submission)
                .set({
                    status: status,
                })
                .where(d.eq(user_submission.id, user_submission_id));

            return {
                message: "success",
                result: {
                    nik: user_approval[0].nik,
                    bansos_event: user_approval[0].bansos_event,
                    status: status ?? user_approval[0].status,
                },
            };
        },
    });
}
