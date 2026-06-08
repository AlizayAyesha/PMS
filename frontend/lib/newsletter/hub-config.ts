import {
  defaultNewsletterHubConfig,
  parseNewsletterHubConfig,
  type NewsletterHubConfig,
} from '@pms/site-content/newsletter';
import { FIELD_KEYS } from '@pms/site-content/keys';
import { supabase } from '@/lib/supabase';

export type { NewsletterHubConfig };
export { defaultNewsletterHubConfig };

export async function loadNewsletterHubConfig(): Promise<NewsletterHubConfig> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return defaultNewsletterHubConfig();

  try {
    const { data, error } = await supabase
      .from('website_data')
      .select('content')
      .eq('field_key', FIELD_KEYS.NEWSLETTER_HUB_CONFIG)
      .eq('is_published', true)
      .maybeSingle();

    if (error || !data?.content) return defaultNewsletterHubConfig();
    return parseNewsletterHubConfig(data.content);
  } catch {
    return defaultNewsletterHubConfig();
  }
}
