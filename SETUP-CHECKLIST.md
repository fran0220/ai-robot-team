# Multi-Agent 系统配置检查清单

## ✅ 已完成配置

### API 配置 (openclaw.json)
- [x] proxy-openai provider (gpt-5.2-codex, gpt-5.2)
- [x] proxy-anthropic provider (claude-opus-4-5-20251101)
- [x] proxy-gemini provider (gemini-3-flash)
- [x] 模型回退链配置
- [x] Gateway auth token

### Agent 配置
- [x] 6 个 Agent 定义 (nova, sage, atlas, jarvis, friday, vision)
- [x] 每个 Agent 独立 workspace
- [x] @mention patterns 配置
- [x] Nova 使用 Claude Opus，其他使用 GPT-5.2 Codex
- [x] SOUL.md 个性文件

### 心跳系统
- [x] setup-heartbeats.sh 脚本
- [x] 错开调度 (避免同时唤醒)
- [x] 心跳消息包含任务检查指令

### 定时任务
- [x] setup-daily-standup.sh (每日站会 9:00 AM)
- [x] cron.enabled = true

### 任务管理 (Mission Control)
- [x] tasks/INBOX.md - 任务收件箱
- [x] tasks/ACTIVE.md - 进行中任务
- [x] tasks/DONE.md - 已完成任务
- [x] tasks/NOTIFICATIONS.md - @mention 通知
- [x] memory/WORKING.md - 当前工作状态

### 共享工作区
- [x] workspace/SOUL.md - 团队身份
- [x] workspace/AGENTS.md - 协作指南
- [x] workspace/research/ - 调研报告
- [x] workspace/specs/ - 技术规格
- [x] workspace/reports/ - 测试报告
- [x] workspace/projects/robot-v1/ - 项目文档

### Skills
- [x] find-skills - 技能发现
- [x] web-research - 网络调研 (parallel-search MCP)
- [x] railway-deploy - 云服务部署
- [x] mission-control-guide
- [x] openclaw

### 安全
- [x] .openclaw 目录权限 700
- [x] openclaw.json 权限 600
- [x] Gateway auth token 配置
- [x] Session 目录创建

---

## 🚀 启动步骤

```bash
# 1. 启动 Gateway
cd /root/multiagent/team
./start-gateway.sh

# 2. 配置心跳
./scripts/setup-heartbeats.sh

# 3. 配置每日站会
./scripts/setup-daily-standup.sh

# 4. 验证
openclaw cron list
openclaw gateway status
```

---

## 📝 使用指南

### 添加任务
编辑 `tasks/INBOX.md`，添加新任务并 @mention 期望的负责 Agent

### 查看状态
- 当前工作: `memory/WORKING.md`
- 进行中: `tasks/ACTIVE.md`
- 通知: `tasks/NOTIFICATIONS.md`

### Agent 通信
在任何文档中 @mention agent:
- @nova - 项目主控
- @sage - 调研
- @atlas - 产品
- @jarvis - 硬件
- @friday - 软件
- @vision - 测试

### 手动触发心跳
```bash
openclaw cron run nova-heartbeat
```

---

## 🔧 重要配置

### Gateway Token
```
bbabb6776a8e047aab1d7b3a5d495cb8
```

### Railway 项目
```
项目 ID: d896ccfb-1264-4e00-a308-e803ce412bca
项目名: robot-team-infra
```

### Convex (Mission Control)
```
后端 URL: https://convex-backend-production-3dbe.up.railway.app
Dashboard: https://convex-dashboard-production-0ac7.up.railway.app
Admin Key: 从 Railway 变量获取 CONVEX_SELF_HOSTED_ADMIN_KEY
```

### .env 文件配置
```bash
# 添加到 .env
OPENCLAW_TOKEN=bbabb6776a8e047aab1d7b3a5d495cb8
RAILWAY_PROJECT_ID=d896ccfb-1264-4e00-a308-e803ce412bca
CONVEX_URL=https://convex-backend-production-3dbe.up.railway.app
CONVEX_ADMIN_KEY=railway|01488cdccae542cf5edbb3b1cb8399bc88d4302dbef8dd95cfe30b2458460fa4690bfe90b5
```

---

## 🔗 Convex Mission Control 设置

```bash
# 1. 部署 Convex schema
cd /root/multiagent/team
./scripts/convex-setup.sh

# 2. 或手动部署
cd convex
npx convex deploy --url "$CONVEX_URL" --admin-key "$CONVEX_ADMIN_KEY" --yes

# 3. 初始化 agents
npx convex run agents:initTeam --url "$CONVEX_URL" --admin-key "$CONVEX_ADMIN_KEY"
```
