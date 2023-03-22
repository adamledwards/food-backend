import type { FastifyTypebox } from 'fastify'
import { getShoppingList, getShoppingListRouteOptions } from './views/getShoppingList'
import { postShoppingList, postShoppingListRouteOptions } from './views/postShoppingList'
import type { ShoppingListPostRouteOptions } from './views/postShoppingList'
import { putShoppingList, putShoppingListRouteOptions } from './views/putShoppingList'
import type { ShoppingListPutRouteOptions } from './views/putShoppingList'

async function routes(fastify: FastifyTypebox): Promise<void> {
  fastify.get('/', getShoppingListRouteOptions, getShoppingList)
  fastify.post<ShoppingListPostRouteOptions>('/:shoppingListId', postShoppingListRouteOptions, postShoppingList)
  fastify.put<ShoppingListPutRouteOptions>('/:shoppingListId', putShoppingListRouteOptions, putShoppingList)
}

export default routes
