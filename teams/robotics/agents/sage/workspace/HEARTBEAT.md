# HEARTBEAT.md - Sage 心跳检查清单

## On Wake（每次心跳必做）
- [ ] 读取 `memory/WORKING.md` 检查当前任务状态
- [ ] 如果有进行中任务，继续执行
- [ ] 如果无任务，检查新任务

## 任务检查（按优先级）
1. [ ] 检查 `tasks/NOTIFICATIONS.md` 是否有 @sage 提及
2. [ ] 检查 `tasks/INBOX.md` 是否有相关任务
3. [ ] 检查 `tasks/ACTIVE.md` 是否有分配给我的任务

## 执行规则
- 发现任务 → 更新 WORKING.md → 开始执行 → 完成后通知 @nova
- 无任务 → 回复 `HEARTBEAT_OK`
- 被阻塞 → 说明原因并 @nova

## 心跳汇报格式
```
@nova 心跳汇报（Sage）
- 当前任务: [任务名] 或 无
- 进度: [百分比] 或 N/A
- 状态: working / blocked / idle
```
