import Link from 'next/link';
import { ImageIcon } from 'lucide-react';
import { PUBLIC_SITE_PAGES, dashboardPageEditorPath } from '@/constants/publicSitePages';
import { siteUrl } from '@/lib/site-config';

export default function SiteSystemHub() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-section text-3xl md:text-4xl mb-2">Website pages</h1>
        <p className="text-muted-foreground text-sm max-w-xl">
          Each item matches a page on the public site ({siteUrl}). Select a page to edit its content
          and SEO.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/dashboard/site-system/media-library"
          className="group p-6 rounded-2xl border border-brand-orange/30 bg-brand-orange/5 premium-shadow-hover hover:border-brand-orange/60 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-xl bg-brand-orange/20 text-brand-orange">
              <ImageIcon size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-lg group-hover:text-brand-orange transition-colors">
                Media library
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Upload images for hero slides, products, blog posts, and CMS fields
              </p>
              <span className="inline-block mt-2 text-label">Assets</span>
            </div>
          </div>
        </Link>

        {PUBLIC_SITE_PAGES.map((page) => {
          const Icon = page.icon;
          return (
            <Link
              key={page.slug}
              href={dashboardPageEditorPath(page.slug)}
              className="group p-6 rounded-2xl border border-border bg-card premium-shadow-hover hover:border-brand-orange/40 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-brand-orange/10 text-brand-orange">
                  <Icon size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-lg group-hover:text-brand-orange transition-colors">
                    {page.label}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{page.path}</p>
                  {page.inMainNav && <span className="inline-block mt-2 text-label">Main nav</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
