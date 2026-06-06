import { NextRequest, NextResponse } from 'next/server';
import { assertSameOrigin } from '@/lib/auth/csrf-origin';
import { upsertUserPassword } from '@/lib/auth/auth-db';
import { getSupabaseDashboardOne } from '@/lib/auth/supabase-admin';
import { hashResetToken } from '@/lib/auth/password-crypto';
import { writeAuthAuditLog } from '@/lib/auth/audit-log';

type Body = { email?: string; token?: string; password?: string };

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
  const token = body.token?.trim() ?? '';
  const password = body.password ?? '';
  if (!email || !token || !password) {
    return NextResponse.json({ error: 'email, token, and password are required' }, { status: 400 });
  }
  if (password.length < 12) {
    return NextResponse.json({ error: 'Password must be at least 12 characters' }, { status: 400 });
  }

  const db = getSupabaseDashboardOne();
  const tokenHash = hashResetToken(token);
  const { data: row, error } = await db
    .from('password_reset_tokens')
    .select('*')
    .eq('email', email)
    .eq('token_hash', tokenHash)
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !row) {
    return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
  }
  if (new Date(row.expires_at as string) < new Date()) {
    return NextResponse.json({ error: 'Reset link expired' }, { status: 400 });
  }

  const { data: history } = await db
    .from('password_history')
    .select('password_hash')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(5);

  const { verifyPassword } = await import('@/lib/auth/password-crypto');
  for (const h of history ?? []) {
    if (await verifyPassword(password, h.password_hash as string)) {
      return NextResponse.json(
        { error: 'Cannot reuse one of your last 5 passwords' },
        { status: 400 },
      );
    }
  }

  await upsertUserPassword(email, password);
  await db
    .from('password_reset_tokens')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', row.id);
  await db
    .from('user_credentials')
    .update({ must_reset_password: false })
    .eq('email', email);

  await writeAuthAuditLog({ email, eventType: 'password_reset_completed' });
  return NextResponse.json({ ok: true });
}
