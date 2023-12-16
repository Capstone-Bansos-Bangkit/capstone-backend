import { FastifyInstance } from "fastify";

import * as d from "drizzle-orm";
import { sql, eq } from "drizzle-orm";
import { db } from "@db/database";
import { attachment, user, wilayah_desa, wilayah_kabupaten, wilayah_kecamatan, wilayah_provinsi } from "@db/schema";
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
        no_kk: z.string(),
        alamat: z.string(),
        kewarganegaraan: z.string(),
        desa: z.string(),
        kec: z.string(),
        kab: z.string(),
        prov: z.string(),
        birth_date: z.string(),
        phone_number: z.string().optional(),
        email: z.string().optional(),
        profile_pic_url: z.string(),
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
                    no_kk: user.no_kk,
                    alamat: user.alamat,
                    desa: wilayah_desa.name,
                    kec: wilayah_kecamatan.name,
                    kab: wilayah_kabupaten.name,
                    prov: wilayah_provinsi.name,
                    birth_date: user.birth_date,
                    phone_number: user.phone_number,
                    email: user.email,
                    profile_pic_url: user.profile_pic_url,
                })
                .from(user)
                .leftJoin(wilayah_desa, d.eq(wilayah_desa.id, user.desa_id))
                .leftJoin(wilayah_kecamatan, d.eq(wilayah_kecamatan.id, wilayah_desa.kecamatan_id))
                .leftJoin(wilayah_kabupaten, d.eq(wilayah_kabupaten.id, wilayah_kecamatan.kabupaten_id))
                .leftJoin(wilayah_provinsi, d.eq(wilayah_provinsi.id, wilayah_kabupaten.provinsi_id))
                .where(d.eq(user.nik, nik));

            if (userProfile.length == 0) {
                return reply.notFound("Invalid user from token");
            }

            return {
                message: "success",
                result: {
                    name: userProfile[0].name,
                    nik: userProfile[0].nik,
                    no_kk: userProfile[0].no_kk,
                    alamat: userProfile[0].alamat,
                    kewarganegaraan: "Warga Negara Indonesia",
                    desa: userProfile[0].desa,
                    kec: userProfile[0].kec,
                    kab: userProfile[0].kab,
                    prov: userProfile[0].prov,
                    birth_date: dayjs(userProfile[0].birth_date).format("YYYY-MM-DD"),
                    phone_number: userProfile[0].phone_number,
                    email: userProfile[0].email,
                    profile_pic_url: userProfile[0].profile_pic_url,
                },
            };
        },
    });
}
