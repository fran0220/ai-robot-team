# OpenClaw Skills 系统详解

**作者**: Manus AI
**日期**: 2026年02月03日

## 1. 摘要

OpenClaw 的 Skills 系统是一个强大而灵活的扩展机制，它允许开发者通过简单的文本文件向 AI 代理传授新能力。该系统基于 AgentSkills 规范，通过结构化的 `SKILL.md` 文件来定义技能的元数据、依赖关系和执行逻辑。Skills 可以被打包、分享和复用，并通过 ClawHub 注册中心进行统一管理。本文档将深入探讨 OpenClaw Skills 系统的核心概念、创建与配置方法、命令行工具的使用、最佳实践以及与其他系统功能的集成方式，旨在为开发者提供一份全面的技术参考。

## 2. 核心概念

OpenClaw 的 Skills 系统围绕着一系列核心概念构建，理解这些概念是有效利用该系统的基础。

### 2.1. Skill 的构成

在 OpenClaw 中，一个 Skill 本质上是一个包含 `SKILL.md` 文件的目录。该文件采用 YAML frontmatter 来定义技能的元数据，例如名称、描述和依赖项，而文件的主体部分则包含了指导 AI 模型如何使用该技能的自然语言指令。这种设计使得技能的定义既结构化又易于理解。

### 2.2. 加载机制与优先级

为了提供灵活性和可扩展性，OpenClaw 从三个不同的位置加载 Skills，并设定了明确的优先级规则以处理命名冲突。加载顺序和优先级如下：

1.  **工作区技能 (Workspace Skills)**: 位于 `<workspace>/skills` 目录，具有最高优先级。这允许开发者在特定项目中覆盖或扩展全局技能。
2.  **托管/本地技能 (Managed/local Skills)**: 位于 `~/.openclaw/skills` 目录，优先级居中。这些技能对同一台机器上的所有 AI 代理可见。
3.  **捆绑技能 (Bundled Skills)**: 作为 OpenClaw 安装包的一部分提供，优先级最低。

此外，系统还支持通过 `~/.openclaw/openclaw.json` 配置文件中的 `skills.load.extraDirs` 选项添加额外的技能目录，这些目录的优先级最低，适用于加载共享的技能库。

### 2.3. ClawHub：技能注册与发现

ClawHub 是 OpenClaw 官方的公共技能注册中心，它为开发者提供了一个发现、安装、更新和分享技能的平台。通过 `clawhub` 命令行工具，用户可以轻松地将社区创建的技能集成到自己的工作流程中，或将自己开发的技能发布给社区。

## 3. 技能的创建与配置

创建和配置技能是使用 OpenClaw Skills 系统的关键步骤。

### 3.1. SKILL.md 文件格式

`SKILL.md` 文件是每个技能的核心。其 YAML frontmatter 必须包含 `name` 和 `description` 字段。`metadata` 字段是一个单行的 JSON 对象，用于定义更复杂的行为和依赖关系。

以下是一个 `SKILL.md` 文件的示例，展示了如何定义一个依赖于特定二进制文件、环境变量和配置的技能：

```yaml
---
name: nano-banana-pro
description: Generate or edit images via Gemini 3 Pro Image
metadata:
  {
    "openclaw":
      {
        "requires": { "bins": ["uv"], "env": ["GEMINI_API_KEY"], "config": ["browser.enabled"] },
        "primaryEnv": "GEMINI_API_KEY"
      }
  }
---

# 指令

这是一个使用 Gemini 3 Pro Image 生成或编辑图像的技能。请提供详细的图像描述...
```

#### 3.1.1. 可选元数据字段

`SKILL.md` 的 frontmatter 还支持一系列可选字段，以实现更高级的功能：

| 字段 | 描述 |
| --- | --- |
| `homepage` | 在 macOS Skills UI 中显示的技能网站 URL。 |
| `user-invocable` | 布尔值，默认为 `true`。设为 `true` 时，技能会作为用户的斜杠命令（slash command）暴露出来。 |
| `disable-model-invocation` | 布尔值，默认为 `false`。设为 `true` 时，技能将不会被包含在模型的工具提示中，但仍可通过用户调用。 |
| `command-dispatch` | 设为 `tool` 时，斜杠命令将绕过模型，直接将请求分派给指定的工具。 |
| `command-tool` | 当 `command-dispatch` 为 `tool` 时，指定要调用的工具名称。 |
| `command-arg-mode` | 默认为 `raw`。在工具分派模式下，将用户输入的原始参数字符串直接传递给工具。 |

### 3.2. 通过 JSON 进行配置覆盖

开发者可以通过编辑 `~/.openclaw/openclaw.json` 文件来覆盖默认的技能配置，例如启用/禁用特定技能，或为其提供必要的环境变量和 API 密钥。

```json
{
  "skills": {
    "entries": {
      "nano-banana-pro": {
        "enabled": true,
        "apiKey": "your_api_key_here"
      }
    }
  }
}
```

## 4. 命令行工具 (CLI)

OpenClaw 提供了 `clawhub` 命令行工具，用于简化技能的生命周期管理。

| 命令 | 描述 |
| --- | --- |
| `clawhub install <skill-slug>` | 从 ClawHub 注册中心安装一个指定的技能到当前工作区。 |
| `clawhub update --all` | 更新所有在当前工作区中已安装的技能到最新版本。 |
| `clawhub sync --all` | 扫描本地技能，并将任何更新发布到 ClawHub。 |

## 5. 最佳实践

为了确保安全、高效地使用 Skills 系统，建议遵循以下最佳实践：

*   **审查第三方技能**: 在启用从社区获取的技能之前，务必仔细审查其源代码，以防止潜在的安全风险。
*   **利用沙盒环境**: 对于处理不受信任输入或执行高风险操作的技能，应优先在沙盒（Sandbox）环境中运行，以隔离其执行并限制其对主机系统的访问。
*   **保护敏感信息**: 避免在 `SKILL.md` 文件或模型提示中硬编码 API 密钥等敏感信息。应使用 `openclaw.json` 的配置覆盖机制来安全地注入这些凭证。
*   **编写清晰的指令**: `SKILL.md` 文件中的指令应该清晰、明确，以便 AI 模型能够准确理解技能的用途和调用方式。
*   **使用版本控制**: 将您的技能目录纳入版本控制系统（如 Git），并利用 ClawHub 进行发布和同步，这有助于团队协作和版本管理。

## 6. 与其他功能的集成

Skills 系统与 OpenClaw 的其他核心功能紧密集成，共同构建了一个强大的自动化平台。

*   **插件 (Plugins)**: 技能可以作为插件的一部分进行分发。这使得开发者可以将一组相关的技能打包成一个独立的插件，方便部署和管理。
*   **多代理 (Multi-Agent)**: 在多代理架构中，Skills 系统支持在不同层级（工作区、用户、全局）定义和覆盖技能，从而可以为不同的代理配置独特的技能集。
*   **沙盒 (Sandboxing)**: 技能可以在沙盒容器内执行，以增强安全性。需要注意的是，如果一个技能依赖于特定的二进制文件，那么该文件也必须存在于沙盒环境中。

## 7. 参考文献

[1] OpenClaw Documentation. [https://docs.openclaw.ai/tools/skills](https://docs.openclaw.ai/tools/skills)
