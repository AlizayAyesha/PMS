import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAuthUser } from '@/lib/auth/get-supabase-auth-user';
import { assertSameOrigin } from '@/lib/auth/csrf-origin';
import { readDashboardSessionEmail } from '@/lib/auth/dashboard-session-cookie';
import { isKnownAdminEmail } from '@/lib/auth/known-users';
import { getSessionSecret, verifySignedSessionToken } from '@/lib/auth/session-token';
import { DEMO_SESSION_KEY } from '@/lib/demo-auth';

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

/** Layer 4 — CMS / mutation POST guard. */
export async function requireDashboardMutationAuth(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ success: false, error: 'Invalid origin' }, { status: 403 });
  }

  const cookieEmail = readDashboardSessionEmail(request);
  if (cookieEmail && isKnownAdminEmail(cookieEmail)) return null;

  const bearerEmail = getBearerSessionEmail(request);
  if (bearerEmail && isKnownAdminEmail(bearerEmail)) return null;

  const demo = request.cookies.get(DEMO_SESSION_KEY)?.value;
  if (demo === '1' || demo === 'true') {
    return NextResponse.json(
      { success: false, error: 'Demo login cannot mutate. Sign in with a real admin account.' },
      { status: 401 },
    );
  }

  try {
    const user = await getSupabaseAuthUser();
    if (user?.email && isKnownAdminEmail(user.email)) return null;
  } catch {
    /* fall through */
  }

  if (process.env.NODE_ENV === 'development' && !getSessionSecret() && assertSameOrigin(request)) {
    return null;
  }

  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}
