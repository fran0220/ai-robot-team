import { NextRequest, NextResponse } from 'next/server';
import { queryAll, queryOne, run } from '@/lib/db';
import type { Workspace, WorkspaceStats, TaskStatus } from '@/lib/types';

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// GET /api/workspaces - List all workspaces with stats
export async function GET(request: NextRequest) {
  const includeStats = request.nextUrl.searchParams.get('stats') === 'true';

  try {
    if (includeStats) {
      // Get workspaces with task counts and agent counts
      const workspaces = await queryAll<Workspace>('SELECT * FROM workspaces ORDER BY name');
      
      const stats: WorkspaceStats[] = [];
      
      for (const workspace of workspaces) {
        // Get task counts by status
        const taskCounts = await queryAll<{ status: TaskStatus; count: string }>(`
          SELECT status, COUNT(*) as count 
          FROM tasks 
          WHERE workspace_id = $1 
          GROUP BY status
        `, [workspace.id]);
        
        const counts: WorkspaceStats['taskCounts'] = {
          planning: 0,
          inbox: 0,
          assigned: 0,
          in_progress: 0,
          testing: 0,
          review: 0,
          done: 0,
          total: 0
        };
        
        taskCounts.forEach(tc => {
          counts[tc.status] = parseInt(tc.count as string, 10);
          counts.total += parseInt(tc.count as string, 10);
        });
        
        // Get agent count
        const agentCountResult = await queryOne<{ count: string }>(
          'SELECT COUNT(*) as count FROM agents WHERE workspace_id = $1',
          [workspace.id]
        );
        
        stats.push({
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          icon: workspace.icon,
          taskCounts: counts,
          agentCount: agentCountResult ? parseInt(agentCountResult.count as string, 10) : 0
        });
      }
      
      return NextResponse.json(stats);
    }
    
    const workspaces = await queryAll<Workspace>('SELECT * FROM workspaces ORDER BY name');
    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('Failed to fetch workspaces:', error);
    return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 });
  }
}

// POST /api/workspaces - Create a new workspace
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const slug = generateSlug(name);
    
    // Check if slug already exists
    const existing = await queryOne<{ id: string }>('SELECT id FROM workspaces WHERE slug = $1', [slug]);
    if (existing) {
      return NextResponse.json({ error: 'A workspace with this name already exists' }, { status: 400 });
    }

    await run(`
      INSERT INTO workspaces (id, name, slug, description, icon)
      VALUES ($1, $2, $3, $4, $5)
    `, [id, name.trim(), slug, description || null, icon || '📁']);

    const workspace = await queryOne<Workspace>('SELECT * FROM workspaces WHERE id = $1', [id]);
    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error('Failed to create workspace:', error);
    return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
  }
}
