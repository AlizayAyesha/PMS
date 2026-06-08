type SendParams = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

function fromHeader(): { email: string; name: string } {
  return {
    email: process.env.AUTH_EMAIL_FROM?.trim() || 'onboarding@resend.dev',
    name: process.env.AUTH_EMAIL_FROM_NAME?.trim() || 'PM Structure',
  };
}

async function sendViaResend(params: SendParams): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) throw new Error('RESEND_API_KEY is not configured');
  const from = fromHeader();
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${from.name} <${from.email}>`,
      to: [params.to],
      subject: params.subject,
      text: params.text,
      html: params.html ?? `<p>${params.text}</p>`,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend failed (${res.status}): ${body}`);
  }
}

async function sendViaSmtp(params: SendParams): Promise<void> {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) throw new Error('SMTP_HOST is not configured');
  const nodemailer = await import('nodemailer');
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true';
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER?.trim(),
      pass: process.env.SMTP_PASS?.trim(),
    },
  });
  const from = fromHeader();
  await transporter.sendMail({
    from: `"${from.name}" <${from.email}>`,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html ?? params.text,
  });
}

export async function sendAuthEmail(params: SendParams): Promise<void> {
  if (process.env.SMTP_HOST?.trim()) {
    await sendViaSmtp(params);
    return;
  }
  await sendViaResend(params);
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() || process.env.SMTP_HOST?.trim());
}

function shouldLogAuthEmailInDev(): boolean {
  return (
    process.env.NODE_ENV === 'development' &&
    (process.env.AUTH_DEV_LOG_RESET_LINK === 'true' || process.env.AUTH_DEV_LOG_OTP === 'true')
  );
}

/** Login OTP — plain text + simple HTML for inbox clients. */
export async function sendLoginOtpEmail(to: string, code: string): Promise<void> {
  const subject = 'Your PM Structure login code';
  const text = `Your verification code is ${code}. It expires in 10 minutes.\n\nIf you did not try to sign in, ignore this email.`;
  const html = `<div style="font-family:system-ui,sans-serif;max-width:420px;margin:0 auto;padding:24px">
  <p style="margin:0 0 16px;font-size:15px;color:#334155">Use this code to finish signing in to the PM Structure dashboard:</p>
  <p style="margin:0 0 20px;font-size:32px;font-weight:700;letter-spacing:0.25em;color:#0f172a">${code}</p>
  <p style="margin:0;font-size:13px;color:#64748b">Expires in 10 minutes. If you did not request this, you can ignore this email.</p>
</div>`;
  await sendAuthEmail({ to, subject, text, html });
}

export function logLoginOtpForDev(email: string, code: string): void {
  if (!shouldLogAuthEmailInDev()) return;
  console.log(`\n[login-otp] Email not configured — dev code for ${email}: ${code}\n`);
}
