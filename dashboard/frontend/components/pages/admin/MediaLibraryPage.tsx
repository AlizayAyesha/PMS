'use client';

import React from 'react';
import Link from 'next/link';
import { Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { MediaLibraryGrid } from './site-content/MediaLibraryGrid';

export function MediaLibraryPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/site-system"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-orange mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Site System
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ImageIcon className="h-7 w-7 text-brand-orange" />
            Media library
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Upload images for the public site. Use them in Home hero slides, store products, blog posts, and
            other CMS fields. Copy the URL or pick from the library inside any image field.
          </p>
        </div>
      </div>
      <MediaLibraryGrid />
    </div>
  );
}
