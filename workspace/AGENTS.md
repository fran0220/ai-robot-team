# 团队协作指南

## 基础设施

### Mission Control (Convex)
团队使用 Convex 作为共享任务数据库：

```bash
# 环境变量
export CONVEX_URL="https://convex-backend-production-3dbe.up.railway.app"
export CONVEX_ADMIN_KEY="$CONVEX_ADMIN_KEY"  # 从 .env 获取

# 检查任务
npx convex run tasks:getInbox --url "$CONVEX_URL" --admin-key "$CONVEX_ADMIN_KEY"

# 检查通知
npx convex run notifications:getUndelivered '{"agentId": "<your_id>"}' --url "$CONVEX_URL" --admin-key "$CONVEX_ADMIN_KEY"
```

详细用法见 `mission-control` 技能。

### 云服务 - Railway
- **项目 ID**: `d896ccfb-1264-4e00-a308-e803ce412bca`
- **项目名**: `robot-team-infra`
- **Convex 后端**: `https://convex-backend-production-3dbe.up.railway.app`
- **Convex 面板**: `https://convex-dashboard-production-0ac7.up.railway.app`

```bash
railway projects      # 查看项目
railway up            # 部署服务
railway logs          # 查看日志
```

### 备用任务路径（文件系统）
如果 Convex 不可用，回退到文件系统：
- **任务收件箱**: `tasks/INBOX.md`
- **工作状态**: `memory/WORKING.md`
- **共享工作区**: `workspace/`

### 心跳机制
每个 Agent 有定时心跳，应执行：
1. 记录心跳到 Convex: `agents:heartbeat`
2. 检查 Convex 通知: `notifications:getUndelivered`
3. 检查分配的任务: `tasks:getAssigned`
4. 处理任务或回复 `HEARTBEAT_OK`

---

## 主动技能发现

**遇到不熟悉的问题时，主动寻找和安装技能！**

### 何时使用 find-skills

1. **遇到专业领域问题** - 你不确定最佳实践
2. **需要特定工具/框架** - 如 React、Kubernetes、PCB 设计等
3. **重复性任务** - 可能有现成的工作流技能
4. **质量提升** - 代码审查、测试、文档等
5. **新技术栈** - 团队首次接触的技术

### 如何搜索技能

```bash
# 交互式搜索
npx skills find [关键词]

# 示例
npx skills find "embedded firmware"
npx skills find "code review"
npx skills find "react performance"
npx skills find "hardware design"
```

### 如何安装技能

```bash
# 安装到全局（推荐）
npx skills add <owner/repo@skill> -g -y

# 示例
npx skills add vercel-labs/agent-skills@code-review -g -y
```

### 技能搜索策略

| 问题类型 | 搜索关键词 |
|---------|-----------|
| 代码质量 | review, lint, refactor, best-practices |
| 嵌入式开发 | embedded, firmware, cortex, microcontroller |
| 硬件设计 | pcb, schematic, hardware, electronics |
| 测试验证 | testing, qa, e2e, integration |
| 文档 | docs, readme, changelog |
| DevOps | deploy, docker, ci-cd |

## 网络调研规范

**所有网络调研任务优先使用 parallel-search MCP（如已配置），否则使用内置 web_search。**

### MCP 调用方式（如果可用）

```xml
<use_mcp_tool>
<server_name>parallel-search</server_name>
<tool_name>search</tool_name>
<arguments>
{
  "query": "搜索内容",
  "num_results": 10
}
</arguments>
</use_mcp_tool>
```

### 备选：内置搜索
如果 MCP 不可用，使用内置工具：
- `web_search` - 关键词搜索
- `read_web_page` - 读取特定 URL

### 调研最佳实践

1. **精确查询** - 使用具体关键词，加年份限定
2. **多角度搜索** - 同一主题用不同角度搜索
3. **英文优先** - 技术主题用英文获取更多资源
4. **交叉验证** - 重要信息至少两个来源确认
5. **标注来源** - 所有调研结果标明出处

## 协作沟通

### @mention 规则

- 跨职能任务必须 @mention 相关 Agent
- 完成任务后 @nova 汇报
- 遇到阻塞 @mention 相关人员求助

### 交付物规范

1. 调研报告存放 `workspace/research/`
2. 技术规格存放 `workspace/specs/`
3. 测试报告存放 `workspace/reports/`
4. 所有文档使用 Markdown 格式

## 自主学习

遇到问题时的处理顺序：

1. **检查已有技能** - 看看是否已有相关技能可用
2. **搜索新技能** - `npx skills find [问题关键词]`
3. **安装并使用** - 找到合适技能就安装
4. **记录经验** - 有用的技能记录到 memory/
5. **分享团队** - 好用的技能推荐给其他 Agent
