import { jsonOk } from '@/lib/response-helpers.js';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return jsonOk({
    sessionId: id,
    status: 'pending',
    message: 'Checkout recorded — no online card payment on this site.',
  });
}
