'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { CTAButton } from '@/components/ui/CTAButton';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { siteUrl } from '@/lib/site-config';

export const UpdatePassword: React.FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { updatePassword } = useAuth();
  const router = useRouter();

  const ready = Boolean(token && email);

  useEffect(() => {
    if (!ready) setError('');
  }, [ready]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(password, { token, email });
      router.replace('/login');
    } catch (err) {
      console.error('Password update failed:', err);
      setError(err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-shell-gradient p-4 relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-brand-orange/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard variant="raised" className="p-8 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <BrandLogo size="lg" />
            <h1 className="text-2xl font-black mt-6">Set new password</h1>
            <p className="text-muted-foreground text-sm mt-2 text-center">
              Choose a new password for your admin account
            </p>
          </div>

          {!ready ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-red-500 font-medium">
                This reset link is invalid or has expired.
              </p>
              <Link
                href="/login"
                className="inline-block text-sm font-semibold text-brand-orange hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <PasswordField
                label="New password"
                value={password}
                onChange={setPassword}
                show={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                autoComplete="new-password"
              />
              <PasswordField
                label="Confirm password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((v) => !v)}
                autoComplete="new-password"
              />

              {error ? (
                <p className="text-red-500 text-xs font-medium text-center">{error}</p>
              ) : null}

              <CTAButton type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Updating…' : (
                  <>
                    Update password <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </CTAButton>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-3 text-muted-foreground text-xs">
            <p className="flex items-center gap-2">
              <ShieldCheck size={14} /> dashboard_one password reset
            </p>
            <Link href={siteUrl} className="hover:text-brand-orange font-semibold transition-colors">
              ← Back to main website
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
  autoComplete: 'new-password' | 'current-password';
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
        <Lock size={14} /> {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="••••••••"
          required
          minLength={12}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-orange transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
