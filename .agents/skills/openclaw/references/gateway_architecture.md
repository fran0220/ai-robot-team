# OpenClaw Gateway 架构和配置研究报告

## 1. 核心概念和功能

OpenClaw Gateway 是一个核心组件，充当所有消息传递通道和客户端之间的中央通信枢纽。它是一个长期运行的守护进程，负责管理与各种消息传递平台（如 WhatsApp、Telegram、Slack 等）的连接。网关通过 WebSocket 协议公开一个控制平面，允许客户端（如 CLI、Web UI 和移动应用程序）以及节点（提供附加功能的远程设备）进行连接和交互。

### 主要功能：

*   **统一通信**：将来自不同消息来源的通信整合到一个单一的、一致的接口中。
*   **控制平面**：为客户端和节点提供一个中心点，以发送命令、接收事件和管理系统状态。
*   **身份验证和安全**：通过令牌和基于设备的配对来保护对系统的访问。
*   **会话管理**：处理用户会话，确保消息在正确的上下文中进行处理。
*   **可扩展性**：支持多个网关以实现冗余和隔离，并允许通过节点添加新功能。

## 2. 配置选项和参数

OpenClaw Gateway 的配置通过位于 `~/.openclaw/openclaw.json` 的 JSON5 文件进行管理。以下是一些关键的配置选项：

| 配置项 | 描述 |
| --- | --- |
| `gateway.port` | 指定网关 WebSocket 服务器绑定的端口。默认为 `18789`。 |
| `gateway.auth.token` | 设置用于客户端身份验证的身份验证令牌。 |
| `gateway.reload.mode` | 控制配置热重载的行为。`hybrid`（默认）模式会热应用安全更改，并在关键更改时重新启动。`off` 模式禁用热重载。 |
| `agents.defaults.workspace` | 为代理设置默认工作区目录。 |
| `channels.whatsapp.allowFrom` | 一个电话号码数组，允许这些号码的用户与机器人互动。 |
| `channels.whatsapp.groups` | 配置群聊行为，例如是否需要提及机器人才能触发响应。 |

## 3. JSON 配置示例

### 最小配置

这是一个基本的配置示例，它设置了代理的工作区并允许来自特定 WhatsApp 号码的交互：

```json
{
  "agents": {
    "defaults": {
      "workspace": "~/.openclaw/workspace"
    }
  },
  "channels": {
    "whatsapp": {
      "allowFrom": ["+15555550123"]
    }
  }
}
```

### 自我聊天模式配置

此配置可防止机器人在群组中响应 @-mentions，仅响应特定的文本触发器：

```json
{
  "agents": {
    "defaults": {
      "workspace": "~/.openclaw/workspace"
    },
    "list": [
      {
        "id": "main",
        "groupChat": { "mentionPatterns": ["@openclaw", "reisponde"] }
      }
    ]
  },
  "channels": {
    "whatsapp": {
      "allowFrom": ["+15555550123"],
      "groups": { "*": { "requireMention": true } }
    }
  }
}
```

## 4. CLI 命令示例

OpenClaw 提供了一组丰富的 CLI 命令来管理网关：

*   **启动网关**：
    ```bash
    openclaw gateway
    ```
*   **在特定端口上启动**：
    ```bash
    openclaw gateway --port 18789
    ```
*   **强制启动（如果端口被占用）**：
    ```bash
    openclaw gateway --force
    ```
*   **检查网关状态**：
    ```bash
    openclaw gateway status
    ```
*   **执行健康检查**：
    ```bash
    openclaw gateway health
    ```
*   **调用原始方法**：
    ```bash
    openclaw gateway call config.get --params '{}'
    ```

## 5. 最佳实践

*   **使用进程管理器**：使用 `launchd`（在 macOS 上）或 `systemd`（在 Linux 上）等进程管理器来确保网关在崩溃或系统重新启动时自动重新启动。
*   **安全远程访问**：对于远程访问，优先使用 Tailscale 或 VPN。如果这些不可用，请使用 SSH 隧道。
*   **隔离开发环境**：使用 `--dev` 配置文件进行开发，以创建一个与主实例隔离的独立环境。
*   **使用部分更新**：对于配置更改，使用 `config.patch` RPC 方法或 `openclaw config set` CLI 命令进行部分更新，以避免覆盖整个配置文件。
*   **备份配置**：在进行重大更改之前，请务必备份您的 `openclaw.json` 文件。

## 6. 与其他功能的集成

Gateway 与 OpenClaw 生态系统中的其他几个组件紧密集成：

*   **消息传递通道**：网关通过插件与各种消息传递平台集成，允许它从这些平台发送和接收消息。
*   **代理运行时**：当收到消息时，网关会调用代理运行时来处理消息并执行适当的操作。
*   **节点**：节点连接到网关以提供额外的功能，例如访问设备摄像头或屏幕录制。
*   **WebChat**：WebChat UI 直接连接到网关的 WebSocket API，以提供无缝的聊天体验。
