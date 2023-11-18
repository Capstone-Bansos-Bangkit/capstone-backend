import fastify from "fastify";

import AutoLoad from "@fastify/autoload";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import Cors from "@fastify/cors";
import FastifyPG from "@fastify/postgres";
import Sensible from "@fastify/sensible";

import path from "path";
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from "fastify-type-provider-zod";

import dotenv from "dotenv";
dotenv.config();

const server = fastify({
    maxParamLength: 5000,
});

async function main() {
    server.register(FastifyPG, {
        connectionString: process.env.DATABASE_URL,
    });

    server.setValidatorCompiler(validatorCompiler);
    server.setSerializerCompiler(serializerCompiler);

    server.register(Cors);
    server.register(Sensible);

    server.register(fastifySwagger, {
        openapi: {
            info: {
                title: "capstone",
                description: "Capstone Project API",
                version: "0.0.1",
            },
            servers: [],
        },
        transform: jsonSchemaTransform,
        mode: "dynamic",
    });

    server.register(fastifySwaggerUI, {
        routePrefix: "/",
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
