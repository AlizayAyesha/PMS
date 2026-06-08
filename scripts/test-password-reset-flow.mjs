/**
 * Smoke-test dashboard password reset (local dev).
 * Requires: npm run dev, dashboard_one exposed, bootstrapped user.
 *
 * Usage: node scripts/test-password-reset-flow.mjs
 */
import { createHash, randomBytes } from 'node:crypto';

const BASE = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const EMAIL = process.env.TEST_ADMIN_EMAIL || 'nauticalinsights.ai@gmail.com';
const OLD_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'TestResetFlow12!';
const NEW_PASSWORD = process.env.TEST_NEW_PASSWORD || 'TestResetFlow99!';

function hashResetToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
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

async function main() {
  console.log(`Testing password reset against ${BASE} for ${EMAIL}\n`);

  const bootstrapSecret = process.env.AUTH_BOOTSTRAP_SECRET;
  if (bootstrapSecret) {
    const boot = await fetch(`${BASE}/api/auth/bootstrap-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bootstrap-secret': bootstrapSecret,
      },
      body: JSON.stringify({ email: EMAIL, password: OLD_PASSWORD }),
    });
    console.log('bootstrap:', boot.status, await boot.text());
  }

  const forgot = await post('/api/auth/forgot-password', { email: EMAIL });
  console.log('forgot-password:', forgot.status, forgot.data);

  const token = randomBytes(32).toString('base64url');
  const tokenHash = hashResetToken(token);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing Supabase env for direct token insert test');
    process.exit(1);
  }

  const { createClient } = await import('@supabase/supabase-js');
  const db = createClient(url, key, { db: { schema: 'dashboard_one' } });
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const { error: insertError } = await db.from('password_reset_tokens').insert({
    email: EMAIL,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });
  if (insertError) {
    console.error('token insert failed:', insertError.message);
    process.exit(1);
  }

  const reset = await post('/api/auth/reset-password', {
    email: EMAIL,
    token,
    password: NEW_PASSWORD,
  });
  console.log('reset-password:', reset.status, reset.data);
  if (reset.status !== 200) process.exit(1);

  const loginOld = await post('/api/auth/login', { email: EMAIL, password: OLD_PASSWORD });
  console.log('login old password (expect 401):', loginOld.status);

  const loginNew = await post('/api/auth/login', { email: EMAIL, password: NEW_PASSWORD });
  console.log('login new password:', loginNew.status, loginNew.data.error ? loginNew.data : 'ok');

  if (loginNew.status !== 200) process.exit(1);

  if (bootstrapSecret) {
    await fetch(`${BASE}/api/auth/bootstrap-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bootstrap-secret': bootstrapSecret,
      },
      body: JSON.stringify({ email: EMAIL, password: OLD_PASSWORD }),
    });
    console.log('\nRestored original test password via bootstrap.');
  }

  console.log('\nPassword reset flow OK.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
