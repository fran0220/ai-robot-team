import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, run, queryOne } from '@/lib/db';
import type { Document, CreateDocumentRequest, Agent } from '@/lib/types';

// GET /api/documents - List documents with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');
    const docType = searchParams.get('doc_type');
    const taskId = searchParams.get('task_id');
    const authorId = searchParams.get('author_id');
    const search = searchParams.get('search');

    let sql = `
      SELECT
        d.*,
        a.name as author_name,
        a.avatar_emoji as author_emoji,
        a.role as author_role
      FROM documents d
      LEFT JOIN agents a ON d.author_id = a.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (workspaceId) {
      sql += ` AND d.workspace_id = $${paramIndex++}`;
      params.push(workspaceId);
    }
    if (docType) {
      sql += ` AND d.doc_type = $${paramIndex++}`;
      params.push(docType);
    }
    if (taskId) {
      sql += ` AND d.task_id = $${paramIndex++}`;
      params.push(taskId);
    }
    if (authorId) {
      sql += ` AND d.author_id = $${paramIndex++}`;
      params.push(authorId);
    }
    if (search) {
      sql += ` AND d.title ILIKE $${paramIndex++}`;
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY d.created_at DESC';

    const documents = await queryAll<Document & { author_name?: string; author_emoji?: string; author_role?: string }>(sql, params);

    // Transform to include nested author info
    const transformedDocuments = documents.map((doc) => ({
      ...doc,
      author: doc.author_id
        ? {
            id: doc.author_id,
            name: doc.author_name,
            avatar_emoji: doc.author_emoji,
            role: doc.author_role,
          }
        : undefined,
    }));

    return NextResponse.json(transformedDocuments);
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

// POST /api/documents - Create a new document
export async function POST(request: NextRequest) {
  try {
    const body: CreateDocumentRequest = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    await run(
      `INSERT INTO documents (id, workspace_id, title, content, doc_type, task_id, author_id, file_path, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        body.workspace_id || null,
        body.title,
        body.content || null,
        body.doc_type || null,
        body.task_id || null,
        body.author_id || null,
        body.file_path || null,
        now,
        now,
      ]
    );

    // Fetch created document with author info
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

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create document:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
