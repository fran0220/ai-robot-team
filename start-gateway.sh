#!/bin/bash
# OpenClaw Gateway 启动脚本 - team workspace
# 将配置和状态都隔离在 /root/multiagent/team 目录

export OPENCLAW_CONFIG_PATH="/root/multiagent/team/openclaw.json"
export OPENCLAW_STATE_DIR="/root/multiagent/team/.openclaw"

# 确保状态目录存在
mkdir -p "$OPENCLAW_STATE_DIR"
mkdir -p "$OPENCLAW_STATE_DIR/agents"
mkdir -p "$OPENCLAW_STATE_DIR/credentials"
mkdir -p "$OPENCLAW_STATE_DIR/logs"

echo "Starting OpenClaw Gateway..."
echo "  Config: $OPENCLAW_CONFIG_PATH"
echo "  State:  $OPENCLAW_STATE_DIR"

openclaw gateway "$@"
