# OpenClaw 模型提供商配置

OpenClaw 支持多种大型语言模型（LLM）提供商，允许用户灵活选择最适合其需求的模型。本指南将详细介绍如何配置和管理这些提供商。

## 核心概念

- **提供商 (Provider)**: 提供 LLM 服务的实体，如 OpenAI、Anthropic、Amazon Bedrock 等。
- **模型 (Model)**: 特定的语言模型，其引用格式为 `provider/model`，例如 `openai/gpt-5.2`。
- **认证配置文件 (Auth Profile)**: 用于存储 API 密钥或 OAuth 令牌的配置单元，支持同一提供商的多个账户。

## 通用配置流程

1.  **获取凭证**: 从您选择的提供商处获取 API 密钥或通过 OAuth 流程获取令牌。
2.  **配置 OpenClaw**: 使用 `openclaw onboard` 向导或直接编辑 `~/.openclaw/openclaw.json` 文件来添加您的凭证。
3.  **设置默认模型**: 在 `openclaw.json` 中指定默认使用的主模型和备用模型。

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-opus-4-5",
        "fallbacks": [
          "openai/gpt-5.2"
        ]
      }
    }
  }
}
```

## 主要提供商配置详解

### OpenAI

- **认证方式**: API 密钥或通过 Codex 的 ChatGPT 订阅。
- **配置示例 (API 密钥)**:
  ```json
  {
    "env": { "OPENAI_API_KEY": "sk-..." },
    "agents": { "defaults": { "model": { "primary": "openai/gpt-5.2" } } }
  }
  ```
- **CLI 命令**:
  ```bash
  openclaw onboard --openai-api-key "$OPENAI_API_KEY"
  ```

### Anthropic (Claude)

- **认证方式**: API 密钥或通过 Claude Code CLI 生成的 `setup-token`。
- **配置示例 (API 密钥)**:
  ```json
  {
    "env": { "ANTHROPIC_API_KEY": "sk-ant-..." },
    "agents": { "defaults": { "model": { "primary": "anthropic/claude-opus-4-5" } } }
  }
  ```
- **CLI 命令 (setup-token)**:
  ```bash
  # 在任意机器运行 claude setup-token，然后粘贴到向导中
  openclaw onboard --auth-choice setup-token
  ```

### Amazon Bedrock

- **认证方式**: AWS SDK 默认凭证链（环境变量、共享配置或 EC2 实例角色），**无需 API 密钥**。
- **核心特性**: 支持自动模型发现。
- **配置示例 (手动)**:
  ```json
  {
    "models": {
      "providers": {
        "amazon-bedrock": {
          "baseUrl": "https://bedrock-runtime.us-east-1.amazonaws.com",
          "api": "bedrock-converse-stream",
          "auth": "aws-sdk",
          "models": [
            {
              "id": "anthropic.claude-opus-4-5-20251101-v1:0",
              "name": "Claude Opus 4.5 (Bedrock)"
            }
          ]
        }
      }
    }
  }
  ```
- **EC2 实例角色**: 需设置 `AWS_PROFILE=default` 和 `AWS_REGION` 环境变量，并授予 `bedrock:InvokeModel` 等权限。

### OpenRouter

- **认证方式**: API 密钥。
- **核心特性**: 提供统一的 API 端点，可路由到多个不同的模型提供商。
- **模型引用**: `openrouter/<provider>/<model>`，例如 `openrouter/anthropic/claude-sonnet-4-5`。
- **配置示例**:
  ```json
  {
    "env": { "OPENROUTER_API_KEY": "sk-or-..." },
    "agents": {
      "defaults": {
        "model": { "primary": "openrouter/anthropic/claude-sonnet-4-5" }
      }
    }
  }
  ```

## 模型回退 (Failover)

OpenClaw 提供了两阶段的故障处理机制，以确保服务的健壮性：

1.  **认证配置文件轮换**: 当一个认证配置文件（例如，一个 API 密钥）因速率限制或认证失败而无法使用时，系统会自动切换到该提供商的下一个可用配置文件。该过程采用带有指数退避策略的冷却机制。

2.  **模型回退**: 如果一个提供商的所有认证配置文件都失败了，系统将根据 `agents.defaults.model.fallbacks` 列表中定义的顺序，切换到下一个备用模型。

这种机制大大提高了代理的可靠性，即使在主要模型提供商出现问题时也能继续提供服务。
