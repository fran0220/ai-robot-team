# Agent Task Status Guide

本指南规范 Mission Control 任务状态自动同步流程。

## 目标
- **任务开始** → 自动变更为 `in_progress`
- **任务完成** → 自动变更为 `review`
- **审查流程** → 通过/不通过后自动更新状态与评论

## 快速用法
通用脚本：`/root/multiagent/team/scripts/task-status.sh`

```bash
# 用法: task-status.sh <taskId> <status> [agentName] [comment] [reviewerName]
# status: in_progress | review | done | blocked

# 开始任务
/root/multiagent/team/scripts/task-status.sh <taskId> in_progress <agentName>

# 提交审查（可选评论 + 指定 reviewer）
/root/multiagent/team/scripts/task-status.sh <taskId> review <agentName> "完成并请求审查" <reviewerName>

# 审查通过（由 reviewer 执行）
/root/multiagent/team/scripts/task-status.sh <taskId> done <reviewerName> "审查通过"

# 阻塞任务
/root/multiagent/team/scripts/task-status.sh <taskId> blocked <agentName> "等待外部依赖"
```

> 提示：若 Agent 在 OpenClaw 环境运行，可通过 `OPENCLAW_SESSION_KEY` 自动推断 agentName。

## 规范要求

### 1) Agent 开始工作
- 接收任务后，**第一时间**调用脚本：
  ```bash
  task-status.sh <taskId> in_progress <agentName>
  ```

### 2) Agent 完成任务
- 完成交付物后，**立即提交审查**：
  ```bash
  task-status.sh <taskId> review <agentName> "完成说明/交付物链接"
  ```

### 3) 审查流程（@xiaomao）
- **通过** → 状态变 `done` + 记录评语
- **不通过** → 状态变 `in_progress` + 评论 + 通知原负责人

> 审查相关操作由 Convex mutations 完成：
> - `tasks:submitForReview`
> - `tasks:approveReview`
> - `tasks:rejectReview`

## 状态说明
- `in_progress`: 任务进行中
- `review`: 提交审查
- `done`: 审查通过完成
- `blocked`: 任务阻塞

## 常见问题
- **提示 Agent 不存在**：确保该 agent 已同步至 Convex（运行 `scripts/sync-agents-to-convex.sh`）。
- **找不到 taskId**：在 Mission Control UI 或 `tasks:list` 中查看。
