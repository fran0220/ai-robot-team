---
name: railway-deploy
description: Deploy services to Railway cloud platform. Use when deploying applications, databases, or services to the cloud.
---

# Railway 部署技能

本技能指导你使用 Railway CLI 部署和管理云服务。

## 前置条件

Railway CLI 已安装并登录：
```bash
railway --version  # 确认安装
railway whoami     # 确认登录状态
```

## 核心命令

### 项目管理

```bash
# 列出项目
railway projects

# 链接到项目
railway link

# 创建新项目
railway init
```

### 部署服务

```bash
# 部署当前目录
railway up

# 部署到指定服务
railway up --service <service-name>

# 查看部署状态
railway status

# 查看日志
railway logs
railway logs --service <service-name>
```

### 环境变量

```bash
# 查看变量
railway variables

# 设置变量
railway variables set KEY=value

# 从 .env 导入
railway variables set < .env
```

### 数据库

```bash
# 添加 PostgreSQL
railway add --database postgres

# 添加 Redis
railway add --database redis

# 添加 MySQL
railway add --database mysql
```

### 域名

```bash
# 生成域名
railway domain

# 查看服务 URL
railway open
```

## 部署工作流

### 1. 新项目部署

```bash
# 1. 初始化项目
railway init

# 2. 添加数据库（如需要）
railway add --database postgres

# 3. 设置环境变量
railway variables set NODE_ENV=production
railway variables set DATABASE_URL=${{Postgres.DATABASE_URL}}

# 4. 部署
railway up

# 5. 获取域名
railway domain
```

### 2. 更新现有服务

```bash
# 1. 链接到项目
railway link

# 2. 选择服务
railway service

# 3. 部署更新
railway up
```

### 3. 查看和调试

```bash
# 实时日志
railway logs -f

# 服务状态
railway status

# 打开管理面板
railway open
```

## 常用场景

### 部署 Node.js 服务

```bash
railway init
railway variables set NODE_ENV=production
railway up
railway domain
```

### 部署 Python 服务

```bash
railway init
# 确保有 requirements.txt 或 Pipfile
railway up
```

### 部署带数据库的服务

```bash
railway init
railway add --database postgres
railway variables set DATABASE_URL=${{Postgres.DATABASE_URL}}
railway up
```

## 注意事项

1. **构建配置** - Railway 自动检测项目类型，也可通过 `railway.json` 或 `Procfile` 自定义
2. **环境隔离** - 使用不同 environment 区分开发/生产
3. **费用** - 注意资源使用，避免意外费用
4. **秘密管理** - 敏感信息使用 Railway Variables，不要提交到代码

## 自动化部署

可以配置 GitHub 集成实现 CI/CD：
1. Railway Dashboard → Project → Settings → GitHub
2. 连接仓库
3. 配置自动部署分支

## 故障排查

```bash
# 查看构建日志
railway logs --build

# 检查服务健康
railway status

# 重启服务
railway restart
```
