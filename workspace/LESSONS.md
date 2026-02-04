# 团队踩坑记录

> 所有 Agent 应定期查阅此文件，避免重复踩坑。遇到新问题请补充。

---

## 🔧 开发环境

### 1. Convex React hooks 无法连接自托管后端
**日期**：2026-02-03  
**发现者**：Friday  
**问题**：Dashboard 显示 0 任务，但后端 API 正常返回 14 个任务  
**原因**：
- `useQuery(api.tasks.list)` 是 Convex React hooks
- Convex hooks 需要 WebSocket 连接到 `*.convex.cloud`
- 自托管 HTTP 后端不支持 Convex 实时协议

**解决**：
1. 创建 `src/lib/api.ts` - REST API wrapper (fetch)
2. 创建 `src/hooks/useApi.ts` - polling hooks 替代实时订阅
3. 修改组件使用新 hooks

**教训**：Convex 官方 SDK 和自托管 HTTP 后端是两种不同架构，自托管只提供 REST API

---

### 2. Railway 部署 Nginx 端口问题
**日期**：2026-02-03  
**发现者**：Friday  
**问题**：Dockerfile 写死 `EXPOSE 80`，Railway 返回 "Application failed to respond"  
**原因**：Railway 需要监听 `$PORT` 环境变量  
**解决**：使用 nginx 模板配置 `listen ${PORT}`  
**教训**：Railway 部署必须使用 `$PORT` 环境变量

---

## 🔌 API 集成

### 3. Zoo Text-to-CAD API 404
**日期**：2026-02-03  
**发现者**：Mech  
**问题**：调用 `/ml/text-to-cad/step` 返回 404  
**原因**：API 路径错误  
**正确路径**：
```
提交任务：POST /ai/text-to-cad/{format}
查询状态：GET /user/text-to-cad/{id}
下载结果：从 response 的 outputs["source.step"] 取 base64 解码
```
**教训**：先查 API 文档，Zoo 的 Text-to-CAD 是异步的

---

### 4. Brave Search API 失效
**日期**：2026-02-02  
**发现者**：Sage  
**问题**：`SUBSCRIPTION_TOKEN_INVALID`  
**解决**：使用 Parallel Search 替代  
**教训**：关键工具要有备用方案

---

## 📁 文件管理

### 5. Agent 修改文件后不同步
**日期**：2026-02-03  
**发现者**：Nova  
**问题**：Agent 修改了自己 workspace 的文件，但共享目录还是旧版本  
**原因**：各 Agent workspace 独立，docs 目录没有统一  
**解决**：使用软链接让所有 Agent 共享同一目录
```bash
ln -s /path/to/team-docs docs
```
**教训**：派发任务时要明确输出路径，或提前配置好共享目录

---

### 6. Xiaomao 审查时找不到文件
**日期**：2026-02-03  
**发现者**：Xiaomao  
**问题**：workspace 里没有 docs 目录，无法审查文档  
**原因**：新建 Agent 时只复制了基础配置，没有链接共享目录  
**解决**：为所有 Agent 创建 docs 软链接  
**教训**：新建 Agent 时要检查共享目录链接

---

## 📝 文档协作

### 7. 投资人文档口径不统一
**日期**：2026-02-03  
**发现者**：Xiaomao（审查时）  
**问题**：PRD 写"围棋模块无独立算力"，问答文档写"围棋模块负责 AI 推理"  
**解决**：统一为"围棋模块仅视觉+机械，AI 在主控"  
**教训**：
- 多人协作时要先对齐核心概念
- 审查流程很重要
- 参考 GLOSSARY.md 统一术语

---

## 🗄️ 数据库

### 8. PostgreSQL vs Convex ID 格式
**日期**：2026-02-04  
**发现者**：Nova  
**问题**：迁移后旧的 Convex ID（如 `j97337btb37x06...`）不能用了  
**解决**：使用新的 PostgreSQL UUID 格式  
**教训**：
- ID 映射表保存在 `convex_id_mapping` 表
- 新代码统一使用 UUID
- 参考 TEAM-MEMORY.md 中的 Agent ID 映射表

---

## 📋 添加新坑的模板

```markdown
### N. 问题简述
**日期**：YYYY-MM-DD  
**发现者**：Agent 名  
**问题**：描述现象  
**原因**：根本原因  
**解决**：解决方案  
**教训**：总结经验
```

---

*最后更新：2026-02-05*
