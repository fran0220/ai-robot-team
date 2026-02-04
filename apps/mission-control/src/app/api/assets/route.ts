import { NextRequest, NextResponse } from 'next/server';
import { listAssets, isMinioConfigured } from '@/lib/minio';
import type { AssetListResponse, AssetStage, AssetType } from '@/lib/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const workspaceId = searchParams.get('workspace_id');
  const stage = searchParams.get('stage') as AssetStage | null;
  const type = searchParams.get('type') as AssetType | null;

  if (!workspaceId) {
    return NextResponse.json(
      { error: 'workspace_id is required' },
      { status: 400 }
    );
  }

  if (!isMinioConfigured()) {
    return NextResponse.json(
      { error: 'MinIO is not configured' },
      { status: 503 }
    );
  }

  try {
    const assets = await listAssets(
      workspaceId,
      stage || undefined,
      type || undefined
    );

    const response: AssetListResponse = {
      assets,
      total: assets.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to list assets:', error);
    const message = error instanceof Error ? error.message : 'Failed to list assets';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
