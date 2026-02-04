import { NextRequest, NextResponse } from 'next/server';
import { getOpenClawClient } from '@/lib/openclaw/client';

interface TeamSpec {
  team_id: string;
  team_name: string;
  agents: Array<{
    id: string;
    name: string;
    role: string;
    emoji: string;
    skills: string[];
  }>;
}

function extractTeamSpec(content: string): TeamSpec | null {
  const specMatch = content.match(/```(?:yaml|json):?team-spec\n([\s\S]*?)```/);
  if (!specMatch) return null;

  try {
    const specContent = specMatch[1].trim();
    if (specContent.startsWith('{')) {
      return JSON.parse(specContent);
    }
    return null;
  } catch {
    return null;
  }
}

function detectPhase(content: string): string | undefined {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('确认创建') || lowerContent.includes('confirm')) {
    return 'preview';
  }
  if (lowerContent.includes('技能') || lowerContent.includes('skill')) {
    return 'skills';
  }
  if (lowerContent.includes('团队规模') || lowerContent.includes('team size')) {
    return 'team_size';
  }
  if (lowerContent.includes('工作流') || lowerContent.includes('workflow')) {
    return 'workflow';
  }
  if (lowerContent.includes('目标') || lowerContent.includes('goal')) {
    return 'goals';
  }
  if (lowerContent.includes('行业') || lowerContent.includes('industry')) {
    return 'industry';
  }
  
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      );
    }

    const client = getOpenClawClient();

    if (!client.isConnected()) {
      try {
        await client.connect();
      } catch {
        return NextResponse.json(
          { error: 'Failed to connect to OpenClaw Gateway' },
          { status: 503 }
        );
      }
    }

    await client.sendMessage(sessionId, content);

    const history = await client.getSessionHistory(sessionId);
    const lastMessage = history[history.length - 1] as { role: string; content: string } | undefined;
    
    if (!lastMessage || lastMessage.role !== 'assistant') {
      return NextResponse.json(
        { error: 'No response from agent' },
        { status: 500 }
      );
    }

    const responseContent = lastMessage.content;
    const teamSpec = extractTeamSpec(responseContent);
    const phase = detectPhase(responseContent);

    return NextResponse.json({
      response: responseContent,
      phase,
      teamSpec
    });
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
