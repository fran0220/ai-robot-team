# Mission Control V2 - 重构方案

> 从 Convex 迁移到 PostgreSQL + 基于 crshdn/mission-control 重构 UI

## 背景

当前项目使用 Convex 作为后端数据库服务，存在以下问题：
1. **依赖第三方服务** - Convex Cloud 增加复杂度和成本
2. **本地开发受限** - 需要网络连接
3. **数据可控性差** - 数据存储在第三方

参考项目 [crshdn/mission-control](https://github.com/crshdn/mission-control) 提供了优秀的架构参考。

## 目标架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Railway (a683faa6)                       │
│  ┌──────────────┐  ┌─────────────────┐  ┌───────────────┐  │
│  │  PostgreSQL  │  │  Next.js API    │  │  Static UI    │  │
│  │  (Database)  │◄─┤  (API Server)   │◄─┤  (Frontend)   │  │
│  └──────────────┘  └────────┬────────┘  └───────────────┘  │
└─────────────────────────────┼───────────────────────────────┘
                              │ WebSocket
┌─────────────────────────────┼───────────────────────────────┐
│              本地 / 远程服务器                               │
│  ┌──────────────────────────▼──────────────────────────────┐│
│  │              OpenClaw Gateway                           ││
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       ││
│  │  │Nova │ │Sage │ │Atlas│ │Jarvis│ │Friday│ │...  │       ││
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘       ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| **Database** | PostgreSQL | Railway 托管，项目 a683faa6 |
| **ORM** | Drizzle ORM | 类型安全，轻量级 |
| **Backend** | Next.js 14 (App Router) | API Routes + SSE |
| **Frontend** | React + Tailwind + Zustand | 参考 crshdn/mission-control |
| **实时通信** | SSE + WebSocket | 事件流 + OpenClaw 通信 |
| **部署** | Railway | 自动部署 |

## 数据库 Schema (PostgreSQL)

### 核心表设计

```sql
-- 工作区 (多租户支持)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Agents
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100) NOT NULL,
  description TEXT,
  avatar_emoji VARCHAR(10) DEFAULT '🤖',
  status VARCHAR(20) DEFAULT 'standby' CHECK (status IN ('standby', 'working', 'offline')),
  is_master BOOLEAN DEFAULT FALSE,
  session_key VARCHAR(255),
  mention_patterns JSONB DEFAULT '[]',
  model VARCHAR(100),
  soul_md TEXT,
  user_md TEXT,
  agents_md TEXT,
  last_heartbeat TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 任务
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'inbox' 
    CHECK (status IN ('planning', 'inbox', 'assigned', 'in_progress', 'testing', 'review', 'done', 'blocked')),
  priority VARCHAR(10) DEFAULT 'P2' CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
  assigned_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  created_by_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  reviewer_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  review_comment TEXT,
  reviewed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  original_status VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 任务活动日志
CREATE TABLE task_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  activity_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 任务交付物
CREATE TABLE task_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  deliverable_type VARCHAR(20) CHECK (deliverable_type IN ('file', 'url', 'artifact')),
  title VARCHAR(255) NOT NULL,
  path TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 消息/评论
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  conversation_id UUID,
  sender_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  mentions JSONB DEFAULT '[]',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 通知
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentioned_agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  from_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  content VARCHAR(500) NOT NULL,
  delivered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 事件流 (Live Feed)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OpenClaw Sessions
CREATE TABLE openclaw_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  openclaw_session_id VARCHAR(255),
  channel VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  session_type VARCHAR(20) DEFAULT 'persistent',
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- 文档 (调研报告、规格文档等)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  doc_type VARCHAR(20) CHECK (doc_type IN ('research', 'spec', 'report', 'deliverable', 'note')),
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  author_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 设计资源审批
CREATE TABLE design_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by UUID REFERENCES agents(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES agents(id) ON DELETE SET NULL,
  review_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- 索引
CREATE INDEX idx_agents_workspace ON agents(workspace_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_agent_id);
CREATE INDEX idx_activities_task ON task_activities(task_id);
CREATE INDEX idx_messages_task ON messages(task_id);
CREATE INDEX idx_notifications_agent ON notifications(mentioned_agent_id, delivered);
CREATE INDEX idx_events_created ON events(created_at DESC);
CREATE INDEX idx_events_workspace ON events(workspace_id);
```

## API 设计

### 核心端点

```
# Agents
GET    /api/agents              # 列表
POST   /api/agents              # 创建
GET    /api/agents/:id          # 详情
PATCH  /api/agents/:id          # 更新
DELETE /api/agents/:id          # 删除
POST   /api/agents/:id/heartbeat # 心跳

# Tasks
GET    /api/tasks               # 列表 (支持 status, workspace_id 过滤)
POST   /api/tasks               # 创建
GET    /api/tasks/:id           # 详情
PATCH  /api/tasks/:id           # 更新
DELETE /api/tasks/:id           # 删除
POST   /api/tasks/:id/dispatch  # 分发给 Agent
POST   /api/tasks/:id/activities # 添加活动记录
GET    /api/tasks/:id/activities # 获取活动记录
POST   /api/tasks/:id/deliverables # 添加交付物
GET    /api/tasks/:id/deliverables # 获取交付物

# Events (Live Feed)
GET    /api/events              # 列表 (支持 since 参数)
POST   /api/events              # 创建
GET    /api/events/stream       # SSE 实时流

# Workspaces
GET    /api/workspaces          # 列表
POST   /api/workspaces          # 创建
GET    /api/workspaces/:id      # 详情
PATCH  /api/workspaces/:id      # 更新

# Notifications
GET    /api/notifications       # 未读通知
POST   /api/notifications/mark-read # 标记已读

# OpenClaw Integration
GET    /api/openclaw/status     # Gateway 状态
GET    /api/openclaw/sessions   # Session 列表
POST   /api/openclaw/sessions/:id # 发送消息

# Files
POST   /api/files/upload        # 上传文件
GET    /api/files/download      # 下载文件
```

## 前端组件

### 主要页面

```
/                           # Dashboard - 工作区概览
/tasks                      # 任务看板 (Kanban)
/tasks/:id                  # 任务详情
/agents                     # Agent 管理
/agents/:id                 # Agent 详情
/feed                       # 活动流
/documents                  # 文档管理
/settings                   # 设置
```

### 核心组件 (参考 crshdn/mission-control)

```
components/
├── layout/
│   ├── Sidebar.tsx           # 左侧导航
│   ├── Header.tsx            # 顶栏
│   └── Layout.tsx            # 整体布局
├── dashboard/
│   ├── StatsCards.tsx        # 统计卡片
│   ├── AgentGrid.tsx         # Agent 状态网格
│   └── RecentActivity.tsx    # 最近活动
├── tasks/
│   ├── MissionQueue.tsx      # Kanban 看板
│   ├── TaskCard.tsx          # 任务卡片
│   ├── TaskModal.tsx         # 任务创建/编辑
│   └── TaskDetail.tsx        # 任务详情
├── agents/
│   ├── AgentCard.tsx         # Agent 卡片
│   ├── AgentModal.tsx        # Agent 创建/编辑
│   └── AgentStatus.tsx       # 状态指示器
├── feed/
│   ├── LiveFeed.tsx          # 实时活动流
│   └── EventItem.tsx         # 事件项
└── shared/
    ├── Button.tsx
    ├── Modal.tsx
    ├── Badge.tsx
    └── ...
```

## 项目结构

```
mission-control-v2/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── agents/
│   │   │   ├── tasks/
│   │   │   ├── events/
│   │   │   ├── openclaw/
│   │   │   └── ...
│   │   ├── (dashboard)/       # Dashboard pages
│   │   ├── tasks/
│   │   ├── agents/
│   │   └── layout.tsx
│   ├── components/            # React components
│   ├── lib/
│   │   ├── db/               # Database
│   │   │   ├── schema.ts     # Drizzle schema
│   │   │   ├── client.ts     # PostgreSQL client
│   │   │   └── migrations/
│   │   ├── openclaw/         # OpenClaw client
│   │   │   └── client.ts
│   │   ├── store.ts          # Zustand store
│   │   └── utils.ts
│   └── types/                # TypeScript types
├── drizzle.config.ts
├── package.json
├── tailwind.config.ts
└── .env.example
```

## 迁移计划

### Phase 1: 基础设施 (1-2天)
- [ ] 在 Railway 创建 PostgreSQL 服务
- [ ] 设置数据库 schema
- [ ] 创建 Next.js 项目骨架
- [ ] 配置 Drizzle ORM

### Phase 2: 核心 API (2-3天)
- [ ] Agent CRUD API
- [ ] Task CRUD API
- [ ] Event/Activity API
- [ ] Notification API
- [ ] 数据初始化脚本 (导入现有 Agent)

### Phase 3: 前端 UI (3-4天)
- [ ] Layout 和导航
- [ ] Dashboard 概览
- [ ] 任务看板 (Kanban)
- [ ] Agent 管理页面
- [ ] 活动流

### Phase 4: 实时功能 (1-2天)
- [ ] SSE 事件流
- [ ] OpenClaw Gateway 集成
- [ ] 任务自动分发

### Phase 5: 集成测试 (1天)
- [ ] 与 OpenClaw Gateway 联调
- [ ] 端到端工作流测试
- [ ] 部署到 Railway

## 环境变量

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/mission_control

# OpenClaw
OPENCLAW_GATEWAY_URL=ws://localhost:18789
OPENCLAW_GATEWAY_TOKEN=your_token

# App
NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app
WORKSPACE_BASE_PATH=/workspace

# Railway
RAILWAY_PROJECT_ID=a683faa6-84e2-4bb4-b2cb-df0b3955338e
```

## 数据迁移

从 Convex 迁移现有数据：

```bash
# 1. 导出 Convex 数据
npx convex export --path ./convex-backup

# 2. 转换格式并导入 PostgreSQL
node scripts/migrate-from-convex.js
```

## 与现有项目整合

Mission Control V2 将整合到 `ai-robot-team` 项目：

```
ai-robot-team/
├── mission-control-v2/     # 新的 Mission Control
│   └── ...
├── agents/                 # Agent 工作区 (保留)
├── .openclaw/             # OpenClaw 运行时 (保留)
├── openclaw.json          # OpenClaw 配置 (更新连接)
└── ...
```

## 优势

1. **数据自主** - PostgreSQL 完全可控
2. **本地开发友好** - 可以本地运行 PostgreSQL
3. **成本可控** - Railway PostgreSQL 比 Convex 便宜
4. **更灵活** - 标准 SQL 易于扩展
5. **参考成熟实现** - crshdn/mission-control 已验证架构

## 风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| 迁移数据丢失 | 备份 Convex 数据后再迁移 |
| 实时性能 | SSE + 合理轮询间隔 |
| OpenClaw 集成复杂 | 参考 crshdn 的 WebSocket 实现 |
