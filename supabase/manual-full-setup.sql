-- ============================================================
-- PM Structure — FULL database setup (one paste in SQL Editor)
-- Project: vmuwflogvpaahgjjdlmr (or your PM Structure Supabase project)
-- Safe to re-run (idempotent where possible)
-- ============================================================

-- ── 1) CMS + forms (public) ──────────────────────────────────
create table if not exists public.website_data (
  id uuid primary key default gen_random_uuid(),
  field_key text unique not null,
  content jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null default 'contact',
  subject text,
  email text,
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  sheets_status text not null default 'na'
    check (sheets_status in ('synced', 'failed', 'pending', 'na'))
);

create index if not exists idx_form_submissions_created_at
  on public.form_submissions (created_at desc);
create index if not exists idx_website_data_published
  on public.website_data (is_published) where is_published = true;

alter table public.website_data enable row level security;
alter table public.form_submissions enable row level security;

drop policy if exists "Published website data is readable" on public.website_data;
create policy "Published website data is readable"
  on public.website_data for select using (is_published = true);

drop policy if exists "Authenticated users manage website data" on public.website_data;
create policy "Authenticated users manage website data"
  on public.website_data for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Public can submit forms" on public.form_submissions;
create policy "Public can submit forms"
  on public.form_submissions for insert with check (true);

drop policy if exists "Authenticated users read submissions" on public.form_submissions;
create policy "Authenticated users read submissions"
  on public.form_submissions for select using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users update submissions" on public.form_submissions;
create policy "Authenticated users update submissions"
  on public.form_submissions for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ── 2) Regional catalogue ────────────────────────────────────
create table if not exists public.regions (
  id text primary key,
  label text not null,
  default_price_display text,
  can_change_region boolean not null default true,
  mismatch_rule text,
  checkout_rule text,
  website_message text,
  sort_order int not null default 0
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  region_id text references public.regions (id),
  gcc_country text,
  residence_country text,
  billing_country text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  offering_id text not null,
  region_id text not null,
  email text not null,
  usd_cents int not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'cancelled')),
  stripe_session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.verification_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  region_id text,
  residence_country text,
  billing_country text,
  verified boolean not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_email on public.orders (email);
create index if not exists idx_orders_status on public.orders (status);

alter table public.regions enable row level security;
alter table public.user_profiles enable row level security;
alter table public.orders enable row level security;
alter table public.verification_logs enable row level security;

drop policy if exists "Regions are readable by everyone" on public.regions;
create policy "Regions are readable by everyone" on public.regions for select using (true);

drop policy if exists "Users read own profile" on public.user_profiles;
create policy "Users read own profile" on public.user_profiles for select using (auth.uid() = id);

drop policy if exists "Users update own profile" on public.user_profiles;
create policy "Users update own profile" on public.user_profiles for update using (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.user_profiles;
create policy "Users insert own profile" on public.user_profiles for insert with check (auth.uid() = id);

drop policy if exists "Authenticated read orders" on public.orders;
create policy "Authenticated read orders" on public.orders for select using (auth.role() = 'authenticated');

drop policy if exists "Service role manages orders" on public.orders;
create policy "Service role manages orders" on public.orders for all using (auth.role() = 'service_role');

drop policy if exists "Authenticated read verification logs" on public.verification_logs;
create policy "Authenticated read verification logs" on public.verification_logs for select using (auth.role() = 'authenticated');

insert into public.regions (
  id, label, default_price_display, can_change_region, mismatch_rule, checkout_rule, website_message, sort_order
) values
  ('global', 'Global / Unknown', 'Global USD', true, 'Use Global price unless validated otherwise', 'USD checkout', 'Your price is shown in Global USD.', 0),
  ('europe', 'Europe', 'Europe EUR', true, 'Switch to billing-country region or review', 'USD equivalent checkout', 'Europe price shown. Taxes/vat may apply depending billing country.', 1),
  ('uk', 'UK', 'UK GBP', true, 'Switch to billing-country region or review', 'USD equivalent checkout', 'UK price shown. Taxes may apply depending billing country.', 2),
  ('gcc', 'GCC', 'GCC currency by country: AED/SAR/QAR/BHD/KWD/OMR', true, 'South Asia selection requires verification; otherwise switch back to GCC', 'USD equivalent checkout', 'GCC regional price is based on residence and billing country.', 3),
  ('india', 'India', 'India Regional Scholarship', true, 'If billing country is not India, switch to correct region or review', 'USD equivalent checkout', 'India Regional Scholarship Pricing applies only to learners residing and billing from India.', 4),
  ('pakistan', 'Pakistan', 'Pakistan Regional Scholarship', true, 'If billing country is not Pakistan, switch to correct region or review', 'USD equivalent checkout', 'Pakistan Regional Scholarship Pricing applies only to learners residing and billing from Pakistan.', 5)
on conflict (id) do update set
  label = excluded.label,
  default_price_display = excluded.default_price_display,
  can_change_region = excluded.can_change_region,
  mismatch_rule = excluded.mismatch_rule,
  checkout_rule = excluded.checkout_rule,
  website_message = excluded.website_message,
  sort_order = excluded.sort_order;

-- ── 3) Catalogue meta ────────────────────────────────────────
create table if not exists public.catalogue_meta (
  id text primary key default 'default',
  version int not null default 1,
  imported_at timestamptz,
  source_file text,
  offering_count int,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.course_offerings (
  offering_id text primary key,
  family_id text not null,
  course_name text not null,
  tier_id text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.catalogue_meta enable row level security;
alter table public.course_offerings enable row level security;

drop policy if exists "Catalogue meta readable" on public.catalogue_meta;
create policy "Catalogue meta readable" on public.catalogue_meta for select using (true);

drop policy if exists "Offerings readable" on public.course_offerings;
create policy "Offerings readable" on public.course_offerings for select using (true);

drop policy if exists "Service role manages catalogue meta" on public.catalogue_meta;
create policy "Service role manages catalogue meta" on public.catalogue_meta for all using (auth.role() = 'service_role');

drop policy if exists "Service role manages offerings" on public.course_offerings;
create policy "Service role manages offerings" on public.course_offerings for all using (auth.role() = 'service_role');

-- ── 4) Media bucket ──────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media', 'site-media', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do nothing;

drop policy if exists "Public read site media" on storage.objects;
create policy "Public read site media" on storage.objects for select using (bucket_id = 'site-media');

drop policy if exists "Authenticated upload site media" on storage.objects;
create policy "Authenticated upload site media" on storage.objects for insert
  with check (bucket_id = 'site-media' and auth.role() = 'authenticated');

drop policy if exists "Authenticated update site media" on storage.objects;
create policy "Authenticated update site media" on storage.objects for update
  using (bucket_id = 'site-media' and auth.role() = 'authenticated');

drop policy if exists "Authenticated delete site media" on storage.objects;
create policy "Authenticated delete site media" on storage.objects for delete
  using (bucket_id = 'site-media' and auth.role() = 'authenticated');

-- ── 5) Dashboard auth (dashboard_one) ────────────────────────
create schema if not exists dashboard_one;

create table if not exists dashboard_one.login_security_settings (
  id text primary key default 'default',
  password_login_enabled boolean not null default true,
  force_password_reset boolean not null default false,
  login_alerts_enabled boolean not null default false,
  sms_new_device_login_enabled boolean not null default false,
  email_new_device_login_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into dashboard_one.login_security_settings (id) values ('default') on conflict (id) do nothing;

create table if not exists dashboard_one.user_credentials (
  email text primary key,
  password_hash text not null,
  phone_e164 text,
  must_reset_password boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists dashboard_one.password_history (
  id uuid primary key default gen_random_uuid(),
  email text not null references dashboard_one.user_credentials (email) on delete cascade,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_password_history_email_created
  on dashboard_one.password_history (email, created_at desc);

create table if not exists dashboard_one.recovery_emails (
  email text primary key references dashboard_one.user_credentials (email) on delete cascade,
  recovery_email text not null,
  updated_at timestamptz not null default now()
);

create table if not exists dashboard_one.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null references dashboard_one.user_credentials (email) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_password_reset_tokens_email
  on dashboard_one.password_reset_tokens (email, created_at desc);

create table if not exists dashboard_one.auth_audit_log (
  id uuid primary key default gen_random_uuid(),
  email text,
  event_type text not null,
  ip_address text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_auth_audit_log_created
  on dashboard_one.auth_audit_log (created_at desc);

create table if not exists dashboard_one.trusted_login_fingerprints (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  fingerprint_hash text not null,
  ip_address text,
  user_agent text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (email, fingerprint_hash)
);

create index if not exists idx_trusted_fingerprints_email
  on dashboard_one.trusted_login_fingerprints (email);

create table if not exists dashboard_one.login_sms_otp_challenges (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_hash text not null,
  fingerprint_hash text not null,
  ip_address text,
  user_agent text,
  expires_at timestamptz not null,
  attempts int not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_login_otp_challenges_email
  on dashboard_one.login_sms_otp_challenges (email, created_at desc);

grant usage on schema dashboard_one to service_role;
grant all on all tables in schema dashboard_one to service_role;
alter default privileges in schema dashboard_one grant all on tables to service_role;

-- ── 6) Expose dashboard_one to Supabase Data API ─────────────
-- (Also add dashboard_one in Dashboard → Settings → API → Exposed schemas)
do $$
declare
  schemas text;
begin
  begin
    schemas := current_setting('pgrst.db_schemas', true);
  exception when others then
    schemas := 'public';
  end;
  if schemas is null or schemas = '' then
    schemas := 'public';
  end if;
  if schemas not like '%dashboard_one%' then
    perform set_config('pgrst.db_schemas', schemas || ', dashboard_one', true);
  end if;
end $$;

notify pgrst, 'reload config';
