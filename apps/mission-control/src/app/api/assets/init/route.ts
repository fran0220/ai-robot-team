import { NextResponse } from 'next/server';
import * as Minio from 'minio';

const config = {
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 443,
  useSSL: process.env.MINIO_USE_SSL !== 'false',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
};

const bucket = process.env.MINIO_BUCKET || 'team-assets';

export async function POST() {
  try {
    if (!config.accessKey || !config.secretKey) {
      return NextResponse.json({ error: 'MinIO not configured' }, { status: 503 });
    }

    const client = new Minio.Client(config);
    
    // Check/create bucket
    const exists = await client.bucketExists(bucket);
    if (!exists) {
      await client.makeBucket(bucket);
    }

    // Create workspace folder structure
    const workspaceId = '8c68a088-41c6-4c58-a9fc-ad5694930e49'; // Robotics
    const stages = ['planning', 'design', 'build', 'review', 'deliver'];
    
    for (const stage of stages) {
      const path = `workspaces/${workspaceId}/${stage}/.gitkeep`;
      try {
        await client.putObject(bucket, path, Buffer.from(''), 0);
      } catch (e) {
        // Ignore if exists
      }
    }

    // List current contents
    const objects: string[] = [];
    const stream = client.listObjectsV2(bucket, '', true);
    
    await new Promise<void>((resolve, reject) => {
      stream.on('data', (obj) => obj.name && objects.push(obj.name));
      stream.on('error', reject);
      stream.on('end', () => resolve());
    });

    return NextResponse.json({
      success: true,
      bucket,
      bucketExists: exists,
      workspaceId,
      objects,
    });
  } catch (error: any) {
    console.error('MinIO init error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
