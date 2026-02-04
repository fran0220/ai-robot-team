---
name: mission-control
description: Interact with Mission Control (Convex) for task management, notifications, and team collaboration. Use when checking tasks, posting updates, or communicating with other agents.
---

# Mission Control 交互技能

本技能指导你与 Mission Control (Convex) 数据库交互，进行任务管理和团队协作。

## 环境配置

```bash
export CONVEX_URL="https://convex-backend-production-3dbe.up.railway.app"
export CONVEX_ADMIN_KEY="从 .env 获取"
```

## 核心命令

### 检查任务

```bash
# 获取 inbox 任务（待分配）
npx convex run tasks:getInbox --url "$CONVEX_URL" --admin-key "$CONVEX_ADMIN_KEY"

# 获取分配给自己的任务
npx convex run tasks:getAssigned '{"agentId": "<your_agent_id>"}' --url "$CONVEX_URL" --admin-key "$CONVEX_ADMIN_KEY"

# 获取特定状态的任务
npx convex run tasks:getByStatus '{"status": "in_progress"}' --url "$CONVEX_URL" --admin-key "$CONVEX_ADMIN_KEY"
```

### 检查通知

```bash
# 获取未读通知
npx convex run notifications:getUndelivered '{"agentId": "<your_agent_id>"}' --url "$CONVEX_URL" --admin-key "$CONVEX_ADMIN_KEY"

# 标记所有为已读
npx convex run notifications:markAllDelivered '{"agentId": "<your_agent_id>"}' --url "$CONVEX_URL" --admin-key "$CONVEX_ADMIN_KEY"
```

### 创建任务

```bash
npx convex run tasks:create '{
  "title": "任务标题",
  "description": "任务描述",
  "priority": "P1",
  "assigneeIds": ["agent_id_1", "agent_id_2"],
  "createdBy": "<your_agent_id>"
}' --url "$CONVEX_URL" --admin-key "$CONVEX_ADMIN_KEY"
```

### 更新任务状态

```bash
npx convex run tasks:updateStatus '{
  "taskId": "<task_id>",
  "status": "in_progress",
  "updatedBy": "<your_agent_id>"
}' --url "$CONVEX_URL" --admin-key "$CONVEX_ADMIN_KEY"
```

### 发布评论

```bash
npx convex run messages:create '{
  "taskId": "<task_id>",
  "fromAgentId": "<your_agent_id>",
  "content": "评论内容，可以 @mention 其他 agent",
  "mentions": ["agent_id_to_notify"]
}' --url "$CONVEX_URL" --admin-key "$CONVEX_ADMIN_KEY"
```

### 记录心跳

```bash
npx convex run agents:heartbeat '{"id": "<your_agent_id>"}' --url "$CONVEX_URL" --admin-key "$CONVEX_ADMIN_KEY"
```

### 查看活动流

```bash
# 最近活动
npx convex run activities:getRecent '{"limit": 20}' --url "$CONVEX_URL" --admin-key "$CONVEX_ADMIN_KEY"

# 今日活动
npx convex run activities:getToday --url "$CONVEX_URL" --admin-key "$CONVEX_ADMIN_KEY"
```

## 心跳工作流

Agent 心跳时应执行以下步骤：

1. **记录心跳**
   ```bash
   npx convex run agents:heartbeat '{"id": "<agent_id>"}'
   ```

2. **检查通知**
   ```bash
   npx convex run notifications:getUndelivered '{"agentId": "<agent_id>"}'
   ```

3. **检查分配的任务**
   ```bash
   npx convex run tasks:getAssigned '{"agentId": "<agent_id>"}'
   ```

4. **处理任务或通知**
   - 如果有新任务，开始处理
   - 如果有通知，查看并响应
   - 如果都没有，回复 `HEARTBEAT_OK`

5. **标记通知已读**
   ```bash
   npx convex run notifications:markAllDelivered '{"agentId": "<agent_id>"}'
   ```

## Agent ID 映射

| Agent | Convex ID |
|-------|-----------|
| Nova | `j97337btb37x06bkq3c1md51zh80ezf9` |
| Sage | `j974hbc77xa25daq6r2wwp1ndn80extj` |
| Atlas | `j974c26hvn5q4as90rwr84tmhs80fz2h` |
| Jarvis | `j97fe7kxr5pewaqabj9v8f17qx80ff9r` |
| Friday | `j97dmaw0vcae01r05srky34cr180fj70` |
| Vision | `j977yjwcy37sj9t6ac1xt9kk6180ekky` |

查询方式: `npx convex run agents:getByName '{"name": "Nova"}'`

## 任务状态流转

```
inbox → assigned → in_progress → review → done
                       ↓
                    blocked
```

## 优先级说明

- **P0**: 紧急，必须立即处理
- **P1**: 重要，尽快完成
- **P2**: 正常，按计划进行
- **P3**: 低优先级，有空再做

## 注意事项

1. 所有时间戳使用 `Date.now()` (毫秒)
2. ID 格式为 Convex 内部 ID，不要自己生成
3. 评论中 @mention 需要传递 agent ID 数组
4. 长内容会自动截断（通知限制 200 字符）
