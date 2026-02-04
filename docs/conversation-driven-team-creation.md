# 对话式团队创建方案

> **设计哲学**: 对话完成一切 — 用户无需填写表单、选择下拉框或点击复杂的工作流按钮

## 一、核心架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Mission Control UI                            │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              Team Creator Chat Panel                           │ │
│  │  ┌───────────────────────────────────────────────────────────┐ │ │
│  │  │ 🏛️ Architect                                              │ │ │
│  │  │ 你好！我是 Architect，帮你创建定制化的 AI 团队。          │ │ │
│  │  │                                                           │ │ │
│  │  │ 首先，你想创建什么行业的团队？                            │ │ │
│  │  │ （金融/医疗/制造/教育/电商/科技/创意/...）                │ │ │
│  │  └───────────────────────────────────────────────────────────┘ │ │
│  │  ┌───────────────────────────────────────────────────────────┐ │ │
│  │  │ [用户输入区]                                              │ │ │
│  │  └───────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ↕ WebSocket
┌─────────────────────────────────────────────────────────────────────┐
│                      OpenClaw Gateway                               │
└─────────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────────┐
│                    platform.architect Agent                         │
│  - 5 阶段对话流程                                                   │
│  - 技能匹配引擎                                                     │
│  - 文件系统操作                                                     │
│  - 配置生成                                                         │
└─────────────────────────────────────────────────────────────────────┘
```

## 二、用户体验流程

### 2.1 入口点

**Dashboard 页面** (`WorkspaceDashboard.tsx`):
- 保留原有的 "新建 Workspace" 按钮（简单场景）
- 新增 **"与 Architect 对话创建"** 浮动按钮（右下角）
- 首次使用时显示引导提示

**触发方式**:
1. 点击浮动按钮 → 滑出聊天面板
2. 在 Workspace 创建弹窗中选择 "对话创建"
3. 键盘快捷键 `Cmd/Ctrl + K` → 输入 "创建团队"

### 2.2 对话流程示例

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏛️ Architect
你好！我是 Architect，帮你创建定制化的 AI 团队。
首先，你想创建什么行业的团队？

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 用户
做电商的，主要做产品内容和营销

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏛️ Architect
了解！电商内容营销团队。几个关键问题：

1. **主要产出是什么？**
   - 商品文案 / 详情页
   - 营销方案 / 活动策划
   - 数据分析报告
   - 社交媒体内容
   - 以上全部

2. **团队规模偏好？**
   - 精简版 (3-4人) - 专注核心任务
   - 标准版 (5-7人) - 覆盖完整流程
   - 重度版 (8-12人) - 深度专业化

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 用户
主要是商品文案和社交内容，标准版就好

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏛️ Architect
完美！最后几个约束确认：

1. **输入来源？** 商品数据库 / Excel / 手动输入
2. **发布渠道？** 淘宝 / 抖音 / 小红书 / 微信
3. **需要 AI 图片生成吗？**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 用户
Excel导入，发小红书和抖音，要图片生成

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏛️ Architect
明白了！这是我为你设计的团队：

## 📋 电商内容营销团队 (ecommerce-content)

### 团队成员 (6人)

| 角色 | 名称 | 职责 | 核心技能 |
|------|------|------|----------|
| 📋 | **Nova** (项目经理) | 任务分配、进度跟踪 | mission-control, project-manager |
| ✍️ | **Echo** (文案专家) | 商品文案、卖点提炼 | copywriting, seo-audit |
| 🎨 | **Pixel** (视觉设计) | 图片生成、视觉设计 | ai-image-generation, canvas-design |
| 📊 | **Atlas** (数据分析) | 竞品分析、效果追踪 | analytics-tracking, competitor-alternatives |
| 📱 | **Viral** (社媒运营) | 小红书/抖音内容 | ai-social-media-content, content-strategy |
| ✅ | **Scout** (质量审核) | 合规检查、品质把控 | qa-expert, professional-communication |

### ⚠️ 合规提醒
- 价格合规 - 避免违反广告法
- 图片版权 - 使用 AI 生成或自有素材
- 平台规则 - 遵守小红书/抖音社区规范

### 📁 目录结构
```
teams/ecommerce-content/
├── agents/
│   ├── nova/workspace/
│   ├── echo/workspace/
│   ├── pixel/workspace/
│   ├── atlas/workspace/
│   ├── viral/workspace/
│   └── scout/workspace/
├── docs/
└── workspace/
```

**确认创建这个团队？** 回复 "确认" 或告诉我需要调整的地方。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 用户
确认

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏛️ Architect
正在创建...

✅ 创建目录 teams/ecommerce-content/
✅ 创建 Nova (项目经理)
✅ 创建 Echo (文案专家)
✅ 创建 Pixel (视觉设计)
✅ 创建 Atlas (数据分析)
✅ 创建 Viral (社媒运营)
✅ 创建 Scout (质量审核)
✅ 更新 openclaw.json
✅ 验证配置完整性

🎉 **团队创建成功！**

你的电商内容营销团队已就绪。可以在 Mission Control 的工作区列表中看到它。

**下一步建议：**
1. 进入团队工作区，熟悉各成员职责
2. 在 USER.md 中配置你的品牌信息
3. 创建第一个任务，开始协作

需要我帮你进行下一步吗？

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 三、技术实现

### 3.1 新增组件

```
src/components/
├── team-creator/
│   ├── TeamCreatorPanel.tsx      # 主聊天面板
│   ├── TeamCreatorButton.tsx     # 浮动触发按钮
│   ├── MessageBubble.tsx         # 消息气泡
│   ├── TeamPreviewCard.tsx       # 团队预览卡片
│   ├── ProgressIndicator.tsx     # 创建进度指示器
│   └── index.ts
└── ...
```

### 3.2 核心组件：TeamCreatorPanel

```tsx
// src/components/team-creator/TeamCreatorPanel.tsx

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Loader2, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    phase?: string;
    teamSpec?: TeamSpec;
    isCreating?: boolean;
    progress?: number;
  };
}

interface TeamSpec {
  team_id: string;
  team_name: string;
  agents: AgentSpec[];
}

interface AgentSpec {
  id: string;
  name: string;
  role: string;
  emoji: string;
  skills: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: (teamId: string) => void;
}

export function TeamCreatorPanel({ isOpen, onClose, onTeamCreated }: Props) {
  const t = useTranslations('teamCreator');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // 初始化会话
  const initSession = useCallback(async () => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);
    try {
      // 1. 创建 OpenClaw 会话，指定 peer 为 platform.architect
      const res = await fetch('/api/team-creator/session', {
        method: 'POST',
      });
      
      if (!res.ok) throw new Error('Failed to create session');
      
      const { sessionId, wsUrl } = await res.json();
      setSessionId(sessionId);
      
      // 2. 建立 WebSocket 连接接收消息
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        // 添加欢迎消息
        addMessage({
          role: 'assistant',
          content: t('welcomeMessage'),
          metadata: { phase: 'A' }
        });
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleIncomingMessage(data);
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
      };
      
      ws.onerror = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };
      
    } catch (error) {
      console.error('Failed to init session:', error);
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, t]);

  // 打开面板时初始化会话
  useEffect(() => {
    if (isOpen && !isConnected && !isConnecting) {
      initSession();
    }
  }, [isOpen, isConnected, isConnecting, initSession]);

  // 处理来自 Agent 的消息
  const handleIncomingMessage = (data: any) => {
    if (data.type === 'message') {
      addMessage({
        role: 'assistant',
        content: data.content,
        metadata: data.metadata
      });
      
      // 检测创建完成
      if (data.metadata?.teamCreated) {
        onTeamCreated(data.metadata.teamId);
      }
    } else if (data.type === 'progress') {
      // 更新创建进度
      updateLastMessageProgress(data.progress);
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || isSending || !sessionId) return;
    
    const userMessage = input.trim();
    setInput('');
    setIsSending(true);
    
    // 添加用户消息到界面
    addMessage({
      role: 'user',
      content: userMessage
    });
    
    try {
      await fetch('/api/team-creator/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          content: userMessage
        })
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage({
        role: 'system',
        content: t('sendError')
      });
    } finally {
      setIsSending(false);
    }
  };

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...msg,
      id: crypto.randomUUID(),
      timestamp: new Date()
    }]);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] bg-mc-bg-secondary border-l border-mc-border shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-mc-border">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏛️</span>
          <div>
            <h2 className="font-semibold">{t('title')}</h2>
            <p className="text-xs text-mc-text-secondary">
              {isConnected ? t('connected') : t('connecting')}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-mc-bg rounded-lg text-mc-text-secondary"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-mc-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={t('inputPlaceholder')}
            className="flex-1 bg-mc-bg border border-mc-border rounded-lg px-4 py-2 focus:outline-none focus:border-mc-accent"
            disabled={!isConnected || isSending}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !isConnected || isSending}
            className="px-4 py-2 bg-mc-accent text-mc-bg rounded-lg font-medium hover:bg-mc-accent/90 disabled:opacity-50 flex items-center gap-2"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-mc-accent text-mc-bg'
            : isSystem
            ? 'bg-mc-accent-yellow/20 text-mc-accent-yellow'
            : 'bg-mc-bg border border-mc-border'
        }`}
      >
        {!isUser && !isSystem && (
          <div className="flex items-center gap-2 mb-2">
            <span>🏛️</span>
            <span className="text-xs font-medium text-mc-accent">Architect</span>
            {message.metadata?.phase && (
              <span className="text-xs text-mc-text-secondary">
                Phase {message.metadata.phase}
              </span>
            )}
          </div>
        )}
        
        {/* Markdown-like content rendering */}
        <div className="prose prose-sm prose-invert">
          {message.content.split('\n').map((line, i) => (
            <p key={i} className="mb-1 last:mb-0">{line}</p>
          ))}
        </div>
        
        {/* Progress indicator for creation */}
        {message.metadata?.isCreating && (
          <div className="mt-3 pt-3 border-t border-mc-border/50">
            <div className="flex items-center gap-2 text-xs text-mc-text-secondary">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>创建中... {message.metadata.progress || 0}%</span>
            </div>
            <div className="mt-1 h-1 bg-mc-bg rounded-full overflow-hidden">
              <div 
                className="h-full bg-mc-accent transition-all duration-300"
                style={{ width: `${message.metadata.progress || 0}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 3.3 后端 API 路由

```
src/app/api/team-creator/
├── session/route.ts      # 创建会话
├── message/route.ts      # 发送消息
└── sync/route.ts         # 同步创建结果到数据库
```

#### session/route.ts

```typescript
// src/app/api/team-creator/session/route.ts

import { NextResponse } from 'next/server';
import { getOpenClawClient } from '@/lib/openclaw/client';

export async function POST() {
  try {
    const client = getOpenClawClient();
    
    if (!client.isConnected()) {
      await client.connect();
    }
    
    // 创建与 platform.architect 的会话
    const session = await client.createSession(
      'team-creator',  // channel
      'platform.architect'  // peer (目标 Agent)
    );
    
    // 返回会话 ID 和 WebSocket URL
    return NextResponse.json({
      sessionId: session.id,
      wsUrl: process.env.OPENCLAW_WS_URL || 'ws://127.0.0.1:18789',
    });
    
  } catch (error) {
    console.error('Failed to create team creator session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
```

#### message/route.ts

```typescript
// src/app/api/team-creator/message/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getOpenClawClient } from '@/lib/openclaw/client';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, content } = await request.json();
    
    if (!sessionId || !content) {
      return NextResponse.json(
        { error: 'sessionId and content are required' },
        { status: 400 }
      );
    }
    
    const client = getOpenClawClient();
    
    if (!client.isConnected()) {
      return NextResponse.json(
        { error: 'OpenClaw Gateway not connected' },
        { status: 503 }
      );
    }
    
    await client.sendMessage(sessionId, content);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
```

#### sync/route.ts

```typescript
// src/app/api/team-creator/sync/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { run, queryOne } from '@/lib/db';

interface SyncRequest {
  teamId: string;
  teamName: string;
  industry: string;
  agents: Array<{
    id: string;
    name: string;
    role: string;
    avatar_emoji: string;
    skills: string[];
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const data: SyncRequest = await request.json();
    
    // 1. 创建 Workspace
    const workspaceId = crypto.randomUUID();
    const slug = data.teamId;
    
    // 检查是否已存在
    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM workspaces WHERE slug = $1',
      [slug]
    );
    
    if (existing) {
      return NextResponse.json(
        { error: 'Workspace already exists' },
        { status: 409 }
      );
    }
    
    await run(`
      INSERT INTO workspaces (id, name, slug, description, icon)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      workspaceId,
      data.teamName,
      slug,
      `${data.industry} team`,
      '🏢'
    ]);
    
    // 2. 创建 Agents
    for (const agent of data.agents) {
      const agentId = crypto.randomUUID();
      await run(`
        INSERT INTO agents (id, name, role, description, avatar_emoji, status, is_master, workspace_id)
        VALUES ($1, $2, $3, $4, $5, 'standby', $6, $7)
      `, [
        agentId,
        agent.name,
        agent.role,
        `Skills: ${agent.skills.join(', ')}`,
        agent.avatar_emoji,
        agent.id.endsWith('.nova') || agent.id.includes('.pm'),  // 项目经理为 master
        workspaceId
      ]);
    }
    
    return NextResponse.json({
      success: true,
      workspaceId,
      slug
    });
    
  } catch (error) {
    console.error('Failed to sync team:', error);
    return NextResponse.json(
      { error: 'Failed to sync team' },
      { status: 500 }
    );
  }
}
```

### 3.4 OpenClaw 客户端扩展

```typescript
// 扩展 src/lib/openclaw/client.ts

export class OpenClawClient extends EventEmitter {
  // ... 现有代码 ...
  
  // 订阅特定会话的消息流
  async subscribeSession(sessionId: string, callback: (msg: any) => void): Promise<() => void> {
    const handler = (data: any) => {
      if (data.sessionId === sessionId) {
        callback(data);
      }
    };
    
    this.on('session.message', handler);
    
    // 返回取消订阅函数
    return () => {
      this.off('session.message', handler);
    };
  }
  
  // 监听团队创建完成事件
  onTeamCreated(callback: (teamSpec: TeamSpec) => void): void {
    this.on('team.created', callback);
  }
}
```

### 3.5 Team Creator Agent 协议扩展

为了让 Agent 能够通知 Mission Control 创建完成，需要在 SOUL.md 中添加输出协议：

```markdown
## 输出协议

### 创建完成通知

当团队创建完成后，输出以下格式的 JSON 块（Mission Control 会解析）：

\`\`\`json:team-created
{
  "event": "team.created",
  "payload": {
    "team_id": "ecommerce-content",
    "team_name": "电商内容营销团队",
    "industry": "ecommerce",
    "agents": [
      {
        "id": "ecommerce-content.nova",
        "name": "Nova",
        "role": "项目经理",
        "avatar_emoji": "📋",
        "skills": ["mission-control", "project-manager"]
      }
      // ... 其他 agents
    ]
  }
}
\`\`\`

Mission Control 检测到此 JSON 块后会自动：
1. 同步到数据库
2. 刷新工作区列表
3. 显示创建成功提示
```

## 四、同步机制

### 4.1 实时同步流程

```
Agent 创建完成
       ↓
输出 team-created JSON
       ↓
Mission Control 检测到 JSON
       ↓
调用 /api/team-creator/sync
       ↓
写入 SQLite 数据库
       ↓
触发 UI 刷新
```

### 4.2 文件系统 → 数据库同步脚本

对于已有的 `teams/` 目录，提供一键同步脚本：

```typescript
// scripts/sync-teams-to-db.ts

import fs from 'fs';
import path from 'path';
import { run, queryOne } from '../src/lib/db';

const TEAMS_DIR = path.join(process.cwd(), '..', '..', 'teams');

async function syncTeams() {
  const teams = fs.readdirSync(TEAMS_DIR).filter(f => 
    fs.statSync(path.join(TEAMS_DIR, f)).isDirectory()
  );
  
  for (const teamId of teams) {
    const teamPath = path.join(TEAMS_DIR, teamId);
    const agentsPath = path.join(teamPath, 'agents');
    
    if (!fs.existsSync(agentsPath)) continue;
    
    // 读取 TEAM.md 获取团队信息
    const teamDoc = path.join(teamPath, 'docs', 'TEAM.md');
    const teamName = fs.existsSync(teamDoc) 
      ? extractTitle(fs.readFileSync(teamDoc, 'utf-8'))
      : teamId;
    
    // 创建或更新 Workspace
    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM workspaces WHERE slug = $1',
      [teamId]
    );
    
    const workspaceId = existing?.id || crypto.randomUUID();
    
    if (!existing) {
      await run(`
        INSERT INTO workspaces (id, name, slug, icon)
        VALUES ($1, $2, $3, '🤖')
      `, [workspaceId, teamName, teamId]);
    }
    
    // 同步 Agents
    const agents = fs.readdirSync(agentsPath).filter(f =>
      fs.statSync(path.join(agentsPath, f)).isDirectory()
    );
    
    for (const agentName of agents) {
      const identityPath = path.join(agentsPath, agentName, 'workspace', 'IDENTITY.md');
      if (!fs.existsSync(identityPath)) continue;
      
      const identity = fs.readFileSync(identityPath, 'utf-8');
      const { name, role, emoji } = parseIdentity(identity);
      
      await run(`
        INSERT INTO agents (id, name, role, avatar_emoji, status, workspace_id)
        VALUES ($1, $2, $3, $4, 'standby', $5)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          avatar_emoji = EXCLUDED.avatar_emoji
      `, [
        `${teamId}.${agentName}`,
        name,
        role,
        emoji,
        workspaceId
      ]);
    }
  }
  
  console.log('✅ Teams synced to database');
}

function extractTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1] : 'Unknown Team';
}

function parseIdentity(markdown: string): { name: string; role: string; emoji: string } {
  // 解析 IDENTITY.md 格式
  const nameMatch = markdown.match(/## 我是\s+(.+)/);
  const roleMatch = markdown.match(/## 角色\s+(.+)/);
  const emojiMatch = markdown.match(/## Emoji\s+(.+)/);
  
  return {
    name: nameMatch?.[1] || 'Agent',
    role: roleMatch?.[1] || 'Team Member',
    emoji: emojiMatch?.[1] || '🤖'
  };
}

syncTeams();
```

## 五、国际化

### 5.1 翻译文件

```json
// messages/zh.json
{
  "teamCreator": {
    "title": "Team Creator",
    "connected": "已连接到 Architect",
    "connecting": "正在连接...",
    "welcomeMessage": "你好！我是 Architect，帮你创建定制化的 AI 团队。\n\n首先，你想创建什么行业的团队？\n（金融/医疗/制造/教育/电商/科技/创意/...）",
    "inputPlaceholder": "描述你的需求...",
    "sendError": "发送失败，请重试",
    "createSuccess": "🎉 团队创建成功！",
    "floatingButton": "与 AI 对话创建团队"
  }
}

// messages/en.json
{
  "teamCreator": {
    "title": "Team Creator",
    "connected": "Connected to Architect",
    "connecting": "Connecting...",
    "welcomeMessage": "Hello! I'm Architect, here to help you create a customized AI team.\n\nFirst, what industry is your team for?\n(Finance/Healthcare/Manufacturing/Education/E-commerce/Tech/Creative/...)",
    "inputPlaceholder": "Describe your needs...",
    "sendError": "Failed to send, please retry",
    "createSuccess": "🎉 Team created successfully!",
    "floatingButton": "Create team with AI"
  }
}
```

## 六、部署与集成

### 6.1 环境变量

```bash
# .env
OPENCLAW_GATEWAY_URL=ws://127.0.0.1:18789
OPENCLAW_GATEWAY_TOKEN=your-token
```

### 6.2 集成到 WorkspaceDashboard

```tsx
// src/components/WorkspaceDashboard.tsx 修改

import { TeamCreatorPanel, TeamCreatorButton } from './team-creator';

export function WorkspaceDashboard() {
  const [showTeamCreator, setShowTeamCreator] = useState(false);
  
  const handleTeamCreated = (teamId: string) => {
    setShowTeamCreator(false);
    loadWorkspaces(); // 刷新列表
    // 可选：自动跳转到新团队
    // router.push(`/workspace/${teamId}`);
  };
  
  return (
    <div className="min-h-screen bg-mc-bg">
      {/* ... 现有内容 ... */}
      
      {/* 浮动按钮 */}
      <TeamCreatorButton onClick={() => setShowTeamCreator(true)} />
      
      {/* 聊天面板 */}
      <TeamCreatorPanel
        isOpen={showTeamCreator}
        onClose={() => setShowTeamCreator(false)}
        onTeamCreated={handleTeamCreated}
      />
    </div>
  );
}
```

## 七、扩展功能

### 7.1 快捷命令

支持在聊天中使用快捷命令：

- `/template` - 查看可用模板
- `/skills [角色]` - 查看角色推荐技能
- `/preview` - 预览当前配置
- `/confirm` - 确认并创建
- `/cancel` - 取消当前会话

### 7.2 编辑已有团队

```
👤 用户
/edit robotics

🏛️ Architect
已加载 robotics 团队配置：
- 10 个成员
- 行业: 机器人/智能制造

你想修改什么？
1. 添加新成员
2. 调整现有成员的技能
3. 更新团队描述
```

### 7.3 模板克隆

```
👤 用户
参考 robotics 团队，创建一个新的 IoT 团队

🏛️ Architect
了解！我会基于 robotics 的结构，为 IoT 领域定制：
- 保留项目管理和研发角色
- 调整为嵌入式/物联网相关技能
- 添加云端连接和数据分析角色
...
```

## 八、实现优先级

### Phase 1: MVP (1-2 天)
1. ✅ TeamCreatorPanel 基础组件
2. ✅ 后端 API 路由
3. ✅ 与 platform.architect 会话连接
4. ✅ 基础消息发送/接收

### Phase 2: 完善 (2-3 天)
1. ✅ 创建进度指示器
2. ✅ 团队预览卡片
3. ✅ 数据库同步
4. ✅ 国际化

### Phase 3: 增强 (持续迭代)
1. 快捷命令支持
2. 编辑已有团队
3. 模板克隆
4. 消息历史持久化
5. 离线队列

---

*这是一个真正践行"对话完成一切"设计哲学的方案 — 用户只需要说话，AI 完成剩余的一切。*
