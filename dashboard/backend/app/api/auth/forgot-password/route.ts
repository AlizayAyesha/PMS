import { NextRequest, NextResponse } from 'next/server';
import { assertSameOrigin } from '@/lib/auth/csrf-origin';
import { isKnownAdminEmail } from '@/lib/auth/known-users';
import { getUserCredentials } from '@/lib/auth/auth-db';
import { getSupabaseDashboardOne } from '@/lib/auth/supabase-admin';
import { generateResetToken, hashResetToken } from '@/lib/auth/password-crypto';
import { sendAuthEmail, isEmailConfigured } from '@/lib/auth/send-email';
import { writeAuthAuditLog } from '@/lib/auth/audit-log';

type Body = { email?: string };

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? '';
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const generic = NextResponse.json({
    ok: true,
    message: 'If that email is registered, a reset link was sent.',
  });

  if (!isKnownAdminEmail(email)) return generic;

  const creds = await getUserCredentials(email);
  if (!creds || !isEmailConfigured()) return generic;

  const token = generateResetToken();
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  const db = getSupabaseDashboardOne();
  await db.from('password_reset_tokens').insert({
    email,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  const link = `${siteUrl}/login/update-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  try {
    await sendAuthEmail({
      to: email,
      subject: 'Reset your PM Structure dashboard password',
      text: `Use this link to reset your password (valid 1 hour):\n\n${link}`,
    });
    await writeAuthAuditLog({ email, eventType: 'password_reset_requested' });
  } catch (err) {
    console.error('[forgot-password]', err);
  }

  return generic;
}
