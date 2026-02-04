# 部署 AI Robot Team 到 Railway

## 快速部署步骤

### 1. 在 Railway 创建新项目

```bash
# 方式一：通过 Railway CLI
railway login
railway init

# 方式二：通过 Railway Dashboard
# 1. https://railway.app/new
# 2. 选择 "Deploy from GitHub repo"
# 3. 连接 fran0220/ai-robot-team 仓库
```

### 2. 添加 Volume

在 Railway Dashboard:
- Service Settings → Volumes → Add Volume
- Mount Path: `/data`

### 3. 配置环境变量

在 Railway Dashboard → Variables 添加：

**必需：**
```
PROXY_BASE_URL=http://67.230.171.248:8317
PROXY_API_KEY=sk-123456
TELEGRAM_BOT_TOKEN=7582788494:AAG1Pkx56oaf-l5Lfn66_sTlFWqEoIQI9fg
PORT=8080
```

**推荐：**
```
OPENCLAW_GATEWAY_TOKEN=<生成一个64字符的随机token>
```

生成 token:
```bash
openssl rand -hex 32
```

### 4. 启用公网访问

Service Settings → Networking:
- Enable HTTP Proxy
- Port: 8080
- Generate Domain 或使用自定义域名

### 5. 部署

```bash
railway up
```

或在 Dashboard 点击 "Deploy"

## 部署后访问

- **Gateway WebSocket**: `wss://<your-domain>.up.railway.app`
- **Gateway HTTP**: `https://<your-domain>.up.railway.app`
- **Health Check**: `https://<your-domain>.up.railway.app/health`

## 连接 Mission Control

更新 Mission Control 的环境变量：

```env
OPENCLAW_GATEWAY_URL=wss://<your-railway-domain>.up.railway.app
OPENCLAW_GATEWAY_TOKEN=<你设置的token>
```

## Telegram 集成

Railway 部署后，Telegram 会自动工作（无墙限制）。

Bot 会通过 `TELEGRAM_BOT_TOKEN` 自动连接。

## 文件结构

```
/app/                        # 应用代码
  ├── openclaw.json          # 配置文件
  ├── platform/              # 平台配置
  ├── teams/                 # 团队配置
  └── docs/                  # 文档

/data/                       # 持久化数据 (Railway Volume)
  ├── .openclaw/             # OpenClaw 状态
  │   ├── agents/            # Agent 状态
  │   ├── credentials/       # 凭证
  │   └── logs/              # 日志
  └── workspace/             # Agent 工作目录
```

## 故障排查

### 查看日志
```bash
railway logs
```

### 连接失败
1. 检查 `OPENCLAW_GATEWAY_TOKEN` 是否一致
2. 确认使用 `wss://` (不是 `ws://`)
3. 检查 Railway 域名是否正确

### Telegram 不工作
1. 确认 `TELEGRAM_BOT_TOKEN` 已设置
2. 检查 Bot 是否在 `allowFrom` 列表中
3. 查看日志中的 Telegram 连接状态
