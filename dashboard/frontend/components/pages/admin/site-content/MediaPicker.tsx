'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ImageIcon, X } from 'lucide-react';
import { MediaLibraryGrid } from './MediaLibraryGrid';

/** Image picker with preview, library modal, and manual URL entry */
export function MediaPicker({
  value,
  onChange,
  label = 'Image',
}: {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="block space-y-2">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</span>

      {value ? (
        <div className="relative inline-block max-w-full">
          <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20 max-w-xs">
            <img src={value} alt="" className="w-full max-h-40 object-cover" />
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-red-500/80"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex h-28 max-w-xs items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 text-muted-foreground text-xs">
          <ImageIcon className="h-6 w-6 mr-2 opacity-50" />
          No image selected
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs font-bold px-3 py-2 rounded-lg bg-brand-orange text-white hover:opacity-90"
        >
          Choose from library
        </button>
        <Link
          href="/dashboard/site-system/media-library"
          target="_blank"
          className="text-xs font-semibold px-3 py-2 rounded-lg border border-white/10 hover:border-brand-orange/40"
        >
          Open media library
        </Link>
      </div>

      <input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste image URL"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-orange"
      />

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-background border border-border rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-bold">Media library</h3>
              <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <MediaLibraryGrid
                compact
                onSelect={(url) => {
                  onChange(url);
                  setOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
