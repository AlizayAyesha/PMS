'use client';

import { useCallback, useEffect, useState } from 'react';
import { FIELD_KEYS } from '@pms/site-content/keys';
import {
  defaultNewsletterHubConfig,
  type NewsletterHubConfig,
} from '@pms/site-content/newsletter';
import { loadNewsletterHubConfig } from '@/lib/newsletter/hub-config';
import { useWebsiteDataRealtime } from '@/hooks/useWebsiteDataRealtime';

export function useNewsletterHubConfig() {
  const [config, setConfig] = useState<NewsletterHubConfig>(defaultNewsletterHubConfig());
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    void loadNewsletterHubConfig()
      .then(setConfig)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useWebsiteDataRealtime(FIELD_KEYS.NEWSLETTER_HUB_CONFIG, refresh);

  return { config, isLoading, refresh };
}
