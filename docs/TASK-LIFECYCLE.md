# 任务生命周期规范

## 状态定义

```
inbox → assigned → in_progress → review → done
                      ↓            ↓
                   blocked    (rejected → in_progress)
```

| 状态 | 含义 | 谁负责 | 下一步 |
|------|------|--------|--------|
| **inbox** | 新任务，未分配 | @nova 或创建者 | 分配给 Agent |
| **assigned** | 已分配，未开始 | 被分配的 Agent | Agent 开始工作 |
| **in_progress** | 进行中 | 被分配的 Agent | 完成后提交审查 |
| **review** | 待审查 | @xiaomao | 审查通过/不通过 |
| **blocked** | 阻塞 | 被分配的 Agent | 等待依赖解除 |
| **done** | 完成 | - | 归档 |

## 状态转换规则

### 1. inbox → assigned
**触发**：Nova 创建任务并指定 assigneeIds
**自动**：创建任务时如果有 assigneeIds，自动设为 assigned

### 2. assigned → in_progress
**触发**：Agent 开始工作
**谁执行**：被分配的 Agent
**如何执行**：
```bash
task-status.sh <taskId> in_progress <agentName>
```

### 3. in_progress → review
**触发**：Agent 完成工作，提交审查
**谁执行**：被分配的 Agent
**如何执行**：
```bash
task-status.sh <taskId> review <agentName> "完成说明" xiaomao
```

### 4. review → done（审查通过）
**触发**：@xiaomao 审查通过
**谁执行**：@xiaomao 或 Nova
**如何执行**：Dashboard "通过" 按钮 或
```bash
task-status.sh <taskId> done xiaomao "审查通过"
```

### 5. review → in_progress（审查不通过）
**触发**：@xiaomao 审查不通过
**谁执行**：@xiaomao
**结果**：
- 状态回到 in_progress
- 记录 reviewComment
- 通知原负责人修改

### 6. in_progress → blocked
**触发**：遇到外部依赖或阻塞
**谁执行**：被分配的 Agent
**如何执行**：
```bash
task-status.sh <taskId> blocked <agentName> "阻塞原因"
```

### 7. blocked → in_progress
**触发**：阻塞解除
**谁执行**：被分配的 Agent

## Dashboard 看板列

| 列名 | 显示的状态 | 操作 |
|------|-----------|------|
| **收件箱** | inbox | 分配 |
| **已分配** | assigned | - |
| **进行中** | in_progress | - |
| **待审查** | review | 审查按钮 |
| **已完成** | done | 归档/删除 |
| **阻塞** | blocked | 解除阻塞 |

## Nova 的任务分配流程

1. 用户提需求
2. Nova 创建任务到 Convex（status=inbox 或 assigned）
3. Nova 通过 sessions_spawn 派发给 Agent
4. Agent 收到任务 → 立即更新状态为 in_progress
5. Agent 完成 → 更新状态为 review
6. @xiaomao 审查 → done 或打回 in_progress
7. 如打回 → 通知原 Agent 修改

## Agent 规范（写入每个 Agent 的 SOUL.md）

```markdown
## 任务状态同步规范

### 开始任务时
收到任务后，第一时间执行：
\`\`\`bash
/root/multiagent/team/scripts/task-status.sh <taskId> in_progress <你的名字>
\`\`\`

### 完成任务时
完成交付物后，立即执行：
\`\`\`bash
/root/multiagent/team/scripts/task-status.sh <taskId> review <你的名字> "完成说明" xiaomao
\`\`\`

### 遇到阻塞时
\`\`\`bash
/root/multiagent/team/scripts/task-status.sh <taskId> blocked <你的名字> "阻塞原因"
\`\`\`
```

## 同步机制

### 1. Nova 创建任务
- 调用 Convex API 创建任务（inbox/assigned）
- 通过 sessions_spawn 派发给 Agent
- **同时**把 taskId 告诉 Agent

### 2. Agent 更新状态
- Agent 通过 task-status.sh 脚本更新 Convex
- 或直接调用 Convex API

### 3. Dashboard 实时显示
- Convex 实时推送
- UI 自动更新

## 通知机制

| 事件 | 通知谁 |
|------|--------|
| 任务创建并分配 | 被分配的 Agent |
| 提交审查 | @xiaomao |
| 审查通过 | 原负责人（可选） |
| 审查不通过 | 原负责人（必须） |
| @mention | 被 @ 的 Agent |
