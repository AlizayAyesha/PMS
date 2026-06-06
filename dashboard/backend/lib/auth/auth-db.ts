import { getSupabaseDashboardOne } from '@/lib/auth/supabase-admin';
import { hashPassword, verifyPassword } from '@/lib/auth/password-crypto';

export type LoginSecuritySettings = {
  id: string;
  password_login_enabled: boolean;
  force_password_reset: boolean;
  login_alerts_enabled: boolean;
  sms_new_device_login_enabled: boolean;
  email_new_device_login_enabled: boolean;
};

export type UserCredentialRow = {
  email: string;
  password_hash: string;
  phone_e164: string | null;
  must_reset_password: boolean;
};

export async function getLoginSecuritySettings(): Promise<LoginSecuritySettings> {
  const db = getSupabaseDashboardOne();
  const { data, error } = await db
    .from('login_security_settings')
    .select('*')
    .eq('id', 'default')
    .maybeSingle();
  if (error) throw error;
  return (
    data ?? {
      id: 'default',
      password_login_enabled: true,
      force_password_reset: false,
      login_alerts_enabled: false,
      sms_new_device_login_enabled: false,
      email_new_device_login_enabled: false,
    }
  ) as LoginSecuritySettings;
}

export async function updateLoginSecuritySettings(
  patch: Partial<Omit<LoginSecuritySettings, 'id'>>,
): Promise<LoginSecuritySettings> {
  const db = getSupabaseDashboardOne();
  const { data, error } = await db
    .from('login_security_settings')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', 'default')
    .select('*')
    .single();
  if (error) throw error;
  return data as LoginSecuritySettings;
}

export async function getUserCredentials(email: string): Promise<UserCredentialRow | null> {
  const db = getSupabaseDashboardOne();
  const { data, error } = await db
    .from('user_credentials')
    .select('email, password_hash, phone_e164, must_reset_password')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return (data as UserCredentialRow | null) ?? null;
}

export async function verifyUserPassword(email: string, password: string): Promise<boolean> {
  const row = await getUserCredentials(email);
  if (!row?.password_hash) return false;
  return verifyPassword(password, row.password_hash);
}

export async function upsertUserPassword(email: string, password: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const password_hash = await hashPassword(password);
  const db = getSupabaseDashboardOne();
  const { error } = await db.from('user_credentials').upsert(
    {
      email: normalized,
      password_hash,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'email' },
  );
  if (error) throw error;
  await db.from('password_history').insert({ email: normalized, password_hash });
}

export async function isTrustedFingerprint(email: string, fingerprintHash: string): Promise<boolean> {
  const db = getSupabaseDashboardOne();
  const { data, error } = await db
    .from('trusted_login_fingerprints')
    .select('id')
    .eq('email', email)
    .eq('fingerprint_hash', fingerprintHash)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function trustFingerprint(params: {
  email: string;
  fingerprintHash: string;
  ip: string;
  userAgent: string;
}): Promise<void> {
  const db = getSupabaseDashboardOne();
  const { error } = await db.from('trusted_login_fingerprints').upsert(
    {
      email: params.email,
      fingerprint_hash: params.fingerprintHash,
      ip_address: params.ip,
      user_agent: params.userAgent,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: 'email,fingerprint_hash' },
  );
  if (error) throw error;
}

export async function createOtpChallenge(params: {
  email: string;
  codeHash: string;
  fingerprintHash: string;
  ip: string;
  userAgent: string;
  expiresAt: Date;
}): Promise<string> {
  const db = getSupabaseDashboardOne();
  const { data, error } = await db
    .from('login_sms_otp_challenges')
    .insert({
      email: params.email,
      code_hash: params.codeHash,
      fingerprint_hash: params.fingerprintHash,
      ip_address: params.ip,
      user_agent: params.userAgent,
      expires_at: params.expiresAt.toISOString(),
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function verifyOtpChallenge(
  challengeId: string,
  email: string,
  code: string,
): Promise<
  | { ok: false; reason: string }
  | { ok: true; fingerprintHash: string; ip: string; userAgent: string }
> {
  const db = getSupabaseDashboardOne();
  const { data: row, error } = await db
    .from('login_sms_otp_challenges')
    .select('*')
    .eq('id', challengeId)
    .eq('email', email)
    .maybeSingle();
  if (error || !row) return { ok: false, reason: 'Invalid challenge' };
  if (row.consumed_at) return { ok: false, reason: 'Code already used' };
  if (new Date(row.expires_at as string) < new Date()) {
    return { ok: false, reason: 'Code expired' };
  }
  if ((row.attempts as number) >= 5) return { ok: false, reason: 'Too many attempts' };

  const { hashOtpCode } = await import('@/lib/auth/password-crypto');
  const match = row.code_hash === hashOtpCode(code);
  if (!match) {
    await db
      .from('login_sms_otp_challenges')
      .update({ attempts: (row.attempts as number) + 1 })
      .eq('id', challengeId);
    return { ok: false, reason: 'Invalid code' };
  }

  await db
    .from('login_sms_otp_challenges')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', challengeId);
  return {
    ok: true,
    fingerprintHash: row.fingerprint_hash as string,
    ip: (row.ip_address as string) || '',
    userAgent: (row.user_agent as string) || '',
  };
}

export async function setUserPhone(email: string, phoneE164: string | null): Promise<void> {
  const db = getSupabaseDashboardOne();
  const { error } = await db
    .from('user_credentials')
    .update({ phone_e164: phoneE164, updated_at: new Date().toISOString() })
    .eq('email', email);
  if (error) throw error;
}
