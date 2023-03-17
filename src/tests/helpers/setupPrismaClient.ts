import { PrismaClient } from '@prisma/client'
import { getTestConnection } from './getTestConnection'

const { connectionString } = getTestConnection()
global._db = new PrismaClient({
  datasources: {
    db: { url: connectionString }
  }
})
