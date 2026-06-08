'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import {
  clearDemoSession,
  createDemoUser,
  isDemoCredentials,
  isDemoLoginAllowed,
  persistDemoSession,
  readDemoSessionEmail,
} from '@/lib/demo-auth';
import { AUTH_API_TOKEN_KEY } from '@/lib/auth/dashboard-api-headers';
import { createAdminUser } from '@/lib/auth/admin-user';
import { getDashboardApiHeaders } from '@/lib/auth/dashboard-api-headers';

const USE_API_LOGIN = process.env.NEXT_PUBLIC_AUTH_USE_API_LOGIN === 'true';

export const REQUIRES_LOGIN_OTP = 'REQUIRES_LOGIN_OTP';

export type LoginOtpState = {
  challengeId: string;
  email: string;
  phoneLast4?: string | null;
  emailHint?: string;
  otpChannels?: { sms: boolean; email: boolean };
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  verifyLoginSmsOtp: (challengeId: string, code: string, email: string) => Promise<void>;
  pendingOtp: LoginOtpState | null;
  clearPendingOtp: () => void;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string, opts?: { token?: string; email?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function restoreApiSession(): Promise<User | null> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem(AUTH_API_TOKEN_KEY)?.trim() : null;
  if (!token) return null;
  try {
    const res = await fetch('/api/auth/session', {
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { email?: string };
    if (data.email) return createAdminUser(data.email);
  } catch {
    return null;
  }
  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingOtp, setPendingOtp] = useState<LoginOtpState | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const demoEmail = readDemoSessionEmail();
      if (demoEmail) {
        setUser(createDemoUser(demoEmail));
        setLoading(false);
        return;
      }

      if (USE_API_LOGIN) {
        const apiUser = await restoreApiSession();
        setUser(apiUser);
        setLoading(false);
        return;
      }

      setLoading(false);
    };

    checkSession();
  }, []);

  const clearPendingOtp = useCallback(() => setPendingOtp(null), []);

  const finishLogin = useCallback((email: string, sessionToken?: string) => {
    if (sessionToken) {
      localStorage.setItem(AUTH_API_TOKEN_KEY, sessionToken);
    }
    setUser(createAdminUser(email));
    setPendingOtp(null);
  }, []);

  const login = async (email: string, password: string) => {
    if (isDemoLoginAllowed() && isDemoCredentials(email, password)) {
      const mockUser = createDemoUser(email);
      persistDemoSession(email);
      setUser(mockUser);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!USE_API_LOGIN) {
      throw new Error('Set NEXT_PUBLIC_AUTH_USE_API_LOGIN=true for dashboard_one login');
    }

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
      sessionToken?: string;
      requiresOtp?: boolean;
      challengeId?: string;
      phoneLast4?: string | null;
      emailHint?: string;
      otpChannels?: { sms: boolean; email: boolean };
    };

    if (!res.ok) {
      const err = new Error(data.error || 'Login failed');
      if (data.code) (err as Error & { code: string }).code = data.code;
      throw err;
    }

    if (data.requiresOtp && data.challengeId) {
      setPendingOtp({
        challengeId: data.challengeId,
        email: normalizedEmail,
        phoneLast4: data.phoneLast4,
        emailHint: data.emailHint,
        otpChannels: data.otpChannels,
      });
      const err = new Error('OTP required');
      (err as Error & { code: string }).code = REQUIRES_LOGIN_OTP;
      throw err;
    }

    finishLogin(normalizedEmail, data.sessionToken);
  };

  const verifyLoginSmsOtp = async (challengeId: string, code: string, email: string) => {
    const res = await fetch('/api/auth/verify-login-sms', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, code, email: email.trim().toLowerCase() }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; sessionToken?: string };
    if (!res.ok) throw new Error(data.error || 'Invalid code');
    finishLogin(email.trim().toLowerCase(), data.sessionToken);
  };

  const logout = async () => {
    if (readDemoSessionEmail() || user?.id === 'demo-user-id') {
      clearDemoSession();
      setUser(null);
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_API_TOKEN_KEY);
    }
    setUser(null);
  };

  const requestPasswordReset = async (email: string) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...getDashboardApiHeaders() },
      body: JSON.stringify({ email: email.trim() }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error || 'Could not send reset email');
    }
  };

  const updatePassword = async (
    password: string,
    opts?: { token?: string; email?: string },
  ) => {
    if (!opts?.token || !opts?.email) {
      throw new Error('Reset token and email are required');
    }
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: opts.email.trim().toLowerCase(),
        token: opts.token,
        password,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) throw new Error(data.error || 'Could not update password');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        verifyLoginSmsOtp,
        pendingOtp,
        clearPendingOtp,
        logout,
        requestPasswordReset,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
