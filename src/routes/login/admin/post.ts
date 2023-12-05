import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { sql, and, eq } from "drizzle-orm";
import { db } from "@db/database";
import { user, admin } from "@db/schema";
import dayjs from "dayjs";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import bcrypt from "bcrypt";

// Request and Response schema
const requestSchema = z.object({
    username: z.string(),
    password: z.string(),
});

const responseSchema = z.object({
    message: z.string(),
    result: z.object({
        token: z.string(),
        payload: z.object({
            role: z.string(),
            data: z.object({
                username: z.string(),
            }),
        }),
    }),
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/login/admin",
        schema: {
            description: "akun dummy -> username: admin, password: admin",
            tags: ["login"],
            querystring: requestSchema,
            response: {
                "2xx": responseSchema,
            },
        },
        handler: async (request, reply) => {
            const existing_admin = await db
                .select({
                    username: admin.username,
                    password_hash: admin.password_hash,
                })
                .from(admin)
                .where(
                    sql`
                        ${admin.username} = ${request.query.username}
                    `
                )
                .limit(1);

            if (existing_admin.length == 0) {
                return reply.notFound("No admin match given information");
            }

            const password_match = await bcrypt.compare(request.query.password, existing_admin[0].password_hash);

            if (!password_match) {
                return reply.badRequest("Password doesn't match");
            }

            const payload = {
                role: "admin",
                data: {
                    username: existing_admin[0].username,
                },
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
