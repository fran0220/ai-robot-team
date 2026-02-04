import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, run } from '@/lib/db';
import type { AgentMemory, CreateMemoryRequest } from '@/lib/types';

// GET /api/memories - List memories with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent_id');
    const workspaceId = searchParams.get('workspace_id');
    const memoryType = searchParams.get('memory_type');
    const tags = searchParams.get('tags');
    const search = searchParams.get('search');

    if (!agentId) {
      return NextResponse.json({ error: 'agent_id is required' }, { status: 400 });
    }

    let sql = `SELECT * FROM agent_memories WHERE agent_id = $1`;
    const params: unknown[] = [agentId];
    let paramIndex = 2;

    if (workspaceId) {
      sql += ` AND workspace_id = $${paramIndex++}`;
      params.push(workspaceId);
    }

    if (memoryType) {
      sql += ` AND memory_type = $${paramIndex++}`;
      params.push(memoryType);
    }

    if (tags) {
      const tagList = tags.split(',').map(t => t.trim());
      sql += ` AND tags ?| $${paramIndex++}`;
      params.push(tagList);
    }

    if (search) {
      sql += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` ORDER BY importance DESC, created_at DESC`;

    const memories = await queryAll<AgentMemory>(sql, params);
    return NextResponse.json(memories);
  } catch (error) {
    console.error('Failed to fetch memories:', error);
    return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 });
  }
}

// POST /api/memories - Create a new memory
export async function POST(request: NextRequest) {
  try {
    const body: CreateMemoryRequest = await request.json();

    if (!body.agent_id || !body.memory_type || !body.title || !body.content) {
      return NextResponse.json(
        { error: 'agent_id, memory_type, title, and content are required' },
        { status: 400 }
      );
    }

    const validTypes = ['fact', 'decision', 'preference', 'lesson', 'context'];
    if (!validTypes.includes(body.memory_type)) {
      return NextResponse.json(
        { error: `memory_type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    await run(
      `INSERT INTO agent_memories (id, agent_id, workspace_id, memory_type, title, content, tags, importance, expires_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        id,
        body.agent_id,
        body.workspace_id || null,
        body.memory_type,
        body.title,
        body.content,
        JSON.stringify(body.tags || []),
        body.importance || 5,
        body.expires_at || null,
        now,
        now,
      ]
    );

    const memory = await queryOne<AgentMemory>(
      'SELECT * FROM agent_memories WHERE id = $1',
      [id]
    );

    return NextResponse.json(memory, { status: 201 });
  } catch (error) {
    console.error('Failed to create memory:', error);
    return NextResponse.json({ error: 'Failed to create memory' }, { status: 500 });
  }
}
