import fjwt from '@fastify/jwt'
import Fastify from 'fastify'
import fastifyGuard from 'fastify-guard'
import buildGetJwks from 'get-jwks'

import type { TokenOrHeader } from '@fastify/jwt'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { db } from './db'

interface AppOptions {
  allowedDomains: string[]
  logger: boolean
}

export default ({ allowedDomains, logger }: AppOptions): FastifyInstance => {
  const fastify = Fastify({
    logger
  }).withTypeProvider<TypeBoxTypeProvider>()

  const getJwks = buildGetJwks({ allowedDomains })

  fastify.register(fastifyGuard)

  fastify.register(fjwt, {
    decode: { complete: true },
    async secret(request: FastifyRequest, tokenOrHeader: TokenOrHeader) {
      if ('header' in tokenOrHeader) {
        const { header: { kid, alg }, payload: { iss } } = tokenOrHeader
        return await getJwks.getPublicKey({ kid, domain: iss, alg })
      }
    }
  })

  fastify.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })
  fastify.decorateRequest('userId', '')
  fastify.addHook('preHandler', async (request) => {
    if (typeof request.user.email !== 'string') {
      throw new Error('no email found')
    }

    // We should cache this
    const user = await db.user.upsert({
      select: {
        id: true
      },
      where: {
        email: request.user.email
      },
      update: {},
      create: {
        email: request.user.email
      }
    })
    request.userId = user.id
  })

  return fastify
}
