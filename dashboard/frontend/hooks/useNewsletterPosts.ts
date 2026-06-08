'use client';

import { useCallback, useEffect, useState } from 'react';
import { WebsiteDataService } from '@/services/WebsiteDataService';
import { useWebsiteDataRealtime } from '@/hooks/useWebsiteDataRealtime';
import {
  NEWSLETTER_POSTS_FIELD_KEY,
  defaultNewsletterPostsRegistry,
  parseNewsletterPostsRegistry,
  type NewsletterPost,
  type NewsletterPostsRegistry,
} from '@/lib/newsletter-posts';

export function useNewsletterPosts() {
  const [registry, setRegistry] = useState<NewsletterPostsRegistry>(defaultNewsletterPostsRegistry());
  const [isRegistryPublished, setIsRegistryPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const rows = await WebsiteDataService.getData('draft');
      const row = rows.find((item) => item.field_key === NEWSLETTER_POSTS_FIELD_KEY);
      setIsRegistryPublished(Boolean(row?.is_published));
      if (row?.content) {
        setRegistry(parseNewsletterPostsRegistry(row.content));
      } else {
        const seeded = defaultNewsletterPostsRegistry();
        setRegistry(seeded);
        await WebsiteDataService.saveDraft(
          NEWSLETTER_POSTS_FIELD_KEY,
          seeded as unknown as Record<string, unknown>,
        );
      }
    } catch (err) {
      console.error('Failed to load newsletter posts', err);
      setError('Could not load newsletter posts.');
      setRegistry(defaultNewsletterPostsRegistry());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useWebsiteDataRealtime(NEWSLETTER_POSTS_FIELD_KEY, load);

  const persist = useCallback(async (next: NewsletterPostsRegistry, publish = false) => {
    setIsSaving(true);
    setError(null);
    try {
      await WebsiteDataService.saveDraft(
        NEWSLETTER_POSTS_FIELD_KEY,
        next as unknown as Record<string, unknown>,
      );
      if (publish) {
        await WebsiteDataService.publish(NEWSLETTER_POSTS_FIELD_KEY);
        setIsRegistryPublished(true);
      }
      setRegistry(next);
    } catch (err) {
      console.error('Failed to save newsletter posts', err);
      setError('Could not save newsletter posts.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const upsertPost = useCallback(
    async (post: NewsletterPost, publish = false) => {
      const nextPosts = [...registry.posts];
      const index = nextPosts.findIndex((item) => item.id === post.id);
      const updated: NewsletterPost = {
        ...post,
        modifiedDate: new Date().toISOString(),
      };
      if (index >= 0) nextPosts[index] = updated;
      else nextPosts.unshift(updated);
      await persist({ version: 1, posts: nextPosts }, publish || isRegistryPublished);
      return updated;
    },
    [persist, registry.posts, isRegistryPublished],
  );

  const deletePost = useCallback(
    async (id: string) => {
      const next = {
        version: 1 as const,
        posts: registry.posts.filter((post) => post.id !== id),
      };
      await persist(next, isRegistryPublished);
    },
    [persist, registry.posts, isRegistryPublished],
  );

  return {
    posts: registry.posts,
    isLoading,
    isSaving,
    error,
    refresh: load,
    upsertPost,
    deletePost,
    getPostById: (id: string) => registry.posts.find((post) => post.id === id),
  };
}
