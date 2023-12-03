import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { sql, eq } from "drizzle-orm";
import { db } from "@db/database";
import { user } from "@db/schema";
import dayjs from "dayjs";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Request and Response schema
// const requestSchema = z.object({
//     name: z.string(),
// });

const responseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.object({
        name: z.string(),
        nik: z.string(),
        birth_date: z.string(),
        phone_number: z.string().optional(),
        email: z.string().optional(),
    }),
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/user/profile",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["user"],
            description: "get user profile from token",
            response: {
                // "2xx": responseSchema,
            },
            security: [
                {
                    Bearer: [],
                },
            ],
        },
        handler: async (request, reply) => {
            const nik = request.user.nik;

            const userProfile = await db
                .select({
                    name: user.name,
                    nik: user.nik,
                    birth_date: user.birth_date,
                    phone_number: user.phone_number,
                    email: user.email,
                })
                .from(user)
                .where(d.eq(user.nik, nik));

            if (userProfile.length == 0) {
                return reply.notFound("Invalid user from token");
            }

            return {
                message: "success",
                result: {
                    name: userProfile[0].name,
                    nik: userProfile[0].nik,
                    birth_date: dayjs(userProfile[0].birth_date).format("YYYY-MM-DD"),
                    phone_number: userProfile[0].phone_number,
                    email: userProfile[0].email,
                },
            };
        },
    });
}
