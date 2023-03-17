import { parse } from 'pg-connection-string'

interface GetTestConnectionResult {
  user: string
  password: string
  port: string
  host: string
  database: string
  connectionString: string
}
export function getTestConnection(): GetTestConnectionResult {
  if (process.env.DATABASE_URL === undefined) {
    throw new Error('DATABASE_URL is required')
  }
  const result = parse(
    process.env.DATABASE_URL
  )

  const { user, password, port, host, database } = result

  if (
    typeof user !== 'string' ||
    typeof password !== 'string' ||
    typeof port !== 'string' ||
    typeof host !== 'string' ||
    typeof database !== 'string'
  ) {
    throw new Error('DATABASE_URL is required')
  }

  return {
    user,
    password,
    port,
    host,
    database,
    connectionString: `postgresql://${user}:${password}@${host}:${port}/${database}_test`
  }
}
