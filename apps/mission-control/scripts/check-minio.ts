/**
 * 检查 MinIO 连接和文件列表
 * 使用: npx tsx scripts/check-minio.ts
 */

import * as Minio from 'minio';

const endpoint = process.env.MINIO_ENDPOINT || 'minio-production-e654.up.railway.app';
const accessKey = process.env.MINIO_ACCESS_KEY || 'admin';
const secretKey = process.env.MINIO_SECRET_KEY || 'EPxtMkGstFW0dXWjKwrB';
const bucket = process.env.MINIO_BUCKET || 'team-assets';
const useSSL = process.env.MINIO_USE_SSL !== 'false';

console.log('🔍 MinIO 检查工具');
console.log('==================');
console.log(`Endpoint: ${endpoint}`);
console.log(`Bucket: ${bucket}`);
console.log(`SSL: ${useSSL}`);
console.log('');

const minioClient = new Minio.Client({
  endPoint: endpoint,
  port: useSSL ? 443 : 9000,
  useSSL,
  accessKey,
  secretKey,
});

async function checkConnection() {
  try {
    console.log('📡 测试连接...');
    const exists = await minioClient.bucketExists(bucket);
    console.log(`✅ Bucket "${bucket}" 存在: ${exists}`);
    
    if (!exists) {
      console.log('🔧 创建 bucket...');
      await minioClient.makeBucket(bucket);
      console.log('✅ Bucket 创建成功');
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ 连接失败:', error.message);
    return false;
  }
}

async function listAllObjects(prefix = '') {
  return new Promise<Minio.BucketItem[]>((resolve, reject) => {
    const objects: Minio.BucketItem[] = [];
    const stream = minioClient.listObjectsV2(bucket, prefix, true);
    
    stream.on('data', (obj) => objects.push(obj));
    stream.on('error', reject);
    stream.on('end', () => resolve(objects));
  });
}

async function main() {
  const connected = await checkConnection();
  if (!connected) {
    process.exit(1);
  }
  
  console.log('\n📁 文件列表:');
  console.log('─'.repeat(60));
  
  try {
    const objects = await listAllObjects();
    
    if (objects.length === 0) {
      console.log('  (空 bucket)');
    } else {
      // 按前缀分组
      const grouped: Record<string, Minio.BucketItem[]> = {};
      for (const obj of objects) {
        const prefix = obj.name?.split('/')[0] || 'root';
        if (!grouped[prefix]) grouped[prefix] = [];
        grouped[prefix].push(obj);
      }
      
      for (const [prefix, items] of Object.entries(grouped)) {
        console.log(`\n📂 ${prefix}/ (${items.length} 文件)`);
        for (const item of items.slice(0, 10)) {
          const size = item.size ? `${(item.size / 1024).toFixed(1)}KB` : '';
          console.log(`  └─ ${item.name} ${size}`);
        }
        if (items.length > 10) {
          console.log(`  └─ ... 还有 ${items.length - 10} 个文件`);
        }
      }
    }
    
    console.log('\n' + '─'.repeat(60));
    console.log(`总计: ${objects.length} 个文件`);
  } catch (error: any) {
    console.error('❌ 列出文件失败:', error.message);
  }
}

main();
