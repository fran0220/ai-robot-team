import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, run } from '@/lib/db';
import type { DailyNote, CreateDailyNoteRequest } from '@/lib/types';

// GET /api/daily-notes - List daily notes with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent_id');
    const workspaceId = searchParams.get('workspace_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!agentId) {
      return NextResponse.json({ error: 'agent_id is required' }, { status: 400 });
    }

    let sql = `SELECT * FROM daily_notes WHERE agent_id = $1`;
    const params: unknown[] = [agentId];
    let paramIndex = 2;

    if (workspaceId) {
      sql += ` AND workspace_id = $${paramIndex++}`;
      params.push(workspaceId);
    }

    if (startDate) {
      sql += ` AND note_date >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      sql += ` AND note_date <= $${paramIndex++}`;
      params.push(endDate);
    }

    sql += ` ORDER BY note_date DESC`;

    const notes = await queryAll<DailyNote>(sql, params);
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Failed to fetch daily notes:', error);
    return NextResponse.json({ error: 'Failed to fetch daily notes' }, { status: 500 });
  }
}

// POST /api/daily-notes - Create or update a daily note (upsert)
export async function POST(request: NextRequest) {
  try {
    const body: CreateDailyNoteRequest = await request.json();

    if (!body.agent_id || !body.note_date || !body.content) {
      return NextResponse.json(
        { error: 'agent_id, note_date, and content are required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Check if note already exists for this agent and date
    const existing = await queryOne<DailyNote>(
      'SELECT * FROM daily_notes WHERE agent_id = $1 AND note_date = $2',
      [body.agent_id, body.note_date]
    );

    if (existing) {
      // Update existing note
      await run(
        `UPDATE daily_notes SET content = $1, tasks_worked = $2, updated_at = $3 WHERE id = $4`,
        [
          body.content,
          JSON.stringify(body.tasks_worked || existing.tasks_worked || []),
          now,
          existing.id,
        ]
      );

      const note = await queryOne<DailyNote>(
        'SELECT * FROM daily_notes WHERE id = $1',
        [existing.id]
      );

      return NextResponse.json(note);
    }

    // Create new note
    const id = uuidv4();

    await run(
      `INSERT INTO daily_notes (id, agent_id, workspace_id, note_date, content, tasks_worked, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        body.agent_id,
        body.workspace_id || null,
        body.note_date,
        body.content,
        JSON.stringify(body.tasks_worked || []),
        now,
        now,
      ]
    );

    const note = await queryOne<DailyNote>(
      'SELECT * FROM daily_notes WHERE id = $1',
      [id]
    );

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Failed to create/update daily note:', error);
    return NextResponse.json({ error: 'Failed to create/update daily note' }, { status: 500 });
  }
}
