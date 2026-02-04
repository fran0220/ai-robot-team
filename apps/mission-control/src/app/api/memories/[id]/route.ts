import { NextRequest, NextResponse } from 'next/server';
import { queryOne, run } from '@/lib/db';
import type { AgentMemory } from '@/lib/types';

// GET /api/memories/[id] - Get a single memory
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const memory = await queryOne<AgentMemory>(
      'SELECT * FROM agent_memories WHERE id = $1',
      [id]
    );

    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    return NextResponse.json(memory);
  } catch (error) {
    console.error('Failed to fetch memory:', error);
    return NextResponse.json({ error: 'Failed to fetch memory' }, { status: 500 });
  }
}

// PATCH /api/memories/[id] - Update a memory
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await queryOne<AgentMemory>(
      'SELECT * FROM agent_memories WHERE id = $1',
      [id]
    );

    if (!existing) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    const now = new Date().toISOString();
    let paramIndex = 1;

    if (body.memory_type !== undefined) {
      const validTypes = ['fact', 'decision', 'preference', 'lesson', 'context'];
      if (!validTypes.includes(body.memory_type)) {
        return NextResponse.json(
          { error: `memory_type must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }
      updates.push(`memory_type = $${paramIndex++}`);
      values.push(body.memory_type);
    }

    if (body.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(body.title);
    }

    if (body.content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(body.content);
    }

    if (body.tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(JSON.stringify(body.tags));
    }

    if (body.importance !== undefined) {
      updates.push(`importance = $${paramIndex++}`);
      values.push(body.importance);
    }

    if (body.expires_at !== undefined) {
      updates.push(`expires_at = $${paramIndex++}`);
      values.push(body.expires_at);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updates.push(`updated_at = $${paramIndex++}`);
    values.push(now);
    values.push(id);

    await run(
      `UPDATE agent_memories SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    const memory = await queryOne<AgentMemory>(
      'SELECT * FROM agent_memories WHERE id = $1',
      [id]
    );

    return NextResponse.json(memory);
  } catch (error) {
    console.error('Failed to update memory:', error);
    return NextResponse.json({ error: 'Failed to update memory' }, { status: 500 });
  }
}

// DELETE /api/memories/[id] - Delete a memory
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await queryOne<AgentMemory>(
      'SELECT * FROM agent_memories WHERE id = $1',
      [id]
    );

    if (!existing) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    await run('DELETE FROM agent_memories WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete memory:', error);
    return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 });
  }
}
