import type { LegalDocument } from './types';
import { LEGAL_LAST_UPDATED, legalSupportSection, section } from './shared';

export const subprocessorsDocument: LegalDocument = {
  slug: 'subprocessors',
  title: 'Subprocessors',
  lastUpdated: LEGAL_LAST_UPDATED,
  jurisdictionNote: 'Third parties that process personal data on our behalf. Last reviewed 2026-05-23.',
  sections: [
    section(
      'list',
      '1. Current subprocessors',
      '• **Supabase** — database, authentication, and form storage (region per project configuration).\n• **Application hosting** — serves the marketing site and API (e.g. Railway, Vercel, or equivalent production host).\n• **Email delivery** — transactional email (order confirmations, access instructions) and newsletter when opted in.\n• **Analytics** (optional, after cookie consent) — website usage metrics when enabled.',
    ),
    section(
      'purpose',
      '2. Why we use them',
      'Each subprocessor helps us run the platform: hosting, security, and communication. We do not authorise subprocessors to use your data for their own marketing without appropriate controls.',
    ),
    section(
      'changes',
      '3. Changes',
      'We update this list when we add or replace processors. Material changes are reflected in the Privacy Policy “Last updated” date.',
    ),
    section(
      'dpa',
      '4. Enterprise DPA',
      'Business customers may request a [Data Processing Agreement](/legal/dpa) with subprocessor details for their contract.',
    ),
    section(
      'contact',
      '5. Contact',
      legalSupportSection('subprocessors'),
    ),
  ],
};

