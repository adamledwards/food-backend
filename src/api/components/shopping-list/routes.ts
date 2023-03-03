import { Type } from '@sinclair/typebox'

import type { Static } from '@sinclair/typebox'
import type { FastifyTypebox, RouteShorthandOptions } from 'fastify'

const ResponseSchema = Type.Object({
  items: Type.Array(Type.Object({
    id: Type.String(),
    name: Type.String()
  }))
})

type ResponseType = Static<typeof ResponseSchema>

async function routes(fastify: FastifyTypebox) {
  const opts: RouteShorthandOptions = {
    schema: {
      response: {
        200: ResponseSchema
      }
    },
    preHandler: [fastify.guard.scope(['shopping:read'])]
  }
  fastify.get('/', opts, (request): ResponseType => {
    return {
      items: [{
        id: '2',
        name: 'chicken'
      }]
    }
  })
}

export default routes
