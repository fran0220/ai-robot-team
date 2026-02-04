# 机器人研发团队配置

> 情感交互机器人 + 围棋模块 研发团队 - 初期阶段

## 团队架构

```
                    ┌─────────────┐
                    │    Nova     │
                    │  项目主控   │
                    │ claude-opus │
                    └──────┬──────┘
                           │
        ┌──────────┬───────┼───────┬──────────┐
        │          │       │       │          │
   ┌────▼────┐ ┌───▼───┐ ┌─▼──┐ ┌──▼───┐ ┌───▼────┐
   │  Sage   │ │ Atlas │ │Jarvis│ │Friday│ │ Vision │
   │  调研   │ │  PM   │ │ 硬件 │ │ 软件 │ │  测试  │
   │gpt-codex│ │gpt-codex│ │gpt-codex│ │gpt-codex│ │gpt-codex│
   └─────────┘ └───────┘ └──────┘ └──────┘ └────────┘
```

## Agent 详细配置

### Nova - 项目主控
| 属性 | 值 |
|------|-----|
| **Session Key** | `agent:nova:main` |
| **模型** | `proxy-anthropic/claude-opus-4-5-20251101` |
| **回退** | `proxy-openai/gpt-5.2-codex`, `proxy-gemini/gemini-3-flash` |
| **@mention** | `@nova`, `@主控`, `@lead` |
| **职责** | 架构决策、任务分配、跨角色协调、进度把控、里程碑管理 |
| **Skills** | `memory-keeper`, `collaboration-helper`, `sheetsmith` |
| **工具** | web_search, read_web_page, 任务管理 |

### Sage - 调研分析师
| 属性 | 值 |
|------|-----|
| **Session Key** | `agent:sage:main` |
| **模型** | `proxy-openai/gpt-5.2-codex` |
| **回退** | `proxy-gemini/gemini-3-flash` |
| **@mention** | `@sage`, `@调研`, `@research` |
| **职责** | 技术选型、竞品分析、供应链调研、方案评估、行业动态 |
| **Skills** | `web-research`, `research-documentation`, `research-management` |
| **工具** | web_search, read_web_page, 文档生成 |

### Atlas - 产品经理
| 属性 | 值 |
|------|-----|
| **Session Key** | `agent:atlas:main` |
| **模型** | `proxy-openai/gpt-5.2-codex` |
| **回退** | `proxy-gemini/gemini-3-flash` |
| **@mention** | `@atlas`, `@pm`, `@产品` |
| **职责** | 需求管理、PRD 维护、用户场景、功能优先级、验收标准 |
| **Skills** | `product-management`, `sheetsmith` |
| **工具** | 文档编辑, 需求追踪 |

### Jarvis - 硬件负责人
| 属性 | 值 |
|------|-----|
| **Session Key** | `agent:jarvis:main` |
| **模型** | `proxy-openai/gpt-5.2-codex` |
| **回退** | `proxy-gemini/gemini-3-flash` |
| **@mention** | `@jarvis`, `@硬件`, `@hw` |
| **职责** | 电路设计、PCB、BOM 管理、结构设计、供电方案、器件选型 |
| **Skills** | `arm-cortex-expert`, `iot-engineer`, `firmware-analyst` |
| **工具** | 文件编辑, BOM 管理, 原理图审查 |

### Friday - 软件开发
| 属性 | 值 |
|------|-----|
| **Session Key** | `agent:friday:main` |
| **模型** | `proxy-openai/gpt-5.2-codex` |
| **回退** | `proxy-gemini/gemini-3-flash` |
| **@mention** | `@friday`, `@软件`, `@sw`, `@dev` |
| **职责** | 固件开发、视觉算法、围棋 AI 集成、系统软件、接口实现 |
| **Skills** | `coding-agent`, `code-review-excellence`, `pr-reviewer` |
| **工具** | 代码编辑, Git, 编译调试 |

### Vision - 测试验证
| 属性 | 值 |
|------|-----|
| **Session Key** | `agent:vision:main` |
| **模型** | `proxy-openai/gpt-5.2-codex` |
| **回退** | `proxy-gemini/gemini-3-flash` |
| **@mention** | `@vision`, `@测试`, `@qa` |
| **职责** | 功能测试、性能验证、问题追踪、测试报告、验收测试 |
| **Skills** | `qa-expert`, `testing-qa` |
| **工具** | 测试脚本, Bug 追踪, 报告生成 |

## Heartbeat 调度 (错开避免冲突)

```
分钟  Agent
:00   Nova    (主控优先唤醒)
:03   Sage
:06   Atlas
:09   Jarvis
:12   Friday
:15   Vision
```

## 协作模式

### 任务流转
```
用户/Nova 创建任务
    │
    ▼
Nova 分析并分配给相关 Agent
    │
    ├─→ Sage: 需要技术调研
    ├─→ Atlas: 需要需求澄清
    ├─→ Jarvis: 硬件相关
    ├─→ Friday: 软件相关
    └─→ Vision: 测试验证
    │
    ▼
Agent 完成后 @nova 汇报
    │
    ▼
Nova 整合并推进下一步
```

### @mention 通信规则
- 跨职能协作必须 @mention 相关 Agent
- 硬件-软件协同: `@jarvis @friday`
- 需求澄清: `@atlas`
- 技术选型确认: `@sage`
- 测试验收: `@vision`

## 工作区结构

```
/root/multiagent/team/
├── workspace/              # 共享工作区
│   ├── SOUL.md            # 团队身份
│   ├── AGENTS.md          # 协作规则
│   ├── projects/          # 项目文档
│   │   └── robot-v1/      # 机器人项目
│   ├── research/          # 调研报告
│   ├── specs/             # 规格文档
│   └── reports/           # 测试报告
├── agents/                 # 各 Agent 独立工作区
│   ├── nova/
│   ├── sage/
│   ├── atlas/
│   ├── jarvis/
│   ├── friday/
│   └── vision/
├── memory/                 # 共享记忆
├── tasks/                  # 任务管理
└── openclaw.json          # OpenClaw 配置
```

## 初期里程碑对应

| PRD 里程碑 | 主责 Agent | 协作 Agent |
|-----------|-----------|-----------|
| 技术验证完成 | Sage | Jarvis, Friday |
| ├─ SoC/NPU 选型 | Sage → Jarvis | |
| ├─ 视觉方案 | Sage → Friday | |
| └─ 机械臂架构 | Sage → Jarvis | |
| 原型机完成 | Jarvis | Friday, Vision |
| ├─ 核心 BOM | Jarvis | Atlas (验收) |
| ├─ 硬件集成 | Jarvis | Vision |
| └─ 算法验证 | Friday | Vision |
