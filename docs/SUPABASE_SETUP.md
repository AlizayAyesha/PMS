# Connect Supabase to this repo — full database setup

Your app expects project **`vmuwflogvpaahgjjdlmr`** (see `frontend/.env.local`).

## Option A — SQL Editor (no password, recommended)

1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/vmuwflogvpaahgjjdlmr) → **SQL Editor**
2. Paste **entire file**: `supabase/manual-full-setup.sql`
3. Click **Run**
4. **Settings → API → Exposed schemas** → add **`dashboard_one`** if not listed
5. Verify:

```bash
npm run db:check-supabase
```

## Option B — Terminal (needs database password once)

1. Supabase → **Settings → Database → Database password**
2. Root `.env.local`:

```env
SUPABASE_DB_PASSWORD=your_password_here
```

3. Run:

```bash
npm run db:setup
npm run db:check-supabase
```

## Option C — Cursor Supabase MCP (agent runs migrations)

This repo includes `.cursor/mcp.json` linked to **`vmuwflogvpaahgjjdlmr`**:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=vmuwflogvpaahgjjdlmr"
    }
  }
}
```

1. **Reload Cursor** (or Settings → MCP → enable **supabase** and sign in when prompted)
2. Optional: `npx skills add supabase/agent-skills`
3. Ask agent: *"Run full database setup for PM Structure"*

> MCP project ref must match `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`.

## What gets created

| Area | Schema | Tables |
|------|--------|--------|
| CMS | `public` | `website_data`, `form_submissions` |
| Regional | `public` | `regions`, `orders`, `user_profiles`, … |
| Catalogue | `public` | `catalogue_meta`, `course_offerings` |
| Media | `storage` | `site-media` bucket |
| Dashboard login | `dashboard_one` | `user_credentials`, OTP, audit, … |

## After database setup

1. Set auth env vars (`AUTH_SESSION_SECRET`, `AUTH_BOOTSTRAP_SECRET`, …) — see `docs/auth/AUTH_SYSTEM.md`
2. Bootstrap admin password via `POST /api/auth/bootstrap-password`
3. `npm run dev` → login at `http://localhost:3000/login`
