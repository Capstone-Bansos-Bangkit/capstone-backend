import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@db/database";
import { user_answer } from "@db/schema";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Request and Response schema
const requestSchema = z.object({
    question_id: z.string(),
    answer: z.string(),
});
const responseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.object({
        nik: z.string().nullish(),
        question_id: z.string().nullish(),
        answer: z.string().nullish(),
        updated_at: z.date().nullish(),
    }),
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "PUT",
        url: "/user/answer",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["user"],
            description: "contoh route",
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
            const nik = request.user.nik;
            const answer = request.query.answer;
            const question_id = request.query.question_id;

            const userAnswer = await db
                .select({
                    nik: user_answer.nik,
                    question_id: user_answer.question_id,
                    answer: user_answer.answer,
                    updated_at: user_answer.updated_at,
                })
                .from(user_answer)
                .where(
                    sql`
                        ${user_answer.nik} = ${nik} AND
                        ${user_answer.question_id} = ${question_id}
                    `
                );

            if (userAnswer.length == 0) {
                return reply.notFound("Invalid user from token");
            }

            if (Object.keys(request.query).length > 0) {
                await db
                    .update(user_answer)
                    .set({
                        answer: answer,
                    })
                    .where(d.eq(user_answer.question_id, question_id));
            }

            return {
                message: "success",
                result: {
                    nik: userAnswer[0].nik,
                    question_id: question_id ?? userAnswer[0].question_id,
                    answer: answer ?? userAnswer[0].answer,
                    updated_at: userAnswer[0].updated_at,
                },
            };
        },
    });
}
