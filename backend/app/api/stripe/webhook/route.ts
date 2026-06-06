import { jsonError } from '@/lib/response-helpers.js';

/** Card payments are not integrated — webhook disabled. */
export async function POST() {
  return jsonError('Payment webhooks are not enabled on this site.', 410);
}
