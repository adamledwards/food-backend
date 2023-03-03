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
}

declare global {
  namespace NodeJS {
    interface process {
      AUTH_DOMAIN?: string
    }
  }
}
