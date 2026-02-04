import { NextRequest, NextResponse } from 'next/server';
import { queryOne, run } from '@/lib/db';
import type { Document, UpdateDocumentRequest } from '@/lib/types';

// GET /api/documents/[id] - Get a single document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const document = await queryOne<Document & { author_name?: string; author_emoji?: string; author_role?: string }>(
      `SELECT d.*,
        a.name as author_name,
        a.avatar_emoji as author_emoji,
        a.role as author_role
       FROM documents d
       LEFT JOIN agents a ON d.author_id = a.id
       WHERE d.id = $1`,
      [id]
    );

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const result = {
      ...document,
      author: document.author_id
        ? {
            id: document.author_id,
            name: document.author_name,
            avatar_emoji: document.author_emoji,
            role: document.author_role,
          }
        : undefined,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch document:', error);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}

// PATCH /api/documents/[id] - Update a document
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateDocumentRequest = await request.json();

    const existing = await queryOne<Document>('SELECT * FROM documents WHERE id = $1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    const now = new Date().toISOString();
    let paramIndex = 1;

    if (body.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(body.title);
    }
    if (body.content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(body.content);
    }
    if (body.doc_type !== undefined) {
      updates.push(`doc_type = $${paramIndex++}`);
      values.push(body.doc_type);
    }
    if (body.workspace_id !== undefined) {
      updates.push(`workspace_id = $${paramIndex++}`);
      values.push(body.workspace_id);
    }
    if (body.task_id !== undefined) {
      updates.push(`task_id = $${paramIndex++}`);
      values.push(body.task_id);
    }
    if (body.author_id !== undefined) {
      updates.push(`author_id = $${paramIndex++}`);
      values.push(body.author_id);
    }
    if (body.file_path !== undefined) {
      updates.push(`file_path = $${paramIndex++}`);
      values.push(body.file_path);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updates.push(`updated_at = $${paramIndex++}`);
    values.push(now);
    values.push(id);

    await run(`UPDATE documents SET ${updates.join(', ')} WHERE id = $${paramIndex}`, values);

    // Fetch updated document with author info
    const document = await queryOne<Document & { author_name?: string; author_emoji?: string; author_role?: string }>(
      `SELECT d.*,
        a.name as author_name,
        a.avatar_emoji as author_emoji,
        a.role as author_role
       FROM documents d
       LEFT JOIN agents a ON d.author_id = a.id
       WHERE d.id = $1`,
      [id]
    );

    const result = document
      ? {
          ...document,
          author: document.author_id
            ? {
                id: document.author_id,
                name: document.author_name,
                avatar_emoji: document.author_emoji,
                role: document.author_role,
              }
            : undefined,
        }
      : null;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to update document:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await queryOne<Document>('SELECT * FROM documents WHERE id = $1', [id]);

    if (!existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    await run('DELETE FROM documents WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
