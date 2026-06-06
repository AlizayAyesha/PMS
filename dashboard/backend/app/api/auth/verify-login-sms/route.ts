import { NextRequest, NextResponse } from 'next/server';
import { assertSameOrigin } from '@/lib/auth/csrf-origin';
import { verifyOtpChallenge, trustFingerprint } from '@/lib/auth/auth-db';
import { writeAuthAuditLog } from '@/lib/auth/audit-log';
import { buildLoginSuccessResponse } from '@/lib/auth/login-session';
import { getLoginFingerprint } from '@/lib/auth/login-fingerprint';
import { getSessionSecret } from '@/lib/auth/session-token';

type Body = { challengeId?: string; code?: string; email?: string };

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  if (!getSessionSecret()) {
    return NextResponse.json({ error: 'AUTH_SESSION_SECRET is not configured' }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const challengeId = body.challengeId?.trim() ?? '';
  const code = body.code?.trim() ?? '';
  const email = body.email?.trim().toLowerCase() ?? '';
  if (!challengeId || !code || !email) {
    return NextResponse.json({ error: 'challengeId, code, and email are required' }, { status: 400 });
  }

  const fp = getLoginFingerprint(request);
  const result = await verifyOtpChallenge(challengeId, email, code);
  if (!result.ok) {
    await writeAuthAuditLog({
      email,
      eventType: 'login_otp_failed',
      ipAddress: fp.ip,
      userAgent: fp.userAgent,
      metadata: { reason: result.reason },
    });
    return NextResponse.json({ error: result.reason }, { status: 401 });
  }

  await trustFingerprint({
    email,
    fingerprintHash: result.fingerprintHash,
    ip: result.ip || fp.ip,
    userAgent: result.userAgent || fp.userAgent,
  });

  await writeAuthAuditLog({
    email,
    eventType: 'login_otp_success',
    ipAddress: fp.ip,
    userAgent: fp.userAgent,
  });

  return buildLoginSuccessResponse(email, {});
}
