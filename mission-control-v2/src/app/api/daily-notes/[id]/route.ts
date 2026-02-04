import { NextRequest, NextResponse } from 'next/server';
import { queryOne, run } from '@/lib/db';
import type { DailyNote } from '@/lib/types';

// GET /api/daily-notes/[id] - Get a single daily note
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const note = await queryOne<DailyNote>(
      'SELECT * FROM daily_notes WHERE id = $1',
      [id]
    );

    if (!note) {
      return NextResponse.json({ error: 'Daily note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('Failed to fetch daily note:', error);
    return NextResponse.json({ error: 'Failed to fetch daily note' }, { status: 500 });
  }
}

// PATCH /api/daily-notes/[id] - Update a daily note
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await queryOne<DailyNote>(
      'SELECT * FROM daily_notes WHERE id = $1',
      [id]
    );

    if (!existing) {
      return NextResponse.json({ error: 'Daily note not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    const now = new Date().toISOString();
    let paramIndex = 1;

    if (body.content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(body.content);
    }

    if (body.tasks_worked !== undefined) {
      updates.push(`tasks_worked = $${paramIndex++}`);
      values.push(JSON.stringify(body.tasks_worked));
    }

    if (body.note_date !== undefined) {
      updates.push(`note_date = $${paramIndex++}`);
      values.push(body.note_date);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updates.push(`updated_at = $${paramIndex++}`);
    values.push(now);
    values.push(id);

    await run(
      `UPDATE daily_notes SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    const note = await queryOne<DailyNote>(
      'SELECT * FROM daily_notes WHERE id = $1',
      [id]
    );

    return NextResponse.json(note);
  } catch (error) {
    console.error('Failed to update daily note:', error);
    return NextResponse.json({ error: 'Failed to update daily note' }, { status: 500 });
  }
}

// DELETE /api/daily-notes/[id] - Delete a daily note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await queryOne<DailyNote>(
      'SELECT * FROM daily_notes WHERE id = $1',
      [id]
    );

    if (!existing) {
      return NextResponse.json({ error: 'Daily note not found' }, { status: 404 });
    }

    await run('DELETE FROM daily_notes WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete daily note:', error);
    return NextResponse.json({ error: 'Failed to delete daily note' }, { status: 500 });
  }
}
