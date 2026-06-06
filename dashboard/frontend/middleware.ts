import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { BOOKING_CRM_CTA_PATH } from '@/lib/dashboard/bookingCrmRedirects';
import { isDashboardRouteAuthorized } from '@/lib/auth/dashboard-page-auth';

/** Canonical CTA admin URL — no category/channel query params. */
export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith('/dashboard/members-revenue')) {
    const nextPath = pathname.replace('/dashboard/members-revenue', '/dashboard/booking-crm');
    const url = request.nextUrl.clone();
    url.pathname = nextPath === '/dashboard/booking-crm' ? BOOKING_CRM_CTA_PATH : nextPath;
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (
    pathname === BOOKING_CRM_CTA_PATH &&
    (searchParams.has('category') || searchParams.has('channel'))
  ) {
    const url = request.nextUrl.clone();
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const authorized = await isDashboardRouteAuthorized(request);
    if (!authorized) {
      const login = request.nextUrl.clone();
      login.pathname = '/login';
      login.searchParams.set('next', pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/booking-crm/cta',
    '/dashboard/members-revenue/:path*',
    '/dashboard',
    '/dashboard/:path*',
  ],
};
