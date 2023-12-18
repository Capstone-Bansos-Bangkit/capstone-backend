import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { db } from "@db/database";
import { bansos_provider, bansos_event, user_submission } from "@db/schema";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

const responseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.array(
        z.object({
            name: z.string().nullish(),
            description: z.string().nullish(),
            logo_url: z.string().nullish(),
            alias: z.string().nullish(),
            total_periode: z.number(),
            total_penerima: z.number(),
        })
    ),
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/bansos",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["bansos"],
            description: "get jenis bansos list",
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
            const jenis_bansos = await db
                .select({
                    name: bansos_provider.name,
                    description: bansos_provider.description,
                    logo_url: bansos_provider.logo_url,
                    alias: bansos_provider.alias,
                    total_periode: d.countDistinct(bansos_event.id).as("total_periode"),
                    total_penerima: d.count(user_submission.status).as("total_penerima"),
                })
                .from(bansos_provider)
                .leftJoin(bansos_event, d.eq(bansos_event.bansos_provider_id, bansos_provider.id))
                .leftJoin(user_submission, d.and(d.eq(user_submission.bansos_event_id, bansos_event.id), d.eq(user_submission.status, "approved")))
                .groupBy(bansos_provider.id);

            return {
                message: "success",
                result: jenis_bansos,
            };
        },
    });
}
