import { createHmac, randomBytes } from 'node:crypto';
import { GW_DASHBOARD_SESSION, getSessionSecret } from '@/lib/auth/session-constants';

export { GW_DASHBOARD_SESSION, getSessionSecret };

const SESSION_TTL_SEC = 7 * 24 * 60 * 60;

export function createSignedSessionToken(email: string, secret: string): string {
  const normalized = email.trim().toLowerCase();
  const payload = Buffer.from(
    JSON.stringify({
      email: normalized,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SEC,
      nonce: randomBytes(8).toString('hex'),
    }),
    'utf8',
  ).toString('base64url');
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${normalized}.${payload}.${sig}`;
}

export function verifySignedSessionToken(token: string, secret: string): string | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = parts[1];
    const expected = createHmac('sha256', secret).update(payload).digest('base64url');
    if (parts[2] !== expected) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      email?: string;
      exp?: number;
    };
    if (data.exp && Date.now() > data.exp * 1000) return null;
    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : null;
    if (!email || email !== parts[0]) return null;
    return email;
  } catch {
    return null;
  }
}
