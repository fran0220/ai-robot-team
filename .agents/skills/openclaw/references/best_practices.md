# OpenClaw 最佳实践和工作流程研究报告

## 核心概念和功能描述

### 会话管理 (Session Management)

OpenClaw 将每个代理的单个直接聊天会话视为主会话。直接聊天会话会折叠为 `agent:<agentId>:<mainKey>`（默认为 `main`），而群组/频道聊天则有自己的密钥。网关是所有会话状态的唯一真实来源，UI 客户端必须查询网关以获取会话列表和令牌计数。会话状态存储在网关主机的 `~/.openclaw/agents/<agentId>/sessions/sessions.json` 文件中，而聊天记录则存储在 `~/.openclaw/agents/<agentId>/sessions/<SessionId>.jsonl` 文件中。

### 调试 (Debugging)

OpenClaw 提供了多种调试工具和技术，以帮助开发人员诊断和解决问题。您可以使用 `/debug` 命令在运行时覆盖配置，这对于在不编辑 `openclaw.json` 文件的情况下切换模糊设置非常有用。此外，网关的“观察模式”可以在文件更改时自动重新启动网关，从而实现快速迭代。为了进行更深入的调试，OpenClaw 还可以记录原始的助手流，以便查看推理过程是否以纯文本增量或单独的思考块的形式到达。

## 配置选项和参数说明

### 会话管理配置

- `session.dmScope`: 控制直接消息的分组方式。可选值为 `main`（默认）、`per-peer`、`per-channel-peer` 和 `per-account-channel-peer`。
- `session.identityLinks`: 将提供商前缀的对等 ID 映射到规范身份，以便在跨渠道使用 `per-peer`、`per-channel-peer` 或 `per-account-channel-peer` 时，同一个人可以共享一个 DM 会话。
- `session.reset`: 配置会话重置策略，默认为每天凌晨 4 点（网关主机本地时间）。
- `session.idleMinutes`: 添加一个滑动的空闲窗口，当与每日重置一起配置时，以先到者为准。
- `session.resetByType`: 允许您覆盖 `dm`、`group` 和 `thread` 会话的策略。
- `session.resetByChannel`: 覆盖特定频道的重置策略。

### 调试配置

- `commands.debug`: 启用或禁用 `/debug` 命令。
- `OPENCLAW_RAW_STREAM`: 启用原始助手流日志记录。
- `OPENCLAW_RAW_STREAM_PATH`: 指定原始助手流日志文件的路径。

## JSON 配置示例

```json
{
  "session": {
    "scope": "per-sender",
    "dmScope": "main",
    "identityLinks": {
      "alice": ["telegram:123456789", "discord:987654321012345678"]
    },
    "reset": {
      "mode": "daily",
      "atHour": 4,
      "idleMinutes": 120
    },
    "resetByType": {
      "thread": { "mode": "daily", "atHour": 4 },
      "dm": { "mode": "idle", "idleMinutes": 240 },
      "group": { "mode": "idle", "idleMinutes": 120 }
    },
    "resetByChannel": {
      "discord": { "mode": "idle", "idleMinutes": 10080 }
    },
    "resetTriggers": ["/new", "/reset"],
    "store": "~/.openclaw/agents/{agentId}/sessions/sessions.json",
    "mainKey": "main"
  }
}
```

## CLI 命令示例

- `openclaw status`: 显示存储路径和最近的会话。
- `openclaw sessions --json`: 转储每个会话条目。
- `openclaw gateway call sessions.list --params '{}'`: 从正在运行的网关获取会话。
- `pnpm gateway:watch --force --raw-stream`: 在观察模式下运行网关并启用原始流日志记录。

## 最佳实践建议

- **会话管理**: 对于多用户收件箱，建议使用 `per-channel-peer` 或 `per-account-channel-peer` 的 `dmScope`。使用 `identityLinks` 来确保跨渠道的用户身份统一。根据您的使用模式，仔细配置会话重置策略，以避免不必要的会话重置。
- **调试**: 在开发过程中，使用网关的观察模式可以加快迭代速度。对于难以追踪的问题，启用原始助手流日志记录可以提供有价值的见解。在共享日志之前，请务必清除其中的机密和个人身份信息。

## 与其他功能的集成方式

会话管理与 OpenClaw 的几乎所有其他功能都紧密集成。例如，它与通道路由协同工作，以确保消息被正确地路由到相应的会话。它还与内存和压缩功能集成，以在会话接近自动压缩时运行静默内存刷新。调试功能主要与其他开发工具（如文件观察器）集成，以提供更流畅的开发体验。

## 参考文献

- [1] OpenClaw. (2026). *Session Management*. Retrieved from https://docs.openclaw.ai/concepts/session
- [2] OpenClaw. (2026). *Debugging*. Retrieved from https://docs.openclaw.ai/debugging
