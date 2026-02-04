'use client';

import { Users, Folder, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { TeamSpec } from './types';

interface Props {
  spec: TeamSpec;
  onConfirm: () => void;
  onModify: () => void;
  isCreating?: boolean;
}

export function TeamPreviewCard({ spec, onConfirm, onModify, isCreating }: Props) {
  const t = useTranslations('teamCreator');

  return (
    <div className="bg-mc-bg-secondary border border-mc-border rounded-xl overflow-hidden my-4">
      <div className="bg-gradient-to-r from-mc-accent/20 to-purple-500/20 px-4 py-3 border-b border-mc-border">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-mc-accent" />
          <h3 className="font-semibold">{spec.team_name}</h3>
          <span className="text-xs text-mc-text-secondary">({spec.team_id})</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h4 className="text-sm font-medium text-mc-text-secondary mb-2">
            {t('preview.members')} ({spec.agents.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {spec.agents.map((agent) => (
              <div 
                key={agent.id}
                className="flex items-start gap-2 p-2 bg-mc-bg rounded-lg"
              >
                <span className="text-xl">{agent.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{agent.name}</div>
                  <div className="text-xs text-mc-text-secondary truncate">{agent.role}</div>
                  {agent.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {agent.skills.slice(0, 3).map((skill) => (
                        <span 
                          key={skill}
                          className="px-1.5 py-0.5 bg-mc-accent/10 text-mc-accent text-[10px] rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {agent.skills.length > 3 && (
                        <span className="text-[10px] text-mc-text-secondary">
                          +{agent.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-mc-text-secondary mb-2">
            <Folder className="w-4 h-4 inline mr-1" />
            {t('preview.structure')}
          </h4>
          <pre className="text-xs bg-mc-bg rounded p-2 overflow-x-auto">
{`teams/${spec.team_id}/
├── agents/
${spec.agents.map(a => `│   └── ${a.name.toLowerCase()}/workspace/`).join('\n')}
├── docs/
└── workspace/`}
          </pre>
        </div>

        {spec.constraints?.compliance && spec.constraints.compliance.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium mb-1">
              <AlertTriangle className="w-4 h-4" />
              {t('preview.complianceWarning')}
            </div>
            <ul className="text-xs text-mc-text-secondary space-y-1">
              {spec.constraints.compliance.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onModify}
            disabled={isCreating}
            className="flex-1 px-4 py-2 border border-mc-border rounded-lg text-mc-text-secondary hover:bg-mc-bg-tertiary transition-colors disabled:opacity-50"
          >
            {t('preview.modify')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isCreating}
            className="flex-1 px-4 py-2 bg-mc-accent text-white rounded-lg font-medium hover:bg-mc-accent/90 transition-colors disabled:opacity-50"
          >
            {isCreating ? t('preview.creating') : t('preview.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
