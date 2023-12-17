import { FastifyInstance } from "fastify";
import * as d from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@db/database";
import { bansos_event } from "@db/schema";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Request and Response schema
const requestSchema = z.object({
    bansos_provider_id: z.coerce.number().optional(),
});

const responseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.array(z.string()),
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/bansos/event",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["bansos"],
            description: "get periode bansos",
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
            let periode = db
                .select({
                    periode: sql<string>`to_char(${bansos_event.start_date}, 'Mon YYYY')`,
                })
                .from(bansos_event)
                .orderBy(sql`start_date DESC`)
                .$dynamic();

            if (request.query.bansos_provider_id) {
                periode = periode.where(d.eq(bansos_event.bansos_provider_id, request.query.bansos_provider_id));
            }

            const list = await periode;
            const list_periode = list.map((item) => item.periode);

            return {
                message: "success",
                result: list_periode,
            };
        },
    });
}
