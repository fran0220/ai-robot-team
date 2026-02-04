'use client';

import { Check, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Props {
  progress: number;
  steps?: string[];
  currentStep?: number;
}

export function ProgressIndicator({ progress, steps, currentStep = 0 }: Props) {
  const t = useTranslations('teamCreator');
  
  const defaultSteps = [
    t('steps.createDirectory'),
    t('steps.createAgents'),
    t('steps.updateConfig'),
    t('steps.validateConfig'),
    t('steps.syncDatabase'),
  ];

  const displaySteps = steps || defaultSteps;

  return (
    <div className="bg-mc-bg-tertiary rounded-lg p-4 my-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">{t('creatingTeam')}</span>
        <span className="text-sm text-mc-text-secondary">{Math.round(progress)}%</span>
      </div>
      
      <div className="h-2 bg-mc-bg rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-mc-accent to-purple-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-2">
        {displaySteps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div 
              key={index}
              className={`flex items-center gap-2 text-sm ${
                isComplete 
                  ? 'text-green-400' 
                  : isCurrent 
                    ? 'text-mc-text' 
                    : 'text-mc-text-secondary'
              }`}
            >
              {isComplete ? (
                <Check className="w-4 h-4" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-current" />
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
