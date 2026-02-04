#!/bin/bash
# 同步 OpenClaw agents 到 Convex
# 读取 openclaw.json，对比 Convex，自动添加缺失的 agent

CONVEX_URL="https://convex-backend-production-3dbe.up.railway.app"
OPENCLAW_CONFIG="/root/multiagent/team/openclaw.json"

echo "🔄 同步 Agent 到 Convex..."

# 获取 Convex 中已有的 agent 名称
CONVEX_AGENTS=$(curl -s "$CONVEX_URL/api/query" \
  -H "Content-Type: application/json" \
  -d '{"path": "agents:list", "args": {}}' | jq -r '.value[].name' | tr '[:upper:]' '[:lower:]')

# 获取 OpenClaw 中的 agent
OPENCLAW_AGENTS=$(cat "$OPENCLAW_CONFIG" | jq -r '.agents.list[].id')

# 角色映射
declare -A ROLES=(
  ["nova"]="项目主控"
  ["sage"]="调研分析"
  ["atlas"]="产品经理"
  ["jarvis"]="硬件工程"
  ["friday"]="软件开发"
  ["vision"]="测试验证"
  ["xiaomao"]="质量审查"
  ["idra"]="工业设计"
  ["mech"]="结构工程"
)

ADDED=0
for agent_id in $OPENCLAW_AGENTS; do
  # 检查是否已存在（忽略大小写）
  agent_lower=$(echo "$agent_id" | tr '[:upper:]' '[:lower:]')
  if echo "$CONVEX_AGENTS" | grep -qi "^${agent_lower}$"; then
    echo "  ✓ $agent_id 已存在"
  else
    # 获取 agent 配置
    AGENT_CONFIG=$(cat "$OPENCLAW_CONFIG" | jq -r ".agents.list[] | select(.id == \"$agent_id\")")
    MENTIONS=$(echo "$AGENT_CONFIG" | jq -c '.groupChat.mentionPatterns // ["@" + .id]')
    MODEL=$(echo "$AGENT_CONFIG" | jq -r '.model.primary // "gpt-5.2-codex"' | sed 's/.*\///')
    ROLE="${ROLES[$agent_id]:-未知}"
    NAME=$(echo "$agent_id" | sed 's/./\U&/')  # 首字母大写
    
    echo "  + 添加 $NAME ($ROLE)..."
    
    curl -s "$CONVEX_URL/api/mutation" \
      -H "Content-Type: application/json" \
      -d "{
        \"path\": \"agents:create\",
        \"args\": {
          \"name\": \"$NAME\",
          \"role\": \"$ROLE\",
          \"sessionKey\": \"agent:$agent_id:main\",
          \"mentionPatterns\": $MENTIONS,
          \"model\": \"$MODEL\"
        }
      }" > /dev/null
    
    ((ADDED++))
  fi
done

echo ""
if [ $ADDED -gt 0 ]; then
  echo "✅ 新增 $ADDED 个 Agent"
else
  echo "✅ 所有 Agent 已同步"
fi
