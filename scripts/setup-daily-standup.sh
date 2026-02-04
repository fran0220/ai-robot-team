#!/bin/bash
# 设置每日站会 - Nova 主持
# 每天早上 9:00 (Asia/Shanghai)

set -e
cd /root/multiagent/team
source .env 2>/dev/null || true

echo "📅 Setting up daily standup..."

openclaw cron add \
  --name "daily-standup" \
  --agent nova \
  --session main \
  --cron "0 9 * * *" \
  --tz "Asia/Shanghai" \
  --message "每日站会时间！请执行以下任务:
1. 阅读 memory/WORKING.md 了解当前状态
2. 检查 tasks/INBOX.md 中的新任务
3. 查看各 Agent 昨日进展（检查 memory/ 下的日志）
4. 生成今日任务分配计划
5. @mention 相关 Agent 分配任务
6. 更新 memory/WORKING.md

输出格式:
## 昨日完成
- ...
## 今日计划
- ...
## 风险/阻塞
- ..." \
  --model "proxy-anthropic/claude-opus-4-5-20251101" \
  --timeout-seconds 600 \
  --post-mode full

echo "✅ Daily standup configured at 9:00 AM (Asia/Shanghai)"
