import type { NextRequest, NextResponse } from 'next/server';
import { GW_DASHBOARD_SESSION, getSessionSecret, verifySignedSessionToken } from '@/lib/auth/session-token';

const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export function readDashboardSessionEmail(request: NextRequest): string | null {
  const secret = getSessionSecret();
  const token = request.cookies.get(GW_DASHBOARD_SESSION)?.value?.trim();
  if (token && secret) {
    return verifySignedSessionToken(token, secret);
  }
  return null;
}

export function appendDashboardSessionCookie(
  response: NextResponse,
  sessionToken: string,
): void {
  const secure = process.env.NODE_ENV === 'production';
  response.cookies.set(GW_DASHBOARD_SESSION, sessionToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}
