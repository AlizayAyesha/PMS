import { NextRequest, NextResponse } from 'next/server';
import { requireDashboardMutationAuth } from '@/lib/auth/api-guard';
import { getSupabaseAdmin } from '@/lib/auth/supabase-admin';

type Body = {
  action?: 'saveDraft' | 'publish' | 'list';
  fieldKey?: string;
  content?: Record<string, unknown>;
  view?: 'draft' | 'published';
};

export async function GET(request: NextRequest) {
  const auth = await requireDashboardMutationAuth(request);
  if (auth) return auth;

  const view = request.nextUrl.searchParams.get('view') === 'published' ? 'published' : 'draft';
  const admin = getSupabaseAdmin();
  let query = admin.from('website_data').select('*');
  if (view === 'published') query = query.eq('is_published', true);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireDashboardMutationAuth(request);
  if (auth) return auth;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const fieldKey = body.fieldKey?.trim();
  if (!fieldKey) {
    return NextResponse.json({ error: 'fieldKey is required' }, { status: 400 });
  }

  if (body.action === 'saveDraft') {
    const { error } = await admin.from('website_data').upsert(
      {
        field_key: fieldKey,
        content: body.content ?? {},
        is_published: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'field_key' },
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'publish') {
    const { error } = await admin
      .from('website_data')
      .update({ is_published: true, updated_at: new Date().toISOString() })
      .eq('field_key', fieldKey);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
