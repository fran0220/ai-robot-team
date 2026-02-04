---
name: mission-control-guide
description: "Builds multi-agent AI teams using Clawdbot/OpenClaw. Use when setting up agent squads, orchestrating multiple AI agents, configuring heartbeats, shared workspaces, or building Mission Control systems."
---

# Mission Control: AI Agent Squad Guide

Complete guide for building coordinated multi-agent systems where AI agents work together like a real team.

## Core Concepts

### Clawdbot Architecture
- **Gateway**: Core daemon managing sessions, crons, and message routing
- **Sessions**: Independent conversations with persistent context (session key like `agent:main:main`)
- **Workspace**: Shared directory for configs, memory files, and scripts
- **Cron Jobs**: Scheduled agent wakeups ("heartbeats")

### Multi-Agent Setup
Each agent = one Clawdbot session with:
- Unique session key (e.g., `agent:product-analyst:main`)
- Own `SOUL.md` defining personality/role
- Own memory files and context
- Heartbeat cron (every 15 min, staggered)

## Session Keys Pattern

```plaintext
agent:main:main              → Coordinator/Lead
agent:product-analyst:main   → Product Analyst
agent:customer-researcher:main → Researcher
agent:content-writer:main    → Content Writer
agent:developer:main         → Developer
```

## Workspace Structure

```plaintext
/home/usr/clawd/
├── AGENTS.md              ← Instructions for agents
├── SOUL.md                ← Agent personality
├── memory/
│   ├── WORKING.md         ← Current task state
│   └── 2026-01-31.md      ← Daily notes
├── scripts/
└── config/
```

## Heartbeat Crons (Staggered)

```bash
# Add heartbeat - wake every 15 min
clawdbot cron add \
  --name "agent-heartbeat" \
  --cron "0,15,30,45 * * * *" \
  --session "isolated" \
  --message "Check Mission Control for new tasks..."
```

Stagger agents: :00 Agent1, :02 Agent2, :04 Agent3, etc.

## Mission Control (Shared Brain)

Required infrastructure:
1. **Shared task database** (Convex recommended)
2. **Comment threads** for agent discussions
3. **Activity feed** for visibility
4. **@mention notifications**
5. **Document storage** for deliverables

### Schema (Convex)

```javascript
agents: { name, role, status, currentTaskId, sessionKey }
tasks: { title, description, status, assigneeIds }
messages: { taskId, fromAgentId, content, attachments }
notifications: { mentionedAgentId, delivered }
```

### Task Lifecycle

```
Inbox → Assigned → In Progress → Review → Done
                              ↘ Blocked ↗
```

## Agent Communication

1. **Direct session messaging**:
   ```bash
   clawdbot sessions send --session "agent:seo-analyst:main" --message "Review this?"
   ```

2. **Shared database** (preferred): All agents read/write to same DB

## Notification System

- @mentions: `@AgentName` triggers notification
- Thread subscriptions: Auto-subscribe when commenting/assigned
- Daemon polls for undelivered notifications every 2 seconds

## Agent Heartbeat Workflow

When agent wakes:
1. Check notifications for @mentions
2. Check assigned tasks for updates
3. Check activity feed for relevant discussions
4. Work on tasks or respond `HEARTBEAT_OK` if nothing to do

## Quick Start

```bash
# 1. Install and start
npm install -g clawdbot
clawdbot init
clawdbot gateway start

# 2. Create agent with heartbeat
clawdbot cron add --name "agent-heartbeat" --cron "*/15 * * * *" \
  --session "isolated" \
  --message "Check for work. If nothing, reply HEARTBEAT_OK."

# 3. Write SOUL.md for identity
# 4. Set up shared task system (Convex/Notion/JSON)
```

## Best Practices

- Start with 2-3 agents, scale gradually
- Use cheaper models for heartbeats, expensive for creative work
- Put everything in files, not "mental notes"
- Let agents contribute beyond assigned tasks
- Daily standups for visibility and accountability

## Agent Roles Example

| Agent | Role | Session Key |
|-------|------|-------------|
| Jarvis | Squad Lead | `agent:main:main` |
| Shuri | Product Analyst | `agent:product-analyst:main` |
| Fury | Customer Researcher | `agent:customer-researcher:main` |
| Vision | SEO Analyst | `agent:seo-analyst:main` |
| Loki | Content Writer | `agent:content-writer:main` |
| Friday | Developer | `agent:developer:main` |

## Reference

Full guide source: https://x.com/pbteja1998/status/2017662163540971756
