#!/bin/bash
# 检查 OpenClaw 工作区配置

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔍 OpenClaw Workspace Setup Check"
echo "=================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_pass() {
    echo -e "  ${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "  ${RED}✗${NC} $1"
}

check_warn() {
    echo -e "  ${YELLOW}⚠${NC} $1"
}

# 1. 检查核心配置文件
echo "📄 Configuration Files"
if [ -f "$PROJECT_ROOT/openclaw.json" ]; then
    check_pass "openclaw.json exists"
else
    check_fail "openclaw.json missing - create from template"
fi

if [ -f "$PROJECT_ROOT/.env" ]; then
    check_pass ".env exists"
else
    check_warn ".env missing - copy from .env.example"
fi

if [ -f "$PROJECT_ROOT/.env.example" ]; then
    check_pass ".env.example exists"
else
    check_fail ".env.example missing"
fi

# 2. 检查 Agent 工作区
echo ""
echo "🤖 Agent Workspaces"
AGENTS=(nova sage atlas jarvis friday vision idra mech xiaomao)
for agent in "${AGENTS[@]}"; do
    if [ -d "$PROJECT_ROOT/agents/$agent/workspace" ]; then
        check_pass "$agent workspace"
    else
        check_fail "$agent workspace missing"
    fi
done

# 3. 检查符号链接
echo ""
echo "🔗 Symlinks"
if [ -L "$PROJECT_ROOT/agents/nova/workspace/docs" ]; then
    target=$(readlink "$PROJECT_ROOT/agents/nova/workspace/docs")
    if [[ "$target" == *"/root/"* ]]; then
        check_fail "docs symlink points to old server path: $target"
    else
        check_pass "docs symlinks fixed"
    fi
else
    check_warn "docs symlink not found"
fi

# 4. 检查 OpenClaw CLI
echo ""
echo "🛠️  OpenClaw CLI"
if command -v openclaw &> /dev/null; then
    version=$(openclaw --version 2>/dev/null || echo "unknown")
    check_pass "openclaw installed: $version"
else
    check_fail "openclaw not installed - run: npm install -g openclaw@latest"
fi

# 5. 检查 Node.js
echo ""
echo "📦 Node.js"
if command -v node &> /dev/null; then
    node_version=$(node --version)
    check_pass "Node.js $node_version"
else
    check_fail "Node.js not installed"
fi

# 6. 检查 npx (for Convex commands)
if command -v npx &> /dev/null; then
    check_pass "npx available"
else
    check_fail "npx not available"
fi

# 7. 检查环境变量（如果 .env 存在）
echo ""
echo "🔑 Environment Variables"
if [ -f "$PROJECT_ROOT/.env" ]; then
    source "$PROJECT_ROOT/.env"
    
    if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ "$TELEGRAM_BOT_TOKEN" != "your_telegram_bot_token_here" ]; then
        check_pass "TELEGRAM_BOT_TOKEN configured"
    else
        check_warn "TELEGRAM_BOT_TOKEN not set"
    fi
    
    if [ -n "$CONVEX_URL" ]; then
        check_pass "CONVEX_URL: $CONVEX_URL"
    else
        check_warn "CONVEX_URL not set"
    fi
    
    if [ -n "$CONVEX_ADMIN_KEY" ] && [ "$CONVEX_ADMIN_KEY" != "your_convex_admin_key_here" ]; then
        check_pass "CONVEX_ADMIN_KEY configured"
    else
        check_warn "CONVEX_ADMIN_KEY not set"
    fi
else
    check_warn "Skipped - .env not found"
fi

# 8. 目录结构
echo ""
echo "📁 Directory Structure"
dirs=("workspace" "team-docs" "shared" "memory" "tasks" ".openclaw")
for dir in "${dirs[@]}"; do
    if [ -d "$PROJECT_ROOT/$dir" ]; then
        check_pass "$dir/"
    else
        check_warn "$dir/ missing"
    fi
done

echo ""
echo "=================================="
echo "Setup check complete!"
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env and fill in your values"
echo "  2. Install openclaw: npm install -g openclaw@latest"
echo "  3. Run: ./start-gateway.sh"
