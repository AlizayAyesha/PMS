import {
  canCheckoutStatus,
  getOfferingById,
  resolveCheckoutUsdCents,
} from '@/lib/regional-catalogue';
import { isConsultationApproved } from '@/lib/consultation-approval';
import { membershipPriceUsdCents } from '@/lib/membership-pricing';
import { verifyRegion } from '@/lib/verify-region';
import { createCheckoutSession } from '@/lib/checkout-session';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase-admin';
import { jsonError, jsonOk } from '@/lib/response-helpers.js';
import type { RegionId } from '@/lib/regional-catalogue';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const {
    offeringId,
    regionId,
    residenceCountry,
    billingCountry,
    email,
    gccCountry,
    hasMembership,
    successUrl,
    cancelUrl,
  } = body as {
    offeringId?: string;
    regionId?: RegionId;
    residenceCountry?: string;
    billingCountry?: string;
    email?: string;
    gccCountry?: string | null;
    hasMembership?: boolean;
    successUrl?: string;
    cancelUrl?: string;
  };

  if (!offeringId || !regionId || !email) {
    return jsonError('offeringId, regionId, and email are required', 400);
  }

  const offering = getOfferingById(offeringId);
  if (!offering) return jsonError('Offering not found', 404);

  const status = offering.regional[regionId].status;

  if (status === 'consultation_required') {
    const approved = await isConsultationApproved(email, offeringId);
    if (!approved) {
      return jsonError(
        'Mastery consultation must be approved before checkout. Submit a consultation request or contact support.',
        403
      );
    }
  } else if (!canCheckoutStatus(status)) {
    return jsonError('Checkout not available for this offering in your region', 403);
  }

  if (status === 'scholarship_verify') {
    const verification = verifyRegion({
      regionId,
      residenceCountry: residenceCountry ?? '',
      billingCountry: billingCountry ?? '',
      gccCountry,
    });
    if (!verification.verified || !verification.scholarshipEligible) {
      return jsonError(verification.message, 403);
    }
  }

  let usdCents = resolveCheckoutUsdCents(offering, regionId);
  if (!usdCents) return jsonError('Price unavailable', 400);

  if (hasMembership) {
    const memberCents = membershipPriceUsdCents(usdCents);
    if (memberCents != null) usdCents = memberCents;
  }

  const origin = request.headers.get('origin') ?? 'http://localhost:3000';

  function safeRedirectUrl(candidate: string | undefined, fallback: string): string {
    if (!candidate?.trim()) return fallback;
    try {
      const parsed = new URL(candidate);
      const base = new URL(origin);
      if (parsed.origin !== base.origin) return fallback;
      return parsed.toString();
    } catch {
      return fallback;
    }
  }

  const defaultSuccess = `${origin}/checkout/success?offering=${offeringId}`;
  const defaultCancel = `${origin}/checkout/cancel?offering=${offeringId}`;

  const session = await createCheckoutSession({
    offeringId,
    usdCents,
    email,
    successUrl: safeRedirectUrl(successUrl, defaultSuccess),
    cancelUrl: safeRedirectUrl(cancelUrl, defaultCancel),
  });

  if (isSupabaseConfigured) {
    const { error } = await supabaseAdmin.from('orders').insert({
      offering_id: offeringId,
      region_id: regionId,
      email,
      usd_cents: usdCents,
      status: 'pending',
      stripe_session_id: session.sessionId,
      metadata: {
        residenceCountry,
        billingCountry,
        gccCountry,
        hasMembership: !!hasMembership,
      },
    });
    if (error) {
      console.error('[checkout/create] orders insert failed:', error.message);
      return jsonError('Could not create order record', 503);
    }
  }

  return jsonOk({ session, usdCents, hasMembership: !!hasMembership });
}
