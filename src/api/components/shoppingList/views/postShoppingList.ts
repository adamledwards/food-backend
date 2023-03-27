import type { Prisma } from '@prisma/client'
import type { Static } from '@sinclair/typebox'
import type { FastifyReplyWithPayload, FastifyRequest, RouteShorthandOptions } from 'fastify'
import { db } from '~/api/db'
import { ShoppingListInputBodySchema, ShoppingListResponseSchema } from '../shoppingList.schema'
import { findOrCreateShoppingList, listWithItems } from '../shoppingList.service'

export const postShoppingListRouteOptions: RouteShorthandOptions = {
  schema: {
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
  Body: Static<typeof ShoppingListInputBodySchema>
  Reply: Prisma.ListGetPayload<typeof listWithItems>
}

export async function postShoppingList(
  request: FastifyRequest<ShoppingListPostRouteOptions>,
  reply: FastifyReplyWithPayload<Prisma.ListGetPayload<typeof listWithItems>>
): Promise<void> {
  const shoppingListId = await findOrCreateShoppingList(request.userId)
  const jsonBody = request.body

  // Research best practices regarding this as data geows
  const { _max } = await db.item.aggregate({
    where: {
      listId: shoppingListId
    },
    _max: {
      order: true
    }
  })
  const max = _max.order ?? 0

  const shoppingList = await db.list.update({
    where: {
      id: shoppingListId
    },
    data: {
      items: {
        createMany: {
          data: jsonBody.items.map(({ item, checked }, i) => ({ item, order: max + i + 1, checked }))
        }
      }
    },
    ...listWithItems
  })

  void reply.send(shoppingList)
}
