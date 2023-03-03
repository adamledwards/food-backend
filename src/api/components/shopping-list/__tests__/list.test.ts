import { beforeEach, describe, expect, test } from 'vitest'

import shoppingListRoutes from '~/api/components/shopping-list/routes'

describe('shoping-list', () => {
  beforeEach(({ app }) => {
    app.register(shoppingListRoutes)
  })

  test('list of shopping is returned', async ({ app, getToken }) => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
      headers: {
        authorization: `Bearer ${getToken(['shopping:read'])}`
      }
    })

    expect(response.statusCode).toBe(200)
  })
})
