/**
 * Verify dashboard_one auth (REST + optional direct Postgres).
 * Usage: node scripts/check-supabase-auth.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const ENV_FILES = [
  path.join(ROOT, '.env'),
  path.join(ROOT, '.env.local'),
  path.join(ROOT, 'frontend', '.env.local'),
  path.join(ROOT, 'backend', '.env.local'),
  path.join(ROOT, 'dashboard', 'frontend', '.env.local'),
  path.join(ROOT, 'dashboard', 'backend', '.env.local'),
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

const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const ref = url?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local files');
  process.exit(1);
}

console.log(`Project: ${url}\n`);

const tables = [
  'login_security_settings',
  'user_credentials',
  'auth_audit_log',
  'login_sms_otp_challenges',
  'trusted_login_fingerprints',
];

const db = createClient(url, key, { db: { schema: 'dashboard_one' } });
let restOk = 0;
let invalidSchema = false;

for (const table of tables) {
  const { error } = await db.from(table).select('*').limit(1);
  if (error) {
    if (error.message?.includes('Invalid schema')) invalidSchema = true;
    console.error(`✗ REST dashboard_one.${table}: ${error.message}`);
  } else {
    console.log(`✓ REST dashboard_one.${table}`);
    restOk++;
  }
}

if (restOk === tables.length) {
  console.log('\nAuth schema OK (API + tables).');
  process.exit(0);
}

// Optional: direct Postgres check (tables may exist but schema not exposed)
const dbPassword = process.env.SUPABASE_DB_PASSWORD || env.SUPABASE_DB_PASSWORD;
let databaseUrl = env.DATABASE_URL || env.SUPABASE_DB_URL;
if ((!databaseUrl || databaseUrl.includes('YOUR_DB_PASSWORD')) && dbPassword && ref) {
  databaseUrl = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${ref}.supabase.co:5432/postgres`;
}

if (databaseUrl && !databaseUrl.includes('YOUR_DB_PASSWORD')) {
  try {
    const { default: pg } = await import('pg');
    const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
    await client.connect();
    const { rows } = await client.query(
      `select table_name from information_schema.tables
       where table_schema = 'dashboard_one'
       order by table_name`,
    );
    await client.end();
    if (rows.length > 0) {
      console.log(`\nPostgres: dashboard_one has ${rows.length} table(s): ${rows.map((r) => r.table_name).join(', ')}`);
      if (invalidSchema) {
        console.error(`
FIX: Tables exist but API cannot see schema "dashboard_one".

Supabase Dashboard → Settings → API → Exposed schemas → add: dashboard_one
Then run this check again.
`);
        process.exit(1);
      }
    } else {
      console.error('\nPostgres: dashboard_one schema has NO tables yet.');
      console.error('Run: SUPABASE_DB_PASSWORD=xxx npm run db:apply-auth');
      console.error('Or paste supabase/manual-dashboard-one-auth.sql in SQL Editor.');
      process.exit(1);
    }
  } catch (err) {
    console.error(`\nPostgres check skipped: ${err.message}`);
  }
} else if (invalidSchema) {
  console.error(`
LIKELY FIX (no DB password set for deeper check):

1. Paste supabase/manual-dashboard-one-auth.sql in Supabase SQL Editor (project ${ref})
2. Settings → API → Exposed schemas → add "dashboard_one"
3. npm run db:check-supabase

Or set SUPABASE_DB_PASSWORD in root .env.local and run: npm run db:apply-auth
`);
}

process.exit(1);
