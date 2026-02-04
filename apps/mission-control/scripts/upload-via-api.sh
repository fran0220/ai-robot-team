#!/bin/bash
# 通过 Mission Control API 上传资产到 MinIO

API_URL="https://mission-control-v2-production-33ad.up.railway.app/api/assets/upload"
WORKSPACE_ID="8c68a088-41c6-4c58-a9fc-ad5694930e49"

upload_file() {
  local file="$1"
  local stage="$2"
  local rel_path="$3"
  
  echo "  📤 $rel_path"
  curl -s -X POST "$API_URL" \
    -F "file=@$file" \
    -F "workspace_id=$WORKSPACE_ID" \
    -F "stage=$stage" \
    -F "path=$rel_path" > /dev/null
}

upload_dir() {
  local dir="$1"
  local stage="$2"
  local base_name=$(basename "$dir")
  
  if [ ! -d "$dir" ]; then
    echo "⏭️  跳过 $dir (不存在)"
    return
  fi
  
  local count=$(find "$dir" -type f ! -name ".*" | wc -l | tr -d ' ')
  echo ""
  echo "📂 $base_name → $stage/ ($count 文件)"
  
  find "$dir" -type f ! -name ".*" | while read file; do
    rel_path="${file#$dir/}"
    upload_file "$file" "$stage" "$rel_path"
  done
}

echo "🚀 上传资产到 MinIO (via API)"
echo "=============================="
echo "Workspace: $WORKSPACE_ID"

# 设计文件
upload_dir "/Users/fan/ai-robot-team/teams/robotics/shared/designs" "design"

# CAD 文件
upload_dir "/Users/fan/ai-robot-team/teams/robotics/shared/cad" "build"

# 文档
upload_dir "/Users/fan/ai-robot-team/archive/team-docs/prd" "planning"
upload_dir "/Users/fan/ai-robot-team/archive/team-docs/dd" "design"
upload_dir "/Users/fan/ai-robot-team/archive/team-docs/bom" "build"
upload_dir "/Users/fan/ai-robot-team/archive/team-docs/review" "review"
upload_dir "/Users/fan/ai-robot-team/archive/team-docs/specs" "planning"

echo ""
echo "✅ 上传完成！"
