'use client';
import * as React from "react";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { 
  Users, 
  Star, 
  Slack, 
  Users2, 
  MapPin, 
  GraduationCap,
  ArrowRight,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useWebsiteData } from "@/services/WebsiteDataService";
import { usePublishedSiteDocument } from "@/lib/usePublishedSiteDocument";
import { FIELD_KEYS, defaultCommunityPageConfig, parseCommunityPageConfig } from "@pms/site-content";
import { StoreContent } from "@/components/pages/Store";
import { BRAND, COMMUNITY_COPY } from "@/lib/brand-voice";
import { MARKETING_STOCK_IMAGES } from "@/lib/marketing-stock-images";
import { pageHeroSection, SectionAmbience, sectionSurface } from "@/components/SectionAmbience";

const communityChannels = [
  {
    title: `${BRAND.name} Slack`,
    desc: "Our primary hub for real-time networking, job alerts, and quick Q&A.",
    icon: Slack,
    color: "text-[#4A154B]",
    bg: "bg-[#4A154B]/5 dark:bg-[#4A154B]/10",
    members: "8.4k"
  },
  {
    title: "Study Circles",
    desc: "Small, focused groups dedicated to specific certifications like PMP or PRINCE2.",
    icon: GraduationCap,
    color: "text-brand-purple",
    bg: "bg-brand-purple/5 dark:bg-brand-purple/10",
    members: "1.2k"
  },
  {
    title: "Local Chapters",
    desc: "Connect with project leaders in your city for in-person meetups and networking.",
    icon: MapPin,
    color: "text-brand-orange",
    bg: "bg-brand-orange/5 dark:bg-brand-orange/10",
    members: "45 Chapters"
  }
];

const mentorshipFeatures = [
  {
    title: "Peer Mentorship",
    desc: "Connect with professionals who have recently passed the exams you're targeting.",
    icon: Heart
  },
  {
    title: "Expert Office Hours",
    desc: "Weekly live sessions with senior PMs to discuss career hurdles and complex projects.",
    icon: Star
  },
  {
    title: "Career Pathing",
    desc: "Structured guidance on moving from Junior to Senior and Executive PM roles.",
    icon: GraduationCap
  }
];

function CommunityNetworkContent() {
  const { get } = useWebsiteData();

  return (
    <>
      {/* Community Channels */}
      <section className="py-20 -mt-20 relative z-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {communityChannels.map((channel, index) => (
              <motion.div
                key={channel.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Card className="h-full border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                  <CardHeader className={cn("p-8", channel.bg)}>
                    <div className={cn("p-4 rounded-xl bg-white dark:bg-slate-900 shadow-sm mb-6 w-fit transition-transform group-hover:scale-110", channel.color)}>
                      <channel.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">{channel.title}</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400 mt-3 text-base font-medium leading-relaxed">{channel.desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm">
                        <Users2 className="h-4 w-4" />
                        <span>{channel.members} members</span>
                      </div>
                      <Link href="/contact">
                        <Button variant="ghost" size="sm" className="text-brand-orange font-bold text-base group-hover:translate-x-1 transition-transform">
                          Join <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentorship & Growth */}
      <section className={sectionSurface('purple', 'py-32')}>
        <SectionAmbience tone="purple" />
        <div className="container relative z-10 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight">
                {get('community_mentorship_title', 'A Culture of Mentorship')}
              </h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium">
                {get('community_mentorship_subtitle', 'We believe the best way to master project management is to learn from those who have already walked the path. Our community is built on a foundation of mutual support and professional generosity.')}
              </p>
              <div className="space-y-8">
                {mentorshipFeatures.map((feature) => (
                  <div key={feature.title} className="flex gap-6 group">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-brand-purple h-fit transition-transform group-hover:scale-110 shadow-sm border border-slate-100 dark:border-slate-800">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{feature.title}</h3>
                      <p className="text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-[3rem] bg-slate-100 dark:bg-slate-800 overflow-hidden relative shadow-2xl border-4 border-white dark:border-slate-900">
                <img
                  src={MARKETING_STOCK_IMAGES.mentorship.src}
                  alt={MARKETING_STOCK_IMAGES.mentorship.alt}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-8 rounded-3xl border border-white/20 dark:border-slate-800 shadow-xl">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-brand-purple shrink-0 shadow-md" />
                    <div>
                      <div className="font-bold text-lg text-slate-900 dark:text-white leading-relaxed tracking-tight">&quot;The study circles were the reason I passed my PMP on the first try. The support is unmatched.&quot;</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-bold uppercase tracking-widest">— Sarah J., Senior PM</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Events Feed */}
      <section className={sectionSurface('cool', 'py-32')}>
        <SectionAmbience tone="cool" />
        <div className="container relative z-10 mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">Live Sessions & Events</h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 mt-4 font-medium">Join our upcoming interactive workshops and networking mixers.</p>
            </div>
            <Link href="/contact">
              <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-800 h-12 px-6 font-bold text-base">View Full Calendar</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { date: "Oct 24", title: "PMP Exam Strategy Workshop", host: "Robert Vance, PMP", type: "Study Circle" },
              { date: "Oct 26", title: "Agile Leadership in Tech", host: "Elena Gilbert", type: "Expert Session" },
              { date: "Oct 29", title: "Global PM Networking Mixer", host: `${BRAND.name} Team`, type: "Networking" },
            ].map((event) => (
              <Card key={event.title} className="border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-[2rem] overflow-hidden group bg-white dark:bg-slate-900">
                <CardContent className="p-0">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <Badge className="text-[10px] uppercase tracking-widest font-bold bg-brand-purple/10 text-brand-purple border-none px-3 py-1">
                        {event.type}
                      </Badge>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{event.date}</div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-brand-orange transition-colors tracking-tight">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                      <Users className="h-4 w-4 text-brand-orange" />
                      <span>Host: {event.host}</span>
                    </div>
                  </div>
                  <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">124 attending</span>
                    <Link href="/contact">
                      <Button size="sm" variant="brand" className="rounded-lg h-10 px-4 font-bold text-xs">Register Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={sectionSurface('warm', 'py-32')}>
        <SectionAmbience tone="warm" />
        <div className="container relative z-10 mx-auto">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/10 to-brand-orange/10 pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight leading-tight">Ready to join the structure?</h2>
              <p className="text-slate-400 text-lg md:text-xl mb-12 font-medium leading-relaxed">
                Your professional network supports readiness and delivery judgment. Start building it with {BRAND.name}.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/contact">
                  <Button size="lg" variant="brand" className="h-14 px-8 rounded-2xl font-bold text-lg shadow-xl transition-all">
                    Join the Community
                  </Button>
                </Link>
                <Link href="/membership">
                  <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-white/10 h-14 px-8 rounded-2xl font-bold text-lg transition-all">
                    Explore Membership
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function Community() {
  const { get } = useWebsiteData();
  const fallback = defaultCommunityPageConfig();
  const { data: pageConfig } = usePublishedSiteDocument(FIELD_KEYS.COMMUNITY_PAGE_CONFIG, {
    parse: (raw) => (raw ? parseCommunityPageConfig(raw) : null),
  });
  const hero = pageConfig?.hero ?? fallback.hero;
  const network = pageConfig?.network ?? fallback.network;
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = React.useState<"community" | "store">("community");

  React.useEffect(() => {
    setActiveTab(searchParams.get("view") === "store" ? "store" : "community");
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    const tab = value as "community" | "store";
    setActiveTab(tab);
    router.replace(tab === "store" ? "/community?view=store" : "/community", { scroll: false });
    requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const heroTabButtonClass = (tab: "community" | "store") =>
    cn(
      "h-12 px-6 rounded-xl font-bold text-base transition-all",
      activeTab === tab
        ? "bg-brand-orange hover:bg-brand-hover text-white shadow-xl border-transparent"
        : "border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900 bg-transparent shadow-none",
    );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className={pageHeroSection('blend', 'text-center')}>
        <SectionAmbience tone="blend" />
        
        <div className="container relative z-10 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-brand-orange/10 text-brand-orange border-none px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]">
              {hero.badge || get('community_badge', COMMUNITY_COPY.heroBadge)}
            </Badge>
            <h1 className="font-heading text-hero font-bold text-slate-900 dark:text-white mb-8 tracking-tight leading-tight">
              {hero.title || get('community_title', COMMUNITY_COPY.heroTitle)}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
              {hero.subtitle || get('community_subtitle', COMMUNITY_COPY.heroSubtitle)}
            </p>
            {network.memberCount ? (
              <p className="mt-4 text-sm font-bold text-brand-orange">
                {network.memberCount.toLocaleString()}+ professionals in the network
              </p>
            ) : null}
          </motion.div>
        </div>
      </section>

      <section className="py-5 border-b border-slate-100 dark:border-slate-900 bg-slate-50/60 dark:bg-slate-900/30 sticky top-16 z-40 backdrop-blur-md">
        <div className="container mx-auto flex justify-center">
          <div
            className="inline-flex flex-col sm:flex-row justify-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
            role="tablist"
            aria-label="Community and resource store"
          >
            <Button
              type="button"
              size="lg"
              variant="ghost"
              role="tab"
              aria-selected={activeTab === "community"}
              className={heroTabButtonClass("community")}
              onClick={() => handleTabChange("community")}
            >
              Join Slack Community
            </Button>
            <Button
              type="button"
              size="lg"
              variant="ghost"
              role="tab"
              aria-selected={activeTab === "store"}
              className={heroTabButtonClass("store")}
              onClick={() => handleTabChange("store")}
            >
              Browse Resources
            </Button>
          </div>
        </div>
      </section>

      <div ref={contentRef} className="scroll-mt-24">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col">
          <TabsContent value="community" className="mt-0 outline-none">
            <CommunityNetworkContent />
          </TabsContent>

          <TabsContent value="store" className="mt-0 outline-none">
            <StoreContent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
