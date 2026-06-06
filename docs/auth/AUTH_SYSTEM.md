# PM Structure — dashboard_one authentication

Production admin login uses **`dashboard_one`** in your **PM Structure Supabase project** (separate from Sh3ikhMABZ main site). Passwords are **scrypt** hashes in `dashboard_one.user_credentials`, not Supabase Auth users.

## Architecture

| Layer | Implementation |
|-------|----------------|
| Allowlist | `dashboard/frontend/constants/admin-users.ts` + `DASHBOARD_ADMIN_EMAILS` |
| Password | `dashboard_one.user_credentials` via **service role** |
| Session | HMAC `gw_dashboard_session` + `localStorage.auth_api_token` |
| CMS writes | `POST /api/cms/website-data` (service role, mutation auth) |
| OTP | Twilio SMS + Resend/SMTP email on new device fingerprint |
| Public CMS data | `public.website_data` (unchanged) |

## One-time Supabase setup (your side)

1. **Settings → API** — copy Project URL, anon key, **service_role** key.
2. **Settings → API → Exposed schemas** — add **`dashboard_one`**.
3. Set **`DATABASE_URL`** in repo root `.env` (Database connection string).
4. Run migrations:

```bash
npm run db:migrate
npm run db:check-supabase
```

## `.env.local` (dashboard backend + frontend)

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_USE_API_LOGIN=true

AUTH_SESSION_SECRET=          # openssl rand -base64 32
AUTH_BOOTSTRAP_SECRET=        # openssl rand -base64 32

NEXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Email (OTP + reset) — Resend OR SMTP
RESEND_API_KEY=re_...
AUTH_EMAIL_FROM=onboarding@resend.dev
AUTH_EMAIL_FROM_NAME=PM Structure

# SMS OTP (optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_MESSAGING_SERVICE_SID=
```

Restart `npm run dev` after changing `NEXT_PUBLIC_*`.

## Bootstrap first password

```bash
curl -X POST http://localhost:3000/api/auth/bootstrap-password \
  -H "Content-Type: application/json" \
  -H "x-bootstrap-secret: YOUR_AUTH_BOOTSTRAP_SECRET" \
  -d '{"email":"nauticalinsights.ai@gmail.com","password":"YourSecurePassword12+"}'
```

Then sign in at **http://localhost:3000/login**.

## OTP (optional)

1. Dashboard → **Site System → Security** — enable SMS/email new-device toggles.
2. Set **E.164 phone** on the same page for SMS.
3. Configure Twilio + Resend in `.env.local`.
4. Test in **incognito** — password OK → 6-digit code → verify → dashboard.

## API routes

| Route | Purpose |
|-------|---------|
| `POST /api/auth/login` | Password + optional OTP challenge |
| `POST /api/auth/verify-login-sms` | Complete OTP |
| `POST /api/auth/bootstrap-password` | First password (bootstrap secret header) |
| `POST /api/auth/forgot-password` | Reset email |
| `POST /api/auth/reset-password` | Set new password from link |
| `GET/PUT /api/auth/security-config` | Security toggles |
| `GET /api/auth/audit` | Audit log |
| `GET/PUT /api/auth/my-phone` | SMS number |
| `GET /api/auth/session` | Validate session |
| `GET/POST /api/cms/website-data` | CMS draft/publish |

## Same password as main Sh3ikhMABZ site?

Only if both sites point at the **same Supabase project** and same `dashboard_one.user_credentials` row. PM Structure uses its **own** project by default — bootstrap the **same password string** once on PM Structure’s DB.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Invalid origin` | `NEXT_PUBLIC_SITE_URL` = exact browser URL |
| `Invalid email or password` | Run bootstrap; email in allowlist |
| CMS Sync Error | Log in; need `auth_api_token` + API login |
| `db:check-supabase` fails | Expose `dashboard_one`; run `db:migrate` |
| OTP 503 | Enable Resend/Twilio; set phone; or disable OTP toggles |
