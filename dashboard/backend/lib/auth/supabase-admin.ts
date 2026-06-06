import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function getUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    ''
  );
}

function getServiceRole(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';
}

export function isSupabaseAdminConfigured(): boolean {
  const key = getServiceRole();
  return Boolean(getUrl() && key && !key.includes('placeholder'));
}

/** Service role client for `public` schema (CMS website_data). */
export function getSupabaseAdmin(): SupabaseClient {
  const url = getUrl();
  const key = getServiceRole();
  if (!url || !key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are required');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Service role client scoped to `dashboard_one` (credentials, OTP, audit). */
export function getSupabaseDashboardOne(): SupabaseClient {
  const url = getUrl();
  const key = getServiceRole();
  if (!url || !key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are required');
  }
  return createClient(url, key, {
    db: { schema: 'dashboard_one' },
    auth: { persistSession: false, autoRefreshToken: false },
  }) as unknown as SupabaseClient;
}
