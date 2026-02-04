/**
 * Database Migrations System (PostgreSQL)
 * 
 * Handles schema changes in a production-safe way:
 * 1. Tracks which migrations have been applied
 * 2. Runs new migrations automatically on startup
 * 3. Never runs the same migration twice
 */

import { PoolClient } from 'pg';

interface Migration {
  id: string;
  name: string;
  up: (client: PoolClient) => Promise<void>;
}

// All migrations in order - NEVER remove or reorder existing migrations
const migrations: Migration[] = [
  {
    id: '001',
    name: 'initial_schema',
    up: async (client) => {
      // Core tables are created in schema.ts on fresh databases
      // This migration exists to mark the baseline for existing databases
      console.log('[Migration 001] Baseline schema marker');
    }
  },
  {
    id: '002',
    name: 'add_session_key_to_agents',
    up: async (client) => {
      console.log('[Migration 002] Ensuring session_key column exists...');
      
      // Check if column exists
      const result = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'agents' AND column_name = 'session_key'
      `);
      
      if (result.rows.length === 0) {
        await client.query(`ALTER TABLE agents ADD COLUMN session_key TEXT`);
        console.log('[Migration 002] Added session_key to agents');
      }
    }
  },
  {
    id: '003',
    name: 'add_planning_columns_to_tasks',
    up: async (client) => {
      console.log('[Migration 003] Adding planning columns to tasks...');
      
      const columns = [
        { name: 'planning_session_key', type: 'TEXT' },
        { name: 'planning_messages', type: 'JSONB' },
        { name: 'planning_complete', type: 'BOOLEAN DEFAULT FALSE' },
        { name: 'planning_spec', type: 'JSONB' },
        { name: 'planning_agents', type: 'JSONB' }
      ];
      
      for (const col of columns) {
        const result = await client.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'tasks' AND column_name = $1
        `, [col.name]);
        
        if (result.rows.length === 0) {
          await client.query(`ALTER TABLE tasks ADD COLUMN ${col.name} ${col.type}`);
          console.log(`[Migration 003] Added ${col.name} to tasks`);
        }
      }
    }
  },
  {
    id: '004',
    name: 'add_agent_memories_tables',
    up: async (client) => {
      // agent_memories - 长期记忆
      await client.query(`
        CREATE TABLE IF NOT EXISTS agent_memories (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
          workspace_id UUID DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES workspaces(id),
          memory_type TEXT NOT NULL CHECK (memory_type IN ('fact', 'decision', 'preference', 'lesson', 'context')),
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          tags JSONB DEFAULT '[]',
          importance INTEGER DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
          expires_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      
      // daily_notes - 每日工作笔记
      await client.query(`
        CREATE TABLE IF NOT EXISTS daily_notes (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
          workspace_id UUID DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES workspaces(id),
          note_date DATE NOT NULL,
          content TEXT NOT NULL,
          tasks_worked JSONB DEFAULT '[]',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(agent_id, note_date)
        )
      `);
      
      // Indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_memories_agent ON agent_memories(agent_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_memories_type ON agent_memories(memory_type)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_memories_tags ON agent_memories USING GIN(tags)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_daily_notes_agent_date ON daily_notes(agent_id, note_date DESC)`);
      
      console.log('[Migration 004] Created agent_memories and daily_notes tables');
    }
  }
];

/**
 * Run all pending migrations
 */
export async function runMigrations(client: PoolClient): Promise<void> {
  // Create migrations tracking table
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  
  // Get already applied migrations
  const result = await client.query('SELECT id FROM _migrations');
  const applied = new Set(result.rows.map(m => m.id));
  
  // Run pending migrations in order
  for (const migration of migrations) {
    if (applied.has(migration.id)) {
      continue;
    }
    
    console.log(`[DB] Running migration ${migration.id}: ${migration.name}`);
    
    try {
      await client.query('BEGIN');
      await migration.up(client);
      await client.query('INSERT INTO _migrations (id, name) VALUES ($1, $2)', [migration.id, migration.name]);
      await client.query('COMMIT');
      
      console.log(`[DB] Migration ${migration.id} completed`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`[DB] Migration ${migration.id} failed:`, error);
      throw error;
    }
  }
}

/**
 * Get migration status
 */
export async function getMigrationStatus(client: PoolClient): Promise<{ applied: string[]; pending: string[] }> {
  const result = await client.query('SELECT id FROM _migrations ORDER BY id');
  const applied = result.rows.map(m => m.id);
  const pending = migrations.filter(m => !applied.includes(m.id)).map(m => m.id);
  return { applied, pending };
}
