#!/bin/bash

# kkFileView 预览集成测试脚本
# 用法: ./test-preview.sh [mission-control-url]

BASE_URL="${1:-http://localhost:3000}"
WORKSPACE_ID="robotics"

echo "=========================================="
echo "kkFileView 预览集成测试"
echo "Mission Control: $BASE_URL"
echo "Workspace: $WORKSPACE_ID"
echo "=========================================="
echo ""

# 测试文件列表 (路径, 描述)
declare -a TEST_FILES=(
  "workspaces/robotics/design/robot-arm.glb|3D 模型 (GLB)"
  "workspaces/robotics/design/motor-assembly.step|3D 模型 (STEP)"
  "workspaces/robotics/planning/requirements.md|Markdown 文档"
  "workspaces/robotics/build/main.py|Python 代码"
  "workspaces/robotics/design/schematic.pdf|PDF 文档"
  "workspaces/robotics/design/render.png|图片 (PNG)"
)

echo "1. 测试 /api/preview 端点"
echo "-------------------------------------------"

for item in "${TEST_FILES[@]}"; do
  IFS='|' read -r path desc <<< "$item"
  echo ""
  echo "📄 $desc"
  echo "   Path: $path"
  
  response=$(curl -s "${BASE_URL}/api/preview?path=${path}&workspace_id=${WORKSPACE_ID}")
  
  if echo "$response" | grep -q "previewUrl"; then
    previewUrl=$(echo "$response" | grep -o '"previewUrl":"[^"]*"' | cut -d'"' -f4)
    echo "   ✅ Preview URL 生成成功"
    echo "   URL: ${previewUrl:0:80}..."
  elif echo "$response" | grep -q "error"; then
    error=$(echo "$response" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
    echo "   ❌ 错误: $error"
  else
    echo "   ⚠️  未知响应: $response"
  fi
done

echo ""
echo "=========================================="
echo "2. 测试 kkFileView 服务可用性"
echo "-------------------------------------------"

KKFILEVIEW_URL="${KKFILEVIEW_URL:-http://localhost:8012}"
echo "kkFileView URL: $KKFILEVIEW_URL"

if curl -s -o /dev/null -w "%{http_code}" "$KKFILEVIEW_URL" | grep -q "200\|302"; then
  echo "✅ kkFileView 服务正常运行"
else
  echo "❌ kkFileView 服务不可用"
  echo "   请确保 kkFileView 已启动:"
  echo "   docker-compose -f platform/infra/docker-compose.kkfileview.yml up -d"
fi

echo ""
echo "=========================================="
echo "3. 支持的文件格式"
echo "-------------------------------------------"
echo "3D 模型: .obj .stl .ply .gltf .glb .fbx .3ds .step .iges"
echo "文档:    .pdf .doc .docx .xls .xlsx .ppt .pptx .md .txt"
echo "代码:    .js .ts .py .java .go .rs .json .xml .css .html"
echo "CAD:     .dwg .dxf"
echo "压缩包:  .zip .rar .7z .tar"
echo ""
echo "=========================================="
