'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MessageBubble } from './MessageBubble';
import { ProgressIndicator } from './ProgressIndicator';
import { TeamPreviewCard } from './TeamPreviewCard';
import type { TeamCreatorMessage, TeamSpec, TeamCreatorPhase, CreateTeamResult } from './types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: (result: CreateTeamResult) => void;
}

const WELCOME_MESSAGE = `你好！我是 **Architect**，帮你创建定制化的 AI 团队。

首先，你想创建什么行业的团队？
（金融/医疗/制造/教育/电商/科技/创意/...）`;

export function TeamCreatorPanel({ isOpen, onClose, onTeamCreated }: Props) {
  const t = useTranslations('teamCreator');
  const [messages, setMessages] = useState<TeamCreatorMessage[]>([]);
  const [input, setInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<TeamCreatorPhase>('welcome');
  const [pendingSpec, setPendingSpec] = useState<TeamSpec | null>(null);
  const [creationProgress, setCreationProgress] = useState(0);
  const [creationStep, setCreationStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: WELCOME_MESSAGE,
        timestamp: new Date(),
        metadata: { phase: 'welcome' }
      });
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const addMessage = (message: TeamCreatorMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const initSession = async () => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);
    try {
      const res = await fetch('/api/team-creator/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: 'platform.architect' })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create session');
      }

      const data = await res.json();
      setSessionId(data.sessionId);
      setIsConnected(true);

      addMessage({
        id: crypto.randomUUID(),
        role: 'system',
        content: t('connected'),
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Session init error:', error);
      addMessage({
        id: crypto.randomUUID(),
        role: 'system',
        content: t('connectionFailed'),
        timestamp: new Date(),
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;

    const userMessage: TeamCreatorMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    addMessage(userMessage);
    setInput('');
    setIsSending(true);

    try {
      if (!sessionId) {
        await initSession();
      }

      const res = await fetch('/api/team-creator/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          content: userMessage.content
        })
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      const data = await res.json();
      
      const assistantMessage: TeamCreatorMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        metadata: {
          phase: data.phase,
          teamSpec: data.teamSpec
        }
      };
      addMessage(assistantMessage);

      if (data.phase) {
        setCurrentPhase(data.phase);
      }

      if (data.teamSpec) {
        setPendingSpec(data.teamSpec);
      }

    } catch (error) {
      console.error('Send error:', error);
      addMessage({
        id: crypto.randomUUID(),
        role: 'system',
        content: t('sendError'),
        timestamp: new Date(),
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmCreate = async () => {
    if (!pendingSpec) return;

    setCurrentPhase('creating');
    setCreationProgress(0);
    setCreationStep(0);

    try {
      const res = await fetch('/api/team-creator/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec: pendingSpec })
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter(Boolean);

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));
              
              if (event.type === 'progress') {
                setCreationProgress(event.progress);
                setCreationStep(event.step);
              } else if (event.type === 'complete') {
                setCurrentPhase('complete');
                onTeamCreated({
                  success: true,
                  teamId: event.teamId,
                  workspaceId: event.workspaceId,
                  agents: event.agents
                });

                addMessage({
                  id: crypto.randomUUID(),
                  role: 'assistant',
                  content: t('createSuccess', { teamName: pendingSpec.team_name }),
                  timestamp: new Date(),
                  metadata: { phase: 'complete' }
                });
              } else if (event.type === 'error') {
                throw new Error(event.message);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }
    } catch (error) {
      console.error('Create error:', error);
      setCurrentPhase('preview');
      addMessage({
        id: crypto.randomUUID(),
        role: 'system',
        content: t('createError'),
        timestamp: new Date(),
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  };

  const handleModifySpec = () => {
    addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: t('wantToModify'),
      timestamp: new Date()
    });
    setPendingSpec(null);
    setCurrentPhase('skills');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetSession = () => {
    setMessages([]);
    setSessionId(null);
    setIsConnected(false);
    setCurrentPhase('welcome');
    setPendingSpec(null);
    setCreationProgress(0);
    setCreationStep(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-mc-bg-secondary border border-mc-border rounded-xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-mc-border bg-gradient-to-r from-mc-accent/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-mc-accent" />
            <h2 className="font-semibold">{t('title')}</h2>
            {isConnected && (
              <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                {t('connected')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetSession}
              className="p-1.5 hover:bg-mc-bg-tertiary rounded-lg transition-colors"
              title={t('reset')}
            >
              <RefreshCw className="w-4 h-4 text-mc-text-secondary" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-mc-bg-tertiary rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-mc-text-secondary" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {pendingSpec && currentPhase === 'preview' && (
            <TeamPreviewCard
              spec={pendingSpec}
              onConfirm={handleConfirmCreate}
              onModify={handleModifySpec}
            />
          )}

          {currentPhase === 'creating' && (
            <ProgressIndicator
              progress={creationProgress}
              currentStep={creationStep}
            />
          )}

          {isSending && (
            <div className="flex items-center gap-2 text-mc-text-secondary text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('thinking')}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-mc-border">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('inputPlaceholder')}
              disabled={isSending || currentPhase === 'creating'}
              rows={1}
              className="flex-1 bg-mc-bg border border-mc-border rounded-lg px-4 py-2.5 resize-none focus:outline-none focus:border-mc-accent disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isSending || currentPhase === 'creating'}
              className="px-4 py-2 bg-mc-accent text-white rounded-lg font-medium hover:bg-mc-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
