export function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      (process.env.TWILIO_MESSAGING_SERVICE_SID?.trim() ||
        process.env.TWILIO_FROM_NUMBER?.trim()),
  );
}

export async function sendLoginOtpSms(phoneE164: string, code: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!sid || !token) throw new Error('Twilio is not configured');

  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();
  const fromNumber = process.env.TWILIO_FROM_NUMBER?.trim();
  const body = new URLSearchParams({
    To: phoneE164,
    Body: `Your PM Structure login code is ${code}. It expires in 10 minutes.`,
  });
  if (messagingServiceSid) {
    body.set('MessagingServiceSid', messagingServiceSid);
  } else if (fromNumber) {
    body.set('From', fromNumber);
  } else {
    throw new Error('TWILIO_MESSAGING_SERVICE_SID or TWILIO_FROM_NUMBER is required');
  }

  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twilio SMS failed (${res.status}): ${text}`);
  }
}
