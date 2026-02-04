import { NextRequest } from 'next/server';
import { run, queryOne } from '@/lib/db/index';
import * as fs from 'fs';
import * as path from 'path';

interface TeamSpec {
  team_id: string;
  team_name: string;
  industry?: string;
  goals?: string[];
  constraints?: {
    data_sensitivity?: string;
    compliance?: string[];
  };
  agents: AgentSpec[];
}

interface AgentSpec {
  id: string;
  name: string;
  role: string;
  emoji: string;
  responsibilities?: string[];
  skills: string[];
  model?: string;
}

const TEAMS_BASE = path.join(process.cwd(), '..', '..', 'teams');
const OPENCLAW_D = path.join(process.cwd(), '..', '..', 'openclaw.d', 'teams');

function sendSSE(controller: ReadableStreamDefaultController, event: Record<string, unknown>) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
}

async function createTeamDirectories(spec: TeamSpec, controller: ReadableStreamDefaultController) {
  const teamDir = path.join(TEAMS_BASE, spec.team_id);
  
  fs.mkdirSync(teamDir, { recursive: true });
  fs.mkdirSync(path.join(teamDir, 'agents'), { recursive: true });
  fs.mkdirSync(path.join(teamDir, 'docs'), { recursive: true });
  fs.mkdirSync(path.join(teamDir, 'workspace'), { recursive: true });
  fs.mkdirSync(path.join(teamDir, 'configs'), { recursive: true });
  fs.mkdirSync(path.join(teamDir, 'shared'), { recursive: true });
  
  sendSSE(controller, { type: 'progress', progress: 10, step: 0, message: `Created ${spec.team_id} directory` });
}

function generateIdentityMd(agent: AgentSpec, teamName: string): string {
  return `# ${agent.name}

## Emoji
${agent.emoji}

## 角色
${agent.role}

## 团队
${teamName}

## 职责
${agent.responsibilities?.map(r => `- ${r}`).join('\n') || '- 待定义'}

## 技能
${agent.skills.map(s => `- ${s}`).join('\n')}
`;
}

function generateSoulMd(agent: AgentSpec): string {
  return `# SOUL.md - ${agent.name}

## 我是谁
我是 **${agent.name}**，担任 ${agent.role}。

## 核心价值观
- 追求卓越
- 团队协作
- 持续学习

## 工作方式
1. 理解任务目标
2. 制定执行计划
3. 高质量交付
4. 持续改进

## 技能专长
${agent.skills.map(s => `- ${s}`).join('\n')}
`;
}

function generateAgentsMd(spec: TeamSpec, currentAgent: AgentSpec): string {
  const otherAgents = spec.agents.filter(a => a.id !== currentAgent.id);
  return `# AGENTS.md - Team Roster

## 团队：${spec.team_name}

### 我的同事

${otherAgents.map(a => `#### ${a.emoji} ${a.name}
- **角色**: ${a.role}
- **ID**: ${a.id}
`).join('\n')}

## 协作规则
- 任务完成后通知项目经理
- 需要帮助时 @mention 相应角色
- 遵循团队工作流程
`;
}

async function createAgentFiles(spec: TeamSpec, controller: ReadableStreamDefaultController) {
  const totalAgents = spec.agents.length;
  let createdCount = 0;

  for (const agent of spec.agents) {
    const agentName = agent.name.toLowerCase().replace(/\s+/g, '-');
    const agentDir = path.join(TEAMS_BASE, spec.team_id, 'agents', agentName, 'workspace');
    
    fs.mkdirSync(agentDir, { recursive: true });
    fs.mkdirSync(path.join(agentDir, 'memory'), { recursive: true });
    fs.mkdirSync(path.join(agentDir, 'tasks'), { recursive: true });

    fs.writeFileSync(
      path.join(agentDir, 'IDENTITY.md'),
      generateIdentityMd(agent, spec.team_name)
    );

    fs.writeFileSync(
      path.join(agentDir, 'SOUL.md'),
      generateSoulMd(agent)
    );

    fs.writeFileSync(
      path.join(agentDir, 'AGENTS.md'),
      generateAgentsMd(spec, agent)
    );

    fs.writeFileSync(
      path.join(agentDir, 'USER.md'),
      `# USER.md\n\n用户上下文配置（待用户填写）`
    );

    fs.writeFileSync(
      path.join(agentDir, 'TOOLS.md'),
      `# TOOLS.md\n\n可用工具列表（待配置）`
    );

    fs.writeFileSync(
      path.join(agentDir, 'HEARTBEAT.md'),
      `# HEARTBEAT.md\n\n心跳配置（待配置）`
    );

    createdCount++;
    const progress = 10 + (createdCount / totalAgents) * 40;
    sendSSE(controller, { 
      type: 'progress', 
      progress, 
      step: 1, 
      message: `Created ${agent.name} (${createdCount}/${totalAgents})` 
    });
  }
}

function generateTeamDoc(spec: TeamSpec): string {
  return `# ${spec.team_name}

## 概述
- **团队 ID**: ${spec.team_id}
- **行业**: ${spec.industry || '通用'}
- **成员数量**: ${spec.agents.length}

## 团队目标
${spec.goals?.map(g => `- ${g}`).join('\n') || '- 待定义'}

## 团队成员

| 角色 | 名称 | 职责 |
|------|------|------|
${spec.agents.map(a => `| ${a.emoji} | **${a.name}** | ${a.role} |`).join('\n')}

## 约束条件
${spec.constraints?.compliance?.map(c => `- ${c}`).join('\n') || '- 无特殊约束'}

## 目录结构
\`\`\`
teams/${spec.team_id}/
├── agents/
${spec.agents.map(a => `│   └── ${a.name.toLowerCase()}/workspace/`).join('\n')}
├── docs/
├── configs/
├── shared/
└── workspace/
\`\`\`

---
*创建时间：${new Date().toISOString()}*
`;
}

async function createTeamDoc(spec: TeamSpec, controller: ReadableStreamDefaultController) {
  const docPath = path.join(TEAMS_BASE, spec.team_id, 'docs', 'TEAM.md');
  fs.writeFileSync(docPath, generateTeamDoc(spec));
  sendSSE(controller, { type: 'progress', progress: 55, step: 1, message: 'Created TEAM.md' });
}

function generateOpenClawConfig(spec: TeamSpec): string {
  const agents = spec.agents.map(agent => {
    const agentName = agent.name.toLowerCase().replace(/\s+/g, '-');
    return {
      id: `${spec.team_id}.${agentName}`,
      workspace: `./teams/${spec.team_id}/agents/${agentName}/workspace`,
      model: agent.model ? { primary: agent.model } : undefined
    };
  });

  return `// ${spec.team_name} - ${spec.industry || '通用'}团队
${JSON.stringify(agents, null, 2)}
`;
}

async function updateOpenClawConfig(spec: TeamSpec, controller: ReadableStreamDefaultController) {
  const configPath = path.join(OPENCLAW_D, `${spec.team_id}.json5`);
  
  fs.mkdirSync(OPENCLAW_D, { recursive: true });
  fs.writeFileSync(configPath, generateOpenClawConfig(spec));
  
  sendSSE(controller, { type: 'progress', progress: 70, step: 2, message: `Created ${spec.team_id}.json5` });
}

async function syncToDatabase(spec: TeamSpec, controller: ReadableStreamDefaultController): Promise<string> {
  const existingWorkspace = await queryOne<{ id: string }>(
    'SELECT id FROM workspaces WHERE slug = $1',
    [spec.team_id]
  );

  let workspaceId: string;

  if (existingWorkspace) {
    workspaceId = existingWorkspace.id;
  } else {
    workspaceId = crypto.randomUUID();
    await run(
      `INSERT INTO workspaces (id, name, slug, icon, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [workspaceId, spec.team_name, spec.team_id, '🤖']
    );
  }

  sendSSE(controller, { type: 'progress', progress: 80, step: 4, message: 'Created workspace in database' });

  const createdAgents: { id: string; name: string }[] = [];

  for (const agent of spec.agents) {
    const agentName = agent.name.toLowerCase().replace(/\s+/g, '-');
    const agentId = `${spec.team_id}.${agentName}`;

    const existingAgent = await queryOne<{ id: string }>(
      'SELECT id FROM agents WHERE id = $1',
      [agentId]
    );

    if (!existingAgent) {
      await run(
        `INSERT INTO agents (id, name, role, description, avatar_emoji, status, is_master, workspace_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'standby', $6, $7, NOW(), NOW())`,
        [
          agentId,
          agent.name,
          agent.role,
          agent.responsibilities?.join(', ') || '',
          agent.emoji,
          agent.role.includes('项目') || agent.role.includes('manager') ? true : false,
          workspaceId
        ]
      );
    }

    createdAgents.push({ id: agentId, name: agent.name });
  }

  sendSSE(controller, { type: 'progress', progress: 95, step: 4, message: `Created ${createdAgents.length} agents in database` });

  return workspaceId;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { spec } = body as { spec: TeamSpec };

    if (!spec || !spec.team_id || !spec.agents) {
      return new Response(JSON.stringify({ error: 'Invalid team spec' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          sendSSE(controller, { type: 'start', teamId: spec.team_id });

          await createTeamDirectories(spec, controller);

          await createAgentFiles(spec, controller);

          await createTeamDoc(spec, controller);

          await updateOpenClawConfig(spec, controller);

          const workspaceId = await syncToDatabase(spec, controller);

          sendSSE(controller, { type: 'progress', progress: 100, step: 4, message: 'Complete' });

          sendSSE(controller, {
            type: 'complete',
            teamId: spec.team_id,
            workspaceId,
            agents: spec.agents.map(a => ({
              id: `${spec.team_id}.${a.name.toLowerCase().replace(/\s+/g, '-')}`,
              name: a.name
            }))
          });

          controller.close();
        } catch (error) {
          console.error('Team creation error:', error);
          sendSSE(controller, {
            type: 'error',
            message: error instanceof Error ? error.message : 'Unknown error'
          });
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Failed to create team:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
