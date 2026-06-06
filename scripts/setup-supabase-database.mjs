/**
 * Apply full PM Structure database setup from this repo.
 *
 * Usage:
 *   npm run db:setup
 *
 * Requires ONE of:
 *   - SUPABASE_DB_PASSWORD in root .env.local
 *   - DATABASE_URL in root .env.local
 *   - Or paste supabase/manual-full-setup.sql in Supabase SQL Editor (no password)
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

const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || '';
const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? 'unknown';

const dbPassword = process.env.SUPABASE_DB_PASSWORD || env.SUPABASE_DB_PASSWORD;
let databaseUrl = env.DATABASE_URL || env.SUPABASE_DB_URL;
if ((!databaseUrl || databaseUrl.includes('YOUR_DB_PASSWORD')) && dbPassword && ref !== 'unknown') {
  databaseUrl = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${ref}.supabase.co:5432/postgres`;
}

const fullSqlPath = path.join(ROOT, 'supabase', 'manual-full-setup.sql');
const migrationsDir = path.join(ROOT, 'supabase', 'migrations');

if (!databaseUrl || databaseUrl.includes('YOUR_DB_PASSWORD')) {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  PM Structure — Supabase database setup                      ║
╚══════════════════════════════════════════════════════════════╝

Project in .env.local: ${ref}
https://supabase.com/dashboard/project/${ref}

No database password in .env.local — use SQL Editor (no password needed):

  1. Open SQL Editor for project ${ref}
  2. Paste entire file: supabase/manual-full-setup.sql
  3. Click Run
  4. Settings → API → Exposed schemas → ensure "dashboard_one" is listed
  5. npm run db:check-supabase

── OR automate from terminal ──

Add to root .env.local:
  SUPABASE_DB_PASSWORD=your_database_password

(Get it: Supabase → Settings → Database → Database password)

Then run: npm run db:setup

── OR link Cursor Supabase MCP ──

Cursor → Settings → MCP → Supabase → connect project ${ref}
Then ask the agent to "run db setup migrations"
`);
  process.exit(1);
}

const { default: pg } = await import('pg');
const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log(`Connected to Supabase project ${ref}\n`);

  const useFull = fs.existsSync(fullSqlPath);
  if (useFull) {
    console.log('Applying supabase/manual-full-setup.sql ...');
    await client.query(fs.readFileSync(fullSqlPath, 'utf8'));
    console.log('✓ Full setup applied.');
  } else {
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
    for (const file of files) {
      console.log(`  → ${file}`);
      await client.query(fs.readFileSync(path.join(migrationsDir, file), 'utf8'));
    }
    console.log('✓ All migrations applied.');
  }

  console.log('\nVerify: npm run db:check-supabase');
  console.log('Then bootstrap admin password (see docs/auth/AUTH_SYSTEM.md)');
} catch (err) {
  console.error('Setup failed:', err.message);
  console.error('\nFallback: paste supabase/manual-full-setup.sql in Supabase SQL Editor.');
  process.exit(1);
} finally {
  await client.end();
}
