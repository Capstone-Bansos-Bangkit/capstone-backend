import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { db } from "@db/database";
import { wilayah_kecamatan } from "@db/schema";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Request and Response schema
const requestSchema = z.object({
    kabupaten_id: z.coerce.number(),
});
const responseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.array(
        z.object({
            id: z.number(),
            name: z.string().nullish(),
            kabupaten_id: z.coerce.number().nullish(),
        }),
    )
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/wilayah/kecamatan",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["wilayah"],
            description: "get kecamatan",
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
            const kecamatan = await db
                .select({
                    id: wilayah_kecamatan.id,
                    name: wilayah_kecamatan.name,
                    kabupaten_id: wilayah_kecamatan.kabupaten_id,
                })
                .from(wilayah_kecamatan)
                .where(d.eq(wilayah_kecamatan.kabupaten_id, request.query.kabupaten_id));
            return {
                message: "success",
                result: kecamatan,
            };
        },
    });
}
