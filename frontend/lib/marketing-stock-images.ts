/**
 * Stable stock imagery for marketing sections until CMS/media library assets are assigned.
 * Uses picsum seeds so URLs stay deterministic across deploys.
 */

const picsum = (seed: string, width: number, height: number) =>
  `https://picsum.photos/seed/${seed}/${width}/${height}`;

export const MARKETING_STOCK_IMAGES = {
  hero: picsum('pms-hero-professional', 1200, 1500),
  insights: picsum('pms-insights-leadership', 900, 1125),
  communityGrid: [
    { src: picsum('pms-community-collab', 600, 600), alt: 'Project professionals collaborating' },
    { src: picsum('pms-community-workshop', 600, 450), alt: 'Study workshop session' },
    { src: picsum('pms-community-mentor', 600, 450), alt: 'Mentor-led discussion' },
    { src: picsum('pms-community-network', 600, 600), alt: 'Professional networking' },
  ],
  mentorship: {
    src: picsum('pms-mentorship-circle', 900, 900),
    alt: 'Community study circle and mentorship',
  },
  membershipResources: [
    { src: picsum('pms-resource-templates', 500, 500), alt: 'Exam prep templates' },
    { src: picsum('pms-resource-guides', 500, 500), alt: 'Study guides and playbooks' },
    { src: picsum('pms-resource-tools', 500, 500), alt: 'PM planning tools' },
    { src: picsum('pms-resource-webinars', 500, 500), alt: 'Expert webinar recordings' },
  ],
} as const;
