import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { db } from "@db/database";
import { wilayah_kabupaten } from "@db/schema";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Request and Response schema
const requestSchema = z.object({
    provinsi_id: z.coerce.number(),
});
const responseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.array(z.object({
        id: z.number(),
        name: z.string().nullish(),
        provinsi_id: z.coerce.number().nullish(),
    }),
    ),
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/wilayah/kabupaten",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["wilayah"],
            description: "get kabupaten",
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
            const kabupaten = await db
                .select({
                    id: wilayah_kabupaten.id,
                    name: wilayah_kabupaten.name,
                    provinsi_id: wilayah_kabupaten.provinsi_id,
                })
                .from(wilayah_kabupaten)
                .where(d.eq(wilayah_kabupaten.provinsi_id, request.query.provinsi_id));
            return {
                message: "success",
                result: kabupaten,
            };
        },
    });
}
