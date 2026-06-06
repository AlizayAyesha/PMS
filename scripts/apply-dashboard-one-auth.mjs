/**
 * Apply dashboard_one auth SQL only (no full migration set).
 * Usage:
 *   SUPABASE_DB_PASSWORD=your_db_password npm run db:apply-auth
 * or set DATABASE_URL in root .env.local
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = {};
for (const file of ENV_FILES) Object.assign(env, loadEnvFile(file));

function projectRef() {
  const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || '';
  const m = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return m?.[1] ?? null;
}

const ref = projectRef();
let databaseUrl = env.DATABASE_URL || env.SUPABASE_DB_URL;
const dbPassword = process.env.SUPABASE_DB_PASSWORD || env.SUPABASE_DB_PASSWORD;

if ((!databaseUrl || databaseUrl.includes('YOUR_DB_PASSWORD')) && dbPassword && ref) {
  databaseUrl = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${ref}.supabase.co:5432/postgres`;
}

if (!databaseUrl || databaseUrl.includes('YOUR_DB_PASSWORD')) {
  console.error(`
Missing database password for project ${ref ?? 'unknown'}.

Quick fix (one line in root .env.local):

  SUPABASE_DB_PASSWORD=your_database_password

Or full URI:

  DATABASE_URL=postgresql://postgres:PASSWORD@db.${ref ?? 'YOUR_REF'}.supabase.co:5432/postgres

Get password: Supabase → Project Settings → Database → Database password / Connection string

Then run: npm run db:apply-auth
`);
  process.exit(1);
}

const sqlPath = path.join(ROOT, 'supabase', 'manual-dashboard-one-auth.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const { default: pg } = await import('pg');
const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log(`Connected to ${ref}. Applying dashboard_one auth SQL...`);
  await client.query(sql);
  console.log('✓ Auth tables applied.');
  console.log('\nNext: Supabase → Settings → API → Exposed schemas → add "dashboard_one"');
  console.log('Then: npm run db:check-supabase');
} catch (err) {
  console.error('Failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
