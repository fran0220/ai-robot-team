#!/bin/bash
# Team Creator - 团队创建脚本
# 用法: ./create-team.sh <team_id> <spec_file>

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="/Users/fan/ai-robot-team"
TEMPLATES_DIR="$SCRIPT_DIR/../workspace/templates"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查参数
if [ -z "$1" ]; then
    echo "用法: $0 <team_id> [spec_file]"
    echo "示例: $0 finance specs/finance-team.yaml"
    exit 1
fi

TEAM_ID="$1"
SPEC_FILE="${2:-}"
TEAM_DIR="$PROJECT_ROOT/teams/$TEAM_ID"

# 检查团队是否已存在
if [ -d "$TEAM_DIR" ]; then
    log_error "团队目录已存在: $TEAM_DIR"
    read -p "是否覆盖？[y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

log_info "开始创建团队: $TEAM_ID"

# 1. 备份 openclaw.json
OPENCLAW_FILE="$PROJECT_ROOT/openclaw.json"
BACKUP_FILE="$PROJECT_ROOT/openclaw.json.bak"
cp "$OPENCLAW_FILE" "$BACKUP_FILE"
log_info "已备份 openclaw.json → openclaw.json.bak"

# 2. 创建目录结构
log_info "创建目录结构..."
mkdir -p "$TEAM_DIR"/{agents,docs,configs,shared,workspace}
log_success "目录结构已创建"

# 3. 创建团队文档
cat > "$TEAM_DIR/docs/TEAM.md" << EOF
# $TEAM_ID Team Documentation

## 概览

- **Team ID:** \`$TEAM_ID\`
- **创建时间:** $(date +%Y-%m-%d)

## 团队成员

*待配置*

## 工作流程

*待配置*

## 合规要求

*待配置*
EOF
log_success "团队文档已创建"

# 4. 创建团队共享内存文件
cat > "$TEAM_DIR/workspace/TEAM-MEMORY.md" << EOF
# $TEAM_ID Team Memory

## 团队共享记忆

*记录团队级别的重要决策、经验和上下文*

## 重要决策

## 经验教训

## 术语定义
EOF

log_success "团队共享内存已创建"

echo ""
log_success "团队基础结构创建完成！"
echo ""
echo "下一步："
echo "  1. 使用 create-agent.sh 添加团队成员"
echo "  2. 编辑 $TEAM_DIR/docs/TEAM.md 完善团队文档"
echo "  3. 配置 openclaw.json 中的 agents"
echo ""
