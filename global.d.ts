import type {
  FastifyBaseLogger,
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  RouteGenericInterface
} from 'fastify'

import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
export {}

declare module '@vitest/runner' {
  export interface TestContext {
    getToken: (scope?: string[]) => string
    app: FastifyInstance
  }
}
declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: { sub: string, email?: string }
  }
}

type ReplyTypePayload<T> = T extends RouteGenericInterface ? T['Reply'] : T
declare module 'fastify' {
  export interface FastifyTypebox extends
    FastifyInstance<
      RawServerDefault,
      RawRequestDefaultExpression<RawServerDefault>,
      RawReplyDefaultExpression<RawServerDefault>,
      FastifyBaseLogger,
      TypeBoxTypeProvider
    >
  {}

  export interface FastifyReplyWithPayload<ReplyType> extends
    FastifyReply<
      RawServerDefault,
      RawRequestDefaultExpression<RawServerDefault>,
      RawReplyDefaultExpression<RawServerDefault>,
      RouteGenericInterface,
      unknown,
      FastifySchema,
      TypeBoxTypeProvider,
      ReplyTypePayload<ReplyType>
    >
  {}

  interface FastifyRequest {
    userId: string
  }
}

declare global {
  namespace NodeJS {
    interface process {
      AUTH_DOMAIN?: string
    }
  }
}

declare module 'pg-connection-string' {
  interface ConnectionOptions {
    schema?: string
  }
}
