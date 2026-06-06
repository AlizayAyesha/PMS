import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRoute } from '@/lib/auth/admin-route-auth';
import { assertSameOrigin } from '@/lib/auth/csrf-origin';
import { getUserCredentials, setUserPhone } from '@/lib/auth/auth-db';

export async function GET(request: NextRequest) {
  const auth = await requireAdminRoute(request);
  if (auth instanceof NextResponse) return auth;
  const creds = await getUserCredentials(auth.email);
  return NextResponse.json({ phone_e164: creds?.phone_e164 ?? null });
}

export async function PUT(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  const auth = await requireAdminRoute(request);
  if (auth instanceof NextResponse) return auth;

  let body: { phone_e164?: string | null };
  try {
    body = (await request.json()) as { phone_e164?: string | null };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const phone = body.phone_e164?.trim() || null;
  if (phone && !/^\+[1-9]\d{7,14}$/.test(phone)) {
    return NextResponse.json({ error: 'phone_e164 must be E.164 format, e.g. +971501234567' }, { status: 400 });
  }

  await setUserPhone(auth.email, phone);
  return NextResponse.json({ phone_e164: phone });
}
