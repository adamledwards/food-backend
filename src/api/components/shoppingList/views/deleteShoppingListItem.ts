import type { Static } from '@sinclair/typebox'
import type { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify'
import { db } from '~/api/db'
import { ShoppingListItemParamSchema } from '../shoppingList.schema'
import { findShoppingList } from '../shoppingList.service'

export const deleteShoppingListItemRouteOptions: RouteShorthandOptions = {
  schema: {
    params: ShoppingListItemParamSchema,
    response: {
      204: {
        description: 'Removing a shopping list item',
        type: 'null'
      }
    }
  },
  preHandler(...args) {
    this.guard.scope(['update:shopping-list']).apply(this, args)
  }
}

export interface ShoppingListItemDeleteRouteOptions {
  Params: Static<typeof ShoppingListItemParamSchema>
  Reply: string
}

export async function deleteShoppingListItem(
  request: FastifyRequest<ShoppingListItemDeleteRouteOptions>,
  reply: FastifyReply
): Promise<void> {
  const { id } = await findShoppingList(request.userId)
  const { itemId } = request.params

  await db.list.update({
    where: {
      id
    },
    data: {
      items: {
        delete: {
          id: itemId
        }
      }
    }
  })

  void reply.status(204).send()
}
