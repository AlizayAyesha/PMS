import { getSupabaseDashboardOne } from '@/lib/auth/supabase-admin';

export type AuditEventType =
  | 'login_success'
  | 'login_failed'
  | 'login_otp_sent'
  | 'login_otp_failed'
  | 'login_otp_success'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'bootstrap_password'
  | 'security_config_updated';

export async function writeAuthAuditLog(params: {
  email?: string | null;
  eventType: AuditEventType;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const db = getSupabaseDashboardOne();
    await db.from('auth_audit_log').insert({
      email: params.email ?? null,
      event_type: params.eventType,
      ip_address: params.ipAddress ?? null,
      user_agent: params.userAgent ?? null,
      metadata: params.metadata ?? {},
    });
  } catch (err) {
    console.error('[auth-audit]', err);
  }
}
