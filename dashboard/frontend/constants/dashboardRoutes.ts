import {
  LayoutDashboard,
  Inbox,
  MousePointer2,
  ShieldAlert,
  Search,
  Map,
  LineChart,
  Settings,
  History,
  ImageIcon,
  Newspaper,
  Radio,
  ClipboardList,
  ShoppingCart,
  FileCheck,
  GraduationCap,
  Users,
  FileText,
  Tag,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { PUBLIC_SITE_PAGES, dashboardPageEditorPath } from './publicSitePages';

export interface DashboardNavSubItem {
  name: string;
  path: string;
  icon?: LucideIcon;
}

export interface DashboardNavSection {
  title: string;
  items: {
    name: string;
    path: string;
    icon: LucideIcon;
    subItems?: DashboardNavSubItem[];
  }[];
}

export const BOOKINGS_ROUTE_PREFIXES = ['/dashboard/booking-crm', '/dashboard/account'];

export const WEBSITE_ROUTE_PREFIXES = [
  '/dashboard/site-system',
  '/dashboard',
  '/dashboard/migrate',
  '/dashboard/cms',
  '/dashboard/booking-crm/newsletter',
  '/dashboard/booking-crm/blogs',
];

export const PUBLISHER_ROUTE_PREFIXES = ['/dashboard/control-tower'];

/** @deprecated Use PUBLISHER_ROUTE_PREFIXES */
export const SOCIAL_ROUTE_PREFIXES = PUBLISHER_ROUTE_PREFIXES;

const NEWSLETTER_NAV_ITEM = {
  name: 'Newsletter',
  path: '/dashboard/booking-crm/newsletter',
  icon: Newspaper,
  subItems: [
    { name: 'Subscribers', path: '/dashboard/booking-crm/newsletter/subscribers', icon: Users },
    { name: 'Blogs Editor', path: '/dashboard/booking-crm/blogs', icon: Newspaper },
  ],
};

/** Always visible at top of sidebar — main CMS sections */
const OVERVIEW_NAV: DashboardNavSection = {
  title: 'Overview',
  items: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Media library', path: '/dashboard/site-system/media-library', icon: ImageIcon },
    { name: 'Posts', path: '/dashboard/cms/posts', icon: FileText },
    { name: 'Topics', path: '/dashboard/cms/topics', icon: Tag },
    NEWSLETTER_NAV_ITEM,
  ],
};

/** Admin sidebar: one item per live public website page */
const websitePageNavItems = PUBLIC_SITE_PAGES.map((page) => ({
  name: page.label,
  path: dashboardPageEditorPath(page.slug),
  icon: page.icon,
}));

export const DASHBOARD_ROUTES: Record<'publisher' | 'bookings' | 'website', DashboardNavSection[]> = {
  publisher: [
    OVERVIEW_NAV,
    {
      title: 'Publisher',
      items: [{ name: 'Control Tower', path: '/dashboard/control-tower', icon: Radio }],
    },
  ],
  bookings: [
    OVERVIEW_NAV,
    {
      title: 'Booking CRM',
      items: [
        { name: 'CTA Management', path: '/dashboard/booking-crm/cta', icon: MousePointer2 },
        { name: 'Sheets records', path: '/dashboard/booking-crm/interactions/sheets', icon: Inbox },
        { name: 'Consultations', path: '/dashboard/booking-crm/consultations', icon: ClipboardList },
        { name: 'Bookings', path: '/dashboard/booking-crm/bookings', icon: ShoppingCart },
        { name: 'Verification logs', path: '/dashboard/booking-crm/verification-logs', icon: FileCheck },
        { name: 'Scholarship review', path: '/dashboard/booking-crm/scholarship-review', icon: GraduationCap },
        { name: 'Account region', path: '/dashboard/account/region', icon: Map },
      ],
    },
  ],
  website: [
    OVERVIEW_NAV,
    {
      title: 'Website pages',
      items: websitePageNavItems,
    },
    {
      title: 'System',
      items: [
        { name: 'Security', path: '/dashboard/site-system/security', icon: ShieldAlert },
        { name: 'SEO Health', path: '/dashboard/site-system/seo', icon: Search },
        { name: 'Analytics', path: '/dashboard/site-system/analytics', icon: LineChart },
        { name: 'Settings', path: '/dashboard/site-system/settings', icon: Settings },
        { name: 'Data Migration', path: '/dashboard/migrate', icon: History },
      ],
    },
  ],
};
