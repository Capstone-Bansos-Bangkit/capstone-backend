import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@db/database";
import { user, user_submission, user_submission_answer, question } from "@db/schema";

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

type Result<T> =
    | {
          error: string;
          result: null;
      }
    | {
          error: null;
          result: T;
      };

async function verifyUserData(user_submission_id: number): Promise<Result<boolean>> {
    const baseUrl = process.env.PREDICTION_URL;
    if (baseUrl == undefined) {
        return { error: "Prediction server url is not set", result: null };
    }

    const answers = await db
        .select({
            question: question.id,
            required: question.is_required,
            answer: user_submission_answer.answer,
        })
        .from(user_submission_answer)
        .rightJoin(
            question,
            d.and(d.eq(question.id, user_submission_answer.question_id), d.eq(user_submission_answer.user_submission_id, user_submission_id))
        )
        .where(d.eq(question.is_required, true));

    const payload = {};
    const missingQuestionIds: string[] = [];
    for (const answer of answers) {
        if (answer.answer == null || answer.answer == undefined) {
            missingQuestionIds.push(answer.question);
            continue;
        }

        payload[answer.question] = parseInt(answer.answer);
    }

    if (missingQuestionIds.length > 0) {
        return { error: `Missing required question: ${missingQuestionIds.join(", ")}`, result: null };
    }

    const resp = await fetch(baseUrl, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!resp.ok) {
        return { error: `Prediction server error: ${resp.statusText}`, result: null };
    }

    const data = await resp.json();

    if (data.error != null) {
        return { error: `Prediction server error: ${data.error}`, result: null };
    }

    return { error: null, result: data.result == 1 };
}

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

            const prediction = await verifyUserData(submission_id);
            if (prediction.error != null) {
                reply.badRequest(prediction.error);
                return;
            }

            await db
                .update(user_submission)
                .set({
                    status: "pending",
                    ml_result: prediction.result,
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
