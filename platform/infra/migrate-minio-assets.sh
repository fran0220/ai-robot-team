#!/bin/bash
# MinIO 资产迁移脚本
# 将旧路径结构迁移到新的 workspace 架构

set -e

# 配置
MINIO_ALIAS="railway"
BUCKET="team-assets"
WORKSPACE_ID="8c68a088-41c6-4c58-a9fc-ad5694930e49"  # Robotics workspace

echo "🔄 MinIO 资产迁移脚本"
echo "========================"
echo "目标 Workspace: Robotics ($WORKSPACE_ID)"
echo ""

# 检查 mc 是否配置
if ! mc alias list $MINIO_ALIAS &>/dev/null; then
  echo "❌ MinIO alias '$MINIO_ALIAS' 未配置"
  echo "请先运行: mc alias set railway https://minio-production-e654.up.railway.app admin <password>"
  exit 1
fi

# 显示当前结构
echo "📁 当前 MinIO 结构:"
mc ls $MINIO_ALIAS/$BUCKET/ 2>/dev/null || echo "  (空或无法访问)"
echo ""

# 迁移映射：旧路径 -> 新路径（stage）
# docs/prd/     -> workspaces/{id}/planning/
# docs/dd/      -> workspaces/{id}/design/
# docs/bom/     -> workspaces/{id}/build/
# docs/review/  -> workspaces/{id}/review/
# designs/     -> workspaces/{id}/design/
# cad/         -> workspaces/{id}/build/

migrate_folder() {
  local src="$1"
  local stage="$2"
  local dest="$MINIO_ALIAS/$BUCKET/workspaces/$WORKSPACE_ID/$stage/"
  
  echo "📦 迁移 $src -> $stage/"
  
  # 检查源目录是否存在
  if mc ls "$MINIO_ALIAS/$BUCKET/$src" &>/dev/null; then
    mc cp --recursive "$MINIO_ALIAS/$BUCKET/$src" "$dest" 2>/dev/null && \
      echo "  ✅ 完成" || echo "  ⚠️ 部分失败"
  else
    echo "  ⏭️ 跳过 (源目录不存在)"
  fi
}

echo "🚀 开始迁移..."
echo ""

# 文档迁移
migrate_folder "docs/prd/" "planning"
migrate_folder "docs/dd/" "design"
migrate_folder "docs/bom/" "build"
migrate_folder "docs/review/" "review"

# 设计文件迁移
migrate_folder "designs/" "design"

# CAD 文件迁移
migrate_folder "cad/" "build"

echo ""
echo "📊 迁移后结构:"
mc ls "$MINIO_ALIAS/$BUCKET/workspaces/$WORKSPACE_ID/" 2>/dev/null || echo "  (无文件)"

echo ""
echo "✅ 迁移完成！"
echo ""
echo "💡 提示: 旧路径文件未删除，确认无误后可手动清理:"
echo "   mc rm --recursive --force $MINIO_ALIAS/$BUCKET/docs/"
echo "   mc rm --recursive --force $MINIO_ALIAS/$BUCKET/designs/"
echo "   mc rm --recursive --force $MINIO_ALIAS/$BUCKET/cad/"
