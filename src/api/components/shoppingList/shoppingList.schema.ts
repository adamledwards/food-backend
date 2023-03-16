import { Type } from '@sinclair/typebox'

export const ShoppingListResponseSchema = Type.Object({
  id: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
  items: Type.Array(Type.Object({
    id: Type.String(),
    item: Type.String(),
    order: Type.Integer()
  }))
})

export const ShoppingListInputBodySchema = Type.Object({
  items: Type.Array(Type.Object({
    item: Type.String(),
    order: Type.Optional(Type.Number())
  }))
})

export const ShoppingListParamSchema = Type.Object({
  shoppingListId: Type.String()
})
