import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { db } from "@db/database";
import { user } from "@db/schema";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

const responseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.array(z.object({
        name: z.string(),
        nik: z.string(),
        jenis_kelamin: z.string(),
        age: z.number(),
    })),
});

export default async function route(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/user/family",
        onRequest: [fastify.authenticate],
        schema: {
            tags: ["user"],
            description: "get user family list",
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
            const nik = request.user.nik;

            const users = await db
                .select({
                    nik: user.nik,
                    no_kk: user.no_kk,
                })
                .from(user)
                .where(d.eq(user.nik, nik));
            
            if (users.length == 0) {
                    return reply.notFound("Invalid user from token");
                }

            const user_family = await db
                .select({
                    name: user.name,
                    nik: user.nik,
                    jenis_kelamin: user.jenis_kelamin,
                    birth_date: user.birth_date,
                })
                .from(user)
                .where(d.eq(user.no_kk, users[0].no_kk));

            const calculateAge = (birth_date: string): number => {
                const birthDate = new Date(birth_date);
                const currentDate = new Date();
                  
                const age = (currentDate.getTime() - birthDate.getTime()) / 1000;
                const userAge = age / (60 * 60 * 24 * 365.25);
                  
                return Math.round(userAge);
            };

            const userFamily = user_family.map((user) => ({
                name: user.name,
                nik: user.nik,
                jenis_kelamin: user.jenis_kelamin,
                age: calculateAge(user.birth_date),
            }));

            return {
                message: "success",
                result: userFamily,
            };
        },
    });
}
