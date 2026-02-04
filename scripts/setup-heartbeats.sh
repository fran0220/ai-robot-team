#!/bin/bash
# 设置所有 Agent 的心跳定时任务
# 心跳错开，避免同时唤醒造成资源冲突

set -e
cd /root/multiagent/team
source .env 2>/dev/null || true

# Gateway token for auth
export OPENCLAW_TOKEN="bbabb6776a8e047aab1d7b3a5d495cb8"

echo "🫀 Setting up agent heartbeats..."

# 先清理旧的心跳任务
echo "Cleaning old heartbeats..."
openclaw cron remove --name "nova-heartbeat" 2>/dev/null || true
openclaw cron remove --name "sage-heartbeat" 2>/dev/null || true
openclaw cron remove --name "atlas-heartbeat" 2>/dev/null || true
openclaw cron remove --name "jarvis-heartbeat" 2>/dev/null || true
openclaw cron remove --name "friday-heartbeat" 2>/dev/null || true
openclaw cron remove --name "vision-heartbeat" 2>/dev/null || true
openclaw cron remove --name "daily-standup" 2>/dev/null || true

# Nova - 主控，每15分钟 :00
# Nova 负责接收用户任务、分解、分配给团队
openclaw cron add \
  --name "nova-heartbeat" \
  --agent nova \
  --session isolated \
  --every 15m \
  --message "你是 Nova，项目主控。执行心跳检查：

1. **记录心跳** (Mission Control)
   npx convex run agents:heartbeat '{\"id\": \"j97337btb37x06bkq3c1md51zh80ezf9\"}' --url \"\$CONVEX_URL\" --admin-key \"\$CONVEX_ADMIN_KEY\"

2. **检查待分配任务**
   - 查看 tasks/INBOX.md 中的新任务
   - 或 npx convex run tasks:getInbox

3. **检查通知**
   - 查看 tasks/NOTIFICATIONS.md 中的 @nova 提及
   - 或 npx convex run notifications:getUndelivered '{\"agentId\": \"j97337btb37x06bkq3c1md51zh80ezf9\"}'

4. **任务分配决策** (如有新任务)
   根据 SOUL.md 中的分配逻辑:
   - 技术调研 → @sage
   - 需求澄清 → @atlas
   - 硬件设计 → @jarvis
   - 软件开发 → @friday
   - 测试验证 → @vision
   
   创建任务并 @mention 对应 Agent。

5. **检查进行中任务** 
   查看 tasks/ACTIVE.md 或 npx convex run tasks:getByStatus '{\"status\": \"in_progress\"}'

6. 如无待办，回复 HEARTBEAT_OK" \
  --model "proxy-anthropic/claude-opus-4-5-20251101" \
  --timeout-seconds 300 \
  --post-mode summary

# Sage - 调研，每15分钟 :03
openclaw cron add \
  --name "sage-heartbeat" \
  --agent sage \
  --session isolated \
  --cron "3,18,33,48 * * * *" \
  --message "你是 Sage，调研分析师。执行心跳检查：

1. **记录心跳**
   npx convex run agents:heartbeat '{\"id\": \"j974hbc77xa25daq6r2wwp1ndn80extj\"}' --url \"\$CONVEX_URL\" --admin-key \"\$CONVEX_ADMIN_KEY\"

2. **检查通知**
   查看 tasks/NOTIFICATIONS.md 是否有 @sage 提及

3. **检查分配的任务**
   查看 tasks/ACTIVE.md 中分配给你的调研任务

4. **执行调研** (如有任务)
   使用 parallel-search MCP 进行调研，输出到 workspace/research/

5. **完成汇报**
   任务完成后在 tasks/NOTIFICATIONS.md 中 @nova 汇报

6. 如无待办，回复 HEARTBEAT_OK" \
  --model "proxy-openai/gpt-5.2-codex" \
  --timeout-seconds 300 \
  --post-mode summary

# Atlas - PM，每15分钟 :06
openclaw cron add \
  --name "atlas-heartbeat" \
  --agent atlas \
  --session isolated \
  --cron "6,21,36,51 * * * *" \
  --message "你是 Atlas，产品经理。执行心跳检查：

1. **记录心跳**
   npx convex run agents:heartbeat '{\"id\": \"j974c26hvn5q4as90rwr84tmhs80fz2h\"}' --url \"\$CONVEX_URL\" --admin-key \"\$CONVEX_ADMIN_KEY\"

2. **检查通知**
   查看 tasks/NOTIFICATIONS.md 是否有 @atlas 提及

3. **检查分配的任务**
   查看 tasks/ACTIVE.md 中分配给你的需求任务

4. **执行任务** (如有)
   更新 workspace/specs/ 或 原型prd.md

5. **完成汇报**
   任务完成后在 tasks/NOTIFICATIONS.md 中 @nova 汇报

6. 如无待办，回复 HEARTBEAT_OK" \
  --model "proxy-openai/gpt-5.2-codex" \
  --timeout-seconds 300 \
  --post-mode summary

# Jarvis - 硬件，每15分钟 :09
openclaw cron add \
  --name "jarvis-heartbeat" \
  --agent jarvis \
  --session isolated \
  --cron "9,24,39,54 * * * *" \
  --message "你是 Jarvis，硬件工程师。执行心跳检查：

1. **记录心跳**
   npx convex run agents:heartbeat '{\"id\": \"j97fe7kxr5pewaqabj9v8f17qx80ff9r\"}' --url \"\$CONVEX_URL\" --admin-key \"\$CONVEX_ADMIN_KEY\"

2. **检查通知**
   查看 tasks/NOTIFICATIONS.md 是否有 @jarvis 提及

3. **检查分配的任务**
   查看 tasks/ACTIVE.md 中分配给你的硬件任务

4. **执行任务** (如有)
   硬件设计输出到 workspace/specs/
   需要软件配合时 @friday

5. **完成汇报**
   任务完成后在 tasks/NOTIFICATIONS.md 中 @nova 汇报

6. 如无待办，回复 HEARTBEAT_OK" \
  --model "proxy-openai/gpt-5.2-codex" \
  --timeout-seconds 300 \
  --post-mode summary

# Friday - 软件，每15分钟 :12
openclaw cron add \
  --name "friday-heartbeat" \
  --agent friday \
  --session isolated \
  --cron "12,27,42,57 * * * *" \
  --message "你是 Friday，软件工程师。执行心跳检查：

1. **记录心跳**
   npx convex run agents:heartbeat '{\"id\": \"j97dmaw0vcae01r05srky34cr180fj70\"}' --url \"\$CONVEX_URL\" --admin-key \"\$CONVEX_ADMIN_KEY\"

2. **检查通知**
   查看 tasks/NOTIFICATIONS.md 是否有 @friday 提及

3. **检查分配的任务**
   查看 tasks/ACTIVE.md 中分配给你的开发任务

4. **执行任务** (如有)
   可使用 npx skills find 搜索相关技能
   需要硬件接口时 @jarvis

5. **完成汇报**
   任务完成后在 tasks/NOTIFICATIONS.md 中 @nova 汇报

6. 如无待办，回复 HEARTBEAT_OK" \
  --model "proxy-openai/gpt-5.2-codex" \
  --timeout-seconds 300 \
  --post-mode summary

# Vision - 测试，每20分钟
openclaw cron add \
  --name "vision-heartbeat" \
  --agent vision \
  --session isolated \
  --every 20m \
  --message "你是 Vision，测试工程师。执行心跳检查：

1. **记录心跳**
   npx convex run agents:heartbeat '{\"id\": \"j977yjwcy37sj9t6ac1xt9kk6180ekky\"}' --url \"\$CONVEX_URL\" --admin-key \"\$CONVEX_ADMIN_KEY\"

2. **检查通知**
   查看 tasks/NOTIFICATIONS.md 是否有 @vision 提及

3. **检查分配的任务**
   查看 tasks/ACTIVE.md 中分配给你的测试任务

4. **执行测试** (如有)
   测试报告输出到 workspace/reports/
   发现问题时 @friday 或 @jarvis

5. **完成汇报**
   任务完成后在 tasks/NOTIFICATIONS.md 中 @nova 汇报

6. 如无待办，回复 HEARTBEAT_OK" \
  --model "proxy-openai/gpt-5.2-codex" \
  --timeout-seconds 300 \
  --post-mode summary

# 每日站会 - Nova 主持
openclaw cron add \
  --name "daily-standup" \
  --agent nova \
  --session main \
  --cron "0 9 * * *" \
  --tz "Asia/Shanghai" \
  --message "每日站会时间！请执行以下任务:

1. 阅读 memory/WORKING.md 了解当前状态
2. 检查 tasks/INBOX.md 中的新任务
3. 查看各 Agent 昨日进展（检查 tasks/ACTIVE.md）
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

echo "✅ Heartbeats configured!"
echo ""
echo "心跳时间表:"
echo "  Nova:   :00, :15, :30, :45 (主控，任务分配)"
echo "  Sage:   :03, :18, :33, :48 (调研)"
echo "  Atlas:  :06, :21, :36, :51 (产品)"
echo "  Jarvis: :09, :24, :39, :54 (硬件)"
echo "  Friday: :12, :27, :42, :57 (软件)"
echo "  Vision: 每20分钟 (测试)"
echo ""
echo "每日站会: 9:00 AM (Asia/Shanghai)"
echo ""
echo "查看心跳状态: openclaw cron list"
echo "查看运行历史: openclaw cron runs"
