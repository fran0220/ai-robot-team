/**
 * 上传本地资产到 MinIO
 * 使用: npx tsx scripts/upload-assets.ts
 */

import * as Minio from 'minio';
import * as fs from 'fs';
import * as path from 'path';

const WORKSPACE_ID = '8c68a088-41c6-4c58-a9fc-ad5694930e49';
const BUCKET = 'team-assets';

// 本地使用公网地址
const client = new Minio.Client({
  endPoint: 'minio-production-e654.up.railway.app',
  port: 443,
  useSSL: true,
  accessKey: 'admin',
  secretKey: 'EPxtMkGstFW0dXWjKwrB',
});

// 源目录映射到 stage
const SOURCE_MAP: Record<string, string> = {
  '/Users/fan/ai-robot-team/teams/robotics/shared/designs': 'design',
  '/Users/fan/ai-robot-team/teams/robotics/shared/cad': 'build',
  '/Users/fan/ai-robot-team/archive/team-docs/prd': 'planning',
  '/Users/fan/ai-robot-team/archive/team-docs/dd': 'design',
  '/Users/fan/ai-robot-team/archive/team-docs/bom': 'build',
  '/Users/fan/ai-robot-team/archive/team-docs/review': 'review',
  '/Users/fan/ai-robot-team/archive/team-docs/specs': 'planning',
};

async function uploadFile(localPath: string, remotePath: string): Promise<boolean> {
  try {
    const stat = fs.statSync(localPath);
    await client.fPutObject(BUCKET, remotePath, localPath, {
      'Content-Type': getMimeType(localPath),
    });
    console.log(`  ✅ ${path.basename(localPath)} (${(stat.size / 1024).toFixed(1)}KB)`);
    return true;
  } catch (err: any) {
    console.log(`  ❌ ${path.basename(localPath)}: ${err.message}`);
    return false;
  }
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.md': 'text/markdown',
    '.txt': 'text/plain',
    '.pdf': 'application/pdf',
    '.step': 'application/step',
    '.stl': 'model/stl',
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json',
    '.json': 'application/json',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

function getAllFiles(dir: string): string[] {
  const files: string[] = [];
  
  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (!entry.name.startsWith('.')) {
        files.push(fullPath);
      }
    }
  }
  
  if (fs.existsSync(dir)) {
    walk(dir);
  }
  return files;
}

async function main() {
  console.log('📤 上传资产到 MinIO');
  console.log('====================');
  console.log(`Workspace: ${WORKSPACE_ID}`);
  console.log('');

  // 检查连接
  try {
    const exists = await client.bucketExists(BUCKET);
    console.log(`✅ 连接成功，Bucket: ${BUCKET}`);
    if (!exists) {
      await client.makeBucket(BUCKET);
      console.log('✅ Bucket 已创建');
    }
  } catch (err: any) {
    console.error('❌ 连接失败:', err.message);
    process.exit(1);
  }

  let totalUploaded = 0;
  let totalFailed = 0;

  for (const [sourceDir, stage] of Object.entries(SOURCE_MAP)) {
    if (!fs.existsSync(sourceDir)) {
      console.log(`\n⏭️  跳过 ${sourceDir} (不存在)`);
      continue;
    }

    const files = getAllFiles(sourceDir);
    if (files.length === 0) {
      console.log(`\n⏭️  跳过 ${sourceDir} (空目录)`);
      continue;
    }

    console.log(`\n📂 ${path.basename(sourceDir)} → ${stage}/ (${files.length} 文件)`);

    for (const localPath of files) {
      // 保留子目录结构
      const relativePath = path.relative(sourceDir, localPath);
      const remotePath = `workspaces/${WORKSPACE_ID}/${stage}/${relativePath}`;
      
      const success = await uploadFile(localPath, remotePath);
      if (success) totalUploaded++;
      else totalFailed++;
    }
  }

  console.log('\n====================');
  console.log(`✅ 上传完成: ${totalUploaded} 个文件`);
  if (totalFailed > 0) {
    console.log(`❌ 失败: ${totalFailed} 个文件`);
  }
}

main();
