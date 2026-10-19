import pg from 'pg'
import { config } from '../config.js'

export const pool = new pg.Pool({ connectionString: config.databaseUrl })

// Tiny helper so routes can write: const rows = await query('select ...', [a, b])
export async function query(text, params) {
  const result = await pool.query(text, params)
  return result.rows
}
