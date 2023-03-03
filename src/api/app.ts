import fjwt from '@fastify/jwt'
import Fastify from 'fastify'
import fastifyGuard from 'fastify-guard'
import buildGetJwks from 'get-jwks'

import type { JwtHeader } from '@fastify/jwt'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { FastifyInstance, FastifyRequest } from 'fastify'

interface AppOptions {
  allowedDomains: string[]
}

interface SecretHeader {
  header: JwtHeader
  payload: { iss: string }
}

export default ({ allowedDomains }: AppOptions): FastifyInstance => {
  const fastify = Fastify({
    logger: false
  }).withTypeProvider<TypeBoxTypeProvider>()

  const getJwks = buildGetJwks({ allowedDomains })

  fastify.register(fastifyGuard)
  fastify.register(fjwt, {
    decode: { complete: true },
    secret: async (_request: FastifyRequest, header: SecretHeader) => {
      const { header: { kid, alg }, payload: { iss } } = header
      return await getJwks.getPublicKey({ kid, domain: iss, alg })
    }
  })
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })
  return fastify
}
