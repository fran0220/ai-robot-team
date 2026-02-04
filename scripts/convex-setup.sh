#!/bin/bash
# 配置 Convex Mission Control

set -e
cd /root/multiagent/team

# Railway 项目信息
export RAILWAY_PROJECT_ID="d896ccfb-1264-4e00-a308-e803ce412bca"
export CONVEX_URL="https://convex-backend-production-3dbe.up.railway.app"

echo "🔧 Setting up Convex Mission Control..."

# 检查环境变量
if [ -z "$CONVEX_ADMIN_KEY" ]; then
  echo "❌ CONVEX_ADMIN_KEY not set. Getting from Railway..."
  # 从 Railway 获取
  CONVEX_ADMIN_KEY=$(railway variables get CONVEX_SELF_HOSTED_ADMIN_KEY 2>/dev/null || echo "")
  if [ -z "$CONVEX_ADMIN_KEY" ]; then
    echo "Please set CONVEX_ADMIN_KEY manually:"
    echo "export CONVEX_ADMIN_KEY='railway|...'"
    exit 1
  fi
  export CONVEX_ADMIN_KEY
fi

echo "✅ Convex URL: $CONVEX_URL"

# 部署 schema
echo "📦 Deploying Convex functions..."
cd convex
npx convex deploy --url "$CONVEX_URL" --admin-key "$CONVEX_ADMIN_KEY" --yes

# 初始化 agents
echo "👥 Initializing team agents..."
npx convex run agents:initTeam --url "$CONVEX_URL" --admin-key "$CONVEX_ADMIN_KEY"

echo ""
echo "✅ Convex Mission Control configured!"
echo ""
echo "Dashboard: $CONVEX_URL"
echo "Railway Project: $RAILWAY_PROJECT_ID"
