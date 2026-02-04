#!/bin/bash
# Team Validator - 验证团队配置
# 用法: ./validate-team.sh <team_id>

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="/Users/fan/ai-robot-team"
SKILLS_DIR="$PROJECT_ROOT/platform/skills"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

check_pass() { echo -e "  ${GREEN}✓${NC} $1"; }
check_fail() { echo -e "  ${RED}✗${NC} $1"; ((ERRORS++)); }
check_warn() { echo -e "  ${YELLOW}!${NC} $1"; ((WARNINGS++)); }

# 检查参数
if [ -z "$1" ]; then
    echo "用法: $0 <team_id>"
    echo "示例: $0 finance"
    exit 1
fi

TEAM_ID="$1"
TEAM_DIR="$PROJECT_ROOT/teams/$TEAM_ID"
OPENCLAW_FILE="$PROJECT_ROOT/openclaw.json"

echo ""
echo "🔍 验证团队: $TEAM_ID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. 检查目录结构
echo ""
echo "📁 目录结构检查"

if [ -d "$TEAM_DIR" ]; then
    check_pass "团队目录存在: $TEAM_DIR"
else
    check_fail "团队目录不存在: $TEAM_DIR"
    exit 1
fi

[ -d "$TEAM_DIR/agents" ] && check_pass "agents/ 目录存在" || check_fail "agents/ 目录不存在"
[ -d "$TEAM_DIR/docs" ] && check_pass "docs/ 目录存在" || check_fail "docs/ 目录不存在"
[ -d "$TEAM_DIR/workspace" ] && check_pass "workspace/ 目录存在" || check_fail "workspace/ 目录不存在"

# 2. 检查团队文档
echo ""
echo "📝 团队文档检查"

[ -f "$TEAM_DIR/docs/TEAM.md" ] && check_pass "TEAM.md 存在" || check_warn "TEAM.md 不存在"
[ -f "$TEAM_DIR/workspace/TEAM-MEMORY.md" ] && check_pass "TEAM-MEMORY.md 存在" || check_warn "TEAM-MEMORY.md 不存在"

# 3. 检查 Agents
echo ""
echo "🤖 Agents 检查"

AGENT_COUNT=0
for agent_dir in "$TEAM_DIR/agents"/*/; do
    if [ -d "$agent_dir" ]; then
        agent_name=$(basename "$agent_dir")
        workspace="$agent_dir/workspace"
        
        echo ""
        echo "  Agent: $TEAM_ID.$agent_name"
        
        # 检查 workspace
        if [ -d "$workspace" ]; then
            check_pass "workspace/ 存在"
            
            # 检查必需文件
            [ -f "$workspace/IDENTITY.md" ] && check_pass "IDENTITY.md" || check_fail "IDENTITY.md 缺失"
            [ -f "$workspace/SOUL.md" ] && check_pass "SOUL.md" || check_fail "SOUL.md 缺失"
            [ -f "$workspace/AGENTS.md" ] && check_pass "AGENTS.md" || check_fail "AGENTS.md 缺失"
            
            # 检查可选文件
            [ -f "$workspace/USER.md" ] || check_warn "USER.md 未创建"
            [ -f "$workspace/TOOLS.md" ] || check_warn "TOOLS.md 未创建"
            [ -d "$workspace/memory" ] || check_warn "memory/ 目录未创建"
            [ -d "$workspace/tasks" ] || check_warn "tasks/ 目录未创建"
        else
            check_fail "workspace/ 不存在"
        fi
        
        ((AGENT_COUNT++))
    fi
done

if [ $AGENT_COUNT -eq 0 ]; then
    check_warn "团队没有任何 Agent"
fi

# 4. 检查 openclaw.json 配置
echo ""
echo "⚙️ openclaw.json 配置检查"

if [ -f "$OPENCLAW_FILE" ]; then
    # 检查 JSON 格式
    if command -v jq &> /dev/null; then
        if jq empty "$OPENCLAW_FILE" 2>/dev/null; then
            check_pass "JSON 格式有效"
            
            # 检查每个 agent 是否在配置中
            for agent_dir in "$TEAM_DIR/agents"/*/; do
                if [ -d "$agent_dir" ]; then
                    agent_name=$(basename "$agent_dir")
                    agent_id="$TEAM_ID.$agent_name"
                    
                    if jq -e ".agents.list[] | select(.id == \"$agent_id\")" "$OPENCLAW_FILE" > /dev/null 2>&1; then
                        check_pass "Agent $agent_id 已配置"
                    else
                        check_fail "Agent $agent_id 未在 openclaw.json 中配置"
                    fi
                fi
            done
        else
            check_fail "JSON 格式无效"
        fi
    else
        check_warn "未安装 jq，跳过 JSON 详细检查"
    fi
else
    check_fail "openclaw.json 不存在"
fi

# 5. 检查 Skills 引用
echo ""
echo "🎯 Skills 引用检查"

# 从 SOUL.md 中提取 skills 并验证
for agent_dir in "$TEAM_DIR/agents"/*/; do
    if [ -d "$agent_dir" ]; then
        agent_name=$(basename "$agent_dir")
        soul_file="$agent_dir/workspace/SOUL.md"
        
        if [ -f "$soul_file" ]; then
            # 提取 backtick 中的 skill 名称
            skills=$(grep -oE '\`[a-z0-9-]+\`' "$soul_file" 2>/dev/null | tr -d '`' | sort -u)
            
            for skill in $skills; do
                # 检查是否在 skills 目录中存在
                if [ -d "$SKILLS_DIR/$skill" ]; then
                    : # skill 存在，不输出（太多）
                else
                    # 检查是否是已知的非 skill 关键词
                    case "$skill" in
                        memory|tasks|workspace|docs|agents|team)
                            ;;
                        *)
                            check_warn "$agent_name 引用了不存在的 skill: $skill"
                            ;;
                    esac
                fi
            done
        fi
    fi
done

# 6. 汇总
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ 验证通过！团队配置正确。${NC}"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️ 验证完成，有 $WARNINGS 个警告。${NC}"
else
    echo -e "${RED}❌ 验证失败，有 $ERRORS 个错误，$WARNINGS 个警告。${NC}"
fi

echo ""
echo "  Agents 数量: $AGENT_COUNT"
echo "  错误: $ERRORS"
echo "  警告: $WARNINGS"
echo ""

exit $ERRORS
