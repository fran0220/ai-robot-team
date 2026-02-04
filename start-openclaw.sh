#!/bin/bash
# OpenClaw Gateway 启动脚本
# 用法: ./start-openclaw.sh [start|stop|restart|status]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 加载环境变量
if [ -f .env ]; then
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
fi

# 设置 OpenClaw 路径（使用绝对路径）
export OPENCLAW_CONFIG_PATH="$SCRIPT_DIR/openclaw.json"
export OPENCLAW_STATE_DIR="$SCRIPT_DIR/.openclaw"

ACTION="${1:-start}"

case "$ACTION" in
    start)
        echo "🦞 Starting OpenClaw Gateway..."
        openclaw gateway start
        sleep 2
        openclaw gateway status
        ;;
    stop)
        echo "🦞 Stopping OpenClaw Gateway..."
        openclaw gateway stop
        ;;
    restart)
        echo "🦞 Restarting OpenClaw Gateway..."
        openclaw gateway restart
        sleep 2
        openclaw gateway status
        ;;
    status)
        openclaw gateway status
        ;;
    doctor)
        openclaw doctor
        ;;
    dashboard)
        openclaw dashboard
        ;;
    chat)
        shift
        AGENT="${1:-platform-architect}"
        shift 2>/dev/null || true
        MESSAGE="$*"
        if [ -z "$MESSAGE" ]; then
            echo "用法: ./start-openclaw.sh chat [agent] <message>"
            echo "示例: ./start-openclaw.sh chat platform-architect 你好"
            exit 1
        fi
        openclaw agent --agent "$AGENT" --message "$MESSAGE"
        ;;
    install)
        echo "🦞 Installing OpenClaw Gateway service..."
        openclaw gateway install
        
        # 添加环境变量到 LaunchAgent
        PLIST="$HOME/Library/LaunchAgents/ai.openclaw.gateway.plist"
        if [ -f "$PLIST" ] && [ -n "$PROXY_BASE_URL" ]; then
            # 使用 PlistBuddy 添加环境变量
            /usr/libexec/PlistBuddy -c "Add :EnvironmentVariables:PROXY_BASE_URL string $PROXY_BASE_URL" "$PLIST" 2>/dev/null || true
            /usr/libexec/PlistBuddy -c "Add :EnvironmentVariables:PROXY_API_KEY string $PROXY_API_KEY" "$PLIST" 2>/dev/null || true
            echo "✅ Environment variables added to LaunchAgent"
        fi
        ;;
    uninstall)
        echo "🦞 Uninstalling OpenClaw Gateway service..."
        openclaw gateway uninstall
        ;;
    *)
        echo "OpenClaw Gateway 管理脚本"
        echo ""
        echo "用法: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  start      启动 Gateway"
        echo "  stop       停止 Gateway"
        echo "  restart    重启 Gateway"
        echo "  status     查看状态"
        echo "  doctor     运行健康检查"
        echo "  dashboard  打开控制面板"
        echo "  chat       发送消息 (chat [agent] <message>)"
        echo "  install    安装为系统服务"
        echo "  uninstall  卸载系统服务"
        exit 1
        ;;
esac
