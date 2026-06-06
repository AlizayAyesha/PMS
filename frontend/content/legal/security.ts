import type { LegalDocument } from './types';
import { LEGAL_LAST_UPDATED, LEGAL_SUPPORT_EMAIL, legalSupportSection, section } from './shared';

export const securityDocument: LegalDocument = {
  slug: 'security',
  title: 'Security Overview',
  lastUpdated: LEGAL_LAST_UPDATED,
  jurisdictionNote: 'High-level security practices for our platform.',
  sections: [
    section(
      'practices',
      '1. Practices',
      'We use HTTPS for public pages and access controls for admin areas. Passwords are handled by our auth provider. We do not process card payments on this website.',
    ),
    section(
      'report',
      '2. Reporting vulnerabilities',
      `Responsible disclosure: email ${LEGAL_SUPPORT_EMAIL} with subject “Security report”, steps to reproduce, and impact. Do not access data that is not yours.`,
    ),
    section(
      'breach',
      '3. Data breaches',
      'If a breach affects your personal data, we will notify you and regulators as required by applicable law. See [Privacy Policy](/legal/privacy).',
    ),
    section(
      'contact',
      '4. Contact',
      legalSupportSection('security'),
    ),
  ],
};
