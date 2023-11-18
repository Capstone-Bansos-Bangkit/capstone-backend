import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { sql, and, eq } from "drizzle-orm";
import { db } from "db/database";
import { user } from "db/schema";
import dayjs from "dayjs";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Request and Response schema
const requestSchema = z.object({
    nik: z.string(),
    mother_name: z.string(),
    birth_date: z.coerce.date().describe("YYYY-MM-DD"),
});

const responseSchema = z.object({
    message: z.string(),
    result: z.object({
        token: z.string(),
        payload: z.object({
            name: z.string(),
            nik: z.string(),
            birth_date: z.string(),
        }),
    }),
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/login/user",
        schema: {
            tags: ["login"],
            querystring: requestSchema,
            response: {
                "2xx": responseSchema,
            },
        },
        handler: async (request, reply) => {
            const existing_user = await db
                .select({
                    name: user.name,
                    nik: user.nik,
                    birth_date: user.birth_date,
                })
                .from(user)
                .where(
                    sql`
                        ${user.nik} = ${request.query.nik} AND
                        ${user.mother_name} = ${request.query.mother_name} AND
                        ${user.birth_date} = ${request.query.birth_date}
                    `
                )
                .limit(1);

            if (existing_user.length == 0) {
                return reply.notFound("No user match given information");
            }

            const payload = {
                name: existing_user[0].name,
                nik: existing_user[0].nik,
                birth_date: dayjs(existing_user[0].birth_date).format("YYYY-MM-DD"),
                role: "user",
            };

            const token = await reply.jwtSign(payload);

            return {
                message: "success",
                result: {
                    token: token,
                    payload: payload,
                },
            };
        },
    });
}
