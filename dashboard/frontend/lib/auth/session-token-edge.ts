/** Edge-safe HMAC session verify (middleware). */

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function verifySignedSessionTokenEdge(
  token: string,
  secret: string,
): Promise<string | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = parts[1]!;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const expected = base64UrlEncode(new Uint8Array(sig));
    if (parts[2] !== expected) return null;
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const data = JSON.parse(
      atob(padded.replace(/-/g, '+').replace(/_/g, '/')),
    ) as {
      email?: string;
      exp?: number;
    };
    if (data.exp && Date.now() > data.exp * 1000) return null;
    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : null;
    if (!email || email !== parts[0]) return null;
    return email;
  } catch {
    return null;
  }
}
