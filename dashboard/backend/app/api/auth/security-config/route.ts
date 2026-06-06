import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRoute } from '@/lib/auth/admin-route-auth';
import { assertSameOrigin } from '@/lib/auth/csrf-origin';
import { getLoginSecuritySettings, updateLoginSecuritySettings } from '@/lib/auth/auth-db';
import { writeAuthAuditLog } from '@/lib/auth/audit-log';

export async function GET(request: NextRequest) {
  const auth = await requireAdminRoute(request);
  if (auth instanceof NextResponse) return auth;
  const settings = await getLoginSecuritySettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  const auth = await requireAdminRoute(request);
  if (auth instanceof NextResponse) return auth;

  let body: Record<string, boolean>;
  try {
    body = (await request.json()) as Record<string, boolean>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const patch: Record<string, boolean> = {};
  const keys = [
    'password_login_enabled',
    'force_password_reset',
    'login_alerts_enabled',
    'sms_new_device_login_enabled',
    'email_new_device_login_enabled',
  ] as const;
  for (const key of keys) {
    if (typeof body[key] === 'boolean') patch[key] = body[key];
  }

  const settings = await updateLoginSecuritySettings(patch);
  await writeAuthAuditLog({
    email: auth.email,
    eventType: 'security_config_updated',
    metadata: patch,
  });
  return NextResponse.json({ settings });
}
