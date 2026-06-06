import { createHash } from 'node:crypto';
import type { NextRequest } from 'next/server';

export function getRequestIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

export function getLoginFingerprint(request: NextRequest): {
  ip: string;
  userAgent: string;
  hash: string;
} {
  const ip = getRequestIp(request);
  const userAgent = request.headers.get('user-agent')?.trim() || 'unknown';
  const hash = createHash('sha256').update(`${ip}|${userAgent}`).digest('hex');
  return { ip, userAgent, hash };
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  const visible = local.length <= 2 ? local[0] : local[0] + '***';
  return `${visible}@${domain}`;
}

export function phoneLast4(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return null;
  return digits.slice(-4);
}
