import type { Prisma } from '@prisma/client'
import { beforeEach, describe, expect, test } from 'vitest'

import shoppingListRoutes from '~/api/components/shoppingList/shoppingList.routes'
import { db } from '~/api/db'
import { listWithItems } from '../shoppingList.service'
import listFixture from './fixtures/list-fixture.json'
import userFixture from './fixtures/user-fixture.json'

describe('shoping-list', () => {
  beforeEach(({ app }) => {
    app.register(shoppingListRoutes)
  })
  describe('create', () => {
    describe('create a list for a new user ', () => {
      test('list of shopping is returned', async ({ app, getToken }) => {
        const response = await app.inject({
          method: 'GET',
          url: '/',
          headers: {
            authorization: `Bearer ${getToken(['read:shopping-list'])}`
          }
        })

        const user = await db.user.findFirst({
          include: {
            list: true
          }
        })

        const list = user?.list[0]
        expect(response.json()).toMatchObject(
          {
            id: list?.id,
            createdAt: list?.createdAt.toISOString(),
            items: []
          }
        )
      })
    })

    describe('create a list for a existing user ', () => {
      interface LocalTestContext {
        userId: string
      }
      beforeEach<LocalTestContext>(async (ctx) => {
        const user = await db.user.create({
          data: userFixture
        })
        ctx.userId = user.id
      })

      test<LocalTestContext>('list of shopping is returned', async ({ app, getToken, userId }) => {
        const response = await app.inject({
          method: 'GET',
          url: '/',
          headers: {
            authorization: `Bearer ${getToken(['read:shopping-list'])}`
          }
        })

        expect(response.statusCode).toBe(200)
        const user = await db.user.findFirstOrThrow({
          where: {
            id: userId
          },
          include: {
            list: true
          }
        })

        const list = user.list[0]
        expect(response.json()).toMatchObject(
          {
            id: list.id,
            createdAt: list.createdAt.toISOString(),
            items: []
          }
        )
        expect(await db.user.count()).toBe(1)
      })
    })
  })

  describe('update', () => {
    interface LocalTestContext {
      shoppingListId: string
      shoppingList: Prisma.ListGetPayload<typeof listWithItems>
    }
    beforeEach<LocalTestContext>(async (ctx) => {
      await db.user.create({
        data: userFixture
      })

      const shoppingList = await db.list.create({
        data: listFixture,
        ...listWithItems
      })
      ctx.shoppingListId = shoppingList.id
      ctx.shoppingList = shoppingList
    })

    test<LocalTestContext>('returns 403 if permission are incorrect', async ({ app, getToken, shoppingListId }) => {
      const response = await app.inject({
        method: 'POST',
        url: '/',
        headers: {
          authorization: `Bearer ${getToken(['update:shopping-list'])}`
        },
        payload: {
          items: [{
            item: 'Bread',
            order: 1
          }]
        }
      })

      expect(response.statusCode).toBe(403)
    })

    test<LocalTestContext>('add an item to the list', async ({ app, getToken, shoppingListId }) => {
      const list = await db.list.findUniqueOrThrow({
        where: {
          id: shoppingListId
        },
        include: {
          items: true
        }
      })

      expect(list).toMatchObject(
        {
          id: list.id,
          createdAt: list.createdAt,
          items: listFixture.items.create
        }
      )

      const response = await app.inject({
        method: 'POST',
        url: '/',
        headers: {
          authorization: `Bearer ${getToken(['read:shopping-list', 'update:shopping-list'])}`
        },
        payload: {
          items: [{
            item: 'New Item 1'
          }, {
            item: 'New Item 2'
          }]
        }
      })

      expect(response.json()).toMatchObject(
        {
          id: list.id,
          createdAt: list.createdAt.toISOString(),
          items: [
            ...listFixture.items.create,
            {
              item: 'New Item 1',
              order: 4
            },
            {
              item: 'New Item 2',
              order: 5
            }
          ]
        }
      )
    })

    describe('update list item', () => {
      test<LocalTestContext>('returns 403 if permission are incorrect', async ({ app, getToken, shoppingList }) => {
        const breadItem = shoppingList.items[0]
        const response = await app.inject({
          method: 'PUT',
          url: '/',
          headers: {
            authorization: `Bearer ${getToken(['update:shopping-list'])}`
          },
          payload: {
            id: breadItem.id,
            data: {
              item: 'Brown Bread'
            }
          }
        })

        expect(response.statusCode).toBe(403)
      })

      test<LocalTestContext>('updates an item to the list', async ({ app, getToken, shoppingList }) => {
        const breadItem = shoppingList.items[0]
        const response = await app.inject({
          method: 'PUT',
          url: '/',
          headers: {
            authorization: `Bearer ${getToken(['read:shopping-list', 'update:shopping-list'])}`
          },
          payload: {
            id: breadItem.id,
            data: {
              item: 'Brown Bread'
            }
          }
        })

        expect(response.json()).toMatchObject(
          {
            id: shoppingList.id,
            createdAt: shoppingList.createdAt.toISOString(),
            items: [
              {
                item: 'Brown Bread',
                order: 1
              },
              {
                item: 'Milk',
                order: 2
              },
              {
                item: 'Rice',
                order: 3
              }
            ]
          }
        )
      })

      describe('reorder item', () => {
        test<LocalTestContext>('move item to the top of the list', async ({ app, getToken, shoppingList }) => {
          const riceItem = shoppingList.items[2]
          const response = await app.inject({
            method: 'PUT',
            url: '/',
            headers: {
              authorization: `Bearer ${getToken(['read:shopping-list', 'update:shopping-list'])}`
            },
            payload: {
              id: riceItem.id,
              data: {
                order: 1
              }
            }
          })

          expect(response.json()).toMatchObject(
            {
              id: shoppingList.id,
              createdAt: shoppingList.createdAt.toISOString(),
              items: [
                {
                  item: 'Rice',
                  order: 1
                },
                {
                  item: 'Bread',
                  order: 2
                },
                {
                  item: 'Milk',
                  order: 3
                }
              ]
            }
          )
        })
        test<LocalTestContext>('move item to the bottom of the list', async ({ app, getToken, shoppingList }) => {
          const breadItem = shoppingList.items[0]
          const response = await app.inject({
            method: 'PUT',
            url: '/',
            headers: {
              authorization: `Bearer ${getToken(['read:shopping-list', 'update:shopping-list'])}`
            },
            payload: {
              id: breadItem.id,
              data: {
                order: 3
              }
            }
          })

          expect(response.json()).toMatchObject(
            {
              id: shoppingList.id,
              createdAt: shoppingList.createdAt.toISOString(),
              items: [
                {
                  item: 'Milk',
                  order: 1
                },
                {
                  item: 'Rice',
                  order: 2
                },
                {
                  item: 'Bread',
                  order: 3
                }
              ]
            }
          )
        })
        test<LocalTestContext>('move item to the middle of the list', async ({ app, getToken, shoppingList }) => {
          const breadItem = shoppingList.items[0]
          const response = await app.inject({
            method: 'PUT',
            url: '/',
            headers: {
              authorization: `Bearer ${getToken(['read:shopping-list', 'update:shopping-list'])}`
            },
            payload: {
              id: breadItem.id,
              data: {
                order: 2
              }
            }
          })

          expect(response.json()).toMatchObject(
            {
              id: shoppingList.id,
              createdAt: shoppingList.createdAt.toISOString(),
              items: [
                {
                  item: 'Milk',
                  order: 1
                },
                {
                  item: 'Bread',
                  order: 2
                },
                {
                  item: 'Rice',
                  order: 3
                }
              ]
            }
          )
        })
      })
    })
  })
  describe('removing an item', () => {
    interface LocalTestContext {
      shoppingListId: string
      shoppingList: Prisma.ListGetPayload<typeof listWithItems>
    }
    beforeEach<LocalTestContext>(async (ctx) => {
      await db.user.create({
        data: userFixture
      })
      const shoppingList = await db.list.create({
        data: listFixture,
        ...listWithItems
      })
      ctx.shoppingListId = shoppingList.id
      ctx.shoppingList = shoppingList
    })
    test<LocalTestContext>('item is removed', async ({ app, getToken, shoppingList }) => {
      const milkItem = shoppingList.items[1]
      const expectedList = [shoppingList.items[0], shoppingList.items[2]]
      const response = await app.inject({
        method: 'DELETE',
        url: `/item/${milkItem.id}`,
        headers: {
          authorization: `Bearer ${getToken(['update:shopping-list'])}`
        }
      })
      expect(response.statusCode).toBe(204)

      expect(
        await db.list.findFirstOrThrow({
          where: {
            id: shoppingList.id
          },
          ...listWithItems
        })
      ).toMatchObject(
        {
          id: shoppingList.id,
          createdAt: shoppingList.createdAt,
          items: expectedList
        }
      )
    })
  })
})
