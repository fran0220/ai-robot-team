# Lessons Learned

> 每次收到用户纠正时更新此文件，记录错误模式和防止规则。

## 格式

```markdown
### [日期] 问题简述
- **错误**: 具体做错了什么
- **原因**: 为什么会出错
- **规则**: 防止再犯的规则
- **状态**: ✅ 已内化 / 🔄 需复习
```

---

## 2026-02

### 2026-02-03 Skill 创建位置错误
- **错误**: 用户要求在 `/root/multiagent/team/.agent/skills` 创建 skill，我却创建在了 `/root/multiagent/.agents/skills/`
- **原因**: 没有仔细听用户指定的目录，假设了默认位置；混淆了 `.agent` 和 `.agents`
- **规则**: 
  1. 用户指定目录时，必须使用用户指定的**完整路径**
  2. 不要假设默认位置，先确认目标目录
  3. 注意 `.agent` vs `.agents` 的区别（项目级 vs 全局）
- **状态**: 🔄 需复习

### 2026-02-03 OpenClaw 模型 API 格式配置
- **发现**: 
  1. GPT-5.2-Codex 官方只支持 Responses API，但中转 API 可转换为 Chat Completions
  2. **主动测试 API** 而不是只查文档 - 用 curl 实际验证
  3. 中转 API 测试结果:
     - `gpt-5.2-codex`: ✅ `/v1/chat/completions` 可用
     - `claude-opus-4-5-20251101`: ✅ `/v1/messages` 可用  
     - `gemini-3-flash`: ✅ `/v1/chat/completions` 可用
- **规则**: 
  1. 遇到不确定时，**主动测试** 而不是只问用户
  2. OpenClaw API 格式: `openai-chat` (OpenAI/Gemini), `anthropic-messages` (Claude)
  3. 中转 API 可能已处理兼容性问题
- **状态**: ✅ 已验证

### 2026-02-03 OpenClaw 自定义配置和工作区路径
- **发现**: 
  1. `OPENCLAW_CONFIG_PATH` - 指定配置文件路径
  2. `OPENCLAW_STATE_DIR` - 指定状态目录（sessions/credentials/logs）
  3. `--profile <name>` - 使用 `~/.openclaw-<name>` 隔离环境
  4. `--dev` - 使用 `~/.openclaw-dev` 开发环境
- **规则**: 
  1. 多项目隔离时，设置这两个环境变量
  2. 创建启动脚本 + .env 文件方便管理
  3. workspace 路径在 `agents.defaults.workspace` 配置
- **状态**: ✅ 已验证

### 2026-02-03 OpenClaw Skills 生态系统
- **发现**: 
  1. 两个 Skills 源：`skills.sh` (通用) 和 `clawhub.ai` (OpenClaw 原生)
  2. `npx skills find [query]` 搜索 skills.sh
  3. `npx skills add <owner/repo@skill>` 安装
  4. ClawHub 有安全风险（恶意 skills），需谨慎使用 `securityclaw` 扫描
- **有用的 Skills**:
  - 调研: `web-research`, `research-documentation`, `research-management`
  - PM: `product-management`, `product-manager`
  - 硬件: `arm-cortex-expert`, `firmware-analyst`, `iot-engineer`
  - 测试: `qa-expert`, `testing-qa`
  - 代码: `code-review-excellence`, `pr-reviewer`
- **状态**: ✅ 已验证

### 2026-02-03 OpenClaw API 格式配置（更新）
- **错误**: 使用 `api: "openai-chat"` 导致配置无效
- **正确值**:
  - OpenAI 兼容 API: `api: "openai-completions"`
  - Anthropic API: `api: "anthropic-messages"`
  - Bedrock: `api: "bedrock-converse-stream"`
- **规则**: 
  1. OpenClaw 的 api 字段值是 `openai-completions` 不是 `openai-chat`
  2. 自定义 provider 必须显式指定 `api` 字段
  3. 配置后用 `openclaw doctor` 验证
- **状态**: ✅ 已验证

### 2026-02-03 OpenClaw Systemd Service 配置
- **错误**: Gateway 启动失败，提示 `gateway.mode=remote`
- **原因**: Systemd service 没有正确的环境变量，读取了默认/错误的配置
- **解决**: 在 service 文件中添加环境变量:
  ```ini
  Environment=OPENCLAW_CONFIG_PATH=/path/to/openclaw.json
  Environment=OPENCLAW_STATE_DIR=/path/to/.openclaw
  Environment=OPENCLAW_TOKEN=<gateway_token>
  ```
- **规则**:
  1. 修改 service 后运行 `systemctl --user daemon-reload`
  2. 检查 `openclaw gateway status` 确认 Config 路径正确
  3. Service env 和 CLI env 必须一致
- **状态**: ✅ 已验证

### 2026-02-03 OpenClaw Cron 心跳配置
- **错误**: 使用 `--session main` 创建心跳失败
- **原因**: main session 需要 `--system-event`，心跳应该用 isolated session
- **规则**:
  1. 心跳任务使用 `--session isolated`
  2. isolated session 在任务完成后自动结束，节省资源
  3. 使用 `--post-mode summary` 将结果汇报到 main session
- **状态**: ✅ 已验证

---

## 待复习规则

1. **用户指定路径时，严格使用该路径，不要自作主张**
2. 创建文件前先确认目标目录位置
3. `.agent/skills` = 项目级，`.agents/skills` = 全局级
4. Skill 目录名必须与 frontmatter 中的 `name` 一致
5. 使用小写字母、数字和连字符命名 skill

---

## 会话开始检查清单

- [ ] 回顾本文件中的 🔄 需复习 项目
- [ ] 检查最近 7 天的教训
- [ ] 确认相关规则已应用到当前任务
