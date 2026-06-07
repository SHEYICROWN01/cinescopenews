/* Cinescope Global Concept — Homepage */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { type SiteArticle } from "@/components/site/ArticleCard";
import { AdSlot } from "@/components/site/AdSlot";
import { AD_SLOTS } from "@/lib/ads";
import { NewsletterCard } from "@/components/site/NewsletterCard";
import { ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import { getPublishedArticles } from "../fns/articles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cinescope Global Concept — Bold. Global. Investigative." },
      { name: "description", content: "Bold investigative journalism, in-depth analysis, and global news coverage from Cinescope Global Concept." },
    ],
  }),
  loader: () => getPublishedArticles(),
  component: Home,
});

const CAT_COLOR: Record<string, string> = {
  news: "#CC0000", sports: "#2A9D8F", metro: "#264653", politics: "#CC0000",
  world: "#457B9D", entertainment: "#F77F00", headlines: "#1D3557",
  business: "#457B9D", health: "#E76F51", education: "#06A77D",
  opinion: "#EA580C", technology: "#7C3AED",
};
function catColor(slug?: string | null) {
  return CAT_COLOR[(slug ?? "").toLowerCase()] ?? "#CC0000";
}

function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } }),
      { threshold: 0.07, rootMargin: "0px 0px -48px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

type CatGroup = { name: string; slug: string; color: string; articles: SiteArticle[] };
function buildCategoryGroups(articles: SiteArticle[], maxGroups = 12, perGroup = 6): CatGroup[] {
  const groups: CatGroup[] = [];
  const seen = new Set<string>();
  for (const a of articles) {
    if (!a.categorySlug || !a.categoryName) continue;
    if (!seen.has(a.categorySlug)) { seen.add(a.categorySlug); groups.push({ name: a.categoryName, slug: a.categorySlug, color: catColor(a.categorySlug), articles: [] }); }
    const g = groups.find((g) => g.slug === a.categorySlug)!;
    if (g.articles.length < perGroup) g.articles.push(a);
  }
  return groups.slice(0, maxGroups);
}

/* ══════════════════════════════════════════════════════════════════════════ */
function Home() {
  const all = Route.useLoaderData();
  useScrollReveal();

  if (all.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-3xl font-black text-ink mb-3">No articles yet</h2>
        <p className="text-ink-muted font-serif-body">Published articles will appear here once the newsroom goes live.</p>
      </div>
    );
  }

  const heroPool = [...all.filter((a) => a.isFeatured), ...all.filter((a) => !a.isFeatured)]
    .filter((a, i, arr) => arr.findIndex((b) => b.slug === a.slug) === i).slice(0, 5);
  const heroSlugs = new Set(heroPool.map((a) => a.slug));
  const afterHero = all.filter((a) => !heroSlugs.has(a.slug));
  const topStories = afterHero.slice(0, 6);
  const rest = afterHero.slice(6);
  const categoryGroups = buildCategoryGroups(rest);
  const trending = all.slice(0, 8);
  const mostRead = all.slice(0, 5);

  return (
    <>
      <HeroSection articles={heroPool} />
      <LatestDispatch articles={all.slice(0, 6)} />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-12 pb-20">
        <div className="grid grid-cols-12 gap-8 lg:gap-14">

          {/* Main content */}
          <div className="col-span-12 lg:col-span-8 space-y-16">
            {topStories.length > 0 && (
              <section className="reveal">
                <EditorialSectionHeader title="Top Stories" />
                <EditorialGrid articles={topStories} />
              </section>
            )}
            <div className="reveal">
              <AdSlot format="leaderboard" slot={AD_SLOTS.LEADERBOARD_TOP} label />
            </div>
            {categoryGroups.map((group, gi) => (
              <div key={group.slug}>
                <section className="reveal"><CategorySection group={group} /></section>
                {(gi + 1) % 2 === 0 && (
                  <div className="mt-10 reveal"><AdSlot format="in-article" slot={AD_SLOTS.ARTICLE_IN_CONTENT} label /></div>
                )}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-10">
              <TrendingBlock articles={trending} />
              <AdSlot format="mpu" slot={AD_SLOTS.HOMEPAGE_MPU_1} label />
              <MostReadBlock articles={mostRead} />
              <NewsletterCard />
              <AdSlot format="mpu" slot={AD_SLOTS.HOMEPAGE_MPU_2} label />
            </div>
          </aside>
        </div>
      </div>

      <NewsletterCTA />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   HERO — Editorial broadsheet layout
   Left 45%: Bold typographic lead (headline is the hero)
   Right 55%: Featured image (tall) + 2 secondary cards below
══════════════════════════════════════════════════════════════════════════ */
function HeroSection({ articles }: { articles: SiteArticle[] }) {
  const [featured, ...rest] = articles;
  const secondary = rest.slice(0, 4);
  if (!featured) return null;

  return (
    <section style={{ background: "#FAFAF8", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 py-6 lg:py-12">

          {/* LEFT — typography-forward editorial lead (order-2 on mobile: image shows first) */}
          <div className="order-2 lg:order-1 lg:col-span-5 flex flex-col justify-between gap-6 sm:gap-8 lg:pr-8 lg:border-r" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
            {/* Top label */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: "rgba(0,0,0,0.1)" }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: "rgba(0,0,0,0.35)", fontFamily: "var(--font-mono)" }}>
                Lead Story
              </span>
              <div className="h-px flex-1" style={{ background: "rgba(0,0,0,0.1)" }} />
            </div>

            {/* Feature text block */}
            <div className="flex-1 flex flex-col justify-center">
              {featured.categoryName && (
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-4 w-1" style={{ background: catColor(featured.categorySlug) }} />
                  <Link
                    to="/category/$slug"
                    params={{ slug: featured.categorySlug ?? "news" }}
                    className="text-[11px] font-black uppercase tracking-[0.25em] hover:opacity-70 transition-opacity"
                    style={{ color: catColor(featured.categorySlug), fontFamily: "var(--font-mono)" }}
                  >
                    {featured.categoryName}
                  </Link>
                  {featured.isBreaking && (
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 text-white animate-pulse" style={{ background: "#CC0000" }}>
                      Breaking
                    </span>
                  )}
                </div>
              )}

              <Link to="/article/$slug" params={{ slug: featured.slug }} className="group block mb-5">
                <h1
                  className="font-display font-black leading-[1.08] tracking-tight text-balance group-hover:opacity-75 transition-opacity text-[1.5rem] sm:text-[2rem] lg:text-[clamp(2rem,3.5vw,3.2rem)]"
                  style={{ color: "#0A0A0A", letterSpacing: "-0.022em" }}
                >
                  {featured.title}
                </h1>
              </Link>

              {featured.subtitle && (
                <p className="hidden sm:block font-serif-body leading-relaxed mb-5 line-clamp-3" style={{ fontSize: "1.05rem", color: "rgba(0,0,0,0.55)" }}>
                  {featured.subtitle}
                </p>
              )}

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1" style={{ background: "#C5D400" }} />
              </div>

              {/* Author + CTA */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div
                    className="size-9 flex items-center justify-center text-xs font-black text-white shrink-0"
                    style={{ background: "#0A0A0A", fontFamily: "var(--font-display)" }}
                  >
                    {(featured.author || "S").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[12px] font-bold leading-none mb-0.5" style={{ color: "#0A0A0A" }}>
                      {featured.author || "Staff Reporter"}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(0,0,0,0.4)", fontFamily: "var(--font-mono)" }}>
                      {featured.date}
                    </p>
                  </div>
                </div>
                <Link
                  to="/article/$slug"
                  params={{ slug: featured.slug }}
                  className="group flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-4 py-2.5 transition-all hover:opacity-80"
                  style={{ background: "#C5D400", color: "#0A0A0A", fontFamily: "var(--font-mono)" }}
                >
                  Read Story
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Bottom: quick-read secondary story — hidden on mobile */}
            {secondary[2] && (
              <Link
                to="/article/$slug"
                params={{ slug: secondary[2].slug }}
                className="group hidden sm:flex items-start gap-3 pt-6 border-t"
                style={{ borderColor: "rgba(0,0,0,0.08)" }}
              >
                <div className="size-1.5 rounded-full mt-1.5 shrink-0" style={{ background: catColor(secondary[2].categorySlug) }} />
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] block mb-1" style={{ color: catColor(secondary[2].categorySlug), fontFamily: "var(--font-mono)" }}>
                    {secondary[2].categoryName}
                  </span>
                  <h4 className="font-display text-sm font-bold leading-snug group-hover:opacity-60 transition-opacity line-clamp-2" style={{ color: "#0A0A0A" }}>
                    {secondary[2].title}
                  </h4>
                </div>
              </Link>
            )}
          </div>

          {/* RIGHT — Image + 2 side cards (order-1 on mobile: shows first) */}
          <div className="order-1 lg:order-2 lg:col-span-7 grid grid-rows-[auto_auto] gap-4">

            {/* Featured image — tall */}
            <div className="grid lg:grid-cols-5 gap-3 lg:gap-4">
              {/* Main image */}
              <Link
                to="/article/$slug"
                params={{ slug: featured.slug }}
                className="group lg:col-span-3 relative overflow-hidden block"
                style={{ minHeight: "220px" }}
              >
                {featured.featuredImage ? (
                  <img
                    src={featured.featuredImage}
                    alt={featured.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden" style={{ background: "#0A0A0A" }}>
                    <span className="font-display font-black uppercase text-center px-4" style={{ fontSize: "clamp(3rem, 8vw, 7rem)", color: "#C5D400", opacity: 0.15, letterSpacing: "-0.04em", lineHeight: 1 }}>
                      {featured.categoryName ?? "News"}
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "#C5D400" }} />
                  </div>
                )}
                {/* Lime frame corner */}
                <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none" style={{ borderTop: "3px solid #C5D400", borderLeft: "3px solid #C5D400" }} />
                <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none" style={{ borderBottom: "3px solid #C5D400", borderRight: "3px solid #C5D400" }} />
              </Link>

              {/* Two vertical secondary cards — hidden on mobile, shown lg+ */}
              <div className="hidden lg:flex lg:col-span-2 flex-col gap-4">
                {secondary.slice(0, 2).map((a) => (
                  <Link
                    key={a.slug}
                    to="/article/$slug"
                    params={{ slug: a.slug }}
                    className="group flex-1 flex flex-col relative overflow-hidden"
                    style={{ minHeight: "150px", background: "#0A0A0A" }}
                  >
                    {a.featuredImage ? (
                      <img src={a.featuredImage} alt={a.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" />
                    ) : (
                      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${catColor(a.categorySlug)}33, #0A0A0A)` }} />
                    )}
                    <div className="absolute inset-0 flex flex-col justify-end p-3" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.95) 40%, transparent)" }}>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 block" style={{ color: "#C5D400", fontFamily: "var(--font-mono)" }}>
                        {a.categoryName}
                      </span>
                      <h4 className="font-display text-[13px] font-bold leading-snug text-white line-clamp-2 group-hover:opacity-75 transition-opacity">
                        {a.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom strip — 2 more secondary stories */}
            <div className="grid sm:grid-cols-2 gap-4">
              {secondary.slice(2, 4).map((a) => (
                <Link
                  key={a.slug}
                  to="/article/$slug"
                  params={{ slug: a.slug }}
                  className="group flex gap-3 p-4 transition-colors"
                  style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#C5D400"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.07)"; }}
                >
                  {a.featuredImage ? (
                    <div className="w-16 h-14 shrink-0 overflow-hidden">
                      <img src={a.featuredImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  ) : (
                    <div className="w-16 h-14 shrink-0 flex items-center justify-center" style={{ background: catColor(a.categorySlug) + "22" }}>
                      <div className="size-1.5 rounded-full" style={{ background: catColor(a.categorySlug) }} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: catColor(a.categorySlug), fontFamily: "var(--font-mono)" }}>
                      {a.categoryName}
                    </span>
                    <h4 className="font-display text-[13px] font-bold leading-snug line-clamp-2 group-hover:opacity-60 transition-opacity" style={{ color: "#0A0A0A" }}>
                      {a.title}
                    </h4>
                    <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: "rgba(0,0,0,0.35)", fontFamily: "var(--font-mono)" }}>
                      <Clock size={9} /> {a.date}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   LATEST DISPATCH — dark band of 6 stories
══════════════════════════════════════════════════════════════════════════ */
function LatestDispatch({ articles }: { articles: SiteArticle[] }) {
  return (
    <div style={{ background: "#0A0A0A", borderBottom: "3px solid #C5D400" }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="flex items-center gap-4 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full animate-pulse" style={{ background: "#C5D400" }} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: "#C5D400", fontFamily: "var(--font-mono)" }}>
              Latest Dispatch
            </span>
          </div>
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-mono)" }}>
            {new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>

        {/* 6 story strips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {articles.slice(0, 6).map((a, i) => (
            <Link
              key={a.slug}
              to="/article/$slug"
              params={{ slug: a.slug }}
              className="group p-4 flex flex-col gap-2 transition-colors border-b sm:border-b border-r"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(197,212,0,0.05)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
            >
              <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: catColor(a.categorySlug), fontFamily: "var(--font-mono)" }}>
                {a.categoryName}
              </span>
              <h4 className="font-display text-[13px] font-bold leading-snug text-white line-clamp-3 group-hover:text-[#C5D400] transition-colors">
                {a.title}
              </h4>
              <span className="text-[9px] mt-auto flex items-center gap-1" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-mono)" }}>
                <Clock size={8} /> {a.date}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   EDITORIAL GRID — top stories section
══════════════════════════════════════════════════════════════════════════ */
function EditorialGrid({ articles }: { articles: SiteArticle[] }) {
  const [lead, ...rest] = articles;
  const side = rest.slice(0, 2);
  const bottom = rest.slice(2, 5);

  return (
    <div className="space-y-6">
      {/* Row 1: Large lead + 2 side cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Lead card — 2 cols */}
        {lead && (
          <Link to="/article/$slug" params={{ slug: lead.slug }} className="group md:col-span-2 flex flex-col">
            <div className="relative overflow-hidden mb-4" style={{ aspectRatio: "16/9" }}>
              {lead.featuredImage ? (
                <img src={lead.featuredImage} alt={lead.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: "#0A0A0A" }}>
                  <span className="font-display font-black text-[5rem] opacity-10 uppercase" style={{ color: "#C5D400" }}>{lead.categoryName?.[0]}</span>
                </div>
              )}
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "#C5D400" }} />
              {lead.categoryName && (
                <span className="absolute bottom-3 left-3 text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1" style={{ background: catColor(lead.categorySlug), color: "white", fontFamily: "var(--font-mono)" }}>
                  {lead.categoryName}
                </span>
              )}
            </div>
            <h3 className="font-display text-xl font-black leading-tight group-hover:opacity-60 transition-opacity mb-2 line-clamp-2" style={{ color: "#0A0A0A", letterSpacing: "-0.02em" }}>
              {lead.title}
            </h3>
            {lead.subtitle && <p className="text-sm font-serif-body leading-relaxed line-clamp-2 mb-3" style={{ color: "rgba(0,0,0,0.5)" }}>{lead.subtitle}</p>}
            <p className="text-[10px] uppercase tracking-wider mt-auto flex items-center gap-1.5" style={{ color: "rgba(0,0,0,0.35)", fontFamily: "var(--font-mono)" }}>
              <span className="font-bold" style={{ color: "#0A0A0A" }}>{lead.author || "Staff Reporter"}</span>
              <span>·</span>{lead.date}
            </p>
          </Link>
        )}

        {/* Side cards — 1 col each */}
        <div className="flex flex-col gap-5">
          {side.map((a) => (
            <Link key={a.slug} to="/article/$slug" params={{ slug: a.slug }} className="group flex gap-3 pb-5 border-b last:border-0" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
              <div className="relative w-20 h-16 shrink-0 overflow-hidden">
                {a.featuredImage ? (
                  <img src={a.featuredImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="w-full h-full" style={{ background: catColor(a.categorySlug) + "33" }} />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: catColor(a.categorySlug), fontFamily: "var(--font-mono)" }}>{a.categoryName}</span>
                <h4 className="font-display text-sm font-bold leading-snug line-clamp-3 group-hover:opacity-60 transition-opacity" style={{ color: "#0A0A0A" }}>{a.title}</h4>
                <p className="text-[10px] mt-1" style={{ color: "rgba(0,0,0,0.3)", fontFamily: "var(--font-mono)" }}>{a.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Row 2: 3 equal cards */}
      {bottom.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 pt-6 border-t" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
          {bottom.map((a) => (
            <Link key={a.slug} to="/article/$slug" params={{ slug: a.slug }} className="group flex flex-col">
              <div className="relative overflow-hidden mb-3" style={{ aspectRatio: "3/2" }}>
                {a.featuredImage ? (
                  <img src={a.featuredImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" loading="lazy" />
                ) : (
                  <div className="w-full h-full" style={{ background: catColor(a.categorySlug) + "22", borderLeft: `3px solid ${catColor(a.categorySlug)}` }} />
                )}
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest mb-1.5 block" style={{ color: catColor(a.categorySlug), fontFamily: "var(--font-mono)" }}>{a.categoryName}</span>
              <h4 className="font-display text-[15px] font-bold leading-snug line-clamp-2 group-hover:opacity-60 transition-opacity mb-2" style={{ color: "#0A0A0A" }}>{a.title}</h4>
              <p className="text-[10px] mt-auto" style={{ color: "rgba(0,0,0,0.35)", fontFamily: "var(--font-mono)" }}>{a.date}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   CATEGORY SECTION
══════════════════════════════════════════════════════════════════════════ */
function CategorySection({ group }: { group: CatGroup }) {
  if (!group.articles.length) return null;
  const [lead, ...others] = group.articles;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-0 mb-8">
        <div className="w-[3px] h-8 shrink-0 mr-4" style={{ background: group.color }} />
        <h3 className="font-display text-2xl font-black tracking-tight flex-1" style={{ color: "#0A0A0A", letterSpacing: "-0.02em" }}>{group.name}</h3>
        <Link to="/category/$slug" params={{ slug: group.slug }} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest hover:opacity-60 transition-opacity" style={{ color: "#0A0A0A", fontFamily: "var(--font-mono)" }}>
          All {group.name} <ArrowUpRight size={12} />
        </Link>
      </div>

      {/* Lead + list layout */}
      <div className="grid md:grid-cols-5 gap-6">
        {/* Lead — 3 cols */}
        {lead && (
          <Link to="/article/$slug" params={{ slug: lead.slug }} className="group md:col-span-3 flex flex-col">
            <div className="relative overflow-hidden mb-4" style={{ aspectRatio: "16/9" }}>
              {lead.featuredImage ? (
                <img src={lead.featuredImage} alt={lead.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-end p-4" style={{ background: `linear-gradient(135deg, ${group.color}44, #0A0A0A)` }}>
                  <span className="font-display font-black text-white opacity-20 uppercase text-[3rem] leading-none">{group.name}</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: group.color }} />
            </div>
            <h3 className="font-display text-lg font-black leading-tight group-hover:opacity-60 transition-opacity mb-2 line-clamp-3" style={{ color: "#0A0A0A", letterSpacing: "-0.02em" }}>
              {lead.title}
            </h3>
            {lead.subtitle && <p className="text-sm font-serif-body leading-relaxed line-clamp-2 mb-3" style={{ color: "rgba(0,0,0,0.5)" }}>{lead.subtitle}</p>}
            <p className="text-[10px] uppercase tracking-wider mt-auto" style={{ color: "rgba(0,0,0,0.35)", fontFamily: "var(--font-mono)" }}>
              {lead.author || "Staff Reporter"} · {lead.date}
            </p>
          </Link>
        )}

        {/* List — 2 cols */}
        <div className="md:col-span-2 flex flex-col divide-y" style={{  }}>
          {others.slice(0, 5).map((a) => (
            <Link key={a.slug} to="/article/$slug" params={{ slug: a.slug }} className="group flex gap-3 py-3.5">
              <div className="w-1 h-auto shrink-0 self-stretch" style={{ background: group.color + "44" }} />
              <div className="min-w-0 flex-1">
                <h4 className="font-display text-[13px] font-bold leading-snug line-clamp-2 group-hover:opacity-60 transition-opacity mb-1" style={{ color: "#0A0A0A" }}>
                  {a.title}
                </h4>
                <p className="text-[10px]" style={{ color: "rgba(0,0,0,0.35)", fontFamily: "var(--font-mono)" }}>{a.date}</p>
              </div>
              {a.featuredImage && (
                <div className="w-14 h-12 shrink-0 overflow-hidden">
                  <img src={a.featuredImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SIDEBAR BLOCKS
══════════════════════════════════════════════════════════════════════════ */
function SidebarHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pb-3 mb-5" style={{ borderBottom: "2px solid #0A0A0A" }}>
      <div className="w-[3px] h-5 shrink-0" style={{ background: "#C5D400" }} />
      <h4 className="font-display text-base font-black tracking-tight uppercase" style={{ color: "#0A0A0A" }}>{label}</h4>
    </div>
  );
}

function TrendingBlock({ articles }: { articles: SiteArticle[] }) {
  return (
    <div>
      <SidebarHeader label="Trending Now" />
      <div className="space-y-0 divide-y" style={{  }}>
        {articles.slice(0, 7).map((a, i) => (
          <Link key={a.slug} to="/article/$slug" params={{ slug: a.slug }} className="group flex gap-4 items-start py-3.5">
            <span className="font-display font-black shrink-0 mt-0.5" style={{ fontSize: "1.5rem", color: i === 0 ? "#C5D400" : "rgba(0,0,0,0.12)", letterSpacing: "-0.03em", lineHeight: 1 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h5 className="font-display text-sm font-bold leading-snug group-hover:opacity-60 transition-opacity line-clamp-2 mb-1" style={{ color: "#0A0A0A" }}>{a.title}</h5>
              {a.categoryName && <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: catColor(a.categorySlug), fontFamily: "var(--font-mono)" }}>{a.categoryName}</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MostReadBlock({ articles }: { articles: SiteArticle[] }) {
  return (
    <div>
      <SidebarHeader label="Most Read" />
      <div className="space-y-0 divide-y" style={{  }}>
        {articles.map((a, i) => (
          <Link key={a.slug} to="/article/$slug" params={{ slug: a.slug }} className="group flex gap-3 items-start py-3.5">
            <span className="text-[9px] font-black px-1.5 py-0.5 shrink-0 mt-0.5" style={{ background: i === 0 ? "#0A0A0A" : "rgba(0,0,0,0.07)", color: i === 0 ? "#C5D400" : "rgba(0,0,0,0.4)", fontFamily: "var(--font-mono)" }}>
              {i + 1}
            </span>
            <h5 className="font-display text-sm font-bold leading-snug group-hover:opacity-60 transition-opacity line-clamp-2" style={{ color: "#0A0A0A" }}>{a.title}</h5>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   NEWSLETTER CTA
══════════════════════════════════════════════════════════════════════════ */
function NewsletterCTA() {
  return (
    <section style={{ background: "#0A0A0A" }} className="reveal">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 md:py-20 grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8" style={{ background: "#C5D400" }} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: "#C5D400", fontFamily: "var(--font-mono)" }}>Global Briefing</span>
          </div>
          <h3 className="font-display font-black leading-[1.02] mb-5 text-white" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.025em" }}>
            Stay ahead of every story.{" "}
            <span style={{ color: "#CC0000" }}>Before the morning noise.</span>
          </h3>
          <p className="font-serif-body leading-relaxed max-w-md mb-6" style={{ color: "rgba(255,255,255,0.45)", fontSize: "1.05rem" }}>
            Join globally-aware readers. Hand-curated headlines, delivered to your inbox at 6:00 AM sharp, six days a week.
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-mono)" }}>
            Trusted worldwide · Zero spam · Unsubscribe any time
          </p>
        </div>
        <form className="flex flex-col gap-3 max-w-sm w-full" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email" required placeholder="Your email address"
            className="px-5 py-4 text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}
            onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#C5D400"; }}
            onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; }}
          />
          <button type="submit" className="px-6 py-4 text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2" style={{ background: "#C5D400", color: "#0A0A0A", fontFamily: "var(--font-mono)" }}>
            Subscribe Free — No Spam Ever <ArrowRight size={13} />
          </button>
        </form>
      </div>
    </section>
  );
}

/* ── Section header ──────────────────────────────────────────────────────── */
function EditorialSectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-[3px] h-8 shrink-0" style={{ background: "#C5D400" }} />
      <h3 className="font-display text-2xl font-black tracking-tight" style={{ color: "#0A0A0A", letterSpacing: "-0.02em" }}>{title}</h3>
      <div className="h-px flex-1" style={{ background: "rgba(0,0,0,0.08)" }} />
    </div>
  );
}
