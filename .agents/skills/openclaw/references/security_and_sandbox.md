# OpenClaw 安全和沙箱研究报告

## 1. 核心概念和功能描述

OpenClaw 提供了一套强大的安全功能，旨在通过权限控制、沙箱模式和工具策略来保护主机环境，同时为智能体（agent）提供必要的灵活性。其核心安全理念建立在三个关键概念之上：

*   **沙箱 (Sandboxing)**: OpenClaw 允许将工具（tools）的执行环境隔离在 Docker 容器中，从而显著降低潜在风险。这是一个可选功能，可以根据需求进行配置。当启用沙箱模式时，工具的执行（如 `exec`, `read`, `write` 等）将在一个独立的环境中进行，从而限制了对主机文件系统和进程的访问。网关（Gateway）进程本身保留在主机上，但工具的执行被安全地隔离。

*   **工具策略 (Tool Policy)**: 该机制用于精确控制哪些工具可供智能体使用。通过配置 `tools.allow` 和 `tools.deny` 规则，可以创建全局或针对特定智能体的工具使用策略。`deny` 规则的优先级最高，如果一个工具被明确禁止，则任何智能体都无法使用它。如果 `allow` 列表不为空，则只有列表中的工具被允许使用。

*   **提升权限 (Elevated Mode)**: 这是一个专门为 `exec` 工具设计的“逃生舱口”，允许在沙箱模式下，临时在主机环境上执行命令。该功能需要明确启用，并且可以通过 `allowFrom` 列表限制哪些使用者可以发起提权请求。这为需要直接访问主机资源的受信任操作提供了一个受控的通道。

这三个功能协同工作，形成了一个分层的安全模型。工具策略首先决定一个工具是否可用，然后沙箱模式决定其执行环境（主机或容器），最后，提升权限模式为特殊情况提供了绕过沙箱的机制。

## 2. 配置选项和参数说明

OpenClaw 的安全功能通过 `clawdbot.json` 文件中的多个配置项进行管理。以下是关键的配置选项：

### 沙箱配置 (`agents.defaults.sandbox`)

| 配置项 | 说明 |
| --- | --- |
| `mode` | 控制沙箱模式的激活时机。可选值为 `"off"` (不使用沙箱), `"non-main"` (仅对非主会话使用沙箱，默认), `"all"` (所有会话都使用沙箱)。 |
| `scope` | 控制容器的创建范围。可选值为 `"session"` (每个会话一个容器，默认), `"agent"` (每个智能体一个容器), `"shared"` (所有沙箱会话共享一个容器)。 |
| `workspaceAccess` | 控制沙箱对智能体工作区的访问权限。可选值为 `"none"` (无法访问，默认), `"ro"` (只读挂载), `"rw"` (读写挂载)。 |
| `docker.binds` | 自定义绑定挂载，用于将主机目录挂载到容器中。格式为 `"host:container:mode"`。 |
| `docker.setupCommand` | 在容器首次创建后执行一次的设置命令，用于安装额外的依赖或进行环境配置。 |
| `docker.network` | 配置容器的网络模式，默认为 `"none"` (无网络访问)。 |

### 工具策略配置 (`tools`)

| 配置项 | 说明 |
| --- | --- |
| `allow` / `deny` | 全局工具允许/拒绝列表。`deny` 始终优先。 |
| `sandbox.tools.allow` / `sandbox.tools.deny` | 仅在沙箱环境中生效的工具策略。 |
| `group:*` | 策略组，可用于一次性允许或拒绝一组相关的工具，如 `group:fs` (文件系统操作) 或 `group:runtime` (执行环境)。 |

### 提升权限配置 (`tools.elevated`)

| 配置项 | 说明 |
| --- | --- |
| `enabled` | 是否启用提升权限功能。 |
| `allowFrom.<provider>` | 按模型提供商（provider）限制哪些使用者可以请求提升权限。 |

## 3. JSON 配置示例

以下是一个典型的 JSON 配置示例，展示了如何启用沙箱并配置相关策略：

```json
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "non-main",
        "scope": "session",
        "workspaceAccess": "ro",
        "docker": {
          "binds": [
            "/home/user/source:/source:ro",
            "/var/run/docker.sock:/var/run/docker.sock"
          ]
        }
      }
    },
    "list": [
      {
        "id": "build-agent",
        "sandbox": {
          "workspaceAccess": "rw",
          "docker": {
            "binds": ["/mnt/cache:/cache:rw"]
          }
        }
      }
    ]
  },
  "tools": {
    "sandbox": {
      "tools": {
        "allow": ["group:runtime", "group:fs"],
        "deny": ["exec"]
      }
    },
    "elevated": {
      "enabled": true,
      "allowFrom": {
        "openai": ["gpt-4.1-mini"]
      }
    }
  }
}
```

在此示例中：
- 默认情况下，非主会话将在沙箱中运行，工作区以只读方式挂载。
- 主机的 `/home/user/source` 和 Docker socket 被挂载到容器中。
- 名为 `build-agent` 的智能体具有对其工作区的读写权限，并额外挂载了 `/mnt/cache`。
- 在沙箱环境中，只允许执行 `runtime` 和 `fs` 组的工具，但明确禁止了 `exec`。
- 提升权限功能已启用，但仅允许来自 `gpt-4.1-mini` 模型的请求。

## 4. CLI 命令示例

OpenClaw 提供了一个非常有用的命令行工具来帮助调试和理解当前的安全配置。`openclaw sandbox explain` 命令可以检查并显示生效的沙箱模式、工具策略和提权设置。

```bash
# 检查默认的沙箱配置
openclaw sandbox explain

# 检查特定会话的配置
openclaw sandbox explain --session agent:main:main

# 检查特定智能体的配置
openclaw sandbox explain --agent work

# 以 JSON 格式输出详细信息
openclaw sandbox explain --json
```

该命令的输出会清晰地展示：
- 当前会话是否被沙箱化。
- 生效的沙箱模式、范围和工作区访问权限。
- 生效的工具允许/拒绝列表，并注明其来源（全局、智能体或默认）。
- 提升权限的门控状态和相关的配置项路径。

## 5. 最佳实践建议

- **最小权限原则**: 默认情况下应保持沙箱开启 (`mode: "non-main"` 或 `"all"`)，并仅在绝对必要时才授予 `rw` 工作区访问权限或使用提升权限模式。
- **优先使用只读挂载**: 在使用 `docker.binds` 挂载主机目录时，尽可能使用 `:ro` (只读) 模式，特别是对于包含敏感信息（如源代码、密钥、Docker socket）的目录。
- **明确的工具策略**: 使用 `tools.deny` 明确禁止不需要或有潜在风险的工具，而不是依赖于 `allow` 列表的隐式拒绝。
- **谨慎使用提升权限**: `tools.elevated` 是一个强大的功能，应谨慎使用。通过 `allowFrom` 限制其使用范围，确保只有受信任的模型或用户可以触发。
- **使用 `sandbox explain` 进行调试**: 当遇到“为什么这个工具被阻止了？”或“为什么这个会话没有被沙箱化？”等问题时，`openclaw sandbox explain` 是首选的调试工具。
- **自定义沙箱镜像**: 对于需要特定运行时（如 Node.js）或依赖项的技能，推荐构建一个自定义的沙箱 Docker 镜像，而不是在容器启动时通过 `setupCommand` 动态安装，这样可以提高启动速度和环境一致性。

## 6. 与其他功能的集成方式

安全和沙箱功能与 OpenClaw 的其他部分紧密集成：

- **多智能体 (Multi-Agent)**: 每个智能体都可以拥有自己独立的沙箱配置和工具策略，这允许为不同任务或信任级别的智能体设置不同的安全边界。
- **技能 (Skills)**: 技能的执行受沙箱和工具策略的约束。如果一个技能需要读取文件，它必须在有权访问该文件的沙箱环境中运行。
- **会话管理 (Session Management)**: 沙箱的 `scope` 可以配置为 `session` 级别，这意味着每个用户会话都可以拥有一个独立的、隔离的执行环境，从而防止会话间的干扰。
- **模型提供商 (Model Providers)**: 工具策略和提升权限可以根据模型提供商进行细粒度配置，允许你根据模型的不同，授予不同的权限。
