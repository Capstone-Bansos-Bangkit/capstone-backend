/* import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { sql, eq } from "drizzle-orm";
import { db } from "@db/database";
import { user_answer } from "@db/schema";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Request and Response schema
// const requestSchema = z.object({
//     name: z.string(),
// });

const responseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.array(
        z.object({
            nik: z.string().nullish(),
            question_id: z.string().nullish(),
            answer: z.string().nullish(),
        })
    ),
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/user/answer",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["user"],
            description: "get user answer",
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
            const nik = request.user.nik;

            const userAnswer = await db
                .select({
                    nik: user_answer.nik,
                    question_id: user_answer.question_id,
                    answer: user_answer.answer,
                })
                .from(user_answer)
                .where(d.eq(user_answer.nik, nik));

            if (userAnswer.length == 0) {
                return reply.notFound("Invalid user from token");
            }

            return {
                message: "success",
                result: userAnswer,
            };
        },
    });
}
 */
