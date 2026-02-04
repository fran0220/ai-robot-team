# 远程访问指南

## Mission Control 控制面板

### 架构说明

根据 mission-control-guide，完整的 Mission Control 包含：

| 组件 | 我们的实现 | 原版实现 |
|------|-----------|---------|
| **任务数据库** | `tasks/*.md` 文件 | Convex 实时数据库 |
| **评论线程** | `tasks/NOTIFICATIONS.md` | Convex messages 表 |
| **活动流** | Agent 心跳日志 | Convex activities 表 |
| **@mention 通知** | 文件内 @mention | Convex notifications 表 |
| **文档存储** | `workspace/` 目录 | Convex documents 表 |
| **Web UI** | OpenClaw Dashboard | 自建 React 前端 |

### OpenClaw 内置 Dashboard

OpenClaw 提供内置的 Web 控制台：

```bash
# 获取 Dashboard URL
source .env && openclaw dashboard --no-open
```

Dashboard 功能：
- 查看 Gateway 状态
- 监控 Agent 会话
- 查看 Cron 任务
- 实时日志

---

## 远程访问方式

### 方式 1: SSH 隧道（推荐 - 最安全）

从你的本地电脑运行：

```bash
# 建立 SSH 隧道
ssh -N -L 18790:127.0.0.1:18790 root@192.168.31.162

# 然后在浏览器打开
http://localhost:18790/?token=bbabb6776a8e047aab1d7b3a5d495cb8
```

优点：
- 加密传输
- 无需修改服务器配置
- 保持 Gateway 只监听 loopback

### 方式 2: Tailscale（推荐 - 长期使用）

```bash
# 服务器和本地都安装 Tailscale
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up

# 获取服务器的 Tailscale IP
tailscale ip -4  # 例如 100.x.x.x

# 修改 Gateway 绑定（可选）
# openclaw.json 中添加:
# "gateway": { "bind": "0.0.0.0" }

# 然后从本地访问
http://100.x.x.x:18790/?token=...
```

优点：
- 无需端口转发
- 自动加密
- 跨网络访问
- 永久连接

### 方式 3: 公网暴露（需谨慎）

**⚠️ 仅在必要时使用，必须配置认证**

```bash
# 1. 修改 Gateway 绑定
# openclaw.json:
{
  "gateway": {
    "bind": "0.0.0.0",
    "port": 18790,
    "auth": {
      "token": "强密码"
    }
  }
}

# 2. 配置防火墙
ufw allow 18790/tcp

# 3. 重启 Gateway
systemctl --user restart openclaw-gateway.service
```

**安全建议：**
- 使用强 token（32+ 字符）
- 配置 fail2ban
- 考虑使用 nginx 反向代理 + HTTPS

---

## 当前配置

| 项目 | 值 |
|------|-----|
| Gateway 地址 | `127.0.0.1:18790` (仅本地) |
| Dashboard URL | `http://127.0.0.1:18790/` |
| Gateway Token | `bbabb6776a8e047aab1d7b3a5d495cb8` |
| 服务器 IP | `192.168.31.162` |

### 快速访问命令

```bash
# 从你的电脑运行
ssh -N -L 18790:127.0.0.1:18790 root@192.168.31.162 &
open "http://localhost:18790/?token=bbabb6776a8e047aab1d7b3a5d495cb8"
```

---

## 高级: 构建自定义 Mission Control UI

如果需要更强大的控制面板，可以参考原版架构：

### Convex 数据库方案

```javascript
// convex/schema.ts
export default defineSchema({
  agents: defineTable({
    name: v.string(),
    role: v.string(),
    status: v.union(v.literal("idle"), v.literal("active"), v.literal("blocked")),
    sessionKey: v.string(),
  }),
  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    status: v.string(),
    assigneeIds: v.array(v.id("agents")),
  }),
  messages: defineTable({
    taskId: v.id("tasks"),
    fromAgentId: v.id("agents"),
    content: v.string(),
  }),
});
```

### Agent 与 Convex 交互

```bash
# Agent 心跳时检查任务
npx convex run tasks:getAssigned '{"agentId": "..."}'

# Agent 发布评论
npx convex run messages:create '{"taskId": "...", "content": "完成了调研"}'

# Agent 更新任务状态
npx convex run tasks:update '{"id": "...", "status": "review"}'
```

这需要额外开发，但可以获得：
- 实时更新的 Web UI
- 跨 Agent 的评论线程
- 更好的任务看板视图
