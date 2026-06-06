import type { User } from '@supabase/supabase-js';

export const DEMO_SESSION_KEY = 'pms_demo_admin_session';

export function isDemoLoginAllowed() {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_ALLOW_DEMO_LOGIN === 'true'
  );
}

export function isDemoCredentials(email: string, password: string) {
  const e = email.trim().toLowerCase();
  if (e === 'admin@pms.os' && password === 'admin') return true;
  if (e === 'admin@platform.os' && password === 'admin') return true;
  return false;
}

export function createDemoUser(email: string): User {
  const normalized = email.trim().toLowerCase() || 'admin@pms.os';
  return {
    id: 'demo-user-id',
    aud: 'authenticated',
    role: 'authenticated',
    email: normalized,
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: 'email' },
    user_metadata: { full_name: 'Demo Admin' },
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function persistDemoSession(email: string) {
  if (typeof window === 'undefined') return;
  const normalized = email.trim().toLowerCase() || 'admin@pms.os';
  sessionStorage.setItem(DEMO_SESSION_KEY, normalized);
  document.cookie = `${DEMO_SESSION_KEY}=${encodeURIComponent(normalized)}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearDemoSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(DEMO_SESSION_KEY);
  document.cookie = `${DEMO_SESSION_KEY}=; path=/; max-age=0`;
}

export function readDemoSessionEmail(): string | null {
  if (typeof window === 'undefined') return null;
  if (!isDemoLoginAllowed()) return null;
  return sessionStorage.getItem(DEMO_SESSION_KEY);
}
