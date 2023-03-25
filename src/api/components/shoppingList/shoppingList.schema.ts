import { Type } from '@sinclair/typebox'

export const ShoppingListResponseSchema = Type.Object({
  id: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
  items: Type.Array(Type.Object({
    id: Type.String(),
    item: Type.String(),
    order: Type.Union([Type.Integer(), Type.Null()])
  }))
})

export const ShoppingListInputBodySchema = Type.Object({
  items: Type.Array(Type.Object({
    item: Type.String(),
    order: Type.Optional(Type.Number())
  }))
})

export const ShoppingListUpdateInputBodySchema = Type.Object({
  id: Type.String(),
  data: Type.Object({
    item: Type.Optional(Type.String()),
    order: Type.Optional(Type.Number())
  })
})

export const ShoppingListItemParamSchema = Type.Object({
  itemId: Type.String()
})
