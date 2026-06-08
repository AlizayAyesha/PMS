'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff, Smartphone } from 'lucide-react';
import { useAuth, REQUIRES_LOGIN_OTP } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { CTAButton } from '@/components/ui/CTAButton';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { siteUrl } from '@/lib/site-config';
import Link from 'next/link';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isError, setIsError] = useState(false);
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, verifyLoginSmsOtp, pendingOtp, clearPendingOtp, requestPasswordReset } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);
    setFormError('');

    try {
      await login(email, password);
      const redirect = sessionStorage.getItem('redirect_after_login') || '/dashboard';
      sessionStorage.removeItem('redirect_after_login');
      router.replace(redirect);
    } catch (error) {
      if (
        error instanceof Error &&
        (error as Error & { code?: string }).code === REQUIRES_LOGIN_OTP
      ) {
        setOtpStep(true);
        return;
      }
      if (error instanceof Error && (error as Error & { code?: string }).code === 'PASSWORD_RESET_REQUIRED') {
        setForgotMode(true);
        setFormError('Your password must be reset. Use the form below to request a reset link.');
        setIsError(true);
        return;
      }
      console.error('Login failed:', error);
      setFormError(error instanceof Error ? error.message : 'Login failed');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingOtp) return;
    setIsLoading(true);
    setFormError('');
    try {
      await verifyLoginSmsOtp(pendingOtp.challengeId, otpCode, pendingOtp.email);
      const redirect = sessionStorage.getItem('redirect_after_login') || '/dashboard';
      sessionStorage.removeItem('redirect_after_login');
      router.replace(redirect);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Invalid code');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setResetSent(false);
    setIsLoading(true);
    try {
      await requestPasswordReset(email);
      setResetSent(true);
    } catch (error) {
      console.error('Password reset failed:', error);
      setFormError('Could not send reset email. Check the address and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const otpHint = pendingOtp?.otpChannels?.sms
    ? pendingOtp.phoneLast4
      ? `SMS sent to number ending ${pendingOtp.phoneLast4}`
      : 'Check your SMS'
    : pendingOtp?.emailHint
      ? `Code sent to ${pendingOtp.emailHint}`
      : 'Enter the 6-digit code';

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
            <h1 className="text-hero text-3xl sm:text-4xl mt-6">
              {otpStep ? 'Verify device' : forgotMode ? 'Reset password' : 'Admin Access'}
            </h1>
            <p className="text-muted-foreground text-sm mt-2 text-center">
              {otpStep
                ? otpHint
                : forgotMode
                  ? 'We will email you a link to choose a new password'
                  : 'Sign in with your dashboard email and password'}
            </p>
          </div>

          {otpStep && pendingOtp ? (
            <form onSubmit={handleOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Smartphone size={14} /> Verification code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm tracking-widest text-center"
                  placeholder="123456"
                  required
                />
              </div>
              {formError ? (
                <p className="text-red-500 text-xs font-medium text-center">{formError}</p>
              ) : null}
              <CTAButton type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifying…' : 'Complete sign in'}
              </CTAButton>
              <button
                type="button"
                onClick={() => {
                  setOtpStep(false);
                  clearPendingOtp();
                  setOtpCode('');
                }}
                className="w-full text-xs font-semibold text-muted-foreground hover:text-brand-orange"
              >
                ← Back
              </button>
            </form>
          ) : forgotMode ? (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Mail size={14} /> Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              {resetSent ? (
                <p className="text-emerald-500 text-xs font-medium text-center">
                  If registered, a reset link was sent to <strong>{email.trim()}</strong>.
                </p>
              ) : null}
              {formError ? (
                <p className="text-red-500 text-xs font-medium text-center">{formError}</p>
              ) : null}
              <CTAButton type="submit" className="w-full" disabled={isLoading || resetSent}>
                {isLoading ? 'Sending…' : 'Send reset link'}
              </CTAButton>
              <button
                type="button"
                onClick={() => {
                  setForgotMode(false);
                  setFormError('');
                  setResetSent(false);
                }}
                className="w-full text-xs font-semibold text-muted-foreground hover:text-brand-orange"
              >
                ← Back to sign in
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Mail size={14} /> Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Lock size={14} /> Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(true);
                      setIsError(false);
                      setFormError('');
                    }}
                    className="text-xs font-semibold text-brand-orange hover:underline shrink-0"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-orange"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {(isError || formError) && (
                <p className="text-red-500 text-xs font-medium text-center">
                  {formError || 'Invalid credentials.'}
                </p>
              )}

              <CTAButton type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : (
                  <>
                    Sign In <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </CTAButton>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-3 text-muted-foreground text-xs">
            <p className="flex items-center gap-2">
              <ShieldCheck size={14} /> Secured dashboard_one credentials
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
