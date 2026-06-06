-- PM Structure dashboard_one auth (separate from public CMS tables)

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

insert into dashboard_one.login_security_settings (id)
values ('default')
on conflict (id) do nothing;

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

grant usage on schema dashboard_one to service_role;
grant all on all tables in schema dashboard_one to service_role;
alter default privileges in schema dashboard_one grant all on tables to service_role;
