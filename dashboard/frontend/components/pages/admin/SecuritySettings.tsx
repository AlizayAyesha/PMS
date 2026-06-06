'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { CTAButton } from '@/components/ui/CTAButton';
import { getDashboardApiHeaders } from '@/lib/auth/dashboard-api-headers';

type Settings = {
  password_login_enabled: boolean;
  force_password_reset: boolean;
  login_alerts_enabled: boolean;
  sms_new_device_login_enabled: boolean;
  email_new_device_login_enabled: boolean;
};

type AuditRow = {
  id: string;
  email: string | null;
  event_type: string;
  ip_address: string | null;
  created_at: string;
};

export function SecuritySettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [phone, setPhone] = useState('');
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const headers = useCallback(
    () => ({
      'Content-Type': 'application/json',
      ...getDashboardApiHeaders(),
    }),
    [],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [cfg, phoneRes, auditRes] = await Promise.all([
        fetch('/api/auth/security-config', { credentials: 'include', headers: headers() }),
        fetch('/api/auth/my-phone', { credentials: 'include', headers: headers() }),
        fetch('/api/auth/audit?limit=30', { credentials: 'include', headers: headers() }),
      ]);
      const cfgJson = (await cfg.json()) as { settings?: Settings; error?: string };
      const phoneJson = (await phoneRes.json()) as { phone_e164?: string | null };
      const auditJson = (await auditRes.json()) as { logs?: AuditRow[] };
      if (!cfg.ok) throw new Error(cfgJson.error || 'Failed to load settings');
      setSettings(cfgJson.settings ?? null);
      setPhone(phoneJson.phone_e164 ?? '');
      setLogs(auditJson.logs ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load security settings');
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    load();
  }, [load]);

  const saveSettings = async () => {
    if (!settings) return;
    setSaved(false);
    const res = await fetch('/api/auth/security-config', {
      method: 'PUT',
      credentials: 'include',
      headers: headers(),
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error || 'Save failed');
      return;
    }
    setSaved(true);
  };

  const savePhone = async () => {
    const res = await fetch('/api/auth/my-phone', {
      method: 'PUT',
      credentials: 'include',
      headers: headers(),
      body: JSON.stringify({ phone_e164: phone.trim() || null }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error || 'Could not save phone');
    }
  };

  if (loading) {
    return <p className="text-muted-foreground text-sm p-6">Loading security settings…</p>;
  }

  return (
    <div className="space-y-6 p-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Security &amp; audit</h1>
      {error ? <p className="text-red-500 text-sm">{error}</p> : null}

      <GlassCard className="p-6 space-y-4">
        <h2 className="font-semibold">Login security</h2>
        {settings ? (
          <div className="space-y-3 text-sm">
            {(
              [
                ['password_login_enabled', 'Password login enabled'],
                ['sms_new_device_login_enabled', 'SMS OTP on new device'],
                ['email_new_device_login_enabled', 'Email OTP on new device'],
                ['login_alerts_enabled', 'Email alert on every login'],
                ['force_password_reset', 'Force password reset for all users'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e) =>
                    setSettings((s) => (s ? { ...s, [key]: e.target.checked } : s))
                  }
                />
                {label}
              </label>
            ))}
          </div>
        ) : null}
        <CTAButton type="button" onClick={saveSettings}>
          Save toggles
        </CTAButton>
        {saved ? <p className="text-emerald-500 text-xs">Saved.</p> : null}
      </GlassCard>

      <GlassCard className="p-6 space-y-3">
        <h2 className="font-semibold">SMS number (E.164)</h2>
        <input
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
          placeholder="+971501234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <CTAButton type="button" onClick={savePhone}>
          Save phone
        </CTAButton>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="font-semibold mb-3">Recent audit log</h2>
        <ul className="text-xs space-y-2 max-h-80 overflow-auto">
          {logs.map((row) => (
            <li key={row.id} className="border-b border-white/5 pb-2">
              <span className="text-brand-orange">{row.event_type}</span>{' '}
              {row.email ?? '—'} · {row.ip_address ?? '—'} ·{' '}
              {new Date(row.created_at).toLocaleString()}
            </li>
          ))}
          {logs.length === 0 ? <li className="text-muted-foreground">No events yet.</li> : null}
        </ul>
      </GlassCard>
    </div>
  );
}
