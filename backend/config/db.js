import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DB_PATH = join(__dirname, '..', 'database', 'nutritrip.db')
const SCHEMA_PATH = join(__dirname, '..', 'database', 'schema.sql')
const SEED_PATH = join(__dirname, '..', 'database', 'seed.sql')

let db

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH)

    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')

    // Run schema
    const schema = readFileSync(SCHEMA_PATH, 'utf-8')
    db.exec(schema)

    // Run seed
    const seed = readFileSync(SEED_PATH, 'utf-8')
    db.exec(seed)

    console.log('✅ Database initialized at', DB_PATH)
  }

  return db
}

export function closeDb() {
  if (db) {
    db.close()
    db = null
  }
}
