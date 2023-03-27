import type { Prisma } from '@prisma/client'
import type { Static } from '@sinclair/typebox'
import type { FastifyReplyWithPayload, FastifyRequest, RouteShorthandOptions } from 'fastify'

import { db } from '~/api/db'
import { ShoppingListResponseSchema, ShoppingListUpdateInputBodySchema } from '../shoppingList.schema'
import { findOrCreateShoppingList, listWithItems } from '../shoppingList.service'

export const putShoppingListRouteOptions: RouteShorthandOptions = {
  schema: {
    response: {
      200: ShoppingListResponseSchema
    },
    body: ShoppingListUpdateInputBodySchema
  },
  preHandler(this, ...args) {
    this.guard.scope(['read:shopping-list', 'update:shopping-list']).apply(this, args)
  }
}

export interface ShoppingListPutRouteOptions {
  Body: Static<typeof ShoppingListUpdateInputBodySchema>
  Reply: Prisma.ListGetPayload<typeof listWithItems>
}

export async function putShoppingList(
  request: FastifyRequest<ShoppingListPutRouteOptions>,
  reply: FastifyReplyWithPayload<ShoppingListPutRouteOptions>
): Promise<void> {
  const shoppingListId = await findOrCreateShoppingList(request.userId)
  const { id, data: { item, order } } = request.body
  const list = await db.list.findFirstOrThrow({
    where: {
      id: shoppingListId
    },
    select: {
      id: true,
      items: {
        where: {
          id
        },
        select: {
          id: true,
          order: true
        }
      }
    }
  })
  const itemEntry = list.items[0]
  if (itemEntry === null || itemEntry === undefined) {
    throw new Error('Item could not be found')
  }

  await db.$transaction(async (tx) => {
    await tx.item.update({
      where: {
        id: itemEntry.id
      },
      data: {
        item,
        order
      }
    })

    if (typeof order === 'undefined') {
      return
    }

    const moveup = itemEntry.order > order
    if (moveup) {
      await db.$executeRaw`
      UPDATE "Item"
      SET "order" = "order"+1
      WHERE "listId" = ${list.id} AND "id" != ${itemEntry.id} AND "order">= ${order}`
    } else {
      await db.$executeRaw`
      UPDATE "Item"
      SET "order" = "order"-1
      WHERE "listId" = ${list.id} AND "id" != ${itemEntry.id} AND "order"<= ${order}`
    }
  })

  const shoppingList = await db.list.findFirstOrThrow({
    where: {
      id: shoppingListId
    },
    ...listWithItems
  })

  void reply.send(shoppingList)
}
