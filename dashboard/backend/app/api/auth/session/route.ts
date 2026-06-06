import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRoute } from '@/lib/auth/admin-route-auth';

export async function GET(request: NextRequest) {
  const auth = await requireAdminRoute(request);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json({ ok: true, email: auth.email });
}
