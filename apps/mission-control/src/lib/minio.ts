import * as Minio from 'minio';
import type { Asset, AssetStage, AssetType } from './types';

const config = {
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 443,
  useSSL: process.env.MINIO_USE_SSL !== 'false',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
};

const bucket = process.env.MINIO_BUCKET || 'team-assets';

let minioClient: Minio.Client | null = null;

function getClient(): Minio.Client {
  if (!minioClient) {
    if (!config.accessKey || !config.secretKey) {
      throw new Error('MinIO credentials not configured');
    }
    minioClient = new Minio.Client(config);
  }
  return minioClient;
}

export function isMinioConfigured(): boolean {
  return !!(config.accessKey && config.secretKey && config.endPoint);
}

const EXTENSION_TO_TYPE: Record<string, AssetType> = {
  '.md': 'document',
  '.txt': 'document',
  '.pdf': 'document',
  '.doc': 'document',
  '.docx': 'document',
  '.png': 'visual',
  '.jpg': 'visual',
  '.jpeg': 'visual',
  '.gif': 'visual',
  '.svg': 'visual',
  '.webp': 'visual',
  '.mp4': 'visual',
  '.mov': 'visual',
  '.glb': 'model',
  '.gltf': 'model',
  '.obj': 'model',
  '.fbx': 'model',
  '.json': 'data',
  '.csv': 'data',
  '.xlsx': 'data',
  '.xml': 'data',
  '.ts': 'code',
  '.tsx': 'code',
  '.js': 'code',
  '.jsx': 'code',
  '.py': 'code',
  '.go': 'code',
  '.rs': 'code',
  '.css': 'code',
  '.html': 'code',
};

export function inferAssetType(filename: string): AssetType {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  return EXTENSION_TO_TYPE[ext] || 'other';
}

const VALID_STAGES: AssetStage[] = ['planning', 'design', 'build', 'review', 'deliver'];

export function inferStageFromPath(path: string): AssetStage {
  const parts = path.split('/');
  for (const part of parts) {
    if (VALID_STAGES.includes(part as AssetStage)) {
      return part as AssetStage;
    }
  }
  return 'build';
}

function getMimeType(filename: string): string | undefined {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.json': 'application/json',
    '.csv': 'text/csv',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.ts': 'application/typescript',
  };
  return mimeMap[ext];
}

export async function listAssets(
  workspaceId: string,
  stage?: AssetStage,
  type?: AssetType
): Promise<Asset[]> {
  const client = getClient();
  const prefix = stage
    ? `workspaces/${workspaceId}/${stage}/`
    : `workspaces/${workspaceId}/`;

  const assets: Asset[] = [];
  const stream = client.listObjectsV2(bucket, prefix, true);

  return new Promise((resolve, reject) => {
    stream.on('data', (obj) => {
      if (!obj.name) return;

      const name = obj.name.split('/').pop() || obj.name;
      const assetType = inferAssetType(name);

      if (type && assetType !== type) return;

      const asset: Asset = {
        id: Buffer.from(obj.name).toString('base64url'),
        name,
        path: obj.name,
        stage: inferStageFromPath(obj.name),
        type: assetType,
        size: obj.size || 0,
        mimeType: getMimeType(name),
        workspaceId,
        createdAt: obj.lastModified?.toISOString() || new Date().toISOString(),
        updatedAt: obj.lastModified?.toISOString() || new Date().toISOString(),
      };
      assets.push(asset);
    });

    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(assets));
  });
}

export async function getPresignedUrl(
  path: string,
  expirySeconds = 3600
): Promise<string> {
  const client = getClient();
  return client.presignedGetObject(bucket, path, expirySeconds);
}

export async function getPublicPresignedUrl(
  path: string,
  expirySeconds = 3600
): Promise<string> {
  const publicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT || 'minio-production-e654.up.railway.app';
  
  const publicClient = new Minio.Client({
    endPoint: publicEndpoint,
    port: 443,
    useSSL: true,
    accessKey: config.accessKey,
    secretKey: config.secretKey,
  });
  
  return publicClient.presignedGetObject(bucket, path, expirySeconds);
}

export function validatePathBelongsToWorkspace(
  path: string,
  workspaceId: string
): boolean {
  const expectedPrefix = `workspaces/${workspaceId}/`;
  return path.startsWith(expectedPrefix);
}
