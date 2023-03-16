import { Prisma } from '@prisma/client'

export const listWithItems = Prisma.validator<Prisma.ListArgs>()({
  select: {
    id: true,
    createdAt: true,
    items: {
      select: {
        id: true,
        order: true,
        item: true
      }
    }
  }
})
