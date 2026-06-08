'use client';

import { useState, useEffect } from 'react';
import { getDashboardApiHeaders } from '@/lib/auth/dashboard-api-headers';

export interface WebsiteData {
  id: string;
  field_key: string;
  content: Record<string, unknown>;
  is_published: boolean;
  updated_at: string;
}

const USE_CMS_API = process.env.NEXT_PUBLIC_AUTH_USE_API_LOGIN === 'true';

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

async function cmsFetch(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getDashboardApiHeaders(),
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || `CMS API error (${res.status})`,
    );
  }
  return data;
}

export const WebsiteDataService = {
  isConfigured: () => USE_CMS_API || Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),

  async getData(view: 'draft' | 'published' = 'draft') {
    if (!USE_CMS_API) {
      const { isSupabaseAuthConfigured, supabase } = await import('@/lib/supabase');
      if (!isSupabaseAuthConfigured) return [] as WebsiteData[];
      const query = supabase.from('website_data').select('*');
      if (view === 'published') query.eq('is_published', true);
      const { data, error } = await query;
      if (error) throw new Error(toErrorMessage(error, 'Failed to load website data'));
      return (data ?? []) as WebsiteData[];
    }

    const q = view === 'published' ? '?view=published' : '';
    const result = (await cmsFetch(`/api/cms/website-data${q}`)) as { data: WebsiteData[] };
    return result.data ?? [];
  },

  async saveDraft(fieldKey: string, content: Record<string, unknown>) {
    if (!USE_CMS_API) {
      const { isSupabaseAuthConfigured, supabase } = await import('@/lib/supabase');
      if (!isSupabaseAuthConfigured) {
        throw new Error('Supabase is not configured.');
      }
      const { data: existing } = await supabase
        .from('website_data')
        .select('is_published')
        .eq('field_key', fieldKey)
        .maybeSingle();

      const { data, error } = await supabase
        .from('website_data')
        .upsert(
          {
            field_key: fieldKey,
            content,
            is_published: existing?.is_published ?? false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'field_key' },
        );
      if (error) throw new Error(toErrorMessage(error, 'Failed to save draft.'));
      return data;
    }

    return cmsFetch('/api/cms/website-data', {
      method: 'POST',
      body: JSON.stringify({ action: 'saveDraft', fieldKey, content }),
    });
  },

  async publish(fieldKey: string) {
    if (!USE_CMS_API) {
      const { isSupabaseAuthConfigured, supabase } = await import('@/lib/supabase');
      if (!isSupabaseAuthConfigured) {
        throw new Error('Supabase is not configured.');
      }
      const { data, error } = await supabase
        .from('website_data')
        .update({ is_published: true })
        .eq('field_key', fieldKey);
      if (error) throw new Error(toErrorMessage(error, 'Failed to publish.'));
      return data;
    }

    return cmsFetch('/api/cms/website-data', {
      method: 'POST',
      body: JSON.stringify({ action: 'publish', fieldKey }),
    });
  },
};

export const useWebsiteData = (keys?: string[]) => {
  const [data, setData] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPublished = async () => {
      try {
        const result = await WebsiteDataService.getData('published');
        const contentMap: Record<string, unknown> = {};
        result.forEach((item) => {
          if (typeof item.content === 'object' && item.content !== null) {
            Object.assign(contentMap, item.content);
          }
        });
        setData(contentMap);
      } catch (err) {
        console.error('Error fetching published data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPublished();
  }, [keys?.join(',')]);

  const get = (key: string, defaultValue = ''): string => {
    const val = data[key];
    return typeof val === 'string' ? val : defaultValue;
  };

  return { data, isLoading, get };
};
