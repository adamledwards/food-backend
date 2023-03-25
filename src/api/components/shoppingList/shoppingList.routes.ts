import type { FastifyTypebox } from 'fastify'
import type { ShoppingListItemDeleteRouteOptions } from './views/deleteShoppingListItem'
import { deleteShoppingListItem, deleteShoppingListItemRouteOptions } from './views/deleteShoppingListItem'
import { getShoppingList, getShoppingListRouteOptions } from './views/getShoppingList'
import type { ShoppingListPostRouteOptions } from './views/postShoppingList'
import { postShoppingList, postShoppingListRouteOptions } from './views/postShoppingList'
import type { ShoppingListPutRouteOptions } from './views/putShoppingList'
import { putShoppingList, putShoppingListRouteOptions } from './views/putShoppingList'

async function routes(fastify: FastifyTypebox): Promise<void> {
  fastify.get('/', getShoppingListRouteOptions, getShoppingList)
  fastify.post<ShoppingListPostRouteOptions>('/', postShoppingListRouteOptions, postShoppingList)
  fastify.put<ShoppingListPutRouteOptions>('/', putShoppingListRouteOptions, putShoppingList)
  fastify.delete<ShoppingListItemDeleteRouteOptions>(
    '/item/:itemId',
    deleteShoppingListItemRouteOptions,
    deleteShoppingListItem
  )
}

export default routes
