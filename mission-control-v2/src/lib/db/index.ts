import { Pool, PoolClient, QueryResult } from 'pg';
import { schema } from './schema';
import { runMigrations } from './migrations';

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

let initialized = false;

export async function initDb(): Promise<void> {
  if (initialized) return;
  
  const client = await pool.connect();
  try {
    // Initialize base schema
    await client.query(schema);
    
    // Run migrations
    await runMigrations(client);
    
    initialized = true;
    console.log('[DB] PostgreSQL database initialized');
  } finally {
    client.release();
  }
}

export function getPool(): Pool {
  return pool;
}

export async function closeDb(): Promise<void> {
  await pool.end();
  initialized = false;
}

// Type-safe query helpers
export async function queryAll<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  await initDb();
  const result = await pool.query(sql, params);
  return result.rows as T[];
}

export async function queryOne<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  await initDb();
  const result = await pool.query(sql, params);
  return result.rows[0] as T | undefined;
}

export async function run(sql: string, params: unknown[] = []): Promise<QueryResult> {
  await initDb();
  return pool.query(sql, params);
}

export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  await initDb();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// Synchronous wrappers for API routes (Next.js API routes can be async)
// These are kept for compatibility but internally use async
export function queryAllSync<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  return queryAll<T>(sql, params);
}

export function queryOneSync<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  return queryOne<T>(sql, params);
}

export function runSync(sql: string, params: unknown[] = []): Promise<QueryResult> {
  return run(sql, params);
}

// Export migration utilities
export { runMigrations, getMigrationStatus } from './migrations';
