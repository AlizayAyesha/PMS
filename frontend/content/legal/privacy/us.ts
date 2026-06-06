import type { LegalDocument } from '../types';
import { LEGAL_LAST_UPDATED, LEGAL_SUPPORT_EMAIL, legalSupportSection, section } from '../shared';

export const privacyUsDocument: LegalDocument = {
  slug: 'privacy-us',
  title: 'Privacy Policy (United States)',
  lastUpdated: LEGAL_LAST_UPDATED,
  jurisdictionNote:
    'Addendum for US residents (including state privacy laws such as CPRA where applicable).',
  sections: [
    section(
      'categories',
      '1. Categories of personal information',
      'We may collect: identifiers (name, email); commercial information (orders, regional pricing verification); internet/technical data (IP, cookies); and communications you send us. We do not sell personal information.',
    ),
    section(
      'sources',
      '2. Sources',
      'Directly from you (forms, checkout, support) and automatically from your device (cookies/logs). We do not process card payments on this website.',
    ),
    section(
      'rights',
      '3. Your state privacy rights',
      'Depending on your state you may request access, deletion, correction, or opt-out of certain processing. California residents may have additional rights under the CPRA.',
    ),
    section(
      'children',
      '4. Children under 13',
      'Our services are not directed at children under 13 and we do not knowingly collect personal information from children under 13. If you believe we have, contact support immediately.',
    ),
    section(
      'verify',
      '5. Verifying requests',
      `We verify identity before fulfilling access or deletion requests. Email ${LEGAL_SUPPORT_EMAIL} with subject “US privacy request”, your state, and the right you wish to exercise.`,
    ),
    section(
      'contact',
      '6. Contact',
      legalSupportSection('US privacy'),
    ),
  ],
};
