import { USERS_DATA } from '@/constants/admin-users';

const ALLOWLIST = new Set(
  USERS_DATA.filter((u) => u.status === 'active').map((u) => u.email.trim().toLowerCase()),
);

export function isKnownAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  if (ALLOWLIST.has(normalized)) return true;
  const extra = process.env.DASHBOARD_ADMIN_EMAILS?.split(',') ?? [];
  return extra.some((entry) => entry.trim().toLowerCase() === normalized);
}
