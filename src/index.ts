import fastify from "fastify";

import AutoLoad from "@fastify/autoload";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import Cors from "@fastify/cors";
import Sensible from "@fastify/sensible";
import JWT from "@fastify/jwt";
import FormBody from "@fastify/formbody";

import { db, initDatabase } from "@db/database";
import { swaggerTheme } from "./assets/swagger";
import path from "path";
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from "fastify-type-provider-zod";
import { ZodError } from "zod";

import { customTransform } from "./lib/lib";
import { initGcs } from "./lib/gcs";
import FastifyFormidable, { ajvBinaryFormat } from "fastify-formidable";

import dotenv from "dotenv";
dotenv.config();

const server = fastify({
    maxParamLength: 5000,
    ajv: {
        plugins: [ajvBinaryFormat],
    },
});

async function main() {
    await initDatabase();
    await initGcs();

    server.register(FastifyFormidable, {
        //addContentTypeParser: true,
        formidable: {},
    });
    server.setValidatorCompiler(validatorCompiler);
    server.setSerializerCompiler(serializerCompiler);
    server.setErrorHandler((error, request, reply) => {
        if (error instanceof ZodError) {
            reply.status(400).send({
                statusCode: 400,
                error: "Bad Request",
                issues: error.issues,
            });
            return;
        }

        reply.send(error);
    });

    server.register(FormBody);
    server.register(Cors);
    server.register(Sensible);
    server.register(JWT, {
        secret: process.env.JWT_SECRET as string,
        sign: {
            expiresIn: "365d",
        },
    });

    server.decorate("authenticate", async function (request: any, reply: any) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });

    server.register(fastifySwagger, {
        openapi: {
            info: {
                title: "Capstone REST API",
                description: "Capstone Project API",
                version: "0.1.6",
            },
            servers: [],
            components: {
                securitySchemes: {
                    Bearer: {
                        type: "http",
                        scheme: "bearer",
                    },
                },
            },
            tags: [
                { name: "example", description: "contoh route" },
                { name: "login", description: "Login user" },
                { name: "user", description: "User related API" },
                { name: "submission", description: "Submission related API" },
                { name: "attachment", description: "Upload berbagai macam file" },
            ],
        },
        //transform: jsonSchemaTransform,
        transform: customTransform,
        mode: "dynamic",
    });

    server.register(fastifySwaggerUI, {
        routePrefix: "/",
        theme: {
            title: "Capstone Project API",
            css: [
                {
                    filename: "theme.css",
                    content: swaggerTheme,
                },
            ],
        },
    });

    // Routes
    server.register(AutoLoad, {
        dir: path.join(__dirname, "routes"),
        ignorePattern: /_.*\.ts$/,
        dirNameRoutePrefix: false,
    });

    await server.listen({ port: port, host: "0.0.0.0" });
    console.log(`Server listening on http://localhost:${port}`);
    console.log(`Swagger UI available at http://localhost:${port}`);
}

const port = parseInt(process.env.PORT || "1337");

try {
    main();
} catch (err) {
    server.log.error(err);
    process.exit(1);
}

export { server };

export const viteNodeApp = server;
