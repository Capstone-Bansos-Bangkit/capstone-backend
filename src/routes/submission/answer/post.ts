import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@db/database";
import { user, user_submission, user_submission_answer, question, question_choice, attachment } from "@db/schema";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Request and Response schema
const postRequestSchema = z.object({
    submission_id: z.coerce.number(),
    question_id: z.string(),
    answer: z.string().describe("id pilihan ganda, bilangan kontinu, atau id file (tergantung tipe question)"),
});

const postResponseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.object({
        nik: z.string().nullish(),
        submission_id: z.number().nullish(),
        question_id: z.string().nullish(),
        answer: z.string().nullish(),
    }),
});

export default async function route(fastify: FastifyInstance, _opts: any, done: any) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/submission/answer",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["submission"],
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
            if (request.user.role !== "user") {
                reply.forbidden("Only user can submit");
                return;
            }

            const nik = request.user.nik;
            const submission_id = request.query.submission_id;
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

            const questions = await db
                .select({
                    id: question.id,
                    type: question.type,
                })
                .from(question)
                .where(d.eq(question.id, question_id));

            if (questions.length == 0) {
                return reply.notFound("Invalid question id");
            }

            const questionEntry = questions[0];
            if (questionEntry.type == "choice") {
                const choice_id = parseInt(answer);
                const choices = await db
                    .select({
                        id: question_choice.id,
                    })
                    .from(question_choice)
                    .where(d.eq(question_choice.value, choice_id));

                if (choices.length == 0) {
                    return reply.notFound("Invalid choice id");
                }
            } else if (questionEntry.type == "file") {
                const file_id = parseInt(answer);
                const files = await db
                    .select({
                        id: attachment.id,
                    })
                    .from(attachment)
                    .where(d.eq(attachment.id, file_id));

                if (files.length == 0) {
                    return reply.notFound("Invalid file id");
                }
            }

            const userSubmission = await db
                .select({
                    id: user_submission.id,
                    nik: user_submission.nik,
                })
                .from(user_submission)
                .where(d.eq(user_submission.id, submission_id));

            if (userSubmission.length == 0) {
                return reply.notFound("Invalid submission id");
            }

            if (userSubmission[0].nik != nik) {
                return reply.forbidden("Forbidden");
            }

            await db.insert(user_submission_answer).values({
                user_submission_id: submission_id,
                question_id: question_id,
                answer: answer,
            });

            return {
                message: "success",
                result: {
                    nik: nik,
                    submission_id: submission_id,
                    question_id: question_id,
                    answer: answer,
                },
            };
        },
    });
}
