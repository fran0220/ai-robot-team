# MEMORY.md - Nova 的长期记忆

## 项目背景

**项目名称**：情感交互机器人 + 围棋模块

**核心价值**：
- 情感AI实体化（表情、动作、触觉多模态）
- 专业围棋生态（赛事、考级、监考闭环）
- 模块化扩展架构

**目标市场**：
- 每年约300万儿童参与线上定级定段考试
- 单次考级费用约¥450

---

## 团队成员 (2026-02-03 更新)

| Agent | 角色 | 工具 | 模型 |
|-------|------|------|------|
| **Nova** | 项目主控 | - | Claude Opus 4.5 |
| **Sage** | 调研分析 | Parallel Search | GPT-5.2 Codex |
| **Atlas** | 产品经理 | - | GPT-5.2 Codex |
| **Jarvis** | 硬件工程 | - | GPT-5.2 Codex |
| **Friday** | 软件开发 | - | GPT-5.2 Codex |
| **Vision** | 测试验证 | - | GPT-5.2 Codex |
| **Xiaomao** | 质量审查 | - | Gemini 3 Pro Preview |
| **Idra** | 工业设计 | Gemini Imagen API | GPT-5.2 Codex |
| **Mech** | 结构工程 | Zoo Text-to-CAD | GPT-5.2 Codex |

---

## 关键决策记录

### 2026-02-03
1. **审查流程建立**：任务完成 → @xiaomao 审查 → 通过/打回修改
2. **共享工作空间**：所有 Agent 的 `docs/` 指向 `team-docs/`，设计类 Agent 共享 `shared/designs/` 和 `shared/cad/`
3. **ID-MD 协作规范**：Idra 输出概念图 → Mech 参考进行结构设计
4. **Dashboard 升级**：MinIO 存储 + 新增文档/设计/CAD 展示页面

---

## 技术要点备忘

### 硬件架构
- 主控：RK3587 或同级（≥6 TOPS NPU）
- 围棋模块：**无独立算力，仅视觉采集+机械执行，AI在主控**
- 连接：WIFI（TCP）或蓝牙

### 关键指标（已统一标注 T/L/M）
- 棋子识别：≥99.5% [T]
- 落子精度：≤±1.0mm [T]
- 语音唤醒：≤300ms [T]
- 推理延迟：≤50ms [T]

### BOM 成本估算
- 样机总成本：¥2,809 [估算]
- 量产总成本（千台）：¥1,400 [估算]

### 监考系统
- AI吻合度阈值：60%/70%
- 三级风险判定
- 反坐机制防恶意举报

---

## API 配置

| API | 用途 | 状态 |
|-----|------|------|
| PARALLEL_API_KEY | 网络调研 | ✅ |
| GEMINI_API_KEY | 图像生成 (Idra) | ✅ |
| ZOO_API_KEY | Text-to-CAD (Mech) | ✅ |
| CONVEX_URL | Mission Control | ⚠️ 未配置到 env |

---

## 用户偏好

- 喜欢自动化流程，审查不通过要自动派发修改
- 重视共享和协作，各 Agent 能看到彼此的产出
- 使用 Railway 部署，自托管优先（MinIO vs S3）
- 文档站部署在 Railway：team-docs-production.up.railway.app

---

## ⚠️ 经验教训（踩过的坑）

### 1. Agent 修改文件后不同步
**问题**：Agent 修改了自己 workspace 的文件，但共享目录（team-docs）还是旧版本
**原因**：各 Agent workspace 独立，docs 目录没有统一
**解决**：使用软链接 `ln -s /root/multiagent/team/team-docs docs` 让所有 Agent 共享同一目录
**教训**：派发任务时要明确输出路径，或提前配置好共享目录

### 2. Xiaomao 审查时找不到文件
**问题**：Xiaomao 的 workspace 里没有 docs 目录，无法审查文档
**原因**：新建 Agent 时只复制了基础配置，没有链接共享目录
**解决**：为所有 Agent 创建 docs 软链接
**教训**：新建 Agent 时要检查共享目录链接

### 3. Zoo Text-to-CAD API 404
**问题**：调用 `/ml/text-to-cad/step` 返回 404
**原因**：API 路径错误
**正确路径**：
- 提交任务：`POST /ai/text-to-cad/{format}`
- 查询状态：`GET /user/text-to-cad/{id}`
- 下载结果：从 response 的 `outputs["source.step"]` 取 base64 解码
**教训**：先查 API 文档，Zoo 的 Text-to-CAD 是异步的

### 4. Brave Search API 失效
**问题**：`SUBSCRIPTION_TOKEN_INVALID`
**解决**：使用 Parallel Search 替代
**教训**：关键工具要有备用方案

### 5. Railway 部署 Nginx 端口问题
**问题**：Dockerfile 写死 `EXPOSE 80`，Railway 返回 "Application failed to respond"
**原因**：Railway 需要监听 `$PORT` 环境变量
**解决**：使用 nginx 模板配置 `listen ${PORT}`
**教训**：Railway 部署必须使用 `$PORT` 环境变量

### 6. 投资人文档口径不统一
**问题**：PRD 写"围棋模块无独立算力"，问答文档写"围棋模块负责 AI 推理"
**发现**：@xiaomao 审查时发现
**解决**：统一为"围棋模块仅视觉+机械，AI 在主控"
**教训**：多人协作时要先对齐核心概念，审查流程很重要

### 7. Convex React hooks 无法连接自托管后端 (2026-02-03 P0)
**问题**：Dashboard 显示 0 任务，但后端 API 正常返回 14 个任务
**原因**：
- `useQuery(api.tasks.list)` 是 Convex React hooks
- Convex hooks 需要 WebSocket 连接到 `*.convex.cloud`
- 我们部署的是自托管 HTTP 后端，不支持 Convex 实时协议
**解决**：
1. 创建 `src/lib/api.ts` - REST API wrapper (fetch)
2. 创建 `src/hooks/useApi.ts` - polling hooks 替代实时订阅
3. 修改 page.tsx 使用新 hooks
**教训**：
- Convex 官方 SDK 和自托管 HTTP 后端是两种不同的架构
- 自托管后端只提供 REST API，需要自己实现 polling/SSE
- @friday 的修复方向正确但没提交代码

---

## 待办事项

- [x] ~~配置 CONVEX_URL 和 CONVEX_ADMIN_KEY 到 openclaw.json~~ (Convex 后端已部署在 Railway)
- [x] ~~等待 Friday 完成 Dashboard 升级 + MinIO 部署~~ ✅
- [x] ~~文件同步脚本：Agent 产出自动上传 MinIO~~ ✅ 每 30 分钟自动同步
- [x] ~~ID 设计方向选择~~ ✅ 用户确认最终参考图
- [ ] @idra 完成基于参考图的完整系列 → @mech 结构设计
- [ ] PRD 深化完成后，Jarvis/Friday 评审

---

## 今日工作总结 (2026-02-03)

1. ✅ 创建 @xiaomao 审查角色，建立审查流程
2. ✅ 完成投资人尽调文档（硬件架构/软硬件协同/竞品对比）
3. ✅ 多轮审查修改，统一口径和指标标注
4. ✅ 完成 BOM 物料调研和清单（样机¥2,809 / 量产¥1,400）
5. ✅ 配置共享文档目录，解决文件同步问题
6. ✅ 创建 @idra (ID 设计)，配置 Gemini API，测试图像生成成功
7. ✅ 创建 @mech (MD 设计)，配置 Zoo Text-to-CAD，测试 STEP 生成成功
8. ✅ 配置共享设计目录 (shared/designs + shared/cad)
9. ✅ 制定 ID-MD 协作规范
10. ✅ Dashboard 升级完成（MinIO + 文档/设计/CAD 页面）
11. ✅ MinIO 部署 + 自动同步 cron
12. ✅ STEP→GLTF 转换 + 3D 预览
13. ✅ 9 个 Agent 同步到 Convex
14. ✅ 派发 PRD 迭代 + ID 方向探索任务
15. ✅ @idra 完成 3 个 ID 设计方向，待用户选择
