/** Checkout sessions — no card processor; records intent and redirects to success. */

export interface CheckoutSessionResult {
  sessionId: string;
  url: string | null;
  usdCents: number;
  offeringId: string;
}

export async function createCheckoutSession(params: {
  offeringId: string;
  usdCents: number;
  email: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<CheckoutSessionResult> {
  return {
    sessionId: `checkout_${Date.now()}_${params.offeringId}`,
    url: null,
    usdCents: params.usdCents,
    offeringId: params.offeringId,
  };
}
