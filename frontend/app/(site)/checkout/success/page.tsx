'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { SectionAmbience, sectionSurface } from '@/components/SectionAmbience';
import { enrollmentSuccessPathForOffering } from '@/lib/enrollment-routes';
import { getOfferingById } from '@/lib/regional-catalogue';
import { cn } from '@/lib/utils';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const offeringId = searchParams.get('offering');
  const offering = offeringId ? getOfferingById(offeringId) : undefined;
  const enrollSuccess = offeringId ? enrollmentSuccessPathForOffering(offeringId) : null;

  useEffect(() => {
    if (enrollSuccess) router.replace(`${enrollSuccess}?offering=${encodeURIComponent(offeringId!)}`);
  }, [enrollSuccess, offeringId, router]);

  if (enrollSuccess) {
    return <p className="text-slate-500">Redirecting to enrollment confirmation…</p>;
  }

  return (
    <section className={sectionSurface('blend', 'py-24')}>
      <SectionAmbience tone="blend" />
      <div className="container relative z-10 mx-auto max-w-lg text-center">
        <h1 className="font-heading text-hero font-bold mb-4">Thank you</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Your checkout request was recorded. Our team will follow up by email with next steps — no card payment is taken on this site.
        </p>
        {offering && (
          <p className="text-sm font-semibold text-brand-orange mb-8">
            {offering.courseName} · {offering.tierId.replace(/_/g, ' ')}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/certifications" className={cn(buttonVariants({ size: 'lg', variant: 'brand' }))}>
            Back to pathways
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-lg py-24 text-center">Loading…</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
