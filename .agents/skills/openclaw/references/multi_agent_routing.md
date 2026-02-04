# OpenClaw Multi-Agent 路由研究报告

## 1. 核心概念和功能描述

OpenClaw 的 Multi-Agent 路由功能允许在一个 Gateway 实例中同时运行多个相互隔离的 Agent。每个 Agent 都拥有独立的上下文、状态和会话历史，从而实现了多租户或多角色部署。

- **Agent**: 每个 Agent 是一个功能齐全的“大脑”，拥有自己独立的:
    - **工作区 (Workspace)**: 包含文件、`AGENTS.md`/`SOUL.md`/`USER.md`、本地笔记和角色规则。
    - **状态目录 (agentDir)**: 用于存放认证配置、模型注册表和每个 Agent 的特定配置。
    - **会话存储 (Session store)**: 位于 `~/.openclaw/agents/<agentId>/sessions`，包含聊天历史和路由状态。

- **隔离性**: 不同 Agent 之间的认证配置、会话和状态是完全隔离的。主 Agent 的凭证不会自动共享。严禁在不同 Agent 之间重用 `agentDir`，否则会导致认证和会话冲突。

- **沙箱 (Sandbox)**: 从 v2026.1.6 开始，可以为每个 Agent 配置独立的沙箱和工具使用限制。这增强了安全性和资源隔离。

- **路由 (Routing)**: 进入 Gateway 的消息通过“绑定”规则被路由到指定的 Agent。

## 2. 配置选项和参数说明

多 Agent 环境主要通过 `openclaw.json` 文件进行配置。核心配置位于 `agents.list` 数组中，每个对象代表一个 Agent。

```json
{
  "agents": {
    "list": [
      {
        "id": "personal",
        "workspace": "~/.openclaw/workspace-personal",
        "sandbox": {
          "mode": "off"
        }
      },
      {
        "id": "family",
        "workspace": "~/.openclaw/workspace-family",
        "sandbox": {
          "mode": "all",
          "scope": "agent",
          "docker": {
            "setupCommand": "apt-get update && apt-get install -y git curl"
          }
        },
        "tools": {
          "allow": ["read"],
          "deny": ["exec", "write", "edit", "apply_patch"]
        }
      }
    ]
  }
}
```

**参数说明:**

- `id`: Agent 的唯一标识符。
- `workspace`: Agent 的工作目录路径。
- `sandbox`: 沙箱配置。
    - `mode`: 沙箱模式，`off` 表示关闭，`all` 表示始终在沙箱中运行。
    - `scope`: 沙箱范围，`agent` 表示每个 Agent 一个独立的容器。
    - `docker.setupCommand`: (可选) 容器创建后执行的一次性设置命令。
- `tools`: 工具使用限制。
    - `allow`: 允许使用的工具列表。
    - `deny`: 禁止使用的工具列表。

## 3. JSON 配置示例

见上一节的示例。

## 4. CLI 命令示例

文档中并未提供专门针对 Multi-Agent 路由的特定 CLI 命令，但通用的命令可以通过指定 Agent ID 来与特定的 Agent 交互。例如，在使用 `openclaw message` 命令时，可以通过参数指定目标 Agent。

## 5. 最佳实践建议

- **独立 `agentDir`**: 永远不要在多个 Agent 之间共享或重用 `agentDir`，以避免状态和认证信息的冲突。
- **凭证共享**: 如果确实需要在不同 Agent 之间共享凭证，应手动复制 `auth-profiles.json` 文件到目标 Agent 的 `agentDir` 中。
- **精细化沙箱和工具配置**: 根据每个 Agent 的具体用途和安全需求，为其配置合适的沙箱模式和工具权限，实现最小权限原则。
- **明确的路由规则**: 确保路由规则清晰明确，能够准确地将不同渠道或用户的消息分发到正确的 Agent。

## 6. 与其他功能的集成方式

- **技能 (Skills)**: 技能可以通过两种方式提供给 Agent：
    - **每个 Agent 独有**: 放置在各自工作区的 `skills/` 目录下。
    - **共享**: 放置在 `~/.openclaw/skills` 目录下，所有 Agent 均可访问。
- **通道 (Channels)**: 可以将不同的通信通道（如 WhatsApp, Telegram）绑定到不同的 Agent，实现多渠道、多角色的客服或助理功能。
