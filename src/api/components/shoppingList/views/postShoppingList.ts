import type { Static } from '@sinclair/typebox'
import type { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify'
import { db } from '~/api/db'
import {
  ShoppingListInputBodySchema,
  ShoppingListParamSchema,
  ShoppingListResponseSchema
} from '../shoppingList.schema'
import { listWithItems } from '../shoppingList.service'

export const postShoppingListRouteOptions: RouteShorthandOptions = {
  schema: {
    params: ShoppingListParamSchema,
    response: {
      200: ShoppingListResponseSchema
    },
    body: ShoppingListInputBodySchema
  },
  preHandler(this, ...args) {
    this.guard.scope(['read:shopping-list', 'update:shopping-list']).apply(this, args)
  }
}

export interface ShoppingListPostRouteOptions {
  Params: Static<typeof ShoppingListParamSchema>
  Body: Static<typeof ShoppingListInputBodySchema>
}

export async function postShoppingList(
  request: FastifyRequest<ShoppingListPostRouteOptions>,
  reply: FastifyReply
): Promise<void> {
  const { shoppingListId } = request.params
  const jsonBody = request.body

  const shoppingList = await db.list.update({
    where: {
      id: shoppingListId
    },

    data: {
      items: {
        createMany: {
          data: jsonBody.items.map(({ item, order }) => ({ item, order }))
        }
      }
    },
    ...listWithItems
  })
  void reply.send(shoppingList)
}
