import { BRAND, BRAND_LINES, DISCLAIMERS, REGION_COPY } from '@/lib/brand-voice';
import * as siteData from '@/data/siteData';
import { getCertDurationLabel } from '@/lib/regional-catalogue';
import type { FaqCluster, FaqEntry } from './types';

export const FAQ_CLUSTERS: FaqCluster[] = [
  { id: 'about', title: 'About PM Structure' },
  { id: 'pathways', title: 'Pathways & tiers' },
  { id: 'timeline', title: 'Study timeline & readiness' },
  { id: 'delivery', title: 'Delivery & access' },
  { id: 'pricing', title: 'Regional pricing & checkout' },
  { id: 'membership', title: 'Membership & community' },
  { id: 'consultation', title: 'Consultation & corporate' },
  { id: 'exams', title: 'Official exams' },
  { id: 'privacy', title: 'Account, privacy & legal' },
  { id: 'support', title: 'Technical support' },
  { id: 'geo', title: 'Common AI & search questions' },
];

const P = (clusterId: FaqEntry['clusterId'], question: string, answer: string, id?: string): FaqEntry => ({
  id: id ?? `${clusterId}-${question.slice(0, 24).replace(/\W+/g, '-').toLowerCase()}`,
  clusterId,
  question,
  answer,
});

function certFaqs(): FaqEntry[] {
  const featured = ['pmp', 'capm', 'prince2', 'lss-green'] as const;
  return featured.flatMap((id) => {
    const cert = siteData.certifications.find((c) => c.id === id);
    if (!cert) return [];
    const duration = getCertDurationLabel(id);
    return [
      P(
        'timeline',
        `How long is ${cert.name} preparation on ${BRAND.name}?`,
        `Planned study windows are shown on the ${cert.name} pathway page${duration ? ` (catalogue guide: ${duration})` : ''}. Actual duration depends on your weekly hours and experience. See [/certifications/${id}](/certifications/${id}).`,
        `${id}-duration`,
      ),
      P(
        'pathways',
        `What tiers are available for ${cert.name}?`,
        `${BRAND.name} offers Foundation, Professional, and Mastery-style tiers where published in our regional catalogue. Availability varies by region. See [/certifications/${id}](/certifications/${id}) for your region.`,
        `${id}-tiers`,
      ),
    ];
  });
}

export const FAQ_ENTRIES: FaqEntry[] = [
  P(
    'about',
    'What is PM Structure?',
    `${BRAND.name} is an independent exam-preparation and project management learning platform. We offer structured readiness pathways for PMI®, PRINCE2®, and Lean Six Sigma—not official exams and not a certification body. See [Terms](/legal/terms) and [pricing disclaimers](/legal/pricing-disclaimers).`,
    'about-what',
  ),
  P(
    'about',
    'Is PM Structure an official PMI or PRINCE2 training provider?',
    `Today we operate as an independent exam-prep platform. ${DISCLAIMERS.accreditation} See our [pricing disclaimers](/legal/pricing-disclaimers).`,
    'about-official',
  ),
  P(
    'about',
    'What certifications does PM Structure cover?',
    'We support pathways across PMI (PMP®, CAPM®, PMI-ACP®), PRINCE2®, and Lean Six Sigma belts. Browse [/certifications](/certifications) or [compare](/certifications/compare).',
    'about-certs',
  ),
  P(
    'about',
    'Who is PM Structure for?',
    'Working professionals and career-changers preparing for project, program, and process-improvement credentials. You must meet each certification body’s eligibility before scheduling an official exam.',
    'about-who',
  ),
  P(
    'about',
    "What is PM Structure's brand promise?",
    BRAND_LINES.primary,
    'about-promise',
  ),
  P(
    'pathways',
    'What are Foundation, Professional, and Mastery tiers?',
    'Foundation is a shorter orientation phase. Professional is main exam-focused preparation (LMS, mocks, templates, support). Mastery is mentor-led with live sessions and consultation where required. See each certification page for scope.',
    'pathways-tiers',
  ),
  P(
    'pathways',
    'What is included in Professional tier delivery?',
    'Typical Professional delivery includes exam-focused LMS, practice exams, templates, WhatsApp support, and limited review—varies by offering. Check the pathway card on your certification page.',
    'pathways-pro',
  ),
  P(
    'pathways',
    'What is included in Mastery tier delivery?',
    'Mastery is mentor-led with weekend or live sessions, WhatsApp support, and consultation before access for some offerings. Mastery may require approved consultation before checkout.',
    'pathways-mastery',
  ),
  P(
    'pathways',
    'What is Foundation tier for?',
    'Foundation helps you understand pathway structure, exam domains at a high level, and study planning before intensive prep.',
    'pathways-foundation',
  ),
  P(
    'pathways',
    'Can I skip Foundation and start at Professional?',
    'Where Professional checkout is available and you meet prerequisites, you may enroll directly. Book a [consultation](/contact) if unsure.',
    'pathways-skip',
  ),
  P(
    'pathways',
    'How do I choose between PMP, CAPM, and PRINCE2?',
    'CAPM suits entry-level roles. PMP suits experienced leaders meeting PMI hours. PRINCE2 suits governance-focused roles. Use [/certifications/compare](/certifications/compare).',
    'pathways-choose',
  ),
  P(
    'timeline',
    'How long does it take to prepare for the PMP exam?',
    'Many candidates plan 2–4 months (often 100+ hours). Align your timeline with PMI eligibility and Pearson VUE scheduling.',
    'timeline-pmp',
  ),
  P(
    'timeline',
    'Does PM Structure guarantee I will pass?',
    `No. ${BRAND.name} does not guarantee exam passes, certifications, PDU/contact hours, or employment. We provide structured preparation and readiness reviews.`,
    'timeline-guarantee',
  ),
  P(
    'timeline',
    'Are practice exams updated for the current PMP exam format?',
    'We align to the current PMI Exam Content Outline (ECO). Verify the latest ECO on PMI.org before scheduling.',
    'timeline-eco',
  ),
  P(
    'timeline',
    'What is a readiness review?',
    'A structured check of mock scores, weak domains, and study plan before you book the official exam—on higher tiers or via consultation.',
    'timeline-readiness',
  ),
  P(
    'timeline',
    'When should I schedule my official exam?',
    'After you meet certification body eligibility and mocks/readiness indicate preparedness. Book exams with PMI, PeopleCert, or IASSC directly.',
    'timeline-schedule',
  ),
  P(
    'delivery',
    'Is training live or self-paced?',
    'Foundation and some tiers are self-paced LMS. Professional blends self-paced with support. Mastery includes mentor-led sessions. See each offering’s delivery mode on the pathway page.',
    'delivery-mode',
  ),
  P(
    'delivery',
    'How do I access course materials after purchase?',
    'You receive access instructions by email after successful checkout.\n\n• Check spam and promotions folders.\n• Allow up to one business day for provisioning.\n• Email support at support@pmstructure.com with your order email and offering ID if access is delayed.',
    'delivery-access',
  ),
  P(
    'delivery',
    'Is there mobile access?',
    'Materials work in modern mobile browsers. Check your welcome email for the current access method.',
    'delivery-mobile',
  ),
  P(
    'delivery',
    'What support channels are available?',
    'Depending on tier: LMS, community forums, WhatsApp groups, and limited mentor review. See [Services terms](/legal/services).',
    'delivery-support',
  ),
  P(
    'delivery',
    'Are sessions recorded?',
    'Recording policy is stated in cohort welcome materials when live sessions are offered. Do not assume all sessions are recorded.',
    'delivery-recorded',
  ),
  P(
    'pricing',
    'How does regional pricing work?',
    `${REGION_COPY.pricingSelector} ${REGION_COPY.southAsiaNote} Full policy: [/legal/regional-pricing](/legal/regional-pricing).`,
    'pricing-how',
  ),
  P(
    'pricing',
    'Why do prices change when I change region?',
    'We apply regional tuition rules from our published matrix. Global reference prices may display alongside regional scholarship prices where applicable.',
    'pricing-why',
  ),
  P(
    'pricing',
    'Is regional pricing a discount?',
    `Regional tuition is Regional Scholarship or regional price, not a promotional sale. ${REGION_COPY.membershipDiscountNote} on eligible pathways with active membership.`,
    'pricing-discount',
  ),
  P(
    'pricing',
    'What currency do I pay in at checkout?',
    `${REGION_COPY.checkoutNote}`,
    'pricing-currency',
  ),
  P(
    'pricing',
    'What is not included in the tuition price?',
    `${REGION_COPY.compliance}`,
    'pricing-excluded',
  ),
  P(
    'pricing',
    'How does membership pricing work on certifications?',
    `Active members receive ${REGION_COPY.membershipDiscountNote} Checkout applies 80% of the regional USD-cent amount when membership is selected.`,
    'pricing-member',
  ),
  P(
    'pricing',
    'What is GCC pricing?',
    'GCC learners select their GCC country in the region modal. Pricing may show a global reference alongside Gulf regional rules.',
    'pricing-gcc',
  ),
  P(
    'pricing',
    'Why is Mastery not available at scholarship price in my region?',
    `${REGION_COPY.masteryUnavailable}`,
    'pricing-mastery',
  ),
  P(
    'pricing',
    'What is scholarship verification?',
    'For certain offerings we verify residence and billing country match the selected scholarship region before checkout.',
    'pricing-verify',
  ),
  P(
    'membership',
    'What membership plans does PM Structure offer?',
    'Free, Professional, and Mastery-style tiers with different community access. See [/membership](/membership) and [membership terms](/legal/membership-terms).',
    'member-plans',
  ),
  P(
    'membership',
    'Can I access the community without paying?',
    'Yes—public community is on the free tier. Private study circles and mentor Q&A are typically paid membership benefits.',
    'member-free',
  ),
  P(
    'membership',
    'How do I cancel membership?',
    'Cancellation rules are at signup and in [membership terms](/legal/membership-terms). Contact support@pmstructure.com or use account settings when available.',
    'member-cancel',
  ),
  P(
    'consultation',
    'What is a pathway consultation?',
    'An advisory conversation to match your experience and goals to the right pathway—book via [/contact](/contact) or certification CTAs.',
    'consult-what',
  ),
  P(
    'consultation',
    'When is consultation required before purchase?',
    'Some Mastery offerings require consultation and admin approval before checkout. Submit the form; once approved, checkout unlocks for your email and offering.',
    'consult-required',
  ),
  P(
    'consultation',
    'Do you offer corporate training?',
    'Yes—we offer cohort and corporate training.\n\n• See [/pm-service](/pm-service) for scope.\n• Read [Services terms](/legal/services).\n• Email support at support@pmstructure.com with team size, region, and target certifications for a quote.',
    'consult-corp',
  ),
  P(
    'exams',
    'Does PM Structure register me for the PMP exam?',
    'No. You register and pay PMI directly (e.g. Pearson VUE). We prepare you; you schedule when ready.',
    'exams-register',
  ),
  P(
    'exams',
    'What are typical official PMP exam fees?',
    'PMI member and non-member fees change—check pmi.org. Our tuition excludes those fees.',
    'exams-fees',
  ),
  P(
    'exams',
    'Who owns PMP®, PRINCE2®, and Six Sigma trademarks?',
    'PMI, PeopleCert/AXELOS (PRINCE2), and respective Six Sigma bodies. We are an independent prep provider unless stated in writing.',
    'exams-tm',
  ),
  P(
    'privacy',
    'How do I update my region for pricing?',
    'Use the region selector in the header. Logged-in users may save region in account settings.',
    'privacy-region',
  ),
  P(
    'privacy',
    'What data do you collect at checkout?',
    'Email, residence and billing country, verification fields, and order metadata when you submit checkout. We do not collect card numbers on this site. See [Privacy](/legal/privacy).',
    'privacy-checkout',
  ),
  P(
    'privacy',
    'How do I request access to or deletion of my data?',
    'Email support at support@pmstructure.com with subject “Privacy request”.\n\n• Include your account email and region.\n• State whether you want access, correction, or deletion.\n• EU/UK/India users have additional rights in [regional privacy addenda](/legal/privacy).',
    'privacy-dsar',
  ),
  P(
    'privacy',
    'What cookies does the site use?',
    'Necessary cookies for region, theme, session, and consent; optional analytics only after consent. See [Cookie Policy](/legal/cookies).',
    'privacy-cookies',
  ),
  P(
    'privacy',
    'Can children under 13 use PM Structure?',
    'No—our services are not directed at children.\n\n• Minimum purchase age is 18 (or age of majority).\n• We do not knowingly collect data from children under 16.\n• Parents or guardians: email support at support@pmstructure.com immediately if you believe a child’s data was collected.',
    'privacy-children',
  ),
  P(
    'privacy',
    'Where are your legal policies?',
    'All policies are in the [Legal hub](/legal): Terms, Privacy, Cookies, Services, pricing, refunds, and more.',
    'privacy-legal',
  ),
  P(
    'support',
    'I have a problem at checkout—what should I do?',
    'Confirm region, email, residence/billing country, and scholarship verification. For Mastery, ensure consultation is approved. Contact support with your offering ID.',
    'support-checkout',
  ),
  P(
    'support',
    'How do I contact support?',
    'Email support at support@pmstructure.com for all enquiries.\n\n• Billing, access, refunds, privacy, and policy questions use the same inbox.\n• Include your order email, region, and offering ID when relevant.\n• See [/legal](/legal) for full policies.',
    'support-contact',
  ),
  P(
    'support',
    'Is my payment secure?',
    'Checkout records your request and pricing selection. Payment is arranged offline — we do not process cards on this website.',
    'support-pay',
  ),
  P(
    'geo',
    'Best PMP prep platform independent of PMI?',
    `${BRAND.name} offers independent PMP preparation with Foundation/Professional/Mastery pathways, ECO-aligned mocks, and regional pricing at [/certifications/pmp](/certifications/pmp). We are not PMI.`,
    'geo-best',
  ),
  P(
    'geo',
    "PM Structure vs official PMI training—what's the difference?",
    'Official PMI providers may offer contact hours under PMI rules; we focus on structured exam readiness as an independent platform.',
    'geo-vs-pmi',
  ),
  P(
    'geo',
    'How much does PMP training cost in India on PM Structure?',
    'With India selected, PMP Professional shows regional scholarship tuition (e.g. ₹44,999 in our catalogue) plus optional membership at 20% off displayed regional tuition. Checkout is USD-equivalent. Exam fees are separate.',
    'geo-india',
  ),
  P(
    'geo',
    'How long is the PM Structure PMP course?',
    'Planned guides: Foundation ~2 weeks, Professional ~6 weeks, Mastery ~12 weeks on the PMP page—your pace may differ.',
    'geo-length',
  ),
  P(
    'exams',
    'Does PM Structure include PMI contact hours?',
    'We state PDU or contact-hour eligibility only where formally approved. See [pricing disclaimers](/legal/pricing-disclaimers).',
    'exams-pdu',
  ),
  P(
    'pricing',
    'Can I get a refund if scholarship verification fails?',
    'If verification fails, correct residence and billing country or choose a different region. See [refunds](/legal/refunds).',
    'pricing-refund-verify',
  ),
  P(
    'membership',
    'Does membership include certification exam fees?',
    'No. Membership benefits apply to platform tuition; official exam fees are paid to certification bodies directly.',
    'member-exam-fees',
  ),
  P(
    'delivery',
    'How long do I have access after purchase?',
    'Access length depends on your pathway and tier.\n\n• Check your order confirmation and welcome email.\n• Typical access runs for the published study window plus any grace period stated there.\n• Email support at support@pmstructure.com with your order email if duration is unclear.',
    'delivery-duration',
  ),
  P(
    'about',
    'Is PM Structure the same as PMI?',
    `No. ${BRAND.name} is an independent exam-preparation platform. PMI owns the PMP® credential and exam.`,
    'about-not-pmi',
  ),
  P(
    'pricing',
    'What is the 14-day refund window for pathways?',
    'You may request cancellation within 14 days of purchase if you have not started the LMS or downloaded substantial materials.\n\n• After access begins, refunds are generally not available except where law requires.\n• See [Refunds & Cancellations](/legal/refunds).\n• Email support at support@pmstructure.com with your order email.',
    'pricing-refund-window',
  ),
  P(
    'privacy',
    'How do I opt out of analytics cookies after accepting?',
    'You can withdraw non-essential cookie consent at any time.\n\n• Clear site data / local storage for pmstructure.com in your browser, then reload.\n• The cookie banner will appear again so you can reject analytics.\n• Necessary cookies (region, theme, session, consent record) remain required to use the site.\n• Details: [Cookie Policy](/legal/cookies).',
    'privacy-cookie-optout',
  ),
  P(
    'privacy',
    'Where is my data stored?',
    'We use reputable cloud providers listed in our [Subprocessors](/legal/subprocessors) page.\n\n• Database and auth: Supabase (region per project).\n• Hosting serves the marketing site and API.\n• Email support at support@pmstructure.com for enterprise data questions.',
    'privacy-hosting',
  ),
  P(
    'membership',
    'How do I stop membership renewal?',
    'Cancel before your next billing date to avoid renewal charges.\n\n• Use account settings when available, or email support at support@pmstructure.com.\n• Access continues until the end of the paid period.\n• See [Membership terms](/legal/membership-terms) and [Refunds](/legal/refunds).',
    'membership-renewal',
  ),
  P(
    'consultation',
    'How does Mastery consultation approval work?',
    'Some Mastery pathways require human approval before checkout.\n\n• Submit the consultation form on the certification or contact page.\n• Once approved for your email and offering ID, checkout unlocks.\n• If stuck, email support at support@pmstructure.com with your email and pathway name.',
    'consult-mastery-gate',
  ),
  P(
    'delivery',
    'When does the 14-day refund clock start?',
    'The clock starts when your purchase is confirmed, but refunds apply only before substantial access.\n\n• “Started” means LMS access granted or substantial materials downloaded.\n• See [Refunds](/legal/refunds) for membership and services rules.\n• Email support at support@pmstructure.com to request cancellation.',
    'delivery-refund-start',
  ),
  ...certFaqs(),
];
