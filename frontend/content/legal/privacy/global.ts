import type { LegalDocument } from '../types';
import {
  LEGAL_CONTROLLER_LINE,
  LEGAL_LAST_UPDATED,
  LEGAL_SUPPORT_EMAIL,
  legalSupportSection,
  section,
} from '../shared';
import { BRAND } from '@/lib/brand-voice';

export const privacyGlobalDocument: LegalDocument = {
  slug: 'privacy-global',
  title: 'Privacy Policy (Global)',
  lastUpdated: LEGAL_LAST_UPDATED,
  jurisdictionNote:
    'Baseline privacy notice for all visitors. Select your region for additional rights and disclosures.',
  sections: [
    section(
      'controller',
      '1. Who we are',
      `Controller: ${LEGAL_CONTROLLER_LINE}. This policy explains how ${BRAND.name} processes personal data on our website and services. For privacy requests email ${LEGAL_SUPPORT_EMAIL}.`,
    ),
    section(
      'collect',
      '2. Data we collect',
      '• Identity & contact: name, email, phone when you subscribe, checkout, book consultation, or contact support.\n• Account: login credentials and profile if you register.\n• Transaction: order history, residence and billing country, and regional pricing verification fields (checkout requests; no card payment on this site).\n• Technical: IP address, browser type, device data, cookies and local storage (see [Cookie Policy](/legal/cookies)).\n• Communications: messages you send us and newsletter preferences.\n• Region selection: country/region you choose for pricing (stored in local storage).',
    ),
    section(
      'use',
      '3. How we use data',
      'To provide pathways and services, process payments, verify regional eligibility, send newsletters you opt into, improve the site, prevent fraud, comply with law, and respond to support enquiries. We do not sell personal data.',
    ),
    section(
      'bases',
      '4. Legal bases (where GDPR applies)',
      '• Contract — delivering your order and account.\n• Consent — marketing/newsletter and optional analytics cookies.\n• Legitimate interests — security, fraud prevention, and product improvement where balanced against your rights.\n• Legal obligation — tax, accounting, and regulatory requirements.',
    ),
    section(
      'sharing',
      '5. Sharing',
      'We use processors listed at [/legal/subprocessors](/legal/subprocessors) for hosting, database/auth (Supabase), and email. Optional analytics runs only after cookie consent. We may disclose data if required by law or to protect rights and safety.',
    ),
    section(
      'retention',
      '6. Retention',
      '• Account and order records: while your account is active and for a reasonable period after (typically up to 7 years where required for tax/legal).\n• Marketing: until you unsubscribe or withdraw consent.\n• Support tickets: long enough to resolve your issue and improve service.\n• Logs and security data: limited periods unless needed for investigations.',
    ),
    section(
      'transfers',
      '7. International transfers',
      'Data may be processed outside your country (e.g. US/EU cloud providers). Where required we use appropriate safeguards such as Standard Contractual Clauses. See regional addenda for local details.',
    ),
    section(
      'rights',
      '8. Your rights',
      'Depending on your location you may have rights to access, correct, delete, restrict, object, or port your data, and withdraw consent. Email support with subject line “Privacy request”, your region, and enough detail to identify your account. See [/legal/privacy](/legal/privacy) for EU, UK, US, India, Pakistan, and GCC supplements.',
    ),
    section(
      'children',
      '9. Children',
      'Our services are not directed at children under 16. Purchases require you to be 18+ (or age of majority). We do not knowingly collect data from children under 16. If you believe we have, email support immediately so we can delete it. Regional addenda may specify lower age thresholds for consent in specific countries.',
    ),
    section(
      'breach',
      '10. Data breaches',
      'If a personal data breach poses risk to your rights, we will notify you and regulators as required by applicable law without undue delay.',
    ),
    section(
      'changes',
      '11. Changes',
      'We post updates on this page with a new “Last updated” date. Material changes may also be noted in the cookie banner version where relevant.',
    ),
    section(
      'contact',
      '12. Contact',
      legalSupportSection('this Privacy Policy'),
    ),
  ],
};

