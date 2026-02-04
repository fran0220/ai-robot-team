/**
 * Migration Script: Convex → PostgreSQL
 * 
 * Migrates agents, tasks, messages, activities, notifications, documents
 * from Convex backend to Mission Control V2 PostgreSQL.
 * 
 * Usage: npx tsx scripts/migrate-from-convex.ts
 */

import { Pool } from 'pg';

const CONVEX_URL = process.env.CONVEX_URL || 'https://convex-backend-production-3dbe.up.railway.app';
const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ID Mapping: Convex ID → PostgreSQL UUID
const idMap: Record<string, string> = {};

async function fetchFromConvex(functionPath: string, args: object = {}): Promise<unknown> {
  const response = await fetch(`${CONVEX_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: functionPath,
      args,
      format: 'json',
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Convex query failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.value;
}

function generateUUID(): string {
  return crypto.randomUUID();
}

function mapConvexId(convexId: string): string {
  if (!idMap[convexId]) {
    idMap[convexId] = generateUUID();
  }
  return idMap[convexId];
}

function convexStatusToPg(status: string): string {
  const statusMap: Record<string, string> = {
    'idle': 'standby',
    'active': 'working',
    'blocked': 'offline',
  };
  return statusMap[status] || 'standby';
}

async function migrateAgents(client: import('pg').PoolClient): Promise<void> {
  console.log('\n📦 Migrating agents...');
  
  const agents = await fetchFromConvex('agents:list') as Array<{
    _id: string;
    name: string;
    role: string;
    status: string;
    sessionKey: string;
    mentionPatterns: string[];
    model: string;
    lastHeartbeat?: number;
  }>;
  
  console.log(`  Found ${agents.length} agents in Convex`);
  
  for (const agent of agents) {
    const pgId = mapConvexId(agent._id);
    
    // Check if agent already exists by name
    const existing = await client.query(
      'SELECT id FROM agents WHERE name = $1',
      [agent.name]
    );
    
    if (existing.rows.length > 0) {
      // Update existing agent and map its ID
      idMap[agent._id] = existing.rows[0].id;
      console.log(`  ✓ Agent ${agent.name} already exists, using ID ${existing.rows[0].id}`);
      
      await client.query(`
        UPDATE agents SET
          role = $2,
          status = $3,
          session_key = $4,
          mention_patterns = $5,
          model = $6,
          last_heartbeat = $7,
          updated_at = NOW()
        WHERE id = $1
      `, [
        existing.rows[0].id,
        agent.role,
        convexStatusToPg(agent.status),
        agent.sessionKey,
        JSON.stringify(agent.mentionPatterns),
        agent.model,
        agent.lastHeartbeat ? new Date(agent.lastHeartbeat) : null,
      ]);
    } else {
      // Insert new agent
      await client.query(`
        INSERT INTO agents (id, name, role, status, session_key, mention_patterns, model, last_heartbeat, workspace_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, '00000000-0000-0000-0000-000000000001')
        ON CONFLICT (id) DO UPDATE SET
          role = EXCLUDED.role,
          status = EXCLUDED.status,
          session_key = EXCLUDED.session_key,
          mention_patterns = EXCLUDED.mention_patterns,
          model = EXCLUDED.model,
          last_heartbeat = EXCLUDED.last_heartbeat,
          updated_at = NOW()
      `, [
        pgId,
        agent.name,
        agent.role,
        convexStatusToPg(agent.status),
        agent.sessionKey,
        JSON.stringify(agent.mentionPatterns),
        agent.model,
        agent.lastHeartbeat ? new Date(agent.lastHeartbeat) : null,
      ]);
      console.log(`  + Created agent ${agent.name} (${pgId})`);
    }
  }
  
  console.log(`  ✅ Migrated ${agents.length} agents`);
}

async function migrateTasks(client: import('pg').PoolClient): Promise<void> {
  console.log('\n📋 Migrating tasks...');
  
  const tasks = await fetchFromConvex('tasks:list') as Array<{
    _id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    assigneeIds: string[];
    createdBy?: string;
    reviewerId?: string;
    reviewComment?: string;
    reviewedAt?: number;
    dueDate?: number;
    originalStatus?: string;
    createdAt: number;
    updatedAt: number;
  }>;
  
  console.log(`  Found ${tasks.length} tasks in Convex`);
  
  for (const task of tasks) {
    const pgId = mapConvexId(task._id);
    const assignedAgentId = task.assigneeIds?.[0] ? idMap[task.assigneeIds[0]] : null;
    const createdByAgentId = task.createdBy ? idMap[task.createdBy] : null;
    const reviewerId = task.reviewerId ? idMap[task.reviewerId] : null;
    
    await client.query(`
      INSERT INTO tasks (id, title, description, status, priority, assigned_agent_id, created_by_agent_id, reviewer_id, review_comment, reviewed_at, due_date, original_status, workspace_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, '00000000-0000-0000-0000-000000000001', $13, $14)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        priority = EXCLUDED.priority,
        assigned_agent_id = EXCLUDED.assigned_agent_id,
        updated_at = NOW()
    `, [
      pgId,
      task.title,
      task.description,
      task.status,
      task.priority,
      assignedAgentId,
      createdByAgentId,
      reviewerId,
      task.reviewComment || null,
      task.reviewedAt ? new Date(task.reviewedAt) : null,
      task.dueDate ? new Date(task.dueDate) : null,
      task.originalStatus || null,
      new Date(task.createdAt),
      new Date(task.updatedAt),
    ]);
    console.log(`  + Task: ${task.title} (${task.status})`);
  }
  
  console.log(`  ✅ Migrated ${tasks.length} tasks`);
}

async function migrateActivities(client: import('pg').PoolClient): Promise<void> {
  console.log('\n📊 Migrating activities...');
  
  try {
    const activities = await fetchFromConvex('activities:getRecent', { limit: 1000 }) as Array<{
      _id: string;
      type: string;
      agentId: string;
      taskId?: string;
      message: string;
      metadata?: unknown;
      createdAt: number;
    }>;
    
    console.log(`  Found ${activities.length} activities in Convex`);
    
    for (const activity of activities) {
      const pgId = generateUUID();
      const agentId = idMap[activity.agentId] || null;
      const taskId = activity.taskId ? idMap[activity.taskId] : null;
      
      // Insert into task_activities if task-related
      if (taskId) {
        await client.query(`
          INSERT INTO task_activities (id, task_id, agent_id, activity_type, message, metadata, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING
        `, [
          pgId,
          taskId,
          agentId,
          activity.type,
          activity.message,
          activity.metadata ? JSON.stringify(activity.metadata) : null,
          new Date(activity.createdAt),
        ]);
      }
      
      // Also insert into events table
      await client.query(`
        INSERT INTO events (id, workspace_id, type, agent_id, task_id, message, metadata, created_at)
        VALUES ($1, '00000000-0000-0000-0000-000000000001', $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING
      `, [
        generateUUID(),
        activity.type,
        agentId,
        taskId,
        activity.message,
        activity.metadata ? JSON.stringify(activity.metadata) : null,
        new Date(activity.createdAt),
      ]);
    }
    
    console.log(`  ✅ Migrated ${activities.length} activities`);
  } catch (error) {
    console.log(`  ⚠️ Could not migrate activities: ${error}`);
  }
}

async function migrateMessages(client: import('pg').PoolClient): Promise<void> {
  console.log('\n💬 Migrating messages...');
  
  try {
    // Get all tasks to fetch messages for each
    const tasks = await fetchFromConvex('tasks:list') as Array<{ _id: string }>;
    let totalMessages = 0;
    
    for (const task of tasks) {
      try {
        const messages = await fetchFromConvex('messages:getByTask', { taskId: task._id }) as Array<{
          _id: string;
          taskId: string;
          fromAgentId: string;
          content: string;
          mentions?: string[];
          createdAt: number;
        }>;
        
        for (const msg of messages) {
          const pgId = mapConvexId(msg._id);
          const taskId = idMap[msg.taskId] || null;
          const senderAgentId = idMap[msg.fromAgentId] || null;
          const mentions = msg.mentions?.map(id => idMap[id]).filter(Boolean) || [];
          
          await client.query(`
            INSERT INTO messages (id, task_id, sender_agent_id, content, message_type, mentions, created_at)
            VALUES ($1, $2, $3, $4, 'text', $5, $6)
            ON CONFLICT (id) DO NOTHING
          `, [
            pgId,
            taskId,
            senderAgentId,
            msg.content,
            JSON.stringify(mentions),
            new Date(msg.createdAt),
          ]);
          totalMessages++;
        }
      } catch {
        // Task might not have messages
      }
    }
    
    console.log(`  ✅ Migrated ${totalMessages} messages`);
  } catch (error) {
    console.log(`  ⚠️ Could not migrate messages: ${error}`);
  }
}

async function migrateNotifications(client: import('pg').PoolClient): Promise<void> {
  console.log('\n🔔 Migrating notifications...');
  
  // Get notifications for each agent
  const agents = await fetchFromConvex('agents:list') as Array<{ _id: string; name: string }>;
  let totalNotifications = 0;
  
  for (const agent of agents) {
    try {
      const notifications = await fetchFromConvex('notifications:getUndelivered', { agentId: agent._id }) as Array<{
        _id: string;
        mentionedAgentId: string;
        fromAgentId: string;
        taskId?: string;
        messageId?: string;
        content: string;
        delivered: boolean;
        createdAt: number;
      }>;
      
      for (const notif of notifications) {
        const pgId = generateUUID();
        const mentionedAgentId = idMap[notif.mentionedAgentId] || null;
        const fromAgentId = idMap[notif.fromAgentId] || null;
        const taskId = notif.taskId ? idMap[notif.taskId] : null;
        const messageId = notif.messageId ? idMap[notif.messageId] : null;
        
        if (mentionedAgentId) {
          await client.query(`
            INSERT INTO notifications (id, mentioned_agent_id, from_agent_id, task_id, message_id, content, delivered, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id) DO NOTHING
          `, [
            pgId,
            mentionedAgentId,
            fromAgentId,
            taskId,
            messageId,
            notif.content,
            notif.delivered,
            new Date(notif.createdAt),
          ]);
          totalNotifications++;
        }
      }
    } catch {
      // Agent might not have notifications
    }
  }
  
  console.log(`  ✅ Migrated ${totalNotifications} notifications`);
}

async function saveIdMapping(client: import('pg').PoolClient): Promise<void> {
  console.log('\n💾 Saving ID mapping...');
  
  // Create mapping table if not exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS convex_id_mapping (
      convex_id TEXT PRIMARY KEY,
      pg_id UUID NOT NULL,
      entity_type TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  
  for (const [convexId, pgId] of Object.entries(idMap)) {
    await client.query(`
      INSERT INTO convex_id_mapping (convex_id, pg_id)
      VALUES ($1, $2)
      ON CONFLICT (convex_id) DO UPDATE SET pg_id = EXCLUDED.pg_id
    `, [convexId, pgId]);
  }
  
  console.log(`  ✅ Saved ${Object.keys(idMap).length} ID mappings`);
}

async function printSummary(client: import('pg').PoolClient): Promise<void> {
  console.log('\n📊 Migration Summary');
  console.log('═'.repeat(50));
  
  const counts = await client.query(`
    SELECT 
      (SELECT COUNT(*) FROM agents) as agents,
      (SELECT COUNT(*) FROM tasks) as tasks,
      (SELECT COUNT(*) FROM messages) as messages,
      (SELECT COUNT(*) FROM notifications) as notifications,
      (SELECT COUNT(*) FROM events) as events,
      (SELECT COUNT(*) FROM task_activities) as activities
  `);
  
  const row = counts.rows[0];
  console.log(`  Agents:        ${row.agents}`);
  console.log(`  Tasks:         ${row.tasks}`);
  console.log(`  Messages:      ${row.messages}`);
  console.log(`  Notifications: ${row.notifications}`);
  console.log(`  Events:        ${row.events}`);
  console.log(`  Activities:    ${row.activities}`);
  console.log('═'.repeat(50));
}

async function main() {
  console.log('🚀 Starting Convex → PostgreSQL Migration');
  console.log(`  Convex URL: ${CONVEX_URL}`);
  console.log(`  PostgreSQL: ${DATABASE_URL?.split('@')[1] || 'connected'}`);
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    await migrateAgents(client);
    await migrateTasks(client);
    await migrateActivities(client);
    await migrateMessages(client);
    await migrateNotifications(client);
    await saveIdMapping(client);
    
    await client.query('COMMIT');
    
    await printSummary(client);
    
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
