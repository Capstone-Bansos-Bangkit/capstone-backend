import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@db/database";
import { user, user_answer} from "@db/schema";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Request and Response schema
const postRequestSchema = z.object({
    question_id: z.string(),
    answer: z.string(),
});
const postResponseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.object({
        nik: z.string().nullish(),
        question_id: z.string().nullish(),
        answer: z.string().nullish(),
    }),
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/user/answer",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["user"],
            description: "post user answer",
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
            const nik = request.user.nik;
            const question_id = request.query.question_id;
            const answer = request.query.answer;

            const userAnswer = await db
                .select({
                    nik: user.nik,
                })
                .from(user)
                .where(d.eq(user.nik, nik));

            if (userAnswer.length == 0) {
                return reply.notFound("Invalid user from token");
            }

            await db
                .insert(user_answer)
                .values({ 
                    nik: nik,
                    question_id: question_id,
                    answer: answer, });

            return {
                message: "success",
                result: {
                    nik: nik,
                    question_id: question_id,
                    answer: answer,
                },
            };

        },
    });
}
