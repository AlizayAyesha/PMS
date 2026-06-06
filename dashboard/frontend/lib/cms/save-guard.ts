import { getDashboardSessionToken } from '@/lib/auth/dashboard-api-headers';
import { readDemoSessionEmail } from '@/lib/demo-auth';

const USE_API_LOGIN = process.env.NEXT_PUBLIC_AUTH_USE_API_LOGIN === 'true';

/** Returns a user-facing reason when CMS draft/publish cannot save. */
export function getCmsSaveBlockReason(): string | null {
  if (readDemoSessionEmail()) {
    return 'Demo login cannot write to the CMS. Sign in with your real admin email and password.';
  }
  if (USE_API_LOGIN && !getDashboardSessionToken()) {
    return 'Not signed in for CMS writes. Log in at /login with your admin password (API login).';
  }
  return null;
}

export function toSyncErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}
