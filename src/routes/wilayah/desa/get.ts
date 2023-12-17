import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { db } from "@db/database";
import { wilayah_desa } from "@db/schema";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Request and Response schema
const requestSchema = z.object({
    kecamatan_id: z.coerce.number(),
});
const responseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.array(z.object({
        id: z.number(),
        name: z.string().nullish(),
        kecamatan_id: z.coerce.number().nullish(),
    }),
    ),
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/wilayah/desa",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["wilayah"],
            description: "get desa",
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
            const desa = await db
                .select({
                    id: wilayah_desa.id,
                    name: wilayah_desa.name,
                    kecamatan_id: wilayah_desa.kecamatan_id,
                })
                .from(wilayah_desa)
                .where(d.eq(wilayah_desa.kecamatan_id, request.query.kecamatan_id));
            return {
                message: "success",
                result: desa,
            };
        },
    });
}
