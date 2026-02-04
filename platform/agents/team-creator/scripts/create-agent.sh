#!/bin/bash
# Agent Creator - 创建单个 Agent
# 用法: ./create-agent.sh <team_id> <agent_name> <agent_role> [skills...]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="/Users/fan/ai-robot-team"
TEMPLATES_DIR="$SCRIPT_DIR/../workspace/templates"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查参数
if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
    echo "用法: $0 <team_id> <agent_name> <agent_role> [skills...]"
    echo "示例: $0 finance analyst '数据分析师' code-review python-executor analytics-tracking"
    exit 1
fi

TEAM_ID="$1"
AGENT_NAME="$2"
AGENT_ROLE="$3"
shift 3
SKILLS=("$@")

TEAM_DIR="$PROJECT_ROOT/teams/$TEAM_ID"
AGENT_DIR="$TEAM_DIR/agents/$AGENT_NAME"
WORKSPACE_DIR="$AGENT_DIR/workspace"

# 检查团队是否存在
if [ ! -d "$TEAM_DIR" ]; then
    log_error "团队不存在: $TEAM_ID"
    log_info "请先运行: ./create-team.sh $TEAM_ID"
    exit 1
fi

# 检查 Agent 是否已存在
if [ -d "$AGENT_DIR" ]; then
    log_warn "Agent 已存在: $AGENT_NAME"
    read -p "是否覆盖？[y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    rm -rf "$AGENT_DIR"
fi

log_info "创建 Agent: $TEAM_ID.$AGENT_NAME ($AGENT_ROLE)"

# 1. 创建目录结构
mkdir -p "$WORKSPACE_DIR"/{memory,tasks}
log_success "目录结构已创建"

# 2. 创建 IDENTITY.md
cat > "$WORKSPACE_DIR/IDENTITY.md" << EOF
# IDENTITY.md - Who Am I?

- **Name:** $AGENT_NAME
- **Creature:** AI $AGENT_ROLE
- **Vibe:** 专业、高效
- **Emoji:** 🤖
- **Avatar:** avatars/$AGENT_NAME.png

---

我是 $TEAM_ID 团队的 $AGENT_ROLE。
EOF
log_success "IDENTITY.md 已创建"

# 3. 创建 SOUL.md
SKILLS_MD=""
for skill in "${SKILLS[@]}"; do
    SKILLS_MD="$SKILLS_MD\n- \`$skill\`"
done

cat > "$WORKSPACE_DIR/SOUL.md" << EOF
# SOUL.md - $AGENT_NAME 核心指令

## 我是谁

我是 **$AGENT_NAME**，$TEAM_ID 团队的 $AGENT_ROLE。

## 职责范围

*待配置 - 描述你的主要职责*

## 技能清单

$(echo -e "$SKILLS_MD")

## 行为边界

### 允许
- 在职责范围内自主工作
- 与团队成员协作
- 访问团队共享资源

### 禁止
- 未经确认修改他人工作
- 泄露敏感信息
- 超出职责范围的操作

### 需要确认
- 重大决策
- 对外发布内容
- 删除操作
EOF
log_success "SOUL.md 已创建"

# 4. 创建 AGENTS.md
cat > "$WORKSPACE_DIR/AGENTS.md" << EOF
# AGENTS.md - $AGENT_NAME Workspace

This folder is home. Treat it that way.

## Every Session

Before doing anything else:

**团队记忆（优先读取）:**
1. Read \`$TEAM_DIR/workspace/TEAM-MEMORY.md\` — 团队共享记忆
2. Read \`/Users/fan/ai-robot-team/workspace/GLOSSARY.md\` — 术语表
3. Read \`/Users/fan/ai-robot-team/workspace/LESSONS.md\` — 踩坑记录

**个人记忆:**
1. Read \`SOUL.md\` — this is who you are
2. Read \`USER.md\` — this is who you're helping
3. Read \`memory/YYYY-MM-DD.md\` (today + yesterday) for recent context

Don't ask permission. Just do it.

## Memory

- **Daily notes:** \`memory/YYYY-MM-DD.md\`
- **Long-term:** \`MEMORY.md\`

## Safety

- Don't exfiltrate private data. Ever.
- Don't run destructive commands without asking.
- When in doubt, ask.
EOF
log_success "AGENTS.md 已创建"

# 5. 创建其他必需文件
touch "$WORKSPACE_DIR/USER.md"
touch "$WORKSPACE_DIR/TOOLS.md"
touch "$WORKSPACE_DIR/HEARTBEAT.md"
log_success "其他文件已创建"

# 6. 更新 openclaw.json
OPENCLAW_FILE="$PROJECT_ROOT/openclaw.json"
AGENT_ID="$TEAM_ID.$AGENT_NAME"
WORKSPACE_PATH="./teams/$TEAM_ID/agents/$AGENT_NAME/workspace"

# 检查是否已存在
if grep -q "\"id\": \"$AGENT_ID\"" "$OPENCLAW_FILE"; then
    log_warn "Agent $AGENT_ID 已在 openclaw.json 中，跳过"
else
    # 使用 jq 添加 agent（如果安装了 jq）
    if command -v jq &> /dev/null; then
        NEW_AGENT="{\"id\": \"$AGENT_ID\", \"workspace\": \"$WORKSPACE_PATH\"}"
        jq ".agents.list += [$NEW_AGENT]" "$OPENCLAW_FILE" > "$OPENCLAW_FILE.tmp"
        mv "$OPENCLAW_FILE.tmp" "$OPENCLAW_FILE"
        log_success "已添加到 openclaw.json"
    else
        log_warn "未安装 jq，请手动添加以下配置到 openclaw.json 的 agents.list:"
        echo "  { \"id\": \"$AGENT_ID\", \"workspace\": \"$WORKSPACE_PATH\" }"
    fi
fi

echo ""
log_success "Agent 创建完成！"
echo ""
echo "Agent ID: $AGENT_ID"
echo "Workspace: $WORKSPACE_PATH"
echo ""
echo "下一步："
echo "  1. 编辑 $WORKSPACE_DIR/SOUL.md 完善职责描述"
echo "  2. 编辑 $WORKSPACE_DIR/IDENTITY.md 设置个性"
echo "  3. 配置所需的 skills"
echo ""
