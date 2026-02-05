'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Download,
  FileText,
  Image,
  Box,
  Database,
  Code,
  File,
  Calendar,
  User,
  Tag,
  Folder,
  Loader2,
  ExternalLink,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { Asset, AssetType } from '@/lib/types';

const useNativeImagePreview = (asset: Asset): boolean => {
  return asset.type === 'visual' && 
         asset.mimeType?.startsWith('image/') === true &&
         !asset.mimeType?.includes('tiff');
};

const supportsKkPreview = (asset: Asset): boolean => {
  const supportedExtensions = [
    '.obj', '.stl', '.ply', '.gltf', '.glb', '.fbx', '.3ds', '.step', '.iges', '.stp',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.md', '.txt', '.rtf',
    '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs', '.json', '.xml', '.css', '.html', '.yaml', '.yml',
    '.dwg', '.dxf',
    '.zip', '.rar', '.7z', '.tar',
    '.tif', '.tiff', '.psd',
  ];
  const lastDotIndex = asset.name.lastIndexOf('.');
  if (lastDotIndex === -1) return false;
  const ext = asset.name.substring(lastDotIndex).toLowerCase();
  return supportedExtensions.includes(ext);
};

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

interface AssetPreviewProps {
  asset: Asset | null;
  onClose: () => void;
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
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AssetPreview({ asset, onClose, workspaceId }: AssetPreviewProps) {
  const [downloading, setDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [kkPreviewUrl, setKkPreviewUrl] = useState<string | null>(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const handleDownload = async () => {
    if (!asset) return;
    setDownloading(true);

    try {
      const res = await fetch(
        `/api/assets/presign?path=${encodeURIComponent(asset.path)}&workspace_id=${workspaceId}`
      );
      if (!res.ok) {
        throw new Error('Failed to get download URL');
      }
      const data = await res.json();
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const loadPreview = async () => {
    if (!asset || asset.type !== 'visual') return;
    setPreviewLoading(true);
    setPreviewError(null);

    try {
      const res = await fetch(
        `/api/assets/presign?path=${encodeURIComponent(asset.path)}&workspace_id=${workspaceId}`
      );
      if (!res.ok) {
        throw new Error('Failed to load preview');
      }
      const data = await res.json();
      setPreviewUrl(data.url);
    } catch (error) {
      setPreviewError('Failed to load preview');
      console.error('Preview failed:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const loadKkPreview = async () => {
    if (!asset || useNativeImagePreview(asset)) return;
    setPreviewLoading(true);
    setPreviewError(null);

    try {
      const res = await fetch(
        `/api/preview?path=${encodeURIComponent(asset.path)}&workspace_id=${workspaceId}`
      );
      if (!res.ok) {
        throw new Error('Failed to get preview URL');
      }
      const data = await res.json();
      setKkPreviewUrl(data.previewUrl);
    } catch (error) {
      setPreviewError('Preview not available');
      console.error('Preview failed:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Auto-load preview when asset changes
  useEffect(() => {
    if (!asset) return;
    
    // Reset states when asset changes
    setPreviewUrl(null);
    setKkPreviewUrl(null);
    setPreviewError(null);
    setFullscreenOpen(false);
    
    const isNative = asset.type === 'visual' && 
                     asset.mimeType?.startsWith('image/') === true &&
                     !asset.mimeType?.includes('tiff');
    const canKk = supportsKkPreview(asset);
    
    // Auto-load appropriate preview
    if (isNative) {
      loadPreview();
    } else if (canKk) {
      loadKkPreview();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset?.id, workspaceId]);

  if (!asset) {
    return null;
  }

  const Icon = TYPE_ICONS[asset.type];
  const colorClass = TYPE_COLORS[asset.type];
  const isNativeImage = useNativeImagePreview(asset);
  const canKkPreview = supportsKkPreview(asset);

  return (
    <div className="w-96 flex-shrink-0 bg-mc-bg-secondary border-l border-mc-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-mc-border">
        <h3 className="font-semibold text-mc-text truncate flex-1 mr-2">Preview</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-mc-bg-tertiary text-mc-text-secondary hover:text-mc-text transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Preview area */}
        <div className="aspect-square bg-mc-bg rounded-xl border border-mc-border flex items-center justify-center overflow-hidden relative">
          {isNativeImage && previewUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={asset.name}
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={() => setFullscreenOpen(true)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-mc-bg-tertiary/80 hover:bg-mc-bg-tertiary text-mc-text-secondary hover:text-mc-text transition-colors"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </>
          ) : isNativeImage && previewLoading ? (
            <Loader2 className="w-8 h-8 animate-spin text-mc-accent" />
          ) : isNativeImage && previewError ? (
            <div className="text-center p-4">
              <p className="text-mc-text-secondary text-sm">{previewError}</p>
              <button
                onClick={loadPreview}
                className="mt-2 text-mc-accent text-sm hover:underline"
              >
                Retry
              </button>
            </div>
          ) : isNativeImage && !previewUrl ? (
            <button
              onClick={loadPreview}
              className="flex flex-col items-center gap-2 text-mc-text-secondary hover:text-mc-accent transition-colors"
            >
              <ExternalLink className="w-6 h-6" />
              <span className="text-sm">Load preview</span>
            </button>
          ) : canKkPreview && kkPreviewUrl ? (
            <>
              <iframe
                src={kkPreviewUrl}
                className="w-full h-full border-0 rounded-lg"
                title={`Preview ${asset.name}`}
              />
              <button
                onClick={() => setFullscreenOpen(true)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-mc-bg-tertiary/80 hover:bg-mc-bg-tertiary text-mc-text-secondary hover:text-mc-text transition-colors"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </>
          ) : canKkPreview && previewLoading ? (
            <Loader2 className="w-8 h-8 animate-spin text-mc-accent" />
          ) : canKkPreview && previewError ? (
            <div className="text-center p-4">
              <p className="text-mc-text-secondary text-sm">{previewError}</p>
              <button
                onClick={loadKkPreview}
                className="mt-2 text-mc-accent text-sm hover:underline"
              >
                Retry
              </button>
            </div>
          ) : canKkPreview ? (
            <button
              onClick={loadKkPreview}
              className="flex flex-col items-center gap-2 text-mc-text-secondary hover:text-mc-accent transition-colors"
            >
              <ExternalLink className="w-6 h-6" />
              <span className="text-sm">Load Preview</span>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-xl bg-mc-bg-tertiary flex items-center justify-center">
                <Icon className={`w-8 h-8 ${colorClass}`} />
              </div>
              <span className="text-xs text-mc-text-secondary">Preview not available</span>
            </div>
          )}
        </div>

        {/* File name */}
        <div>
          <h4 className="font-medium text-mc-text break-words">{asset.name}</h4>
          <p className="text-sm text-mc-text-secondary">{asset.mimeType || 'Unknown type'}</p>
        </div>

        {/* Metadata */}
        <div className="space-y-3">
          <MetaItem icon={Folder} label="Stage" value={asset.stage} capitalize />
          <MetaItem icon={Tag} label="Type" value={asset.type} capitalize />
          <MetaItem icon={File} label="Size" value={formatFileSize(asset.size)} />
          <MetaItem icon={Calendar} label="Created" value={formatDate(asset.createdAt)} />
          {asset.agentId && <MetaItem icon={User} label="Agent" value={asset.agentId} />}
          {asset.taskId && <MetaItem icon={FileText} label="Task" value={asset.taskId} truncate />}
        </div>

        {/* Tags */}
        {asset.tags && asset.tags.length > 0 && (
          <div>
            <p className="text-xs text-mc-text-secondary mb-2">Tags</p>
            <div className="flex flex-wrap gap-1">
              {asset.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded-full bg-mc-bg-tertiary text-mc-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {asset.description && (
          <div>
            <p className="text-xs text-mc-text-secondary mb-1">Description</p>
            <p className="text-sm text-mc-text">{asset.description}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-mc-border">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-mc-accent text-mc-bg rounded-lg font-medium hover:bg-mc-accent/90 transition-colors disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{downloading ? 'Downloading...' : 'Download'}</span>
        </button>
      </div>

      {/* Fullscreen Modal */}
      {fullscreenOpen && (
        <div className="fixed inset-0 z-50 bg-mc-bg/95 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-mc-border">
            <h3 className="font-semibold text-mc-text truncate">{asset.name}</h3>
            <button
              onClick={() => setFullscreenOpen(false)}
              className="p-2 rounded-lg hover:bg-mc-bg-tertiary text-mc-text-secondary hover:text-mc-text transition-colors"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            {isNativeImage && previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={asset.name}
                className="w-full h-full object-contain"
              />
            ) : kkPreviewUrl ? (
              <iframe
                src={kkPreviewUrl}
                className="w-full h-full border-0 rounded-lg"
                title={`Preview ${asset.name}`}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

interface MetaItemProps {
  icon: typeof File;
  label: string;
  value: string;
  capitalize?: boolean;
  truncate?: boolean;
}

function MetaItem({ icon: Icon, label, value, capitalize, truncate }: MetaItemProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-mc-text-secondary mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-mc-text-secondary">{label}</p>
        <p
          className={`text-sm text-mc-text ${capitalize ? 'capitalize' : ''} ${
            truncate ? 'truncate' : ''
          }`}
          title={truncate ? value : undefined}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
