import type { NextRequest } from 'next/server';
import { DEMO_SESSION_KEY } from '@/lib/demo-auth';
import { verifySignedSessionTokenEdge } from '@/lib/auth/session-token-edge';
import { GW_DASHBOARD_SESSION, getSessionSecret } from '@/lib/auth/session-constants';
import { isKnownAdminEmail } from '@/lib/auth/known-users';

function readDemoCookieEmail(request: NextRequest): string | null {
  const demo = request.cookies.get(DEMO_SESSION_KEY)?.value?.trim();
  if (demo && demo.includes('@')) return decodeURIComponent(demo).toLowerCase();
  return null;
}

async function readGwSessionEmail(request: NextRequest): Promise<string | null> {
  const secret = getSessionSecret();
  const token = request.cookies.get(GW_DASHBOARD_SESSION)?.value?.trim();
  if (!token || !secret) return null;
  return verifySignedSessionTokenEdge(token, secret);
}

function hasSupabaseAuthCookies(request: NextRequest): boolean {
  return request.cookies.getAll().some((c) => c.name.startsWith('sb-'));
}

/**
 * Layer 3 — dashboard HTML routes (/dashboard/**).
 * Without AUTH_SESSION_SECRET in production, returns false (locked).
 */
export async function isDashboardRouteAuthorized(request: NextRequest): Promise<boolean> {
  const gwEmail = await readGwSessionEmail(request);
  if (gwEmail && isKnownAdminEmail(gwEmail)) return true;

  const demoEmail = readDemoCookieEmail(request);
  if (demoEmail && isKnownAdminEmail(demoEmail)) return true;

  const secret = getSessionSecret();
  if (!secret) {
    if (process.env.NODE_ENV === 'development') {
      return Boolean(gwEmail) || Boolean(demoEmail) || hasSupabaseAuthCookies(request);
    }
    return hasSupabaseAuthCookies(request);
  }

  return false;
}
