import { FastifyInstance } from "fastify";

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
            querystring: requestSchema,
            response: {
                "2xx": responseSchema,
            },
        },
        handler: async (request, reply) => {
            // Contoh penggunaan database
            const client = await fastify.pg.connect();
            let queryResult;
            try {
                const { rows } = await client.query("SELECT NOW()");
                queryResult = rows[0];
            } catch {
                // setiap membuka koneksi pakai `fastify.pg.connect()`
                // harus di release setelah selesai, baik ketika API berhasil atau error
                client.release();
                return reply.internalServerError();
            }
            client.release();

            // Contoh menggunakan data dari request
            const { name } = request.query;

            return {
                result: {
                    message: `Hello, ${name}!`,
                    date: queryResult,
                },
            };
        },
    });
}
