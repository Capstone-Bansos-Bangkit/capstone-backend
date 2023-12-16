import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { sql, eq } from "drizzle-orm";
import { db } from "@db/database";
import { user } from "@db/schema";
import dayjs from "dayjs";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

const putRequestSchema = z.object({
    address: z.string().optional(),
    phone_number: z.string().optional(),
    email: z.string().email().optional(),
    profile_pic_url: z.string().optional(),
});

const putResponseSchema = z.object({
    message: z.string().default("success").optional(),
    result: z.object({
        nik: z.string(),
        birth_date: z.string(),
        address: z.string().nullish(),
        phone_number: z.string().nullish(),
        email: z.string().nullish(),
        profile_pic_url: z.string().nullish(),
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
            if (request.user.role !== "user") {
                reply.forbidden("Only user can submit");
                return;
            }

            const nik = request.user.nik;
            const address = request.query.address;
            const phone_number = request.query.phone_number;
            const email = request.query.email;
            const profile_pic_url = request.query.profile_pic_url;

            const userProfile = await db
                .select({
                    nik: user.nik,
                    birth_date: user.birth_date,
                    address: user.alamat,
                    phone_number: user.phone_number,
                    email: user.email,
                    profile_pic_url: user.profile_pic_url,
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
                        alamat: address,
                        phone_number: phone_number,
                        email: email,
                        profile_pic_url: profile_pic_url,
                    })
                    .where(d.eq(user.nik, nik));
            }

            return {
                message: "success",
                result: {
                    nik: userProfile[0].nik,
                    birth_date: dayjs(userProfile[0].birth_date).format("YYYY-MM-DD"),
                    address: address ?? null,
                    phone_number: phone_number ?? null,
                    email: email ?? null,
                    profile_pic_url: profile_pic_url ?? null,
                },
            };
        },
    });
}
