import type { FastifySchema, FastifySchemaCompiler, FastifyTypeProvider } from "fastify";
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from "fastify-type-provider-zod";

type FreeformRecord = Record<string, any>;
interface Schema extends FastifySchema {
    hide?: boolean;
}
export const customTransform: any = (obj) => {
    const { schema, url } = obj;

    if (url == "/attachment") {
        return {
            schema: {
                body: {
                    type: "object",
                    properties: {
                        file: {
                            type: "file",
                        },
                    },
                },
                tags: ["attachment"],
                consumes: ["multipart/form-data"],
                security: [
                    {
                        Bearer: [],
                    },
                ],
            },
            url: "/attachment",
        };
    }

    const result = jsonSchemaTransform(obj);

    // if (obj2.url == "/submission/answer") {
    //     console.log(result);
    // }

    return result;
};
