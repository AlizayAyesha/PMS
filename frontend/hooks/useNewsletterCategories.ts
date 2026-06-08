'use client';

import { useCallback, useEffect, useState } from 'react';
import type { NewsletterArticle } from '@pms/site-content/newsletter-posts';
import { CMS_TOPICS_FIELD_KEY } from '@pms/site-content/cms-posts';
import { buildNewsletterCategories, loadActiveCmsTopicNames } from '@/lib/newsletter/categories';
import { useWebsiteDataRealtime } from '@/hooks/useWebsiteDataRealtime';

export function useNewsletterCategories(articles: NewsletterArticle[]) {
  const [cmsTopicNames, setCmsTopicNames] = useState<string[]>([]);

  const refreshTopics = useCallback(() => {
    void loadActiveCmsTopicNames().then(setCmsTopicNames);
  }, []);

  useEffect(() => {
    refreshTopics();
  }, [refreshTopics]);

  useWebsiteDataRealtime(CMS_TOPICS_FIELD_KEY, refreshTopics);

  return buildNewsletterCategories(articles, cmsTopicNames);
}
