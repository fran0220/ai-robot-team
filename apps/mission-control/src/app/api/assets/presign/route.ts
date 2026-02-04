import { NextRequest, NextResponse } from 'next/server';
import { getPresignedUrl, isMinioConfigured, validatePathBelongsToWorkspace } from '@/lib/minio';

const PRESIGN_EXPIRY_SECONDS = 3600;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');
  const workspaceId = searchParams.get('workspace_id');

  if (!path) {
    return NextResponse.json({ error: 'path is required' }, { status: 400 });
  }

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

  if (!validatePathBelongsToWorkspace(path, workspaceId)) {
    return NextResponse.json(
      { error: 'Access denied: path does not belong to workspace' },
      { status: 403 }
    );
  }

  try {
    const url = await getPresignedUrl(path, PRESIGN_EXPIRY_SECONDS);
    return NextResponse.json({
      url,
      expiresIn: PRESIGN_EXPIRY_SECONDS,
    });
  } catch (error) {
    console.error('Failed to generate presigned URL:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate presigned URL';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
