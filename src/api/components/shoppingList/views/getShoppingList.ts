import type { Prisma } from '@prisma/client'
import type { FastifyReplyWithPayload, FastifyRequest, RouteShorthandOptions } from 'fastify'
import { db } from '~/api/db'
import { ShoppingListResponseSchema } from '../shoppingList.schema'
import { findOrCreateShoppingList, listWithItems } from '../shoppingList.service'

export const getShoppingListRouteOptions: RouteShorthandOptions = {
  schema: {
    response: {
      200: ShoppingListResponseSchema
    }
  },
  preHandler(...args) {
    this.guard.scope(['read:shopping-list']).apply(this, args)
  }
}

type ShoppingList = Prisma.ListGetPayload<typeof listWithItems>

export async function getShoppingList(
  request: FastifyRequest,
  reply: FastifyReplyWithPayload<ShoppingList>
): Promise<void> {
  const shoppingListId = await findOrCreateShoppingList(request.userId)
  const shoppingList = await db.list.findFirstOrThrow({
    where: {
      id: shoppingListId
    },

    ...listWithItems
  })

  void reply.send(shoppingList)
}
