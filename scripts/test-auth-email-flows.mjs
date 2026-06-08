/**
 * Test forgot-password + email OTP login flows (local dev).
 * Usage: node scripts/test-auth-email-flows.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash, randomBytes } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BASE = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const EMAIL = process.env.TEST_ADMIN_EMAIL || 'nauticalinsights.ai@gmail.com';

const ENV_FILES = [
  path.join(ROOT, 'dashboard', 'backend', '.env.local'),
  path.join(ROOT, '.env.local'),
];

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

const env = {};
for (const f of ENV_FILES) Object.assign(env, loadEnv(f));
for (const [k, v] of Object.entries(env)) {
  if (!process.env[k]) process.env[k] = v;
}

function hashResetToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function hashOtpCode(code) {
  return createHash('sha256').update(code.trim()).digest('hex');
}

async function post(path, body, headers = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE, ...headers },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  return { status: res.status, data };
}

async function waitForServer(maxMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(5000) });
      if (res.ok || res.status === 307) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Server not ready at ${BASE}`);
}

async function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key, { db: { schema: 'dashboard_one' } });
}

async function bootstrapPassword(password) {
  const secret = process.env.AUTH_BOOTSTRAP_SECRET;
  if (!secret) return;
  const res = await fetch(`${BASE}/api/auth/bootstrap-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-bootstrap-secret': secret,
    },
    body: JSON.stringify({ email: EMAIL, password }),
  });
  console.log('  bootstrap:', res.status, await res.text());
}

async function testForgotPassword(db) {
  console.log('\n=== Forgot password ===');
  const before = await db
    .from('password_reset_tokens')
    .select('id', { count: 'exact', head: true })
    .eq('email', EMAIL);

  const forgot = await post('/api/auth/forgot-password', { email: EMAIL });
  console.log('  forgot-password:', forgot.status, forgot.data);
  if (forgot.status !== 200) throw new Error('forgot-password failed');

  await new Promise((r) => setTimeout(r, 1500));

  const { data: tokens, error } = await db
    .from('password_reset_tokens')
    .select('id, created_at, consumed_at')
    .eq('email', EMAIL)
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;
  if (!tokens?.length) {
    throw new Error('No reset token created — user may not exist in user_credentials');
  }
  console.log('  reset token created in DB:', tokens[0].id);
  console.log('  check inbox for reset email (SMTP)');

  const token = randomBytes(32).toString('base64url');
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  await db.from('password_reset_tokens').insert({
    email: EMAIL,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  const testPassword = `AuthFlow${Date.now()}Xy12!`;
  const reset = await post('/api/auth/reset-password', {
    email: EMAIL,
    token,
    password: testPassword,
  });
  console.log('  reset-password:', reset.status, reset.data);
  if (reset.status !== 200) throw new Error('reset-password failed');

  const login = await post('/api/auth/login', { email: EMAIL, password: testPassword });
  console.log('  login after reset:', login.status, login.data.requiresOtp ? 'OTP step' : login.data.sessionToken ? 'session ok' : login.data);
  if (login.status !== 200) throw new Error('login after reset failed');

  await bootstrapPassword(testPassword);
  console.log('  forgot-password flow: PASS');
  return testPassword;
}

async function testEmailOtp(db, loginPassword) {
  console.log('\n=== Email OTP (new device) ===');

  await db.from('trusted_login_fingerprints').delete().eq('email', EMAIL);

  const { data: settings } = await db
    .from('login_security_settings')
    .select('email_new_device_login_enabled')
    .eq('id', 'default')
    .maybeSingle();

  if (!settings?.email_new_device_login_enabled) {
    throw new Error('email_new_device_login_enabled is false in DB');
  }
  console.log('  email OTP enabled in security settings');

  const uniqueUa = `AuthFlowTest/${Date.now()}`;
  const login = await post(
    '/api/auth/login',
    { email: EMAIL, password: loginPassword },
    { 'User-Agent': uniqueUa },
  );
  console.log('  login (new device):', login.status, login.data);
  if (login.status !== 200) throw new Error('login did not return 200');
  if (!login.data.requiresOtp) throw new Error('expected requiresOtp for new device');
  if (!login.data.otpChannels?.email) throw new Error('expected email OTP channel');
  console.log('  OTP challenge created, email channel active');
  console.log('  check inbox for 6-digit login code (SMTP)');

  const testCode = '847291';

  const { error: updateErr } = await db
    .from('login_sms_otp_challenges')
    .update({ code_hash: hashOtpCode(testCode) })
    .eq('id', login.data.challengeId);

  if (updateErr) throw updateErr;

  const verify = await post(
    '/api/auth/verify-login-sms',
    { challengeId: login.data.challengeId, code: testCode, email: EMAIL },
    { 'User-Agent': uniqueUa },
  );
  console.log('  verify OTP:', verify.status, verify.data.sessionToken ? 'session ok' : verify.data);
  if (verify.status !== 200 || !verify.data.sessionToken) {
    throw new Error('OTP verify failed');
  }
  console.log('  email OTP flow: PASS');
}

async function main() {
  console.log(`Testing auth email flows at ${BASE} for ${EMAIL}`);
  await waitForServer();

  const smtpOk = Boolean(process.env.SMTP_HOST?.trim() || process.env.RESEND_API_KEY?.trim());
  console.log('  SMTP/Resend configured:', smtpOk);
  if (!smtpOk) {
    console.warn('  Warning: no SMTP — emails will not reach inbox');
  }

  const db = await getDb();
  const loginPassword = await testForgotPassword(db);
  await testEmailOtp(db, loginPassword);

  console.log('\nAll automated auth email flow checks passed.');
  console.log('Manual: confirm reset + OTP emails arrived at', EMAIL);
}

main().catch((err) => {
  console.error('\nFAILED:', err.message);
  process.exit(1);
});
