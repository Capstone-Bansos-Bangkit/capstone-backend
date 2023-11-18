import fastify from '.';

declare module 'fastify' {
  export interface FastifyInstance<
    HttpServer = Server,
    HttpRequest = IncomingMessage,
    HttpResponse = ServerResponse,
  > {
    authenticate: any;
  }
}

// fastify-jwt.d.ts
import "@fastify/jwt"

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      name: string,
      nik: string,
      birth_date: string,
      role: 'user' | 'admin',
      iat: number,
      exp: number,
    } // user type is return type of `request.user` object
  }
}