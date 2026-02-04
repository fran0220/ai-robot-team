import { NextRequest, NextResponse } from 'next/server';
import { getOpenClawClient } from '@/lib/openclaw/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent } = body;

    if (!agent) {
      return NextResponse.json(
        { error: 'agent is required' },
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

    const session = await client.createSession('api', agent);
    
    return NextResponse.json({
      sessionId: session.id,
      agentId: agent,
      status: session.status
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create team creator session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
