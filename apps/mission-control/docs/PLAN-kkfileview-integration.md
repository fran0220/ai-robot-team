# kkFileView 集成计划

## 概述

集成 kkFileView 作为通用文件预览服务，解决 Mission Control 中各种文件格式的在线预览问题。

## 目标

- 支持 3D 模型预览（STEP, GLB, STL, OBJ 等）
- 支持文档预览（PDF, MD, DOCX, TXT 等）
- 支持代码文件预览（语法高亮）
- 保持现有图片预览功能
- 统一的预览体验

---

## 架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│  Mission Control (Next.js)                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  AssetPreview                                               ││
│  │  ┌─────────────┐  ┌──────────────────────────────────────┐ ││
│  │  │ Metadata    │  │  Preview Area                        │ ││
│  │  │ - Name      │  │  ┌────────────────────────────────┐  │ ││
│  │  │ - Size      │  │  │  <iframe>                      │  │ ││
│  │  │ - Stage     │  │  │  src={kkFileView URL}          │  │ ││
│  │  │ - Type      │  │  │                                │  │ ││
│  │  │ - Created   │  │  │  (或原生 img for 图片)          │  │ ││
│  │  └─────────────┘  │  └────────────────────────────────┘  │ ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
          │                              │
          │ /api/assets/presign          │ /api/preview
          ▼                              ▼
┌─────────────────────┐        ┌─────────────────────────────────┐
│  MinIO              │        │  kkFileView (Docker)            │
│  (Railway Internal) │◄───────│  - 端口: 8012                    │
│                     │        │  - 通过 presigned URL 获取文件    │
└─────────────────────┘        └─────────────────────────────────┘
```

## 网络拓扑

```
Railway Internal Network
├── mission-control.railway.internal:3000
├── minio.railway.internal:9000  (内网访问)
├── kkfileview.railway.internal:8012  (新增)
└── External: minio-production-e654.up.railway.app (公网)
              kkfileview-xxx.up.railway.app (公网)
```

---

## Phase 1: kkFileView 部署 (P0) ✅ 完成

### 1.1 创建 Railway 服务

**方案 A: Railway Docker 部署（推荐）**

在 Railway 创建新服务，使用 Docker image:

```yaml
# 服务配置
Image: keking/kkfileview:4.4.0
Port: 8012

# 环境变量
KK_CONTEXT_PATH: /
KK_OFFICE_PREVIEW_TYPE: image  # office 转图片预览
KK_PDF_DOWNLOAD_DISABLE: true  # 禁止下载
KK_MEDIA_CONVERT_DISABLE: false
KK_FILE_ENCODING: UTF-8
```

**方案 B: 本地开发用 docker-compose**

```yaml
# platform/infra/docker-compose.kkfileview.yml
version: '3.8'
services:
  kkfileview:
    image: keking/kkfileview:4.4.0
    ports:
      - "8012:8012"
    environment:
      - KK_CONTEXT_PATH=/
      - KK_OFFICE_PREVIEW_TYPE=image
    restart: unless-stopped
```

### 1.2 环境变量配置

```env
# .env.example 新增
# ====================================
# kkFileView 预览服务
# ====================================

# kkFileView 服务 URL
KKFILEVIEW_URL=http://kkfileview.railway.internal:8012

# 公网访问 URL (用于生成 presigned URL 回调)
KKFILEVIEW_PUBLIC_URL=https://kkfileview-xxx.up.railway.app
```

**完成时间:** 2026-02-05

---

## Phase 2: 预览 API 开发 (P0) ✅ 完成

### 2.1 创建预览代理 API

```
src/app/api/preview/route.ts
```

**功能:**
1. 接收文件路径和 workspace_id
2. 生成 MinIO presigned URL（使用公网地址）
3. 构建 kkFileView 预览 URL
4. 返回预览 URL 或代理 iframe

**核心逻辑:**

```typescript
// GET /api/preview?path=xxx&workspace_id=xxx
export async function GET(request: NextRequest) {
  const path = searchParams.get('path');
  const workspaceId = searchParams.get('workspace_id');
  
  // 1. 验证路径权限
  if (!validatePathBelongsToWorkspace(path, workspaceId)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  
  // 2. 生成公网 presigned URL (kkFileView 需要能访问)
  const presignedUrl = await getPublicPresignedUrl(path, 3600);
  
  // 3. 构建 kkFileView URL
  const encodedUrl = encodeURIComponent(
    Buffer.from(presignedUrl).toString('base64')
  );
  const previewUrl = `${KKFILEVIEW_URL}/onlinePreview?url=${encodedUrl}`;
  
  return NextResponse.json({ previewUrl });
}
```

### 2.2 更新 MinIO 客户端

```typescript
// src/lib/minio.ts 新增

// 生成公网可访问的 presigned URL
export async function getPublicPresignedUrl(
  path: string,
  expirySeconds = 3600
): Promise<string> {
  // 使用公网 endpoint 生成 URL
  const publicClient = new Minio.Client({
    endPoint: process.env.MINIO_PUBLIC_ENDPOINT || 'minio-production-e654.up.railway.app',
    port: 443,
    useSSL: true,
    accessKey: config.accessKey,
    secretKey: config.secretKey,
  });
  
  return publicClient.presignedGetObject(bucket, path, expirySeconds);
}
```

**完成时间:** 2026-02-05

---

## Phase 3: 前端组件重构 (P0) ✅ 完成

### 3.1 重构 AssetPreview 组件

**新增功能:**
- 通用预览模式（iframe 嵌入 kkFileView）
- 保留图片原生预览（性能更好）
- 全屏预览按钮
- 预览加载状态

**文件判断逻辑:**

```typescript
// 判断是否使用原生预览
const useNativePreview = (asset: Asset): boolean => {
  // 图片使用原生 <img>
  if (asset.type === 'visual' && asset.mimeType?.startsWith('image/')) {
    return true;
  }
  return false;
};

// 判断是否支持 kkFileView 预览
const supportsKkPreview = (asset: Asset): boolean => {
  const supportedExtensions = [
    // 3D 模型
    '.obj', '.stl', '.ply', '.gltf', '.glb', '.fbx', '.3ds', '.step', '.iges',
    // 文档
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.md', '.txt',
    // 代码
    '.js', '.ts', '.py', '.java', '.go', '.rs', '.json', '.xml', '.css', '.html',
    // CAD
    '.dwg', '.dxf',
    // 其他
    '.zip', '.rar',
  ];
  
  const ext = asset.name.substring(asset.name.lastIndexOf('.')).toLowerCase();
  return supportedExtensions.includes(ext);
};
```

### 3.2 UI 更新

```tsx
// Preview Area 重构
{useNativePreview(asset) ? (
  // 原生图片预览
  <img src={previewUrl} alt={asset.name} />
) : supportsKkPreview(asset) ? (
  // kkFileView iframe 预览
  <div className="relative w-full h-full">
    {previewLoading && <LoadingOverlay />}
    <iframe
      src={kkPreviewUrl}
      className="w-full h-full border-0"
      onLoad={() => setPreviewLoading(false)}
    />
  </div>
) : (
  // 不支持预览
  <UnsupportedPreview asset={asset} />
)}
```

### 3.3 新增全屏预览模态框

```tsx
// src/components/assets/PreviewModal.tsx
export function PreviewModal({ 
  asset, 
  previewUrl, 
  isOpen, 
  onClose 
}: PreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh]">
        <iframe src={previewUrl} className="w-full h-[80vh]" />
      </DialogContent>
    </Dialog>
  );
}
```

**完成时间:** 2026-02-05

---

## Phase 4: 集成测试 (P1) ✅ 完成

### 4.1 测试矩阵

| 文件类型 | 示例文件 | 预期结果 |
|---------|---------|---------|
| 3D 模型 | .glb, .step, .stl | 3D 交互预览 |
| PDF | .pdf | 翻页阅读 |
| Office | .docx, .xlsx | 转图片显示 |
| Markdown | .md | 渲染后显示 |
| 代码 | .ts, .py | 语法高亮 |
| 图片 | .png, .jpg | 原生显示 |
| CAD | .dwg | 2D 预览 |

### 4.2 测试脚本

```bash
# platform/infra/test-preview.sh
#!/bin/bash

FILES=(
  "workspaces/robotics/design/robot-arm.glb"
  "workspaces/robotics/design/motor-assembly.step"
  "workspaces/robotics/planning/requirements.md"
  "workspaces/robotics/build/main.py"
)

for file in "${FILES[@]}"; do
  echo "Testing: $file"
  curl -s "http://localhost:3000/api/preview?path=$file&workspace_id=robotics" | jq .
done
```

**完成时间:** 2026-02-05

---

## Phase 5: 优化与安全 (P2) 待实施

### 5.1 安全增强

- [ ] 添加预览 URL 签名验证
- [ ] 限制 presigned URL 有效期
- [ ] 添加文件大小限制（大文件只提供下载）

### 5.2 性能优化

- [ ] 预览 URL 缓存
- [ ] 图片缩略图生成
- [ ] 大文件分片加载

### 5.3 UI 优化

- [ ] 预览进度条
- [ ] 预览错误重试
- [ ] 预览历史记录

**预计工时:** 2-3h

---

## 文件清单

### 新增文件

```
platform/infra/docker-compose.kkfileview.yml    # 本地开发
src/app/api/preview/route.ts                     # 预览 API
src/components/assets/PreviewModal.tsx           # 全屏预览
platform/infra/test-preview.sh                   # 测试脚本
```

### 修改文件

```
src/components/assets/AssetPreview.tsx           # 集成 kkFileView
src/lib/minio.ts                                 # 新增公网 URL 生成
.env.example                                     # 新增 kkFileView 配置
```

---

## 环境变量总结

```env
# kkFileView
KKFILEVIEW_URL=http://kkfileview.railway.internal:8012
KKFILEVIEW_PUBLIC_URL=https://kkfileview-xxx.up.railway.app

# MinIO (新增公网 endpoint)
MINIO_PUBLIC_ENDPOINT=minio-production-e654.up.railway.app
```

---

## 执行顺序

```mermaid
graph LR
    P1[Phase 1: 部署 kkFileView] --> P2[Phase 2: 预览 API]
    P2 --> P3[Phase 3: 前端重构]
    P3 --> P4[Phase 4: 集成测试]
    P4 --> P5[Phase 5: 优化]
```

**总预计工时:** 4-6h (Phase 1-4)

---

## 验证清单

- [ ] kkFileView 服务部署成功
- [ ] kkFileView 能访问 MinIO presigned URL
- [ ] 3D 模型 (GLB, STEP) 预览正常
- [ ] 文档 (PDF, MD, DOCX) 预览正常
- [ ] 代码文件语法高亮正常
- [ ] 图片保持原生预览
- [ ] 全屏预览功能正常
- [ ] 错误处理和重试机制
- [ ] Railway 部署验证

---

## 风险与备选方案

### 风险 1: kkFileView 内存占用大

**缓解:** Railway 分配 1GB+ 内存，监控使用情况

### 风险 2: STEP 文件预览不理想

**备选:** 使用 convert-step-to-gltf.py 转换后预览 GLB

### 风险 3: kkFileView 无法访问内网 MinIO

**解决:** 使用公网 presigned URL，已在方案中考虑
