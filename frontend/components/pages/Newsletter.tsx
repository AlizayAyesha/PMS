'use client';
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Search, ArrowRight, TrendingUp, Loader2 } from "lucide-react";
import { 
  CategoryChip, 
  ArticleCard, 
  FeaturedPost, 
  CTABanner 
} from "@/components/NewsletterComponents";
import { PAGE_HERO_PADDING } from "@/components/SectionAmbience";
import { useNewsletterArticles } from "@/hooks/useNewsletterArticles";
import { useNewsletterHubConfig } from "@/hooks/useNewsletterHubConfig";
import { useNewsletterCategories } from "@/hooks/useNewsletterCategories";
import { getNewsletterArticleHref } from "@pms/site-content/newsletter-posts";

const SUBSCRIBER_COUNT = "5,000+";

function renderHeroTitle(title: string) {
  const marker = "Structure";
  const index = title.indexOf(marker);
  if (index === -1) return title;
  return (
    <>
      {title.slice(0, index)}
      <span className="text-pms-gradient-blue-cyan">{marker}</span>
      {title.slice(index + marker.length)}
    </>
  );
}

export function Newsletter() {
  const { articles, isLoading } = useNewsletterArticles();
  const { config: hub } = useNewsletterHubConfig();
  const categories = useNewsletterCategories(articles);
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [visibleCount, setVisibleCount] = React.useState(4);

  React.useEffect(() => {
    if (!categories.includes(activeCategory)) {
      setActiveCategory("All");
    }
  }, [activeCategory, categories]);

  const filteredArticles = React.useMemo(() => {
    if (activeCategory === "All") return articles;
    return articles.filter((a) => a.category === activeCategory);
  }, [activeCategory, articles]);

  const featuredArticle = filteredArticles[0] ?? articles[0];
  const visibleArticles = filteredArticles.slice(0, visibleCount);

  if (isLoading && articles.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Newsletter Hero / Title Section */}
      <section
        className={`relative border-b border-slate-100 dark:border-slate-900 overflow-hidden bg-gradient-to-br from-cyan-50/70 via-slate-50 to-blue-50/50 dark:from-[#061628] dark:via-slate-950 dark:to-[#0a1535] ${PAGE_HERO_PADDING}`}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-15%] right-[-8%] w-[45%] h-[48%] rounded-full blur-[120px] opacity-35 bg-pms-gradient-blue-cyan" />
          <div className="absolute bottom-[-25%] left-[-12%] w-[42%] h-[45%] rounded-full blur-[120px] opacity-30 bg-pms-gradient-blue-purple dark:opacity-40" />
          <div className="absolute top-[30%] left-[35%] w-[22%] h-[28%] rounded-full blur-[100px] opacity-15 bg-pms-gradient-blue-cyan dark:opacity-25" />
        </div>
        <div className="container relative z-10 mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-3xl text-center md:text-left mx-auto md:mx-0">
              <Badge variant="outline" className="mb-6 border-[#0859b3]/25 text-[#0859b3] dark:text-[#57d5e2] bg-[#0859b3]/5 dark:bg-[#57d5e2]/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]">
                {hub.hero.badge}
              </Badge>
              <h1 className="font-heading text-hero font-bold tracking-tight leading-tight text-slate-900 dark:text-white mb-8">
                {renderHeroTitle(hub.hero.title)}
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium max-w-2xl md:mx-0 mx-auto">
                {hub.hero.subtitle} Delivered weekly to {SUBSCRIBER_COUNT} professionals.
              </p>
              <p className="mt-6">
                <Link
                  href="/membership"
                  className="inline-flex items-center gap-2 text-sm font-bold text-brand-orange hover:text-brand-hover transition-colors"
                >
                  Explore membership benefits
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </p>
            </div>
            <div className="w-full md:w-auto">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-brand-purple transition-colors" />
                <Input 
                  placeholder="Search articles..." 
                  className="pl-12 h-14 w-full md:w-[350px] rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-brand-purple"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Topics / Categories Grid */}
      <section className="py-8 bg-slate-50/50 dark:bg-slate-900/20 sticky top-16 z-40 backdrop-blur-md border-b border-slate-100 dark:border-slate-900">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest shrink-0 mr-2">Topics:</span>
            {categories.map((cat) => (
              <CategoryChip 
                key={cat} 
                label={cat} 
                active={activeCategory === cat} 
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto py-12">
        {/* 2. Featured Article */}
        <FeaturedPost article={featuredArticle} />

        <Separator className="my-12 opacity-50" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:items-stretch">
          {/* Main Content: Latest Posts */}
          <div className="lg:col-span-8 min-w-0">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-heading text-3xl font-bold">Latest Insights</h2>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <span>Sort by:</span>
                <select className="bg-transparent border-none focus:ring-0 cursor-pointer font-bold text-slate-900 dark:text-white">
                  <option>Newest First</option>
                  <option>Most Read</option>
                  <option>Long Reads</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {visibleArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>

            {visibleCount < filteredArticles.length && (
              <div className="mt-16 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-12 rounded-2xl border-slate-200 dark:border-slate-800 font-bold group"
                  onClick={() => setVisibleCount((n) => Math.min(n + 2, filteredArticles.length))}
                >
                  Load More Articles <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar: Popular & Editor Picks — equal panels, stretch to main column height on lg */}
          <aside className="lg:col-span-4 flex flex-col gap-6 lg:h-full">
            <div className="flex flex-col flex-1 min-h-0 p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-6 shrink-0">
                <TrendingUp className="h-6 w-6 text-brand-orange" />
                <h3 className="font-heading text-2xl font-bold">Popular Now</h3>
              </div>
              <div className="flex flex-1 flex-col justify-between gap-5 min-h-0">
                {articles.slice(0, 4).map((article, index) => (
                  <Link
                    key={article.slug}
                    href={getNewsletterArticleHref(article)}
                    className="flex gap-4 group"
                  >
                    <span
                      className="text-4xl font-heading font-black tabular-nums leading-none text-slate-300 dark:text-slate-600 group-hover:text-brand-orange transition-colors duration-300 shrink-0"
                      aria-hidden
                    >
                      0{index + 1}
                    </span>
                    <div className="min-w-0">
                      <Badge variant="link" className="p-0 h-auto text-brand-purple text-[10px] uppercase tracking-widest font-bold mb-1">
                        {article.category}
                      </Badge>
                      <h4 className="font-bold leading-tight group-hover:text-brand-purple transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-2">{article.readTime}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col flex-1 min-h-0 p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <h3 className="font-heading text-2xl font-bold mb-6 shrink-0">Editor&apos;s Picks</h3>
              <div className="flex flex-1 flex-col justify-center gap-8 min-h-0">
                {articles.slice(4, 6).map((article) => (
                  <ArticleCard key={article.slug} article={article} variant="horizontal" />
                ))}
              </div>
              <Link href="/newsletter" className="block mt-6 shrink-0">
                <Button className="w-full bg-brand-purple hover:bg-brand-purple/90">
                  View all articles
                </Button>
              </Link>
            </div>
          </aside>
        </div>

        {/* 7. Join Newsletter CTA (Large) */}
        <CTABanner 
          title="Stay Ahead of the Curve" 
          description={`Join ${SUBSCRIBER_COUNT} project professionals receiving weekly deep-dives on methodology, leadership, and career growth.`}
          buttonText="Join the Newsletter"
          buttonHref="/newsletter"
          variant="orange"
        />

        {/* 8. Membership CTA */}
        <CTABanner 
          title="Join the PM Structure Newsletter" 
          description="Members get access to case studies, exam simulators, and mentor-led sessions focused on readiness and practical project judgment."
          buttonText="Explore Membership"
          buttonHref="/membership"
          variant="purple"
        />
      </div>
    </div>
  );
}
