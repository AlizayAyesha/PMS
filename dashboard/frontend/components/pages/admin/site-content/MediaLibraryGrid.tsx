'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Copy, Trash2, Check, Upload } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { listMediaItems, uploadMediaFile, deleteMediaItem, type MediaItem } from '@/lib/cms/media-api';

type Props = {
  onSelect?: (url: string) => void;
  compact?: boolean;
};

export function MediaLibraryGrid({ onSelect, compact }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await listMediaItems());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load media');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      await uploadMediaFile(file);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const onDelete = async (name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await deleteMediaItem(name);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className={compact ? 'space-y-4' : 'space-y-6'}>
      <GlassCard className="p-4 flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-orange text-white text-sm font-bold">
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading…' : 'Upload image'}
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
        </label>
        <span className="text-xs text-muted-foreground">JPEG, PNG, WebP, GIF, SVG — max 5MB</span>
      </GlassCard>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Loading media…</p> : null}

      <div className={`grid gap-4 ${compact ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
        {items.map((item) => (
          <GlassCard key={item.name} className="p-2 overflow-hidden group">
            <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/20">
              <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(item.url)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold"
                >
                  Use this image
                </button>
              ) : null}
            </div>
            <p className="text-xs truncate mt-2 font-mono text-muted-foreground">{item.name}</p>
            <div className="flex gap-1 mt-2">
              <button
                type="button"
                onClick={() => copyUrl(item.url)}
                className="flex-1 inline-flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg border border-white/10 hover:border-brand-orange/50"
              >
                {copied === item.url ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied === item.url ? 'Copied' : 'Copy URL'}
              </button>
              {!onSelect ? (
                <button
                  type="button"
                  onClick={() => onDelete(item.name)}
                  className="p-1.5 rounded-lg border border-white/10 text-red-400 hover:bg-red-500/10"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </GlassCard>
        ))}
      </div>

      {!loading && items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No images yet. Upload your first asset above.</p>
      ) : null}
    </div>
  );
}
