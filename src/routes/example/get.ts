import { FastifyInstance } from "fastify";

import { sql } from "drizzle-orm";
import { db } from "db/database";
import { user } from "db/schema";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Request and Response schema
const requestSchema = z.object({
    name: z.string(),
});
const responseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.object({
        message: z.string(),
        date: z.any(),
    }),
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/path",
        schema: {
            tags: ["example"],
            description: "contoh route",
            querystring: requestSchema,
            response: {
                "2xx": responseSchema,
            },
        },
        handler: async (request, reply) => {
            const queryResult: { now: string }[] = await db.execute(sql`select now()`);
            const name = request.query.name;

            return {
                result: {
                    message: `Hello, ${name}!`,
                    date: queryResult[0].now,
                },
            };
        },
    });
}
