import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { db } from "@db/database";
import { bansos_event } from "@db/schema";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Request and Response schema
const requestSchema = z.object({
    name: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    bansos_provider_id: z.coerce.number(),
});
const responseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.object({
        name: z.string(),
        start_date: z.string(),
        end_date: z.string(),
        bansos_provider_id: z.coerce.number(),
    }),
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/bansos/event",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["bansos"],
            description: "post event bansos",
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
            if (request.user.role !== "admin") {
                return reply.forbidden("Access denied")
            }

            const name = request.query.name;
            const start_date = request.query.start_date;
            const end_date = request.query.end_date;
            const bansos_provider_id = request.query.bansos_provider_id;

            const existingSubmission = await db
                .select({ 
                    name: bansos_event.name })
                .from(bansos_event)
                .where(d.and(d.eq(bansos_event.name, name), d.eq(bansos_event.bansos_provider_id, bansos_provider_id)));

            if (existingSubmission.length > 0) {
                reply.badRequest("Bansos event already exists");
                return;
            }

            await db
                .insert(bansos_event)
                .values({ 
                    name: name,
                    start_date: start_date,
                    end_date: end_date,
                    bansos_provider_id: bansos_provider_id, });

            return {
                result: {
                    name: name,
                    start_date: start_date,
                    end_date: end_date,
                    bansos_provider_id: bansos_provider_id,
                },
            };
        },
    });
}
