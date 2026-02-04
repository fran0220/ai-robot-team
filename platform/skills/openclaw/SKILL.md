---
name: openclaw
description: 提供使用 OpenClaw 个人 AI 助手框架的最佳实践、工作流程和配置示例。当用户想要安装、配置或使用 OpenClaw 及其相关功能（如 Gateway、Skills、多代理）时，应使用此技能。
---

# OpenClaw 专家

本技能旨在为您提供使用 OpenClaw（一个开源的、自托管的个人 AI 助手框架）所需的核心知识和最佳实践。它将引导您完成从安装配置到高级功能的整个过程，涵盖 Gateway 架构、消息渠道集成、技能系统和多代理路由，并提供详细的参考文档以便深入研究。

## 核心概念

在开始之前，请先了解 OpenClaw 的几个核心概念：

1.  **Gateway**: 系统的核心，一个长期运行的进程，负责连接所有消息渠道（WhatsApp, Telegram 等）并管理 WebSocket 控制平面。
2.  **Agent**: 执行任务的 AI 实体。OpenClaw 支持通过配置运行多个相互隔离的代理。
3.  **Channel**: 连接用户与 Gateway 的通信桥梁，例如 WhatsApp、Telegram 或 Discord。
4.  **Skill**: 为代理定义新工具和能力的机制，通过 `SKILL.md` 文件进行描述。
5.  **Workspace**: 每个代理独立的工作目录，包含其配置、技能和状态。

## 快速入门：安装和配置

让我们从一个基本的安装和配置流程开始，这将帮助您快速启动并运行 OpenClaw。

1.  **安装 OpenClaw CLI** (需要 Node.js ≥ 22):
    ```bash
    npm install -g openclaw@latest
    ```

2.  **运行引导程序** (推荐，会自动安装后台服务):
    ```bash
    openclaw onboard --install-daemon
    ```

3.  **配置消息渠道** (以 Telegram 为例，最简单快捷):
    ```bash
    # 在 openclaw.json 中添加或修改
    # "channels": { "telegram": { "enabled": true, "botToken": "YOUR_TELEGRAM_BOT_TOKEN" } }
    openclaw configure channels.telegram.enabled true
    openclaw configure channels.telegram.botToken YOUR_TELEGRAM_BOT_TOKEN
    ```

4.  **启动 Gateway** (如果未作为后台服务安装):
    ```bash
    openclaw gateway
    ```

5.  **发送测试消息**: 从您的 Telegram 客户端向机器人发送消息。

## 核心功能与参考指南

本技能将研究的关键主题整理成了详细的参考文档。在执行任务时，请根据需要查阅这些文档。

| 主题 | 描述 | 参考文档 |
| :--- | :--- | :--- |
| **Gateway 架构** | 了解核心网关的设置、运行模式和远程访问。 | `references/gateway_architecture.md` |
| **Agent Runtime** | 深入理解代理的生命周期、上下文管理和 Token 使用。 | `references/agent_runtime.md` |
| **消息渠道配置** | 学习如何配置 WhatsApp、Telegram、Discord 等渠道。 | `references/channel_config.md` |
| **Skills 系统** | 掌握技能的创建、`SKILL.md` 格式、ClawHub 和配置。 | `references/skills_system.md` |
| **多代理路由** | 学习如何设置和管理多个相互隔离的代理。 | `references/multi_agent_routing.md` |
| **安全与沙箱** | 配置权限、沙箱模式和工具策略以确保安全。 | `references/security_and_sandbox.md` |
| **CLI 命令参考** | 查阅 `openclaw` 命令行工具的详细用法。 | `references/cli_reference.md` |
| **最佳实践** | 学习会话管理、调试技巧和推荐的工作流程。 | `references/best_practices.md` |
| **模型提供商** | 学习如何配置不同的 LLM 提供商和模型回退策略。 | `references/model_providers.md` |


**使用方法**：当您需要深入了解某个特定主题时，请使用 `file` 工具阅读相应的参考文档。例如：
`print(default_api.file(action=\'read\', path=\'/home/ubuntu/skills/openclaw/references/skills_system.md\'))`

## 推荐工作流程

在配置或管理 OpenClaw 实例时，建议遵循以下工作流程：

1.  **规划您的设置**: 决定您需要单个代理还是多个代理，以及需要哪些消息渠道。
2.  **配置文件优先**: 尽可能通过编辑 `~/.openclaw/openclaw.json` 文件进行配置，而不是完全依赖命令行。这有助于保持配置的版本可控和可复现。
3.  **从简到繁**: 先从最简单的配置开始（例如，一个 Telegram 渠道和一个默认代理），验证其正常工作后再逐步添加更复杂的功能（如多代理、沙箱）。
4.  **使用 `doctor` 命令**: 定期运行 `openclaw doctor` 来检查您的配置和环境是否存在问题。
5.  **管理技能**: 使用 `clawhub` CLI 从官方仓库发现并安装技能。在启用第三方技能之前，务必审查其 `SKILL.md` 文件以了解其功能和潜在风险。
6.  **安全第一**: 仔细配置沙箱和工具权限，遵循最小权限原则，特别是对于暴露在公共网络上的实例。

## 配置文件示例 (`~/.openclaw/openclaw.json`)

下面是一个包含 WhatsApp 和 Telegram 渠道以及一个自定义代理的基本配置示例：

```json
{
  "channels": {
    "whatsapp": {
      "enabled": true,
      "dmPolicy": "pairing", // 只允许配对的用户私聊
      "allowFrom": ["+15555550123"] // 允许特定号码
    },
    "telegram": {
      "enabled": true,
      "botToken": "YOUR_TELEGRAM_BOT_TOKEN",
      "allowFrom": ["123456789"] // 允许特定 Telegram 用户 ID
    }
  },
  "agents": {
    "defaults": {
      "workspace": "~/.openclaw/workspace",
      "sandbox": {
        "mode": "non-main" // 对非主会话启用沙箱
      }
    }
  },
  "skills": {
    "entries": {
      "google": { "enabled": true },
      "wikipedia": { "enabled": true }
    }
  }
}
```

