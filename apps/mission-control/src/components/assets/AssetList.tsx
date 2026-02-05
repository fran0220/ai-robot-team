'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Image, Box, Database, Code, File, Loader2, FolderOpen } from 'lucide-react';
import type { Asset, AssetType } from '@/lib/types';

const TYPE_ICONS: Record<AssetType, typeof FileText> = {
  document: FileText,
  visual: Image,
  model: Box,
  data: Database,
  code: Code,
  other: File,
};

const TYPE_COLORS: Record<AssetType, string> = {
  document: 'text-mc-accent',
  visual: 'text-mc-accent-green',
  model: 'text-mc-accent-purple',
  data: 'text-mc-accent-yellow',
  code: 'text-mc-accent-cyan',
  other: 'text-mc-text-secondary',
};

interface AssetListProps {
  assets: Asset[];
  selectedAsset: Asset | null;
  onSelectAsset: (asset: Asset) => void;
  loading: boolean;
  workspaceId: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isPreviewableImage(asset: Asset): boolean {
  return asset.type === 'visual' && 
         asset.mimeType?.startsWith('image/') === true &&
         !asset.mimeType?.includes('tiff');
}

interface AssetThumbnailProps {
  asset: Asset;
  workspaceId: string;
  isSelected: boolean;
}

function AssetThumbnail({ asset, workspaceId, isSelected }: AssetThumbnailProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadThumbnail = useCallback(async () => {
    if (!isPreviewableImage(asset)) return;
    
    setLoading(true);
    setError(false);
    
    try {
      const res = await fetch(
        `/api/assets/presign?path=${encodeURIComponent(asset.path)}&workspace_id=${workspaceId}`
      );
      if (!res.ok) throw new Error('Failed to get thumbnail URL');
      const data = await res.json();
      setThumbnailUrl(data.url);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [asset, workspaceId]);

  useEffect(() => {
    loadThumbnail();
  }, [loadThumbnail]);

  const Icon = TYPE_ICONS[asset.type];
  const colorClass = TYPE_COLORS[asset.type];

  if (isPreviewableImage(asset)) {
    if (loading) {
      return (
        <div className={`w-full aspect-square rounded-lg mb-3 flex items-center justify-center ${
          isSelected ? 'bg-mc-accent/20' : 'bg-mc-bg-tertiary'
        }`}>
          <Loader2 className="w-6 h-6 animate-spin text-mc-text-secondary" />
        </div>
      );
    }

    if (thumbnailUrl && !error) {
      return (
        <div className={`w-full aspect-square rounded-lg mb-3 overflow-hidden ${
          isSelected ? 'ring-2 ring-mc-accent' : ''
        }`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt={asset.name}
            className="w-full h-full object-cover"
            onError={() => setError(true)}
          />
        </div>
      );
    }
  }

  return (
    <div
      className={`w-full aspect-square rounded-lg mb-3 flex items-center justify-center ${
        isSelected ? 'bg-mc-accent/20' : 'bg-mc-bg-tertiary'
      }`}
    >
      <Icon className={`w-8 h-8 ${colorClass}`} />
    </div>
  );
}

export function AssetList({ assets, selectedAsset, onSelectAsset, loading, workspaceId }: AssetListProps) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-mc-bg">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-mc-accent mx-auto mb-3" />
          <p className="text-mc-text-secondary">Loading assets...</p>
        </div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-mc-bg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-mc-bg-secondary border border-mc-border flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-mc-text-secondary" />
          </div>
          <h3 className="text-lg font-medium text-mc-text mb-2">No assets found</h3>
          <p className="text-sm text-mc-text-secondary max-w-xs">
            Files created by your AI agents will appear here. Try uploading files or running tasks that generate outputs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-mc-bg overflow-y-auto p-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {assets.map((asset) => {
          const isSelected = selectedAsset?.id === asset.id;

          return (
            <button
              key={asset.id}
              onClick={() => onSelectAsset(asset)}
              className={`text-left p-3 rounded-xl border transition-all hover:shadow-lg ${
                isSelected
                  ? 'bg-mc-accent/10 border-mc-accent'
                  : 'bg-mc-bg-secondary border-mc-border hover:border-mc-accent/50'
              }`}
            >
              <AssetThumbnail 
                asset={asset} 
                workspaceId={workspaceId} 
                isSelected={isSelected} 
              />

              <h4 className="font-medium text-mc-text truncate mb-1 text-sm" title={asset.name}>
                {asset.name}
              </h4>

              <div className="flex items-center gap-2 text-xs text-mc-text-secondary">
                <span>{formatFileSize(asset.size)}</span>
                <span>•</span>
                <span>{formatDate(asset.createdAt)}</span>
              </div>

              <div className="mt-2">
                <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-mc-bg-tertiary text-mc-text-secondary capitalize">
                  {asset.stage}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
