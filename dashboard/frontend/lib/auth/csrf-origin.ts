import type { NextRequest } from 'next/server';

function parseOriginHost(value: string | null): string | null {
  if (!value?.trim()) return null;
  try {
    return new URL(value.trim()).host.toLowerCase();
  } catch {
    return null;
  }
}

function collectAllowedHosts(): Set<string> {
  const hosts = new Set<string>();
  const add = (url: string | undefined) => {
    const host = parseOriginHost(url?.startsWith('http') ? url : url ? `https://${url}` : null);
    if (host) hosts.add(host);
  };

  add(process.env.NEXT_PUBLIC_SITE_URL);
  add(process.env.NEXT_PUBLIC_DASHBOARD_URL);
  add(process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : undefined);
  add(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  const extras = process.env.AUTH_ALLOWED_ORIGINS?.split(',') ?? [];
  for (const entry of extras) add(entry.trim());

  if (process.env.NODE_ENV === 'development') {
    hosts.add('localhost:3000');
    hosts.add('127.0.0.1:3000');
    hosts.add('localhost:5174');
    hosts.add('127.0.0.1:5174');
  }

  return hosts;
}

/** Layer 5 — state-changing auth/CMS routes. */
export function assertSameOrigin(request: NextRequest): boolean {
  const allowed = collectAllowedHosts();
  const requestHost = request.headers.get('host')?.toLowerCase() ?? null;
  if (requestHost) allowed.add(requestHost);

  const originHost = parseOriginHost(request.headers.get('origin'));
  if (originHost) return allowed.has(originHost);

  const referer = request.headers.get('referer');
  const refererHost = referer ? parseOriginHost(referer) : null;
  if (refererHost) return allowed.has(refererHost);

  return process.env.NODE_ENV === 'development';
}

export function invalidOriginResponse() {
  return new Response(JSON.stringify({ error: 'Invalid origin' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}
