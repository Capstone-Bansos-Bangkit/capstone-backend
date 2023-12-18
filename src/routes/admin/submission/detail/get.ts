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
});
const responseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.object({
        nik: z.string().nullish(),
        no_kk: z.string().nullish(),
        name: z.string().nullish(),
        phone_number: z.string().nullish(),
        email: z.string().nullish(),

        alamat: z.string().nullish(),
        desa: z.string().nullish(),
        kec: z.string().nullish(),
        kab: z.string().nullish(),
        prov: z.string().nullish(),

        status: z.enum(["unsubmitted", "pending", "approved", "rejected"]),
        ml_result: z.enum(["eligible", "not_eligible"]),

        bansos_provider_name: z.string().nullish(),
        bansos_event_name: z.string().nullish(),

        questioner_result: z.array(
            z.object({
                question: z.string(),
                answer: z.string(),
            })
        ),
        attachment_result: z.array(
            z.object({
                question: z.string(),
                answer: z.string(),
            })
        ),
    }),
});

type SubmissionDetail = {
    nik: string;
    no_kk: string;
    name: string;
    phone_number: string;
    email: string;

    alamat: string;
    desa: string;
    kec: string;
    kab: string;
    prov: string;

    status: "unsubmitted" | "pending" | "approved" | "rejected";
    ml_result: "eligible" | "not_eligible";

    bansos_provider_name: string;

    questioner_result: {
        question: string;
        answer: string;
    }[];

    attachment_result: {
        question: string;
        answer: string;
    }[];
};

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/admin/submission/detail",
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

            if (request.user.role !== "admin") {
                return reply.forbidden("Access denied");
            }

            const userSubmissionDetail = await db.execute<SubmissionDetail>(sql`
            with answer_choice_1 as (
                select q.id, q.question, answer from user_submission_answer usa
                right join question q on q.id = usa.question_id and user_submission_id = ${user_submission_id}	
                where q."type" = 'choice'
            ), answer_choice as (
                select
                    a1.question,
                    'text' as answer_type,
                    qc.alias as answer
                from answer_choice_1 a1
                join question_choice qc on qc.question_id = a1.id and qc.value = a1.answer::int
            ), answer_cont as (
                select 
                    q.question, 
                    'text' as answer_type,
                    answer 
                from user_submission_answer usa
                right join question q on q.id = usa.question_id and user_submission_id = ${user_submission_id}		
                where q."type" = 'continuous'
            ), answer_img as (
                select 
                    q.question, 
                    'image_url' as answer_type,
                    'https://storage.googleapis.com/genius-aid/' || a."path" as answer
                from user_submission_answer usa
                right join question q on q.id = usa.question_id and user_submission_id = ${user_submission_id}	
                join attachment a on a.id = usa.answer::int 
                where q."type" = 'image'
            ), answer_all as (
                select * from answer_choice
                union
                select * from answer_cont
                order by answer_type desc, question
            ), answer_json as (
                select jsonb_agg(to_json(answer_all)) as questioner_result from answer_all
            ), attachment_json as (
                select jsonb_agg(to_json(answer_img)) as attachment_result from answer_img
            ),submission as (
                select
                    u.nik,
                    u.no_kk,
                    u.name,
                    u.alamat,
                    u.phone_number,
                    u.email,
                    wd.name as desa,
                    wk.name as kec,
                    wk2.name as kab,
                    wp.name as prov,
                    us.status,
                    case 
                        when us.ml_result then 'eligible'
                        else 'not_eligible'
                    end as ml_result,
                    bp."name" as bansos_provider_name
                from users u
                join user_submission us on us.nik = u.nik
                join bansos_event be on be.id = us.bansos_event_id 
                join bansos_provider bp on bp.id = be.bansos_provider_id 
                join wilayah_desa wd on wd.id = u.desa_id 
                join wilayah_kecamatan wk on wk.id = wd.kecamatan_id 
                join wilayah_kabupaten wk2 on wk2.id = wk.kabupaten_id 
                join wilayah_provinsi wp on wp.id = wk2.provinsi_id 
                where us.id = ${user_submission_id}	
            ) select * from submission, answer_json, attachment_json`);

            if (userSubmissionDetail.length == 0) {
                return reply.notFound("Submission not found");
            }

            return {
                message: "success",
                result: userSubmissionDetail[0],
            };
        },
    });
}
