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
