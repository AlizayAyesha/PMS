import type { LegalDocument } from './types';
import { LEGAL_LAST_UPDATED, legalSupportSection, section } from './shared';
import { BRAND } from '@/lib/brand-voice';

export const cookiesDocument: LegalDocument = {
  slug: 'cookies',
  title: 'Cookie Policy',
  lastUpdated: LEGAL_LAST_UPDATED,
  jurisdictionNote: 'Describes how we use cookies and similar technologies on our website.',
  sections: [
    section(
      'what',
      '1. What are cookies?',
      'Cookies are small text files stored on your device when you visit a website. We also use local storage for preferences and consent records.',
    ),
    section(
      'necessary',
      '2. Strictly necessary',
      'These are required for the site to function. You cannot opt out while using the site.',
    ),
    section(
      'table',
      '3. Storage we use',
      '| Name / key | Type | Purpose | Duration |\n| --- | --- | --- | --- |\n| `pms_region` (local storage) | Necessary | Remembers your pricing region | Until cleared |\n| `theme` (local storage) | Necessary | Light or dark mode | Until cleared |\n| Session / auth cookies | Necessary | Login to member or admin areas | Session |\n| `legal_cookie_consent_v1` (local storage) | Necessary | Records cookie consent choice and version | Until cleared or updated |\n| Analytics (if enabled) | Optional | Traffic measurement after you accept | Per provider |',
    ),
    section(
      'optional',
      '4. Optional cookies',
      'Analytics cookies are off until you accept them in the cookie banner. Rejecting non-essential cookies does not block checkout or course access. We do not sell personal data through cookies.',
    ),
    section(
      'manage',
      '5. How to manage cookies',
      '• Use the cookie banner on first visit to accept or reject non-essential cookies.\n• Clear site data in your browser to reset consent; the banner will appear again.\n• Change region anytime via the header region selector.\n• To withdraw analytics consent after accepting, clear local storage for this site or use browser controls, then reload.',
    ),
    section(
      'third',
      '6. Third parties',
      'Supabase (auth/forms) and hosting providers may set their own cookies when you use those features. See [Subprocessors](/legal/subprocessors).',
    ),
    section(
      'updates',
      '7. Updates',
      `We may update this policy. The “Last updated” date at the top reflects the latest version. Continued use of ${BRAND.name} after changes constitutes notice.`,
    ),
    section(
      'contact',
      '8. Contact',
      legalSupportSection('cookies'),
    ),
  ],
};
