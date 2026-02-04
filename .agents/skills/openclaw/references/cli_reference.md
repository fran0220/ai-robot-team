# OpenClaw CLI 命令参考研究报告

## 1. 核心概念

OpenClaw CLI 是一个功能强大的命令行工具，用于管理 OpenClaw 平台的方方面面。它提供了一个分层的命令树，涵盖了从初始设置、日常配置到高级系统管理和故障排除的各种功能。核心概念包括：

*   **命令树 (Command Tree)**: CLI 命令按功能分组，形成一个逻辑层次结构。主要命令类别包括 `setup`, `onboard`, `configure`, `system`, `models`, `gateway`, `nodes`, `channels`, `skills`, `plugins` 等。
*   **全局标志 (Global Flags)**: 提供了如 `--dev`, `--profile <name>`, `--no-color` 等全局标志，用于隔离开发环境、切换配置文件和控制输出样式。
*   **输出样式 (Output Styling)**: 支持 ANSI 颜色、JSON、纯文本和可点击的超链接，可以通过 `--json` 或 `--no-color` 等标志进行控制，以适应不同的使用场景，特别是脚本自动化。
*   **插件扩展 (Plugin Extensibility)**: 插件可以向 CLI 添加新的一级命令，从而扩展其功能，例如 `voicecall` 插件。

## 2. 配置选项与参数

OpenClaw CLI 提供了丰富的配置选项，允许用户通过交互式向导或非交互式命令进行精细化控制。

### 2.1. 主要配置命令

| 命令 | 描述 | 主要选项 |
| --- | --- | --- |
| `setup` | 初始化配置和工作区。 | `--workspace`, `--wizard`, `--non-interactive`, `--remote-url` |
| `onboard` | 交互式向导，用于设置网关、工作区和技能。 | `--reset`, `--flow`, `--auth-choice`, `--gateway-port`, `--tailscale` |
| `configure` | 交互式配置向导，用于设置模型、渠道、技能和网关。 | N/A |
| `config` | 非交互式地获取、设置或取消设置配置值。 | `get <path>`, `set <path> <value>`, `unset <path>` |
| `doctor` | 检查系统健康状况并提供快速修复。 | `--deep`, `--yes`, `--non-interactive` |
| `security` | 审计配置和本地状态以发现安全问题。 | `audit`, `audit --deep`, `audit --fix` |

### 2.2. 功能模块配置

*   **`channels`**: 管理聊天渠道（如 WhatsApp, Telegram, Discord）。
    *   `add`: 添加新渠道账户。
    *   `remove`: 禁用或删除渠道账户。
    *   `login`/`logout`: 管理渠道会话。
*   **`models`**: 管理语言模型。
    *   `list`: 列出可用模型。
    *   `set`: 设置默认模型。
    *   `aliases`: 管理模型别名。
    *   `fallbacks`: 配置备用模型。
*   **`plugins`**: 管理插件和扩展。
    *   `install`: 安装插件。
    *   `enable`/`disable`: 启用或禁用插件。
*   **`gateway`**: 运行和管理 WebSocket 网关。
    *   `run`: 启动网关。
    *   `install`/`uninstall`: 作为系统服务安装或卸载网关。
*   **`sessions`**: 管理会话，但文档中未详细展开。

## 3. JSON 配置与 CLI 命令示例

### 3.1. JSON 配置示例

文档中未直接提供完整的 JSON 配置文件示例，但提到了可以使用 `openclaw config get/set` 命令来操作 JSON 格式的配置。配置项以点或括号路径表示，例如 `openclaw config set model.default gpt-4.1-mini`。

### 3.2. CLI 命令示例

以下是一些常用的 CLI 命令示例：

*   **初始化一个新的工作区并运行设置向导**:

    ```bash
    openclaw setup --workspace ./myworkspace --wizard
    ```

*   **以非交互方式添加一个 Telegram 渠道**:

    ```bash
    openclaw channels add --channel telegram --account alerts --name "Alerts Bot" --token $TELEGRAM_BOT_TOKEN
    ```

*   **深度检查系统健康状况**:

    ```bash
    openclaw health --deep
    ```

*   **在指定端口上运行网关**:

    ```bash
    openclaw gateway --port 8080 --bind auto --token mytoken
    ```

*   **以 JSON 格式列出所有可用模型**:

    ```bash
    openclaw models list --json
    ```

*   **发送一条消息**:

    ```bash
    openclaw message send --target +15555550123 --message "Hi"
    ```

## 4. 最佳实践

*   **用于脚本和自动化**: 在编写脚本时，始终使用 `--json` 标志以获取结构化的、可预测的输出。
*   **环境隔离**: 使用 `--profile <name>` 或 `--dev` 标志来创建和管理多个独立的配置和状态环境，避免相互干扰。
*   **定期健康检查**: 定期运行 `openclaw doctor` 命令来诊断和修复潜在的配置或服务问题。
*   **谨慎操作重置和卸载**: `reset` 和 `uninstall` 是破坏性操作，应仅在开发、测试或需要彻底恢复的场景下使用。
*   **插件管理**: 在安装、启用或禁用插件后，需要重启网关才能使更改生效。
*   **监控与日志**: 使用 `openclaw health`, `openclaw status --deep` 和 `openclaw logs` 命令来持续监控系统状态和排查问题。

## 5. 与其他功能的集成

OpenClaw CLI 旨在与其他工具和系统无缝集成：

*   **自动化部署**: 可以将 `gateway install`, `gateway start`, `plugins install` 等命令集成到 CI/CD 管道或部署脚本中，实现自动化部署和配置。
*   **动态配置管理**: `config get/set/unset` 命令使得在脚本中动态读取和修改配置成为可能。
*   **消息工作流**: 结合 `channels` 命令和 `webhooks`，可以构建自动化的消息发送和响应工作流。
*   **远程自动化**: 通过 `browser` 和 `nodes` 相关命令，可以实现对浏览器和远程节点的控制，用于自动化测试或远程任务执行。
*   **交互式管理**: `tui` (终端用户界面) 为开发和故障排查过程中的交互式管理提供了便利。

---

**参考资料**:

[1] OpenClaw. (2026). *CLI Reference*. Retrieved from https://docs.openclaw.ai/cli
