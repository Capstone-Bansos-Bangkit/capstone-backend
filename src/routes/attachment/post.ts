import { FastifyInstance } from "fastify";

import { sql } from "drizzle-orm";
import { db } from "@db/database";
import { user, attachment } from "@db/schema";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { File } from "fastify-formidable";

import { uploadFileFromPath } from "@lib/gcs";

export default async function route(fastify: FastifyInstance) {
    fastify.post(
        "/attachment",
        {
            onRequest: [fastify.authenticate],
            schema: {
                consumes: ["multipart/form-data"],
                tags: ["attachment"],
                security: [
                    {
                        Bearer: [],
                    },
                ],
            },
        },
        async function (request, reply) {
            await request.parseMultipart();

            if (request.files === null) {
                throw new Error("No files");
            }

            const files = request.files;

            if (files["file"] === undefined) {
                throw new Error("No file");
            }

            if (Array.isArray(files["file"])) {
                throw new Error("No multiple files allowed");
            }

            const file: File = files["file"];

            const currTimestamp = Date.now();
            const cloudPath = `attachment/${currTimestamp}/${file.originalFilename}`;

            try {
                await uploadFileFromPath(file.filepath, cloudPath);
            } catch (err) {
                console.log(err);
                throw new Error("Failed to upload file to cloud storage");
            }

            const insertedAttachment = await db
                .insert(attachment)
                .values({
                    path: cloudPath,
                    uploader_nik: request.user.nik,
                    real_filename: file.originalFilename,
                    mime_type: file.mimetype,
                    data: file.toJSON(),
                })
                .returning();

            const fullUrl = `https://storage.cloud.google.com/genius-aid/${cloudPath}`;

            return {
                message: "success",
                result: {
                    file_id: insertedAttachment[0].id,
                    url: fullUrl,
                    real_filename: insertedAttachment[0].real_filename,
                    mime_type: insertedAttachment[0].mime_type,
                },
            };
        }
    );
}
