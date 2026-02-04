export interface TeamCreatorMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    phase?: TeamCreatorPhase;
    teamSpec?: TeamSpec;
    isCreating?: boolean;
    progress?: number;
    error?: string;
  };
}

export type TeamCreatorPhase = 
  | 'welcome'
  | 'industry'
  | 'goals'
  | 'workflow'
  | 'team_size'
  | 'skills'
  | 'preview'
  | 'creating'
  | 'complete';

export interface TeamSpec {
  team_id: string;
  team_name: string;
  industry?: string;
  goals?: string[];
  constraints?: {
    data_sensitivity?: string;
    compliance?: string[];
    web_access?: boolean;
    persistent_memory?: boolean;
  };
  agents: AgentSpec[];
}

export interface AgentSpec {
  id: string;
  name: string;
  role: string;
  emoji: string;
  responsibilities?: string[];
  skills: string[];
  model?: string;
}

export interface TeamCreatorState {
  isOpen: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  isSending: boolean;
  sessionId: string | null;
  messages: TeamCreatorMessage[];
  currentPhase: TeamCreatorPhase;
  pendingSpec?: TeamSpec;
}

export interface CreateTeamResult {
  success: boolean;
  teamId?: string;
  workspaceId?: string;
  error?: string;
  agents?: {
    id: string;
    name: string;
  }[];
}
