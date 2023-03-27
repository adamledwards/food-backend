import { PrismaClient } from '@prisma/client'
import { getTestConnection } from './getTestConnection'

const { connectionString } = getTestConnection()
export const db = new PrismaClient({
  datasources: {
    db: { url: connectionString }
  }
})
