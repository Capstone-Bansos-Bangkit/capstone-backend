import { FastifyInstance } from "fastify";

import { eq } from "drizzle-orm";
import { db } from "@db/database";
import { question, question_choice } from "@db/schema";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Request and Response schema
const responseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.array(
        z.object({
            id: z.string(),
            question: z.string(),
            type: z.string(),
            options: z.array(
                z.object({
                    value: z.number().nullish(),
                    alias: z.string().nullish(),
                })
            ).optional(),
        })
    ),
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/questioner",
        schema: {
            tags: ["questioner"],
            description: "get questioner list",
            response: {
                "2xx": responseSchema,
            },
        },
        handler: async (request, reply) => {
            const questionsList = await db
                .select({
                    id: question.id,
                    question: question.question,
                    type: question.type,
                    options: {
                        value: question_choice.value,
                        alias: question_choice.alias,
                    },
                })
                .from(question)
                .leftJoin(question_choice, eq(question.id, question_choice.question_id));

            const questions = new Map<string, any>();
            questionsList.forEach((quest) => {
                const key = quest.id;
                if (quest.type === "continuous" || quest.type === "image") {
                    questions.set(key, {
                        id: quest.id,
                        question: quest.question,
                        type: quest.type,
                    });
                } else if (questions.has(key)) {
                    questions.get(key).options.push({
                        value: quest.options?.value ?? null,
                        alias: quest.options?.alias ?? null,
                    });
                } else {
                    questions.set(key, {
                        id: quest.id,
                        question: quest.question,
                        type: quest.type,
                        options: 
                            [{
                                value: quest.options?.value ?? null,
                                alias: quest.options?.alias ?? null,
                            }],
                    });
                }
            });

            const list_question = Array.from(questions.values());

            return {
                message: "success",
                result: list_question,
            };
        },
    });
}
