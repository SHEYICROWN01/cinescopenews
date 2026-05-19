import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getArticle, related, ARTICLES, type Article } from "@/lib/news-data";
import { ArticleCard, NumberedItem } from "@/components/site/ArticleCard";
import { NewsletterCard } from "@/components/site/NewsletterCard";
import { AdSlot } from "@/components/site/AdSlot";
import { Twitter, Facebook, Linkedin, Link2, Bookmark, MessageCircle, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/article/$slug")({
  head: ({ params }) => {
    const a = getArticle(params.slug);
    if (!a) return { meta: [{ title: "Article — DailyNewsTap" }] };
    return {
      meta: [
        { title: `${a.title} — DailyNewsTap` },
        { name: "description", content: a.excerpt },
        { property: "og:title", content: a.title },
        { property: "og:description", content: a.excerpt },
        { property: "og:image", content: a.image },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: a.image },
      ],
    };
  },
  loader: ({ params }) => {
    const article = getArticle(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  component: ArticlePage,
  notFoundComponent: () => (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center">
      <h1 className="font-display text-5xl font-black mb-4">Article not found</h1>
      <Link to="/" className="text-brand underline">Back to home</Link>
    </div>
  ),
});

function ArticlePage() {
  const { article } = Route.useLoaderData() as { article: Article };
  const rel = related(article.slug, article.categorySlug);
  const [progress, setProgress] = useState(0);
  const idx = ARTICLES.findIndex((a) => a.slug === article.slug);
  const prev = idx > 0 ? ARTICLES[idx - 1] : null;
  const next = idx < ARTICLES.length - 1 ? ARTICLES[idx + 1] : null;

  useEffect(() => {
    const handler = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setProgress(total > 0 ? (h.scrollTop / total) * 100 : 0);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      {/* Reading progress */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[60] bg-transparent">
        <div className="h-full bg-brand transition-[width] duration-100" style={{ width: `${progress}%` }} />
      </div>

      <article className="max-w-[1600px] mx-auto px-6 lg:px-10 py-10 md:py-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs eyebrow text-ink-muted mb-10 max-w-3xl mx-auto">
          <Link to="/" className="hover:text-brand">Home</Link>
          <ChevronRight size={11} />
          <Link to="/category/$slug" params={{ slug: article.categorySlug }} className="hover:text-brand">{article.category}</Link>
          <ChevronRight size={11} />
          <span className="truncate">{article.title}</span>
        </nav>

        {/* Header */}
        <header className="max-w-3xl mx-auto text-center mb-12">
          <Link to="/category/$slug" params={{ slug: article.categorySlug }} className="eyebrow text-brand hover:underline">
            {article.category}
          </Link>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-[-0.03em] leading-[0.98] text-balance mt-6 mb-7">
            {article.title}
          </h1>
          <p className="font-editorial text-2xl md:text-3xl text-ink-muted leading-[1.3] mb-10">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="size-11 bg-ink rounded-full grid place-items-center text-background text-sm font-bold">
              {article.author.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold">{article.author}</p>
              <p className="eyebrow text-ink-muted mt-0.5">{article.authorRole} · {article.date} · {article.readTime}</p>
            </div>
          </div>
        </header>

        {/* Featured image */}
        <div className="w-full aspect-[16/9] bg-surface overflow-hidden mb-14 max-w-6xl mx-auto">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        </div>

        {/* Body + Sidebar */}
        <div className="grid grid-cols-12 gap-8 lg:gap-16">
          {/* Share rail */}
          <aside className="hidden lg:flex col-span-1 flex-col items-center gap-4 pt-2">
            <div className="sticky top-32 flex flex-col gap-3">
              <ShareBtn Icon={Twitter} />
              <ShareBtn Icon={Facebook} />
              <ShareBtn Icon={Linkedin} />
              <ShareBtn Icon={Link2} />
              <div className="w-px h-8 bg-rule mx-auto my-1" />
              <ShareBtn Icon={Bookmark} />
            </div>
          </aside>

          {/* Body */}
          <div className="col-span-12 lg:col-span-7">
            <div className="font-serif-body text-lg leading-[1.8] text-ink space-y-6 max-w-[68ch]">
              <p className="first-letter:font-display first-letter:text-7xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.8]">
                {article.body[0]}
              </p>
              <p>{article.body[1]}</p>

              {/* Pull quote */}
              <blockquote className="my-10 border-l-4 border-brand pl-6 py-2">
                <p className="font-display text-2xl md:text-3xl font-bold leading-tight text-ink">
                  "{article.excerpt.split(".")[0]}."
                </p>
                <footer className="eyebrow text-ink-muted mt-3">— {article.author}</footer>
              </blockquote>

              <p>{article.body[2]}</p>

              {/* Inline related */}
              <aside className="my-10 bg-surface p-6 border-l-4 border-ink not-prose">
                <p className="eyebrow text-brand mb-3">Related Reading</p>
                {rel[0] && (
                  <Link to="/article/$slug" params={{ slug: rel[0].slug }} className="font-display text-xl font-bold hover:text-brand transition-colors block leading-snug">
                    {rel[0].title}
                  </Link>
                )}
              </aside>

              <p>{article.body[3]}</p>
              <p>{article.body[4]}</p>
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-rule flex flex-wrap gap-2">
              <span className="eyebrow text-ink-muted mr-2 self-center">Tags:</span>
              {article.tags.map((t) => (
                <span key={t} className="px-3 py-1 border border-rule text-xs font-semibold hover:border-ink cursor-pointer transition-colors">
                  {t}
                </span>
              ))}
            </div>

            {/* Ad */}
            <AdSlot format="in-article" className="my-12" />

            {/* Prev / Next */}
            <nav className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 mb-4">
              {prev ? (
                <Link to="/article/$slug" params={{ slug: prev.slug }} className="group border border-rule p-5 hover:border-ink transition-colors">
                  <span className="eyebrow text-ink-muted flex items-center gap-2 mb-2"><ArrowLeft size={11} /> Previous</span>
                  <p className="font-display text-lg font-bold leading-tight group-hover:text-brand transition-colors">{prev.title}</p>
                </Link>
              ) : <div />}
              {next ? (
                <Link to="/article/$slug" params={{ slug: next.slug }} className="group border border-rule p-5 hover:border-ink transition-colors text-right">
                  <span className="eyebrow text-ink-muted flex items-center justify-end gap-2 mb-2">Next <ArrowRight size={11} /></span>
                  <p className="font-display text-lg font-bold leading-tight group-hover:text-brand transition-colors">{next.title}</p>
                </Link>
              ) : <div />}
            </nav>

            {/* Comments */}
            <section className="mt-12">
              <h3 className="font-display text-2xl font-black mb-6 flex items-center gap-3">
                <MessageCircle size={22} /> Comments (24)
              </h3>
              <form className="mb-10" onSubmit={(e) => e.preventDefault()}>
                <textarea
                  placeholder="Share your thoughts…"
                  rows={4}
                  className="w-full border border-rule p-4 text-sm outline-none focus:border-brand transition-colors font-serif-body"
                />
                <button className="mt-3 bg-ink text-background px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-brand transition-colors">
                  Post Comment
                </button>
              </form>
              <div className="space-y-8">
                {[
                  { name: "Folake Ade", time: "2 hours ago", text: "A timely and balanced report. The infrastructure conversation rarely gets this level of nuance." },
                  { name: "Ibrahim K.", time: "4 hours ago", text: "Would love to see a follow-up on the financing model. The numbers don't fully add up yet." },
                ].map((c, i) => (
                  <div key={i} className="flex gap-4 pb-8 border-b border-rule last:border-0">
                    <div className="size-10 bg-surface rounded-full grid place-items-center text-xs font-bold shrink-0">
                      {c.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{c.name} <span className="eyebrow text-ink-muted ml-2">{c.time}</span></p>
                      <p className="text-sm font-serif-body text-ink-muted mt-2 leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sticky Sidebar */}
          <aside className="col-span-12 lg:col-span-4 space-y-10">
            <div className="lg:sticky lg:top-28 space-y-10">
              <div>
                <h4 className="bg-brand text-brand-foreground eyebrow px-3 py-1.5 inline-block mb-6">More from this section</h4>
                <div className="space-y-6">
                  {ARTICLES.slice(0, 5).map((a, i) => <NumberedItem key={a.slug} article={a} index={i} />)}
                </div>
              </div>
              <AdSlot format="mpu" />
              <NewsletterCard />
              <AdSlot format="half-page" />
            </div>
          </aside>
        </div>

        {/* Related articles */}
        <section className="mt-20 pt-14 border-t border-rule">
          <h3 className="font-display text-3xl font-black mb-8">Related Stories</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {rel.length > 0 ? rel.map((a) => <ArticleCard key={a.slug} article={a} />) :
              ARTICLES.slice(1, 4).map((a) => <ArticleCard key={a.slug} article={a} />)}
          </div>
        </section>
      </article>
    </>
  );
}

function ShareBtn({ Icon }: { Icon: any }) {
  return (
    <button className="size-10 grid place-items-center border border-rule hover:bg-ink hover:text-background hover:border-ink transition-all" aria-label="Share">
      <Icon size={15} />
    </button>
  );
}
