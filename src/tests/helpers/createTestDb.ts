import dotenv from 'dotenv'
import { spawn } from 'node:child_process'
import { Pool } from 'pg'
import { getTestConnection } from './getTestConnection'

dotenv.config()

async function main(): Promise<void> {
  if (process.env.DATABASE_URL === undefined) {
    throw new Error('DATABASE_URL is required')
  }

  const client = new Pool({
    connectionString: process.env.DATABASE_URL
  })

  const { connectionString: testConnectionString, database: testDatabase } = getTestConnection()

  void await client.connect()
  void await client.query(`
        DROP DATABASE IF EXISTS ${testDatabase}_test;
    `)

  void await client.query(`
        CREATE DATABASE ${testDatabase}_test;
    `)

  const migrate = spawn(`DATABASE_URL=${testConnectionString} npx prisma migrate dev`, { shell: true })

  migrate.stdout.on('data', (data: string) => {
    process.stdout.write(data)
  })

  migrate.stderr.on('data', (data: string) => {
    process.stderr.write(data)
  })

  migrate.on('error', (error) => {
    process.stderr.write(error.message)
  })
  const exitCode = await new Promise<number>((resolve, reject) => {
    migrate.on('exit', (code) => {
      if (typeof code === 'number') {
        resolve(code)
        return
      }
      reject(new Error('Unexpected code'))
    })
  })

  process.exit(exitCode)
}

void main()
