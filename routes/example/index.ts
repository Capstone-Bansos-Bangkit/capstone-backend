import { FastifyInstance } from "fastify";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Request and Response schema
const requestSchema = z.object({
    message: z.string().optional().default("Ping"),
});
const responseSchema = z.object({
    message: z.string(),
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/path",
        schema: {
            querystring: requestSchema,
            response: {
                "2xx": responseSchema,
            },
        },
        handler: async (request, reply) => {
            return {
                message: "Pong!",
            };
        },
    });
}
