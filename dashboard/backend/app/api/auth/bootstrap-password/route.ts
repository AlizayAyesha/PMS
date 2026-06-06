import { NextRequest, NextResponse } from 'next/server';
import { assertSameOrigin } from '@/lib/auth/csrf-origin';
import { isKnownAdminEmail } from '@/lib/auth/known-users';
import { getUserCredentials, upsertUserPassword } from '@/lib/auth/auth-db';
import { writeAuthAuditLog } from '@/lib/auth/audit-log';
import { isSupabaseAdminConfigured } from '@/lib/auth/supabase-admin';

type Body = { email?: string; password?: string };

export async function POST(request: NextRequest) {
  const bootstrapSecret = process.env.AUTH_BOOTSTRAP_SECRET?.trim();
  if (!bootstrapSecret) {
    return NextResponse.json({ error: 'AUTH_BOOTSTRAP_SECRET is not configured' }, { status: 503 });
  }

  const headerSecret = request.headers.get('x-bootstrap-secret')?.trim();
  if (headerSecret !== bootstrapSecret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Supabase admin is not configured' }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? '';
  const password = body.password ?? '';
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }
  if (password.length < 12) {
    return NextResponse.json({ error: 'Password must be at least 12 characters' }, { status: 400 });
  }
  if (!isKnownAdminEmail(email)) {
    return NextResponse.json({ error: 'Email is not in admin allowlist' }, { status: 403 });
  }

  const existing = await getUserCredentials(email);
  if (existing?.password_hash && process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Password already set. Use forgot-password or Security UI.' },
      { status: 409 },
    );
  }

  await upsertUserPassword(email, password);
  await writeAuthAuditLog({
    email,
    eventType: 'bootstrap_password',
    metadata: { hadExisting: Boolean(existing) },
  });

  return NextResponse.json({ ok: true, email });
}
