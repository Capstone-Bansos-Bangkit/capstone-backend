import { FastifyInstance } from "fastify";

import { db } from "@db/database";
import { wilayah_provinsi } from "@db/schema";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

const responseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.array(
        z.object({
        id: z.number(),
        name: z.string().nullish(),
        }),
    ),
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/wilayah/provinsi",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["wilayah"],
            description: "get provinsi",
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
            const provinsi = await db
                .select({
                    id: wilayah_provinsi.id,
                    name: wilayah_provinsi.name,
                })
                .from(wilayah_provinsi);

            return {
                message: "success",
                result: provinsi,
            };
        },
    });
}
