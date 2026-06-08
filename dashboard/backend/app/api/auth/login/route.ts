import { NextRequest, NextResponse } from 'next/server';
import { assertSameOrigin } from '@/lib/auth/csrf-origin';
import { isKnownAdminEmail } from '@/lib/auth/known-users';
import {
  getLoginSecuritySettings,
  getUserCredentials,
  isTrustedFingerprint,
  createOtpChallenge,
  verifyUserPassword,
} from '@/lib/auth/auth-db';
import { writeAuthAuditLog } from '@/lib/auth/audit-log';
import { buildLoginSuccessResponse, isLegacyLoginEnabled } from '@/lib/auth/login-session';
import { getLoginFingerprint, maskEmail, phoneLast4 } from '@/lib/auth/login-fingerprint';
import { generateOtpCode, hashOtpCode } from '@/lib/auth/password-crypto';
import { sendAuthEmail, sendLoginOtpEmail, isEmailConfigured, logLoginOtpForDev } from '@/lib/auth/send-email';
import { isTwilioConfigured, sendLoginOtpSms } from '@/lib/auth/twilio-sms';
import { getSessionSecret } from '@/lib/auth/session-token';
import { isSupabaseAdminConfigured } from '@/lib/auth/supabase-admin';

type LoginBody = { email?: string; password?: string };

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  if (!getSessionSecret()) {
    return NextResponse.json(
      { error: 'AUTH_SESSION_SECRET is not configured' },
      { status: 503 },
    );
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured' },
      { status: 503 },
    );
  }

  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? '';
  const password = body.password ?? '';
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  if (!isKnownAdminEmail(email)) {
    const fp0 = getLoginFingerprint(request);
    await writeAuthAuditLog({
      email,
      eventType: 'login_failed',
      ipAddress: fp0.ip,
      userAgent: fp0.userAgent,
      metadata: { reason: 'not_allowlisted' },
    });
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const settings = await getLoginSecuritySettings();
  if (!settings.password_login_enabled) {
    return NextResponse.json({ error: 'Password login is disabled' }, { status: 403 });
  }

  const creds = await getUserCredentials(email);
  let passwordOk = false;

  if (creds?.password_hash) {
    passwordOk = await verifyUserPassword(email, password);
  } else if (isLegacyLoginEnabled()) {
    passwordOk = true;
  }

  if (!passwordOk) {
    await writeAuthAuditLog({
      email,
      eventType: 'login_failed',
      ipAddress: getLoginFingerprint(request).ip,
      userAgent: getLoginFingerprint(request).userAgent,
      metadata: { reason: 'bad_password' },
    });
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  if (creds?.must_reset_password || settings.force_password_reset) {
    return NextResponse.json(
      { error: 'Password reset required', code: 'PASSWORD_RESET_REQUIRED' },
      { status: 403 },
    );
  }

  const fp = getLoginFingerprint(request);
  const trusted = await isTrustedFingerprint(email, fp.hash);
  const smsOn = settings.sms_new_device_login_enabled;
  const emailOn = settings.email_new_device_login_enabled;
  const otpEnabled = smsOn || emailOn;

  if (trusted || !otpEnabled) {
    await writeAuthAuditLog({
      email,
      eventType: 'login_success',
      ipAddress: fp.ip,
      userAgent: fp.userAgent,
      metadata: { trusted },
    });
    if (settings.login_alerts_enabled && isEmailConfigured()) {
      try {
        await sendAuthEmail({
          to: email,
          subject: 'New login to PM Structure dashboard',
          text: `Signed in from ${fp.ip} at ${new Date().toISOString()}.`,
        });
      } catch (err) {
        console.error('[login-alert]', err);
      }
    }
    return buildLoginSuccessResponse(email, {});
  }

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const challengeId = await createOtpChallenge({
    email,
    codeHash: hashOtpCode(code),
    fingerprintHash: fp.hash,
    ip: fp.ip,
    userAgent: fp.userAgent,
    expiresAt,
  });

  const otpChannels = { sms: false, email: false };
  const errors: string[] = [];

  if (smsOn && creds?.phone_e164 && isTwilioConfigured()) {
    try {
      await sendLoginOtpSms(creds.phone_e164, code);
      otpChannels.sms = true;
    } catch (err) {
      errors.push(`SMS: ${err instanceof Error ? err.message : 'failed'}`);
    }
  }

  if (emailOn && isEmailConfigured()) {
    try {
      await sendLoginOtpEmail(email, code);
      otpChannels.email = true;
    } catch (err) {
      errors.push(`Email: ${err instanceof Error ? err.message : 'failed'}`);
      logLoginOtpForDev(email, code);
      if (process.env.NODE_ENV === 'development') {
        otpChannels.email = true;
      }
    }
  } else if (emailOn) {
    logLoginOtpForDev(email, code);
    if (process.env.NODE_ENV === 'development') {
      otpChannels.email = true;
    }
  }

  if (!otpChannels.sms && !otpChannels.email) {
    return NextResponse.json(
      {
        error: 'OTP delivery is not configured',
        details: errors,
        hint: 'Enable Resend/SMTP and/or Twilio, set phone_e164 for SMS, or disable OTP in Security settings.',
      },
      { status: 503 },
    );
  }

  await writeAuthAuditLog({
    email,
    eventType: 'login_otp_sent',
    ipAddress: fp.ip,
    userAgent: fp.userAgent,
    metadata: { challengeId, otpChannels },
  });

  return NextResponse.json({
    success: true,
    requiresOtp: true,
    challengeId,
    phoneLast4: phoneLast4(creds?.phone_e164),
    emailHint: maskEmail(email),
    otpChannels,
  });
}
