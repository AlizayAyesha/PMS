'use client';

import { getDashboardApiHeaders } from '@/lib/auth/dashboard-api-headers';

export type MediaItem = {
  name: string;
  url: string;
  created_at: string;
};

const USE_MEDIA_API = process.env.NEXT_PUBLIC_AUTH_USE_API_LOGIN === 'true';

export async function listMediaItems(): Promise<MediaItem[]> {
  if (USE_MEDIA_API) {
    const res = await fetch('/api/cms/media', {
      credentials: 'include',
      headers: getDashboardApiHeaders(),
    });
    const data = (await res.json().catch(() => ({}))) as { items?: MediaItem[]; error?: string };
    if (!res.ok) throw new Error(data.error || 'Failed to load media');
    return data.items ?? [];
  }

  const { supabase } = await import('@/lib/supabase');
  const { data, error } = await supabase.storage.from('site-media').list('', { limit: 200 });
  if (error) throw error;
  return (data ?? [])
    .filter((f) => f.name && !f.name.startsWith('.'))
    .map((f) => {
      const { data: pub } = supabase.storage.from('site-media').getPublicUrl(f.name!);
      return { name: f.name!, url: pub.publicUrl, created_at: f.created_at ?? '' };
    });
}

export async function uploadMediaFile(file: File): Promise<MediaItem> {
  if (USE_MEDIA_API) {
    const form = new FormData();
    form.append('file', file);
    form.append('filename', file.name);
    const res = await fetch('/api/cms/media', {
      method: 'POST',
      credentials: 'include',
      headers: getDashboardApiHeaders(),
      body: form,
    });
    const data = (await res.json().catch(() => ({}))) as {
      url?: string;
      name?: string;
      error?: string;
    };
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return { name: data.name ?? file.name, url: data.url ?? '', created_at: new Date().toISOString() };
  }

  const { supabase } = await import('@/lib/supabase');
  const path = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('site-media').upload(path, file, { upsert: false });
  if (error) throw error;
  const { data: pub } = supabase.storage.from('site-media').getPublicUrl(path);
  return { name: path, url: pub.publicUrl, created_at: new Date().toISOString() };
}

export async function deleteMediaItem(name: string): Promise<void> {
  if (USE_MEDIA_API) {
    const res = await fetch('/api/cms/media', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...getDashboardApiHeaders() },
      body: JSON.stringify({ name }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) throw new Error(data.error || 'Delete failed');
    return;
  }

  const { supabase } = await import('@/lib/supabase');
  const { error } = await supabase.storage.from('site-media').remove([name]);
  if (error) throw error;
}
