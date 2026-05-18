import { createFileRoute, Link } from "@tanstack/react-router";
import { ARTICLES, byCategory } from "@/lib/news-data";
import { ArticleCard, ArticleRow, NumberedItem } from "@/components/site/ArticleCard";
import { NewsletterCard } from "@/components/site/NewsletterCard";
import { ArrowRight, Play } from "lucide-react";

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
  const trending = ARTICLES.slice(1, 6);
  const opinion = byCategory("opinion");

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 md:py-14">
      {/* HERO */}
      <section className="grid grid-cols-12 gap-8 lg:gap-12 pb-14 border-b border-rule animate-fade-in">
        <article className="col-span-12 lg:col-span-8 group">
          <Link to="/article/$slug" params={{ slug: featured.slug }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-brand/10 text-brand px-2 py-1 eyebrow">Featured Report</span>
              <span className="eyebrow text-ink-muted">{featured.category} · {featured.date}</span>
            </div>
            <div className="w-full aspect-[16/9] bg-surface overflow-hidden mb-7">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black leading-[0.98] tracking-tight text-balance group-hover:text-brand transition-colors mb-5">
              {featured.title}
            </h2>
            <p className="font-serif-body text-lg text-ink-muted leading-relaxed max-w-[62ch] mb-6">
              {featured.excerpt}
            </p>
            <div className="flex items-center gap-3">
              <div className="size-10 bg-ink rounded-full grid place-items-center text-background text-xs font-bold">
                {featured.author.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-tight">By {featured.author}</p>
                <p className="eyebrow text-ink-muted mt-0.5">{featured.authorRole}</p>
              </div>
            </div>
          </Link>
        </article>

        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-8 lg:border-l lg:border-rule lg:pl-12">
          {secondary.map((a) => (
            <article key={a.slug} className="group cursor-pointer border-b border-rule pb-8 last:border-0 last:pb-0">
              <Link to="/article/$slug" params={{ slug: a.slug }}>
                <span className="eyebrow text-brand mb-2 block">{a.category}</span>
                <h3 className="font-display text-xl md:text-2xl font-bold leading-tight group-hover:underline underline-offset-4 mb-4">
                  {a.title}
                </h3>
                <div className="w-full aspect-video bg-surface overflow-hidden mb-3">
                  <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <p className="text-sm text-ink-muted font-serif-body italic line-clamp-2">{a.excerpt}</p>
              </Link>
            </article>
          ))}
        </aside>
      </section>

      {/* LATEST + SIDEBAR */}
      <div className="grid grid-cols-12 gap-8 lg:gap-12 mt-14">
        <div className="col-span-12 lg:col-span-8">
          <SectionHeader title="Latest Briefs" href="/category/politics" />
          <div className="space-y-10">
            {latest.map((a, i) => (
              <article key={a.slug} className="flex flex-col md:flex-row gap-6 md:gap-8 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <Link to="/article/$slug" params={{ slug: a.slug }} className="shrink-0">
                  <div className="w-full md:w-60 aspect-[4/3] md:aspect-square bg-surface overflow-hidden group">
                    <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-brand eyebrow">{a.category}</span>
                    <span className="eyebrow text-ink-muted">{a.date}</span>
                  </div>
                  <Link to="/article/$slug" params={{ slug: a.slug }}>
                    <h3 className="font-display text-2xl font-bold leading-tight hover:text-brand transition-colors mb-3">{a.title}</h3>
                  </Link>
                  <p className="text-sm font-serif-body text-ink-muted leading-relaxed mb-4 line-clamp-2">{a.excerpt}</p>
                  <p className="text-xs text-ink-muted">By <span className="font-semibold text-ink">{a.author}</span> · {a.readTime}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4 lg:border-l lg:border-rule lg:pl-12 space-y-12">
          <div>
            <h4 className="bg-brand text-brand-foreground px-3 py-1.5 inline-block eyebrow mb-7">Most Read Today</h4>
            <div className="space-y-7">
              {trending.map((a, i) => (
                <NumberedItem key={a.slug} article={a} index={i} />
              ))}
            </div>
          </div>
          <NewsletterCard />
          <AdSlot />
        </aside>
      </div>

      {/* CATEGORY: POLITICS */}
      <CategoryBlock title="Politics & Power" slug="politics" articles={politics} />

      {/* CATEGORY: BUSINESS */}
      <CategoryBlock title="Business & Economy" slug="business" articles={business} />

      {/* VIDEO + INTERVIEW */}
      <section className="mt-20 grid grid-cols-12 gap-8 lg:gap-12">
        <div className="col-span-12 lg:col-span-7">
          <SectionHeader title="Video Newsroom" href="/category/world" />
          <div className="relative aspect-video bg-ink overflow-hidden group cursor-pointer">
            <img src={ARTICLES[5].image} alt="Featured video" className="w-full h-full object-cover opacity-70 group-hover:opacity-60 transition-opacity" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="size-20 rounded-full bg-brand grid place-items-center group-hover:scale-110 transition-transform">
                <Play size={28} className="text-brand-foreground fill-current ml-1" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
              <span className="eyebrow text-brand mb-2 block">Watch · 12:40</span>
              <h3 className="font-display text-2xl md:text-3xl font-bold leading-tight max-w-2xl">
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
                <img src={opinion[0]?.image ?? ARTICLES[0].image} alt="Interview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
              </div>
              <span className="eyebrow text-brand mb-2 block">In Conversation</span>
              <h3 className="font-display text-2xl md:text-3xl font-bold leading-tight group-hover:text-brand transition-colors mb-4">
                "We must rethink urban sprawl before it's too late for our heritage."
              </h3>
              <p className="text-sm text-ink-muted font-serif-body italic">— Prof. Julian Marks, Guest Columnist</p>
            </Link>
          </article>
        </div>
      </section>

      {/* TECH */}
      <CategoryBlock title="Technology" slug="technology" articles={tech} />

      {/* EDITOR'S PICKS */}
      <section className="mt-20 bg-surface px-6 md:px-12 py-14">
        <SectionHeader title="Editor's Picks" href="/category/opinion" inverted />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ARTICLES.slice(8, 11).map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>

      {/* NEWSLETTER FULL */}
      <section className="mt-20 bg-ink text-background p-10 md:p-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="eyebrow text-brand mb-3 block">Newsletter</span>
          <h3 className="font-display text-3xl md:text-4xl font-black leading-tight mb-4">
            Wake up sharper. Every morning, before the noise.
          </h3>
          <p className="text-background/70 font-serif-body leading-relaxed max-w-md">
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
          <button type="submit" className="bg-brand text-brand-foreground px-7 py-4 font-bold uppercase text-xs tracking-widest hover:opacity-90 transition-opacity">
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
}

function SectionHeader({ title, href, inverted }: { title: string; href: string; inverted?: boolean }) {
  return (
    <div className={`flex justify-between items-end pb-3 mb-8 border-b-2 ${inverted ? "border-ink" : "border-ink"}`}>
      <h3 className="font-display text-2xl md:text-3xl font-black tracking-tight">{title}</h3>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </section>
  );
}

function AdSlot() {
  return (
    <div className="border border-dashed border-rule aspect-square grid place-items-center text-center p-6">
      <div>
        <p className="eyebrow text-ink-muted mb-2">Advertisement</p>
        <p className="font-display text-lg font-bold">Your Brand Here</p>
        <p className="text-xs text-ink-muted mt-2">300 × 300</p>
      </div>
    </div>
  );
}
