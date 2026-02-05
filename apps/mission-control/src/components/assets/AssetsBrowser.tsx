'use client';

import { useState, useEffect, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { useMissionControl } from '@/lib/store';
import { AssetSidebar } from './AssetSidebar';
import { AssetList } from './AssetList';
import { AssetPreview } from './AssetPreview';
import type { Asset, AssetStage, AssetType, AssetListResponse } from '@/lib/types';

export function AssetsBrowser() {
  const { workspace } = useMissionControl();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStage, setSelectedStage] = useState<AssetStage | 'all'>('all');
  const [selectedTypes, setSelectedTypes] = useState<AssetType[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    if (!workspace) return;

    const fetchAssets = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ workspace_id: workspace.id });
        const res = await fetch(`/api/assets?${params}`);

        if (!res.ok) {
          const data = await res.json();
          if (res.status === 503) {
            setError('Storage service not configured');
          } else {
            setError(data.error || 'Failed to load assets');
          }
          setAssets([]);
          return;
        }

        const data: AssetListResponse = await res.json();
        setAssets(data.assets);
      } catch (err) {
        setError('Failed to connect to server');
        console.error('Failed to fetch assets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [workspace]);

  const filteredAssets = useMemo(() => {
    let result = assets;

    if (selectedStage !== 'all') {
      result = result.filter((a) => a.stage === selectedStage);
    }

    if (selectedTypes.length > 0) {
      result = result.filter((a) => selectedTypes.includes(a.type));
    }

    return result;
  }, [assets, selectedStage, selectedTypes]);

  const stageCounts = useMemo(() => {
    const counts: Record<AssetStage | 'all', number> = {
      all: assets.length,
      planning: 0,
      design: 0,
      build: 0,
      review: 0,
      deliver: 0,
    };

    for (const asset of assets) {
      counts[asset.stage]++;
    }

    return counts;
  }, [assets]);

  if (!workspace) {
    return (
      <div className="flex-1 flex items-center justify-center bg-mc-bg">
        <p className="text-mc-text-secondary">Loading workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-mc-bg">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-mc-accent-yellow/20 border border-mc-accent-yellow/50 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-mc-accent-yellow" />
          </div>
          <h3 className="text-lg font-medium text-mc-text mb-2">Unable to Load Assets</h3>
          <p className="text-sm text-mc-text-secondary">{error}</p>
          {error === 'Storage service not configured' && (
            <p className="text-xs text-mc-text-secondary mt-2">
              MinIO storage needs to be configured. Contact your administrator.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      <AssetSidebar
        selectedStage={selectedStage}
        onStageChange={setSelectedStage}
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
        stageCounts={stageCounts}
      />

      <AssetList
        assets={filteredAssets}
        selectedAsset={selectedAsset}
        onSelectAsset={setSelectedAsset}
        loading={loading}
        workspaceId={workspace.id}
      />

      {selectedAsset && (
        <AssetPreview
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          workspaceId={workspace.id}
        />
      )}
    </div>
  );
}
