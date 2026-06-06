import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getBearerSessionEmail } from '@/lib/auth/api-guard';
import { readDashboardSessionEmail } from '@/lib/auth/dashboard-session-cookie';
import { isKnownAdminEmail } from '@/lib/auth/known-users';
import { getSessionSecret } from '@/lib/auth/session-token';
import { assertSameOrigin } from '@/lib/auth/csrf-origin';

export async function requireAdminRoute(
  request: NextRequest,
): Promise<{ email: string } | NextResponse> {
  const cookieEmail = readDashboardSessionEmail(request);
  if (cookieEmail && isKnownAdminEmail(cookieEmail)) {
    return { email: cookieEmail };
  }

  const bearerEmail = getBearerSessionEmail(request);
  if (bearerEmail && isKnownAdminEmail(bearerEmail)) {
    return { email: bearerEmail };
  }

  if (process.env.NODE_ENV === 'development' && !getSessionSecret() && assertSameOrigin(request)) {
    return { email: bearerEmail ?? cookieEmail ?? 'dev@local' };
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
