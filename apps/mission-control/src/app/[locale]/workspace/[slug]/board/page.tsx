'use client';

import { AgentsSidebar } from '@/components/AgentsSidebar';
import { MissionQueue } from '@/components/MissionQueue';
import { LiveFeed } from '@/components/LiveFeed';
import { SSEDebugPanel } from '@/components/SSEDebugPanel';
import { useMissionControl } from '@/lib/store';

export default function BoardPage() {
  const { workspace } = useMissionControl();

  if (!workspace) {
    return (
      <div className="flex-1 flex items-center justify-center text-mc-text-secondary">
        Loading board...
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex overflow-hidden">
        {/* Agents Sidebar */}
        <AgentsSidebar workspaceId={workspace.id} />

        {/* Main Content Area */}
        <MissionQueue workspaceId={workspace.id} />

        {/* Live Feed */}
        <LiveFeed />
      </div>

      {/* Debug Panel - only shows when debug mode enabled */}
      <SSEDebugPanel />
    </>
  );
}
