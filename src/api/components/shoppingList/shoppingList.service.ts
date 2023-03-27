import { Prisma } from '@prisma/client'
import { db } from '~/api/db'

export const listWithItems = Prisma.validator<Prisma.ListArgs>()({
  select: {
    id: true,
    createdAt: true,
    items: {
      orderBy: {
        order: 'asc'
      },
      select: {
        id: true,
        order: true,
        item: true,
        checked: true
      }
    }
  }
})

export async function findShoppingList(userId: string): Promise<Prisma.ListGetPayload<{ select: { id: true } }>> {
  return await db.list.findFirstOrThrow({
    where: {
      userId
    },
    select: {
      id: true
    }
  })
}

export async function findOrCreateShoppingList(userId: string): Promise<string> {
  try {
    const { id } = await findShoppingList(userId)
    return id
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      const { id } = await db.list.create({
        data: {
          userId
        },
        select: {
          id: true
        }
      })
      return id
    }
    throw err
  }
}
