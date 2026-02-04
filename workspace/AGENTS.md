# 团队协作指南

## ⚡ 启动时必读

每次会话启动时，按顺序读取以下文件：

1. **TEAM-MEMORY.md** - 团队共享记忆（项目背景、决策记录）
2. **GLOSSARY.md** - 术语表（统一口径）
3. **LESSONS.md** - 踩坑记录（避免重复错误）
4. 你自己的 `SOUL.md` - 角色定义
5. 你自己的 `memory/WORKING.md` - 当前工作状态

---

## 基础设施

### Mission Control V2 (PostgreSQL)

团队使用 Mission Control V2 作为共享任务数据库：

```bash
# 环境变量
export MISSION_CONTROL_URL="https://mission-control-v2-production-33ad.up.railway.app"

# 检查待分配任务
curl -s "$MISSION_CONTROL_URL/api/tasks?status=inbox"

# 检查分配给自己的任务
curl -s "$MISSION_CONTROL_URL/api/tasks?assigned_agent_id=<your-uuid>"

# 检查通知
curl -s "$MISSION_CONTROL_URL/api/notifications?agent_id=<your-uuid>&delivered=false"

# 记录心跳
curl -X POST "$MISSION_CONTROL_URL/api/agents/<your-uuid>/heartbeat"
```

详细用法见 `mission-control` 技能。

### Agent ID 映射

| Agent | PostgreSQL UUID |
|-------|-----------------|
| Nova | `e01bda3b-54d7-445b-a76a-3908da4ba11d` |
| Sage | `00f2d69a-9ddd-466d-bdea-ef8b5e2ad74b` |
| Atlas | `b16223d9-9059-454a-9516-3174ce37c5fa` |
| Jarvis | `b08702eb-ebc8-446b-aa7e-e010ad2a2875` |
| Friday | `2f545ac8-0253-4ccf-b159-504d27b1c807` |
| Vision | `50770420-bbe7-4ca7-a9ea-77b3b5c46463` |
| Idra | `8531c9d1-5d33-49e1-9ba3-e50ec61bb268` |
| Mech | `9dacde45-a17e-4bec-a239-81a8d228c96f` |
| Xiaomao | `08dbb2e3-c394-44b8-bf00-198a867edad9` |

### Dashboard

访问 https://mission-control-v2-production-33ad.up.railway.app/workspace/default 查看任务看板。

### 云服务 - Railway

- **Mission Control V2**: https://mission-control-v2-production-33ad.up.railway.app
- **Team Docs**: https://team-docs-production.up.railway.app
- **MinIO**: Railway 部署（文件存储）

```bash
railway projects      # 查看项目
railway up            # 部署服务
railway logs          # 查看日志
```

### 备用任务路径（文件系统）

如果 API 不可用，回退到文件系统：
- **任务收件箱**: `tasks/INBOX.md`
- **工作状态**: `memory/WORKING.md`
- **共享工作区**: `workspace/`

---

## 心跳机制

每个 Agent 有定时心跳（每 30 分钟，错开执行），应执行：

1. **记录心跳**
   ```bash
   curl -X POST "$MISSION_CONTROL_URL/api/agents/<your-uuid>/heartbeat"
   ```

2. **检查通知**
   ```bash
   curl -s "$MISSION_CONTROL_URL/api/notifications?agent_id=<your-uuid>&delivered=false"
   ```

3. **检查分配的任务**
   ```bash
   curl -s "$MISSION_CONTROL_URL/api/tasks?assigned_agent_id=<your-uuid>&status=assigned"
   ```

4. **处理任务或通知**
   - 如果有新任务，开始处理
   - 如果有通知，查看并响应
   - 如果都没有，回复 `HEARTBEAT_OK`

---

## 记忆系统

### 个人记忆
- `MEMORY.md` - 你的长期记忆（重要决策、经验）
- `memory/YYYY-MM-DD.md` - 每日工作笔记
- `memory/WORKING.md` - 当前工作状态

### 团队记忆（共享）
- `workspace/TEAM-MEMORY.md` - 团队共享记忆
- `workspace/LESSONS.md` - 踩坑记录
- `workspace/GLOSSARY.md` - 术语表

### 向量搜索
OpenClaw 会自动索引 `MEMORY.md` 和 `memory/*.md`，支持语义搜索：
- 使用 `memory_search` 工具查找历史记忆
- 使用 `memory_get` 读取特定记忆文件

---

## 主动技能发现

**遇到不熟悉的问题时，主动寻找和安装技能！**

### 何时使用 find-skills

1. **遇到专业领域问题** - 你不确定最佳实践
2. **需要特定工具/框架** - 如 React、Kubernetes、PCB 设计等
3. **重复性任务** - 可能有现成的工作流技能
4. **质量提升** - 代码审查、测试、文档等

### 如何搜索技能

```bash
npx skills find [关键词]

# 示例
npx skills find "embedded firmware"
npx skills find "code review"
npx skills find "hardware design"
```

---

## 网络调研规范

**所有网络调研任务优先使用 parallel-search MCP。**

### 调研最佳实践

1. **精确查询** - 使用具体关键词，加年份限定
2. **多角度搜索** - 同一主题用不同角度搜索
3. **英文优先** - 技术主题用英文获取更多资源
4. **交叉验证** - 重要信息至少两个来源确认
5. **标注来源** - 所有调研结果标明出处

---

## 协作沟通

### @mention 规则

| 场景 | @mention |
|------|----------|
| 项目协调、决策 | @nova / @主控 |
| 技术调研 | @sage / @调研 |
| 产品需求 | @atlas / @pm |
| 硬件问题 | @jarvis / @硬件 |
| 软件开发 | @friday / @软件 |
| 测试验证 | @vision / @测试 |
| 工业设计 | @idra / @设计 |
| 结构设计 | @mech / @机械 |
| 质量审查 | @xiaomao |

### 任务完成流程

```
执行任务 → 产出文档/代码 → @xiaomao 审查 → 通过则 @nova 汇报 → 任务关闭
                                    ↓
                              不通过则修改后重新提交
```

### 交付物路径

| 类型 | 路径 |
|------|------|
| PRD/需求文档 | `team-docs/prd/` |
| 技术规格 | `team-docs/specs/` |
| 调研报告 | `team-docs/research/` |
| 审查记录 | `team-docs/review/` |
| ID 设计 | `shared/designs/` |
| CAD 模型 | `shared/cad/` |

---

## 自主学习

遇到问题时的处理顺序：

1. **检查 LESSONS.md** - 看看是否有人踩过这个坑
2. **检查 GLOSSARY.md** - 确认术语理解正确
3. **搜索记忆** - 使用 `memory_search` 查找历史
4. **搜索技能** - `npx skills find [问题关键词]`
5. **记录经验** - 新发现写入 memory/ 或 LESSONS.md
6. **分享团队** - 重要经验更新到团队记忆

---

*最后更新：2026-02-05*
