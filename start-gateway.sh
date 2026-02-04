#!/bin/bash
# OpenClaw Gateway 启动脚本 - ai-robot-team workspace
# 配置和状态都在当前目录

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

export OPENCLAW_CONFIG_PATH="$SCRIPT_DIR/openclaw.json"
export OPENCLAW_STATE_DIR="$SCRIPT_DIR/.openclaw"

# 加载 .env 文件（如果存在）
if [ -f "$SCRIPT_DIR/.env" ]; then
    set -a
    source "$SCRIPT_DIR/.env"
    set +a
fi

# 确保状态目录存在
mkdir -p "$OPENCLAW_STATE_DIR"
mkdir -p "$OPENCLAW_STATE_DIR/agents"
mkdir -p "$OPENCLAW_STATE_DIR/credentials"
mkdir -p "$OPENCLAW_STATE_DIR/logs"

echo "Starting OpenClaw Gateway..."
echo "  Config: $OPENCLAW_CONFIG_PATH"
echo "  State:  $OPENCLAW_STATE_DIR"
echo ""

# 检查配置文件
if [ ! -f "$OPENCLAW_CONFIG_PATH" ]; then
    echo "Error: openclaw.json not found at $OPENCLAW_CONFIG_PATH"
    exit 1
fi

# 检查 .env 文件
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo "Warning: .env file not found. Copy .env.example to .env and fill in your values."
fi

# 启动 gateway
openclaw gateway "$@"
