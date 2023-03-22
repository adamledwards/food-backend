import { Prisma } from '@prisma/client'

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
        item: true
      }
    }
  }
})
