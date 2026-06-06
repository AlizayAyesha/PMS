import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRoute } from '@/lib/auth/admin-route-auth';
import { getSupabaseDashboardOne } from '@/lib/auth/supabase-admin';

export async function GET(request: NextRequest) {
  const auth = await requireAdminRoute(request);
  if (auth instanceof NextResponse) return auth;

  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') || 50), 200);
  const db = getSupabaseDashboardOne();
  const { data, error } = await db
    .from('auth_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ logs: data ?? [] });
}
