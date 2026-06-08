import { z } from 'zod';

export const newsletterHubConfigSchema = z.object({
  version: z.literal(1),
  hero: z.object({
    badge: z.string(),
    title: z.string(),
    subtitle: z.string(),
  }),
  /** Published articles load from Supabase `newsletter_posts_registry` when set. */
  source: z.enum(['file', 'supabase']).default('supabase'),
});

export type NewsletterHubConfig = z.infer<typeof newsletterHubConfigSchema>;

export function defaultNewsletterHubConfig(): NewsletterHubConfig {
  return {
    version: 1,
    hero: {
      badge: 'Newsletter',
      title: 'The Structure Report',
      subtitle: 'Weekly deep-dives on methodology, leadership, and career growth.',
    },
    source: 'supabase',
  };
}

export function parseNewsletterHubConfig(raw: unknown): NewsletterHubConfig {
  const result = newsletterHubConfigSchema.safeParse(raw);
  if (result.success) return result.data;
  return defaultNewsletterHubConfig();
}
