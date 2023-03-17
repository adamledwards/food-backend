import type {
  FastifyBaseLogger,
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault
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
