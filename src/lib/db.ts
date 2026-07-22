import 'server-only'
import { Pool, type PoolClient } from 'pg'

const globalForPg = globalThis as unknown as { pgPool?: Pool }

export const db =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pgPool = db
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>) {
  const client = await db.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
