import { Prisma } from '@prisma/client'
import type { FastifyReplyWithPayload, FastifyRequest, RouteShorthandOptions } from 'fastify'
import { db } from '~/api/db'
import { ShoppingListResponseSchema } from '../shoppingList.schema'
import { listWithItems } from '../shoppingList.service'

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
  let shoppingList: ShoppingList | undefined

  try {
    shoppingList = await db.list.findFirstOrThrow({
      where: {
        userId: request.userId
      },

      ...listWithItems
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      shoppingList = await db.list.create({
        data: {
          userId: request.userId
        },
        ...listWithItems
      })
    }
  }

  void reply.send(shoppingList)
}
