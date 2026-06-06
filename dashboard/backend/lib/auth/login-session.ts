import { NextResponse } from 'next/server';
import { appendDashboardSessionCookie } from '@/lib/auth/dashboard-session-cookie';
import { createSignedSessionToken, getSessionSecret } from '@/lib/auth/session-token';

export function issueLoginSession(
  email: string,
  response: NextResponse,
): { sessionToken: string } | null {
  const secret = getSessionSecret();
  if (!secret) return null;
  const sessionToken = createSignedSessionToken(email, secret);
  appendDashboardSessionCookie(response, sessionToken);
  return { sessionToken };
}

/** Build success response with Set-Cookie from issueLoginSession. */
export function buildLoginSuccessResponse(
  email: string,
  payload: Record<string, unknown>,
): NextResponse {
  const secret = getSessionSecret();
  if (!secret) {
    return NextResponse.json(
      { error: 'AUTH_SESSION_SECRET is not configured' },
      { status: 503 },
    );
  }
  const sessionToken = createSignedSessionToken(email, secret);
  const response = NextResponse.json({ success: true, sessionToken, email, ...payload });
  appendDashboardSessionCookie(response, sessionToken);
  return response;
}

export function isLegacyLoginEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return process.env.AUTH_LEGACY_LOGIN === 'true';
  }
  return (
    process.env.AUTH_LEGACY_LOGIN === 'true' ||
    process.env.NEXT_PUBLIC_AUTH_LEGACY_LOGIN === 'true'
  );
}
