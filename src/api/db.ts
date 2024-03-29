/* eslint-disable no-var */
import { PrismaClient } from '@prisma/client'

let db: PrismaClient

declare global {
  var _db: PrismaClient | undefined
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === 'production') {
  db = new PrismaClient()
} else {
  if (global._db === undefined) {
    global._db = new PrismaClient()
  }
  db = global._db
}

export { db }
