import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

let pool

/**
 * Get the MySQL connection pool (lazy-initialized)
 */
export function getMysqlPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'nutritrip',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
    console.log('✅ MySQL pool created')
  }
  return pool
}

/**
 * Run a query on the MySQL pool
 */
export async function query(sql, params = []) {
  const pool = getMysqlPool()
  const [rows] = await pool.execute(sql, params)
  return rows
}

/**
 * Close the MySQL pool
 */
export async function closeMysql() {
  if (pool) {
    await pool.end()
    pool = null
  }
}
