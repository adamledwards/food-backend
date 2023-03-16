import { beforeEach, describe, expect, test } from 'vitest'

import shoppingListRoutes from '~/api/components/shoppingList/shoppingList.routes'
import { db } from '~/api/db'

describe('shoping-list', () => {
  beforeEach(({ app }) => {
    app.register(shoppingListRoutes)
  })
  describe('create', () => {
    describe('create a list for a new user ', () => {
      test('list of shopping is returned', async ({ app, getToken }) => {
        expect(await db.user.count()).toBe(0)
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
        expect(await db.user.count()).toBe(1)
      })
    })

    describe('create a list for a existing user ', () => {
      interface LocalTestContext {
        userId: string
      }
      beforeEach<LocalTestContext>(async (ctx) => {
        const user = await db.user.create({
          data: {
            email: 'testuser@example.com'
          }
        })
        ctx.userId = user.id
      })

      test<LocalTestContext>('list of shopping is returned', async ({ app, getToken, userId }) => {
        expect(await db.user.count()).toBe(1)

        expect(
          await db.list.count({
            where: {
              userId
            }
          })
        ).toBe(0)

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
    }
    beforeEach<LocalTestContext>(async (ctx) => {
      const user = await db.user.create({
        data: {
          email: 'testuser@example.com'
        }
      })
      const shoppingList = await db.list.create({
        data: {
          userId: user.id
        },
        select: {
          id: true
        }
      })
      ctx.shoppingListId = shoppingList.id
    })

    test<LocalTestContext>('returns 403 if permission are incorrect', async ({ app, getToken, shoppingListId }) => {
      const response = await app.inject({
        method: 'POST',
        url: `/${shoppingListId}`,
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
          items: []
        }
      )

      const response = await app.inject({
        method: 'POST',
        url: `/${shoppingListId}`,
        headers: {
          authorization: `Bearer ${getToken(['read:shopping-list', 'update:shopping-list'])}`
        },
        payload: {
          items: [{
            item: 'Bread',
            order: 1
          }]
        }
      })
      expect(response.json()).toMatchObject(
        {
          id: list.id,
          createdAt: list.createdAt.toISOString(),
          items: [{
            item: 'Bread',
            order: 1
          }]
        }
      )
    })
  })
})
