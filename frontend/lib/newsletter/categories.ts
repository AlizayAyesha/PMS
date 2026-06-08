import type { NewsletterArticle } from '@pms/site-content/newsletter-posts';
import { CMS_TOPICS_FIELD_KEY } from '@pms/site-content/cms-posts';
import { supabase } from '@/lib/supabase';

const FALLBACK_CATEGORIES = [
  'All',
  'PMP',
  'CAPM',
  'Agile',
  'Risk',
  'Business Analysis',
  'PRINCE2',
  'PMO',
  'Six Sigma',
  'Career Growth',
  'Exam Strategies',
];

type CmsTopicRow = { id: string; name: string; status: string };

function parseActiveCmsTopicNames(raw: unknown): string[] {
  if (!raw || typeof raw !== 'object') return [];
  const data = raw as { topics?: CmsTopicRow[] };
  if (!Array.isArray(data.topics)) return [];
  return data.topics
    .filter((topic) => topic?.status === 'active' && typeof topic.name === 'string')
    .map((topic) => topic.name.trim())
    .filter(Boolean);
}

export async function loadActiveCmsTopicNames(): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  try {
    const { data, error } = await supabase
      .from('website_data')
      .select('content')
      .eq('field_key', CMS_TOPICS_FIELD_KEY)
      .eq('is_published', true)
      .maybeSingle();

    if (error || !data?.content) return [];
    return parseActiveCmsTopicNames(data.content);
  } catch {
    return [];
  }
}

export function buildNewsletterCategories(
  articles: NewsletterArticle[],
  cmsTopicNames: string[] = [],
): string[] {
  const names = new Set<string>();
  for (const topic of cmsTopicNames) {
    const trimmed = topic.trim();
    if (trimmed) names.add(trimmed);
  }
  for (const article of articles) {
    const trimmed = article.category.trim();
    if (trimmed) names.add(trimmed);
  }

  if (names.size === 0) return FALLBACK_CATEGORIES;
  return ['All', ...Array.from(names).sort((a, b) => a.localeCompare(b))];
}
