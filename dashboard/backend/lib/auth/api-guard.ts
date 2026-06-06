import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { assertSameOrigin } from '@/lib/auth/csrf-origin';
import { isKnownAdminEmail } from '@/lib/auth/known-users';
import { getSessionSecret, verifySignedSessionToken } from '@/lib/auth/session-token';

export function getBearerSessionEmail(request: NextRequest): string | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7).trim();
  if (!token) return null;

  const secret = getSessionSecret();
  if (secret) {
    const signedEmail = verifySignedSessionToken(token, secret);
    if (signedEmail) return signedEmail;
  }

  return decodeJwtEmail(token);
}

function decodeJwtEmail(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      email?: string;
    };
    return typeof data.email === 'string' ? data.email.trim().toLowerCase() : null;
  } catch {
    return null;
  }
}

export function readDashboardSessionEmailFromRequest(request: NextRequest): string | null {
  const secret = getSessionSecret();
  const token = request.cookies.get('gw_dashboard_session')?.value?.trim();
  if (token && secret) {
    return verifySignedSessionToken(token, secret);
  }
  return null;
}

export async function requireDashboardMutationAuth(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ success: false, error: 'Invalid origin' }, { status: 403 });
  }

  const cookieEmail = readDashboardSessionEmailFromRequest(request);
  if (cookieEmail && isKnownAdminEmail(cookieEmail)) return null;

  const bearerEmail = getBearerSessionEmail(request);
  if (bearerEmail && isKnownAdminEmail(bearerEmail)) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anon) {
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : request.cookies.get('sb-access-token')?.value;
    if (accessToken) {
      const supabase = createClient(url, anon);
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (!error && data.user?.email && isKnownAdminEmail(data.user.email)) {
        return null;
      }
    }
  }

  if (process.env.NODE_ENV === 'development' && !getSessionSecret() && assertSameOrigin(request)) {
    return null;
  }

  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}
