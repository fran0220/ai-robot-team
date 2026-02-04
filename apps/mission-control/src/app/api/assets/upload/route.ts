import { NextRequest, NextResponse } from 'next/server';
import * as Minio from 'minio';

const config = {
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 443,
  useSSL: process.env.MINIO_USE_SSL !== 'false',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
};

const bucket = process.env.MINIO_BUCKET || 'team-assets';

export async function POST(request: NextRequest) {
  try {
    if (!config.accessKey || !config.secretKey) {
      return NextResponse.json({ error: 'MinIO not configured' }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const workspaceId = formData.get('workspace_id') as string;
    const stage = formData.get('stage') as string;
    const relativePath = formData.get('path') as string || file.name;

    if (!file || !workspaceId || !stage) {
      return NextResponse.json(
        { error: 'Missing required fields: file, workspace_id, stage' },
        { status: 400 }
      );
    }

    const client = new Minio.Client(config);
    const objectPath = `workspaces/${workspaceId}/${stage}/${relativePath}`;
    
    const buffer = Buffer.from(await file.arrayBuffer());
    await client.putObject(bucket, objectPath, buffer, buffer.length, {
      'Content-Type': file.type || 'application/octet-stream',
    });

    return NextResponse.json({
      success: true,
      path: objectPath,
      size: buffer.length,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
