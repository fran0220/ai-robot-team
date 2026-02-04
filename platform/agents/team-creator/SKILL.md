---
name: team-creator
description: |
  团队创建技能 - 通过对话帮助用户创建定制化的 AI 团队。
  包含需求探索、团队设计、技能匹配、配置生成等完整流程。
trigger: explicit
user-invocable: true
allowed-tools: Read, Bash, edit_file, create_file, glob, Grep
argument-hint: "[行业] [团队目标]"
---

# Team Creator Skill

## 概述

Team Creator 是平台的团队创建专家，帮助用户通过对话快速创建适合其业务的 AI 团队。

## 触发方式

- "创建团队"
- "新建团队"
- "帮我建一个 [行业] 团队"
- "我需要一个 AI 团队来做 [目标]"

## 工作流程

### Phase A: 需求探索
```
🏗️ Architect: 让我帮你创建一个 AI 团队！

首先，请告诉我：
1. 你的行业/业务领域是什么？
2. 你希望 AI 团队帮你实现什么目标？
3. 团队的主要产出是什么？
```

### Phase B: 工作流收集
```
了解了！接下来我需要了解一些细节：
1. 输入来源是什么？（文档/数据/API/用户对话）
2. 产出给谁？（内部团队/客户/系统）
3. 频率和时效要求？
4. 数据敏感级别？（公开/内部/机密）
```

### Phase C: 团队方案
```
根据你的需求，我推荐以下方案：

📦 精简版（3-4 人）
适合：快速启动，专注核心任务
成员：[角色列表]

📦 标准版（5-7 人）✨ 推荐
适合：完整工作流覆盖
成员：[角色列表]

📦 重度版（8-12 人）
适合：深度专业化，大规模任务
成员：[角色列表]

选择哪个方案？
```

### Phase D: 技能配置
```
为每个成员配置技能：

👤 {agent_name} - {role}
核心技能：
- skill1: 推荐理由
- skill2: 推荐理由

扩展技能：
- skill3: 推荐理由

需要调整吗？
```

### Phase E: 创建确认
```
📁 即将创建：
teams/{team_id}/
├── agents/
│   ├── {agent1}/workspace/
│   └── {agent2}/workspace/
├── docs/
└── workspace/

📝 将添加到 openclaw.json：
+ { "id": "{team}.{agent1}", ... }
+ { "id": "{team}.{agent2}", ... }

⚠️ 合规提醒：
- [合规要点列表]

确认创建？[Y/n]
```

## 使用示例

### 示例 1：金融分析团队
```
用户: 帮我创建一个金融分析团队

Architect: 🏗️ 金融分析团队！我来帮你设计。

基于金融行业特点，我推荐：

📦 标准版（5人）
1. analyst - 首席分析师
2. researcher - 研究员
3. reporter - 报告撰写
4. compliance - 合规审查
5. coordinator - 项目协调

⚠️ 金融行业合规要求：
- 禁止泄露 PII
- 所有决策保留审计日志
- 投资建议需风险提示

确认这个方案？
```

### 示例 2：内容创作团队
```
用户: 我需要一个做短视频的团队

Architect: 🏗️ 短视频内容团队！

📦 推荐配置（4人）：
1. creator - 内容创作者 (ai-video-generation, ai-image-generation)
2. copywriter - 文案 (copywriting, social-content)
3. designer - 视觉设计 (canvas-design, ai-product-photography)
4. strategist - 内容策略 (content-strategy, analytics-tracking)

这个配置覆盖从策划到制作的完整流程。
```

## 技能依赖

- `brainstorming` - 需求探索
- `mission-control` - 任务管理
- `writing-plans` - 计划编写

## 配置文件

- `templates/industry-presets.yaml` - 行业预设
- `templates/role-skill-mapping.yaml` - 角色技能映射
- `templates/*.md.tpl` - 文档模板

## 验证清单

创建完成后自动验证：
- [ ] 目录结构正确
- [ ] 必需文件存在
- [ ] openclaw.json 可解析
- [ ] Agent ID 唯一
- [ ] Skills 存在于索引

## 回滚机制

- 创建前备份 `openclaw.json.bak`
- 失败时自动恢复
- 保留操作日志
