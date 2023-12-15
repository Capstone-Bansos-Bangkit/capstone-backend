import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@db/database";
import { user, user_submission } from "@db/schema";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Request and Response schema
const postRequestSchema = z.object({
    submission_id: z.coerce.number(),
});

const postResponseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.object({
        nik: z.string().nullish(),
        submission_id: z.number().nullish(),
        status: z.string().nullish(),
    }),
});

export default async function route(fastify: FastifyInstance, _opts: any, done: any) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "PUT",
        url: "/submission/submit",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["submission"],
            description: "put submission submit",
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

            const nik = request.user.nik;
            const submission_id = request.query.submission_id;

            const userSubmission = await db
                .select({
                    nik: user_submission.nik,
                    status: user_submission.status,
                })
                .from(user_submission)
                .where(d.eq(user_submission.id, submission_id));

            if (userSubmission.length === 0) {
                reply.notFound("Submission not found");
                return;
            }

            if (userSubmission[0].nik !== nik) {
                reply.forbidden("Access denied");
                return;
            }

            if (userSubmission[0].status != "unsubmitted") {
                reply.badRequest("Submission already submitted");
                return;
            }

            await db
                .update(user_submission)
                .set({
                    status: "pending",
                })
                .where(d.eq(user_submission.id, submission_id));

            return {
                message: "success",
                result: {
                    nik: request.user.nik,
                    submission_id: request.query.submission_id,
                    status: "pending",
                },
            };
        },
    });
}
