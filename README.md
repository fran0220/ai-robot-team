# Multi-Agent Configuration Platform

基于 OpenClaw 的多代理配置平台，支持多团队协作。

## 项目结构

```
/
├─ openclaw.json              # OpenClaw 配置入口
├─ .openclaw/                 # 运行时数据（不提交）
├─ platform/                  # 平台共享层
│   ├─ skills/                # 通用技能库
│   ├─ docs/                  # 平台文档
│   ├─ tasks/                 # 任务管理
│   └─ infra/                 # 基础设施脚本
├─ apps/
│   └─ mission-control/       # 任务管理 UI (Next.js)
├─ teams/                     # 团队目录
│   └─ robotics/              # 机器人研发团队
│       ├─ agents/            # 团队 agents
│       ├─ docs/              # 团队文档
│       └─ workspace/         # 团队共享工作区
├─ workspace/                 # 平台默认工作区
└─ archive/                   # 归档（旧版本/备份）
```

## 入驻团队

| Team ID | 名称 | Agents |
|---------|------|--------|
| `robotics` | 机器人研发团队 | nova, sage, atlas, jarvis, friday, vision, idra, mech, xiaomao |

## Agent 命名规范

采用命名空间化的 agent id: `{team}.{agent}`

例如：`robotics.nova`, `robotics.sage`

## 快速开始

### 1. 启动 OpenClaw Gateway

```bash
./start-gateway.sh
```

### 2. 启动 Mission Control

```bash
cd apps/mission-control
npm install
npm run dev
```

### 3. 添加新团队

1. 创建团队目录：`teams/{team-id}/agents/`
2. 在 `openclaw.json` 添加 agents 配置
3. 在 Mission Control 创建对应 workspace

## 文档

- [平台文档](platform/docs/)
- [机器人团队文档](teams/robotics/docs/TEAM.md)
- [Mission Control](apps/mission-control/README.md)

## 技能库

通用技能位于 `platform/skills/`，可被所有团队使用。
