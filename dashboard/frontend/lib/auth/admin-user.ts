import type { User } from '@supabase/supabase-js';

/** Synthetic Supabase-shaped user for dashboard_one API login (no Supabase Auth user). */
export function createAdminUser(email: string): User {
  const normalized = email.trim().toLowerCase();
  const now = new Date().toISOString();
  return {
    id: `admin-${normalized}`,
    aud: 'authenticated',
    role: 'authenticated',
    email: normalized,
    email_confirmed_at: now,
    phone: '',
    confirmed_at: now,
    last_sign_in_at: now,
    app_metadata: { provider: 'dashboard_one' },
    user_metadata: { full_name: 'Dashboard Admin' },
    identities: [],
    created_at: now,
    updated_at: now,
  };
}
