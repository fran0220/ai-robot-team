# 团队共享记忆

> 所有 Agent 启动时应读取此文件，了解项目背景和团队决策。

## 项目概述

**项目名称**：情感交互机器人 + 围棋模块

**核心价值**：
- 情感 AI 实体化（表情、动作、触觉多模态）
- 专业围棋生态（赛事、考级、监考闭环）
- 模块化扩展架构

**目标市场**：
- 每年约 300 万儿童参与线上定级定段考试
- 单次考级费用约 ¥450

---

## 团队成员

| Agent | 角色 | PostgreSQL ID | 专长 |
|-------|------|---------------|------|
| **Nova** | 项目主控 | e01bda3b-54d7-445b-a76a-3908da4ba11d | 架构决策、任务分配、跨角色协调 |
| **Sage** | 调研分析 | 00f2d69a-9ddd-466d-bdea-ef8b5e2ad74b | 技术选型、竞品分析、文献综述 |
| **Atlas** | 产品经理 | b16223d9-9059-454a-9516-3174ce37c5fa | PRD、用户故事、需求澄清 |
| **Jarvis** | 硬件工程 | b08702eb-ebc8-446b-aa7e-e010ad2a2875 | 电路设计、PCB、传感器选型 |
| **Friday** | 软件开发 | 2f545ac8-0253-4ccf-b159-504d27b1c807 | 固件、算法、后端、前端 |
| **Vision** | 测试验证 | 50770420-bbe7-4ca7-a9ea-77b3b5c46463 | 单元测试、集成测试、QA |
| **Idra** | 工业设计 | 8531c9d1-5d33-49e1-9ba3-e50ec61bb268 | 产品外观、CMF、概念渲染 |
| **Mech** | 机械结构 | 9dacde45-a17e-4bec-a239-81a8d228c96f | 结构设计、机械臂、运动规划 |
| **Xiaomao** | 质量审查 | 08dbb2e3-c394-44b8-bf00-198a867edad9 | 文档审查、口径统一 |

---

## 关键决策记录

### 2026-02-03
1. **审查流程建立**：任务完成 → @xiaomao 审查 → 通过/打回修改
2. **共享工作空间**：所有 Agent 的 `docs/` 指向 `team-docs/`，设计类 Agent 共享 `shared/designs/` 和 `shared/cad/`
3. **ID-MD 协作规范**：Idra 输出概念图 → Mech 参考进行结构设计
4. **Dashboard 升级**：MinIO 存储 + 新增文档/设计/CAD 展示页面

### 2026-02-04
1. **Mission Control V2**：从 Convex 迁移到 PostgreSQL，部署在 Railway
2. **向量记忆搜索**：启用 OpenClaw memorySearch，使用 OpenAI embedding
3. **团队记忆系统**：创建共享 TEAM-MEMORY.md、LESSONS.md、GLOSSARY.md

### 2026-02-05
1. **Documents API**：激活文档管理 CRUD，支持 research/spec/report/deliverable/note 类型
2. **记忆持久化 API**：
   - `agent_memories` 表：长期记忆（fact/decision/preference/lesson/context）
   - `daily_notes` 表：每日工作笔记
3. **新增 API 端点**：
   - `/api/documents` - 文档管理
   - `/api/memories` - Agent 长期记忆
   - `/api/daily-notes` - 每日笔记

---

## 技术架构要点

### 硬件架构
- **主控**：RK3587 或同级（≥6 TOPS NPU）
- **围棋模块**：无独立算力，仅视觉采集+机械执行，AI 在主控
- **连接**：WIFI（TCP）或蓝牙

### 关键指标
| 指标 | 目标值 | 类型 |
|------|--------|------|
| 棋子识别准确率 | ≥99.5% | Target |
| 落子精度 | ≤±1.0mm | Target |
| 语音唤醒延迟 | ≤300ms | Target |
| 推理延迟 | ≤50ms | Target |

### BOM 成本估算
- 样机总成本：¥2,809 [估算]
- 量产总成本（千台）：¥1,400 [估算]

---

## 基础设施

| 服务 | URL | 用途 |
|------|-----|------|
| Mission Control V2 | https://mission-control-v2-production-33ad.up.railway.app | 任务管理 |
| Team Docs | https://team-docs-production.up.railway.app | 文档站 |
| MinIO | Railway 部署 | 文件存储 |

---

## 协作规范

### 任务分配流程
```
用户需求 → Nova 分解 → 分配给专业 Agent → 执行 → Xiaomao 审查 → 完成/打回
```

### 文档输出路径
- PRD/需求文档 → `team-docs/prd/`
- 技术规格 → `team-docs/specs/`
- 调研报告 → `team-docs/research/`
- ID 设计 → `shared/designs/`
- CAD 模型 → `shared/cad/`

### @mention 规则
- `@nova` / `@主控` - 项目协调、决策
- `@sage` / `@调研` - 技术调研
- `@atlas` / `@pm` - 产品需求
- `@jarvis` / `@硬件` - 硬件问题
- `@friday` / `@软件` - 软件开发
- `@vision` / `@测试` - 测试验证
- `@idra` / `@设计` - 工业设计
- `@mech` / `@机械` - 结构设计
- `@xiaomao` - 质量审查

---

## 用户偏好

- 喜欢自动化流程，审查不通过要自动派发修改
- 重视共享和协作，各 Agent 能看到彼此的产出
- 使用 Railway 部署，自托管优先
- 文档要有明确的输出路径

---

*最后更新：2026-02-05*
