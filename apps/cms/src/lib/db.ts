import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

// Create a singleton Pool to avoid exhausting connections in dev
let poolInstance: Pool | null = null

function getPool(): Pool {
  if (poolInstance) return poolInstance

  const connectionString = process.env.DATABASE_URI
  if (!connectionString) {
    throw new Error('DATABASE_URI is not set')
  }

  poolInstance = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  return poolInstance
}

export const pool = getPool()
export const db = drizzle(pool)
