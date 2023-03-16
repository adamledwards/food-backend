import type { FastifyTypebox } from 'fastify'
import { getShoppingList, getShoppingListRouteOptions } from './views/getShoppingList'
import { postShoppingList, postShoppingListRouteOptions } from './views/postShoppingList'
import type { ShoppingListPostRouteOptions } from './views/postShoppingList'

async function routes(fastify: FastifyTypebox): Promise<void> {
  fastify.get('/', getShoppingListRouteOptions, getShoppingList)
  fastify.post<ShoppingListPostRouteOptions>('/:shoppingListId', postShoppingListRouteOptions, postShoppingList)
}

export default routes
