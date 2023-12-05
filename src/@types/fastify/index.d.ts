import { FastifyJWT } from '@fastify/jwt';
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

type UserPayload = {
  role: 'user',
  name: string,
  nik: string,
  birth_date: string,
  iat: number,
  exp: number,
}

type AdminPayload = {
  role: 'admin',
  username: string,
  iat: number,
  exp: number,
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: UserPayload | AdminPayload
  }
}