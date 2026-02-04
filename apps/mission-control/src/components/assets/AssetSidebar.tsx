'use client';

import {
  ClipboardList,
  Palette,
  Wrench,
  Eye,
  Package,
  Layers,
  FileText,
  Image,
  Box,
  Database,
  Code,
  File,
} from 'lucide-react';
import type { AssetStage, AssetType } from '@/lib/types';

const STAGE_CONFIG: Record<AssetStage, { label: string; icon: typeof ClipboardList }> = {
  planning: { label: 'Planning', icon: ClipboardList },
  design: { label: 'Design', icon: Palette },
  build: { label: 'Build', icon: Wrench },
  review: { label: 'Review', icon: Eye },
  deliver: { label: 'Deliver', icon: Package },
};

const TYPE_CONFIG: Record<AssetType, { label: string; icon: typeof FileText }> = {
  document: { label: 'Document', icon: FileText },
  visual: { label: 'Visual', icon: Image },
  model: { label: '3D Model', icon: Box },
  data: { label: 'Data', icon: Database },
  code: { label: 'Code', icon: Code },
  other: { label: 'Other', icon: File },
};

interface AssetSidebarProps {
  selectedStage: AssetStage | 'all';
  onStageChange: (stage: AssetStage | 'all') => void;
  selectedTypes: AssetType[];
  onTypesChange: (types: AssetType[]) => void;
  stageCounts: Record<AssetStage | 'all', number>;
}

export function AssetSidebar({
  selectedStage,
  onStageChange,
  selectedTypes,
  onTypesChange,
  stageCounts,
}: AssetSidebarProps) {
  const toggleType = (type: AssetType) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  return (
    <div className="w-56 flex-shrink-0 bg-mc-bg-secondary border-r border-mc-border p-4 overflow-y-auto">
      {/* Stages */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-mc-text-secondary uppercase tracking-wider mb-3">
          Stages
        </h3>
        <div className="space-y-1">
          {/* All option */}
          <button
            onClick={() => onStageChange('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedStage === 'all'
                ? 'bg-mc-accent/20 text-mc-accent'
                : 'text-mc-text hover:bg-mc-bg-tertiary'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>All</span>
            </div>
            <span className="text-xs text-mc-text-secondary">{stageCounts.all}</span>
          </button>

          {/* Stage options */}
          {(Object.entries(STAGE_CONFIG) as [AssetStage, typeof STAGE_CONFIG[AssetStage]][]).map(
            ([stage, config]) => {
              const Icon = config.icon;
              const count = stageCounts[stage] || 0;
              return (
                <button
                  key={stage}
                  onClick={() => onStageChange(stage)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedStage === stage
                      ? 'bg-mc-accent/20 text-mc-accent'
                      : 'text-mc-text hover:bg-mc-bg-tertiary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{config.label}</span>
                  </div>
                  <span className="text-xs text-mc-text-secondary">{count}</span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Types */}
      <div>
        <h3 className="text-xs font-semibold text-mc-text-secondary uppercase tracking-wider mb-3">
          Types
        </h3>
        <div className="space-y-1">
          {(Object.entries(TYPE_CONFIG) as [AssetType, typeof TYPE_CONFIG[AssetType]][]).map(
            ([type, config]) => {
              const Icon = config.icon;
              const isSelected = selectedTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isSelected
                      ? 'bg-mc-accent-purple/20 text-mc-accent-purple'
                      : 'text-mc-text hover:bg-mc-bg-tertiary'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      isSelected
                        ? 'bg-mc-accent-purple border-mc-accent-purple'
                        : 'border-mc-border'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <Icon className="w-4 h-4" />
                  <span>{config.label}</span>
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
