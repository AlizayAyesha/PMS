-- New-device OTP: SMS + trusted fingerprints

alter table dashboard_one.user_credentials
  add column if not exists phone_e164 text;

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

grant all on dashboard_one.trusted_login_fingerprints to service_role;
grant all on dashboard_one.login_sms_otp_challenges to service_role;
