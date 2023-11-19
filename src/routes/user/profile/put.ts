import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { sql, eq } from "drizzle-orm";
import { db } from "@db/database";
import { user } from "@db/schema";
import dayjs from "dayjs";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

const putRequestSchema = z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    phone_number: z.string().optional(),
    email: z.string().email().optional(),
});

const putResponseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.object({
        name: z.string(),
        nik: z.string(),
        birth_date: z.string(),
        address: z.string().nullish(),
        phone_number: z.string().nullish(),
        email: z.string().nullish(),
        updated_at: z.date().nullish(),
    }),
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "PUT",
        url: "/user/profile",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["user"],
            querystring: putRequestSchema,
            description: "api update user profile from token",
            response: {
                "2xx": putResponseSchema,
            },
            security: [
                {
                    Bearer: [],
                },
            ],
        },
        handler: async (request, reply) => {
            const nik = request.user.nik;
            const name = request.query.name;
            const address = request.query.address;
            const phone_number = request.query.phone_number;
            const email = request.query.email;

            const userProfile = await db
                .select({
                    name: user.name,
                    nik: user.nik,
                    birth_date: user.birth_date,
                    address: user.address,
                    phone_number: user.phone_number,
                    email: user.email,
                    updated_at: user.updated_at,
                })
                .from(user)
                .where(d.eq(user.nik, nik));

            if (userProfile.length == 0) {
                return reply.notFound("Invalid user from token");
            }

            if (Object.keys(request.query).length > 0) {
                await db
                    .update(user)
                    .set({
                        name: name,
                        address: address,
                        phone_number: phone_number,
                        email: email,
                    })
                    .where(d.eq(user.nik, nik));
            }

            return {
                message: "success",
                result: {
                    name: name ?? userProfile[0].name,
                    nik: userProfile[0].nik,
                    birth_date: dayjs(userProfile[0].birth_date).format("YYYY-MM-DD"),
                    address: address ?? null,
                    phone_number: phone_number ?? null,
                    email: email ?? null,
                    updated_at: userProfile[0].updated_at,
                },
            };
        },
    });
}
