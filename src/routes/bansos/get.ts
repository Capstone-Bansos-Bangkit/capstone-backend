import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@db/database";
import { bansos_provider, bansos_event, user_submission } from "@db/schema";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

const responseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.array(
        z.object({
            id: z.number(),
            name: z.string().nullish(),
            description: z.string().nullish(),
            logo_url: z.string().nullish(),
        })
    ),
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/bansos",
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
                    id: bansos_provider.id,
                    name: bansos_provider.name,
                    description: bansos_provider.description,
                    logo_url: bansos_provider.logo_url,
                })
                .from(bansos_provider);

            return {
                message: "success",
                result: jenis_bansos,
            };
        },
    });
}
