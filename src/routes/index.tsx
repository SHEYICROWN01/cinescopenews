import { createFileRoute, Link } from "@tanstack/react-router";
import { ARTICLES, byCategory } from "@/lib/news-data";
import { ArticleCard, NumberedItem } from "@/components/site/ArticleCard";
import { NewsletterCard } from "@/components/site/NewsletterCard";
import { AdSlot } from "@/components/site/AdSlot";
import { ArrowRight, Play, Clock, Eye, Bookmark } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DailyNewsTap — Nigeria's Premier Digital Newsroom" },
      { name: "description", content: "Breaking news, in-depth analysis, and premium journalism from Nigeria's most trusted digital newsroom." },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = ARTICLES[0];
  const secondary = ARTICLES.slice(1, 3);
  const latest = ARTICLES.slice(3, 7);
  const politics = byCategory("politics").slice(0, 3);
  const business = byCategory("business").slice(0, 3);
  const tech = byCategory("technology").slice(0, 3);
  const opinion = byCategory("opinion");

  return (
    <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-10 md:py-14">
      {/* HERO — full-width editorial */}
      <section className="grid grid-cols-12 gap-8 lg:gap-14 pb-16 border-b border-rule animate-fade-in">
        <article className="col-span-12 lg:col-span-8 group">
          <Link to="/article/$slug" params={{ slug: featured.slug }}>
            <div className="flex items-center gap-3 mb-5">
              <span className="bg-brand text-brand-foreground px-2.5 py-1 eyebrow">Featured Report</span>
              <span className="eyebrow text-ink-muted">{featured.category} · {featured.date}</span>
            </div>
            <div className="w-full aspect-[16/9] bg-surface overflow-hidden mb-8 relative">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[1200ms] ease-out"
              />
              <button className="absolute top-4 right-4 size-10 bg-background/90 backdrop-blur grid place-items-center hover:bg-brand hover:text-brand-foreground transition-colors" aria-label="Save">
                <Bookmark size={15} />
              </button>
            </div>
            <h2 className="font-display text-[2.5rem] md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-[-0.03em] text-balance group-hover:text-brand transition-colors mb-6">
              {featured.title}
            </h2>
            <p className="font-editorial text-2xl md:text-[1.6rem] text-ink-muted leading-[1.4] max-w-[58ch] mb-8">
              {featured.excerpt}
            </p>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="size-11 bg-ink rounded-full grid place-items-center text-background text-xs font-bold">
                  {featured.author.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight">By {featured.author}</p>
                  <p className="eyebrow text-ink-muted mt-0.5">{featured.authorRole}</p>
                </div>
              </div>
              <div className="flex items-center gap-5 text-xs text-ink-muted">
                <span className="flex items-center gap-1.5"><Clock size={12} /> {featured.readTime}</span>
                <span className="flex items-center gap-1.5"><Eye size={12} /> 24.8k views</span>
              </div>
            </div>
          </Link>
        </article>

        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-8 lg:border-l lg:border-rule lg:pl-14">
          {secondary.map((a) => (
            <article key={a.slug} className="group cursor-pointer border-b border-rule pb-8 last:border-0 last:pb-0">
              <Link to="/article/$slug" params={{ slug: a.slug }}>
                <div className="w-full aspect-video bg-surface overflow-hidden mb-4">
                  <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <span className="eyebrow text-brand mb-2 block">{a.category}</span>
                <h3 className="font-display text-2xl md:text-[1.6rem] font-bold leading-[1.1] tracking-tight group-hover:text-brand transition-colors mb-3">
                  {a.title}
                </h3>
                <p className="text-sm text-ink-muted font-serif-body leading-relaxed line-clamp-2">{a.excerpt}</p>
                <p className="eyebrow text-ink-muted mt-3">{a.date} · {a.readTime}</p>
              </Link>
            </article>
          ))}
        </aside>
      </section>

      {/* Billboard ad */}
      <AdSlot format="billboard" className="my-4" />

      {/* LATEST + SIDEBAR */}
      <div className="grid grid-cols-12 gap-8 lg:gap-14 mt-10">
        <div className="col-span-12 lg:col-span-8">
          <TabbedFeed latest={latest} />
        </div>

        <aside className="col-span-12 lg:col-span-4 lg:border-l lg:border-rule lg:pl-14 space-y-12">
          <div>
            <h4 className="bg-brand text-brand-foreground px-3 py-1.5 inline-block eyebrow mb-7">Most Read Today</h4>
            <div className="space-y-7">
              {ARTICLES.slice(1, 6).map((a, i) => (
                <NumberedItem key={a.slug} article={a} index={i} />
              ))}
            </div>
          </div>
          <AdSlot format="mpu" />
          <NewsletterCard />
          <AdSlot format="half-page" />
        </aside>
      </div>

      <CategoryBlock title="Politics & Power" slug="politics" articles={politics} />

      {/* Mid-feed leaderboard */}
      <AdSlot format="leaderboard" className="my-14" />

      <CategoryBlock title="Business & Economy" slug="business" articles={business} />

      {/* VIDEO + INTERVIEW */}
      <section className="mt-20 grid grid-cols-12 gap-8 lg:gap-14">
        <div className="col-span-12 lg:col-span-7">
          <SectionHeader title="Video Newsroom" href="/category/world" />
          <div className="relative aspect-video bg-ink overflow-hidden group cursor-pointer">
            <img src={ARTICLES[5].image} alt="Featured video" className="w-full h-full object-cover opacity-70 group-hover:opacity-60 transition-opacity" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="size-20 rounded-full bg-brand grid place-items-center group-hover:scale-110 transition-transform shadow-elevated">
                <Play size={28} className="text-brand-foreground fill-current ml-1" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 bg-gradient-to-t from-black/85 to-transparent text-white">
              <span className="eyebrow text-brand mb-2 block">Watch · 12:40</span>
              <h3 className="font-display text-2xl md:text-4xl font-bold leading-[1.05] tracking-tight max-w-2xl">
                Inside the 2027 Coalition Talks: A DailyNewsTap Documentary
              </h3>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5">
          <SectionHeader title="Featured Interview" href="/category/opinion" />
          <article className="group cursor-pointer">
            <Link to="/article/$slug" params={{ slug: opinion[0]?.slug ?? ARTICLES[0].slug }}>
              <div className="aspect-[4/5] bg-surface overflow-hidden mb-6 max-w-md">
                <img src={opinion[0]?.image ?? ARTICLES[0].image} alt="Interview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[1200ms]" />
              </div>
              <span className="eyebrow text-brand mb-2 block">In Conversation</span>
              <h3 className="font-editorial text-3xl md:text-4xl leading-[1.1] tracking-tight group-hover:text-brand transition-colors mb-4 italic">
                "We must rethink urban sprawl before it's too late for our heritage."
              </h3>
              <p className="text-sm text-ink-muted font-serif-body italic">— Prof. Julian Marks, Guest Columnist</p>
            </Link>
          </article>
        </div>
      </section>

      <CategoryBlock title="Technology" slug="technology" articles={tech} />

      {/* EDITOR'S PICKS */}
      <section className="mt-20 bg-surface px-6 md:px-12 lg:px-16 py-16">
        <SectionHeader title="Editor's Picks" href="/category/opinion" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {ARTICLES.slice(8, 11).map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>

      {/* Bottom billboard before newsletter */}
      <AdSlot format="billboard" className="my-14" />

      {/* NEWSLETTER FULL */}
      <section className="mt-10 bg-ink text-background p-10 md:p-16 lg:p-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="eyebrow text-brand mb-4 block">The Morning Tap · Newsletter</span>
          <h3 className="font-display text-4xl md:text-5xl font-black leading-[1.02] tracking-tight mb-5">
            Wake up sharper. Every morning, before the noise.
          </h3>
          <p className="text-background/70 font-serif-body text-lg leading-relaxed max-w-md">
            Join 240,000 readers getting our hand-curated brief on Nigerian
            politics, markets, and culture — six days a week.
          </p>
        </div>
        <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Your best email address"
            className="flex-1 bg-background/10 border border-background/20 text-background placeholder:text-background/40 px-5 py-4 outline-none focus:border-brand transition-colors"
          />
          <button type="submit" className="bg-brand text-brand-foreground px-8 py-4 font-bold uppercase text-xs tracking-widest hover:opacity-90 transition-opacity">
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
}

function TabbedFeed({ latest }: { latest: any[] }) {
  const tabs = ["Latest", "Trending", "Most Shared"] as const;
  const [active, setActive] = useState<(typeof tabs)[number]>("Latest");
  const data =
    active === "Trending" ? ARTICLES.slice(5, 9) :
    active === "Most Shared" ? ARTICLES.slice(7, 11) :
    latest;

  return (
    <>
      <div className="flex items-end justify-between border-b-2 border-ink pb-3 mb-8">
        <div className="flex gap-6 md:gap-8">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`font-display text-xl md:text-2xl font-black tracking-tight transition-colors ${
                active === t ? "text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {t}
              {active === t && <span className="block h-0.5 bg-brand mt-2 -mb-[14px]" />}
            </button>
          ))}
        </div>
        <Link to="/category/$slug" params={{ slug: "politics" }} className="eyebrow hover:text-brand transition-colors items-center gap-1 hidden sm:flex">
          View all <ArrowRight size={12} />
        </Link>
      </div>
      <div className="space-y-10">
        {data.map((a, i) => (
          <article key={a.slug} className="flex flex-col md:flex-row gap-6 md:gap-8 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <Link to="/article/$slug" params={{ slug: a.slug }} className="shrink-0">
              <div className="w-full md:w-64 aspect-[4/3] md:aspect-[4/3] bg-surface overflow-hidden group">
                <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-brand eyebrow">{a.category}</span>
                <span className="eyebrow text-ink-muted">{a.date}</span>
              </div>
              <Link to="/article/$slug" params={{ slug: a.slug }}>
                <h3 className="font-display text-2xl md:text-[1.7rem] font-bold leading-[1.1] tracking-tight hover:text-brand transition-colors mb-3">{a.title}</h3>
              </Link>
              <p className="text-base font-serif-body text-ink-muted leading-relaxed mb-4 line-clamp-2 max-w-[60ch]">{a.excerpt}</p>
              <p className="text-xs text-ink-muted">By <span className="font-semibold text-ink">{a.author}</span> · {a.readTime}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex justify-between items-end pb-3 mb-10 border-b-2 border-ink">
      <h3 className="font-display text-3xl md:text-4xl font-black tracking-[-0.025em]">{title}</h3>
      <Link to={href as any} className="eyebrow hover:text-brand transition-colors flex items-center gap-1">
        View all <ArrowRight size={12} />
      </Link>
    </div>
  );
}

function CategoryBlock({ title, slug, articles }: { title: string; slug: string; articles: any[] }) {
  return (
    <section className="mt-20">
      <SectionHeader title={title} href={`/category/${slug}`} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </section>
  );
}
