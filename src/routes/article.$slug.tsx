import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArticleCard } from "@/components/site/ArticleCard";
import { NewsletterCard } from "@/components/site/NewsletterCard";
import { AdSlot } from "@/components/site/AdSlot";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { AD_SLOTS } from "@/lib/ads";
import { MessageCircle, Send, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublishedArticleBySlug, incrementArticleViews } from "../fns/articles";
import { getApprovedCommentsFn, submitCommentFn } from "../fns/comments";
import { ShareButtons, MobileShareBar } from "@/components/site/SharePanel";

type LoaderResult = NonNullable<Awaited<ReturnType<typeof getPublishedArticleBySlug>>>;
type ArticleComment = Awaited<ReturnType<typeof getApprovedCommentsFn>>[number];

export const Route = createFileRoute("/article/$slug")({
  head: ({ loaderData }) => {
    const a = (loaderData as (LoaderResult & { articleComments: ArticleComment[] }) | undefined)?.article;
    if (!a) return { meta: [{ title: "Article — Cinescope Global Concept" }] };
    const pageUrl = `https://www.cinescopenews.com.ng/article/${a.slug}`;
    const ogImage = a.featuredImage
      ? (a.featuredImage.startsWith("http") ? a.featuredImage : `https://www.cinescopenews.com.ng${a.featuredImage}`)
      : "https://www.cinescopenews.com.ng/logo.png";
    return {
      meta: [
        { title: `${a.title} — Cinescope Global Concept` },
        { name: "description", content: a.subtitle ?? a.title },
        { property: "og:title", content: a.title },
        { property: "og:description", content: a.subtitle ?? a.title },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:url", content: pageUrl },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "Cinescope Global Concept" },
        { property: "article:published_time", content: a.publishedAt ?? "" },
        { property: "article:author", content: a.author ?? "Cinescope Global Concept" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@CinescopeGlobal" },
        { name: "twitter:title", content: a.title },
        { name: "twitter:description", content: a.subtitle ?? a.title },
        { name: "twitter:image", content: ogImage },
      ],
      links: [
        {
          rel: "canonical",
          href: `https://www.cinescopenews.com.ng/article/${a.slug}`,
        },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "NewsArticle",
                "@id": `https://www.cinescopenews.com.ng/article/${a.slug}#article`,
                headline: a.title,
                description: a.subtitle ?? a.title,
                image: a.featuredImage ? [a.featuredImage] : [],
                datePublished: a.publishedAt ?? a.createdAt,
                dateModified: a.publishedAt ?? a.createdAt,
                author: {
                  "@type": "Person",
                  name: a.author ?? "Cinescope Global Concept Editorial",
                },
                publisher: {
                  "@id": "https://www.cinescopenews.com.ng/#organization",
                },
                mainEntityOfPage: {
                  "@type": "WebPage",
                  "@id": `https://www.cinescopenews.com.ng/article/${a.slug}`,
                },
                ...(a.categoryName && {
                  articleSection: a.categoryName,
                  keywords: a.tags?.join(", ") ?? a.categoryName,
                }),
                inLanguage: "en-NG",
                isAccessibleForFree: true,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://www.cinescopenews.com.ng",
                  },
                  ...(a.categoryName && a.categorySlug
                    ? [
                        {
                          "@type": "ListItem",
                          position: 2,
                          name: a.categoryName,
                          item: `https://www.cinescopenews.com.ng/category/${a.categorySlug}`,
                        },
                        {
                          "@type": "ListItem",
                          position: 3,
                          name: a.title,
                          item: `https://www.cinescopenews.com.ng/article/${a.slug}`,
                        },
                      ]
                    : [
                        {
                          "@type": "ListItem",
                          position: 2,
                          name: a.title,
                          item: `https://www.cinescopenews.com.ng/article/${a.slug}`,
                        },
                      ]),
                ],
              },
            ],
          }),
        },
      ],
    };
  },
  loader: async ({ params }) => {
    const result = await getPublishedArticleBySlug({ data: params.slug });
    if (!result) throw notFound();
    const articleComments = await getApprovedCommentsFn({ data: result.article.id });
    return { ...result, articleComments };
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
  const { article, related, readAlsoArticles, articleComments } = Route.useLoaderData() as LoaderResult & { articleComments: ArticleComment[] };
  const [progress, setProgress] = useState(0);
  const articleUrl = `https://www.cinescopenews.com.ng/article/${article.slug}`;

  const wordCount = (article.content ?? "").replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
  const authorInitials = (article.author || "S").split(" ").map((n: string) => n[0]).join("");
  const authorSlug = (article.author || "staff-reporter").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  useEffect(() => {
    incrementArticleViews({ data: article.id }).catch(() => {});
  }, [article.id]);

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
      <div className="fixed top-0 left-0 right-0 h-1 z-[60] bg-transparent">
        <div className="h-full bg-brand transition-[width] duration-100" style={{ width: `${progress}%` }} />
      </div>

      <article>
        {article.featuredImage ? (
          <div className="relative w-full bg-surface overflow-hidden min-h-[300px] sm:min-h-[380px] md:min-h-0 md:aspect-[21/9]" style={{ maxHeight: "580px" }}>
            <img
              src={article.featuredImage}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ animation: "hero-scale 8s ease both" }}
              fetchPriority="high"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/97 via-ink/60 to-transparent" />
            {article.featuredImageCaption && (
              <div className="absolute bottom-3 right-4 z-10">
                <span className="text-background/60 text-[10px] font-mono tracking-wide">
                  {article.featuredImageCaption}
                </span>
              </div>
            )}
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-6 sm:pb-10 md:pb-16 w-full">
                {article.isBreaking && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block size-2 rounded-full bg-red-500 animate-[pulse-dot_1.6s_ease-in-out_infinite]" />
                    <span className="eyebrow text-red-400 tracking-[0.25em]">Breaking News</span>
                  </div>
                )}
                {article.categoryName && article.categorySlug && (
                  <Link
                    to="/category/$slug"
                    params={{ slug: article.categorySlug }}
                    className="eyebrow text-brand hover:underline mb-3 block"
                  >
                    {article.categoryName}
                  </Link>
                )}
                <h1
                  className="font-display text-xl sm:text-3xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[1.05] text-background mb-3 sm:mb-5 max-w-5xl"
                  style={{ animation: "fade-in 0.9s var(--ease-out-expo) both", animationDelay: "80ms" }}
                >
                  {article.title}
                </h1>
                {article.subtitle && (
                  <p
                    className="hidden sm:block font-serif-body text-base md:text-xl text-background/75 leading-relaxed mb-5 md:mb-7 max-w-3xl"
                    style={{ animation: "fade-in 0.9s var(--ease-out-expo) both", animationDelay: "160ms" }}
                  >
                    {article.subtitle}
                  </p>
                )}
                <div
                  className="flex items-center gap-2.5 flex-wrap"
                  style={{ animation: "fade-in 0.9s var(--ease-out-expo) both", animationDelay: "220ms" }}
                >
                  <div className="size-8 sm:size-10 bg-background/20 backdrop-blur-sm rounded-full grid place-items-center text-background text-xs font-bold border border-background/30">
                    {authorInitials}
                  </div>
                  <div>
                    <Link
                      to="/author/$slug"
                      params={{ slug: authorSlug }}
                      className="text-xs sm:text-sm font-bold text-background hover:text-brand transition-colors"
                    >
                      {article.author || "Staff Reporter"}
                    </Link>
                    <p className="eyebrow text-background/60 mt-0.5 text-[10px] sm:text-xs">{article.date} &middot; {readTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <header className="max-w-3xl mx-auto text-center px-4 sm:px-6 pt-8 sm:pt-14 pb-8 md:pt-20">
            <div className="flex items-center justify-center gap-3 mb-4 sm:mb-5">
              <div className="h-px w-10 bg-rule" />
              {article.isBreaking ? (
                <div className="flex items-center gap-1.5">
                  <span className="inline-block size-2 rounded-full bg-red-500 animate-[pulse-dot_1.6s_ease-in-out_infinite]" />
                  <span className="eyebrow text-red-500 tracking-[0.25em]">Breaking News</span>
                </div>
              ) : article.categoryName && article.categorySlug ? (
                <Link to="/category/$slug" params={{ slug: article.categorySlug }} className="eyebrow text-brand hover:opacity-70 transition-opacity">
                  {article.categoryName}
                </Link>
              ) : null}
              <div className="h-px w-10 bg-rule" />
            </div>
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.06] text-balance mb-4 sm:mb-6">
              {article.title}
            </h1>
            {article.subtitle && (
              <p className="font-serif-body text-base sm:text-xl text-ink-muted leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto">{article.subtitle}</p>
            )}
            <div className="flex items-center justify-center gap-3">
              <div className="size-9 sm:size-11 bg-ink rounded-full grid place-items-center text-background text-xs sm:text-sm font-bold">
                {authorInitials}
              </div>
              <div className="text-left">
                <Link
                  to="/author/$slug"
                  params={{ slug: authorSlug }}
                  className="text-xs sm:text-sm font-bold hover:text-brand transition-colors"
                >
                  {article.author || "Staff Reporter"}
                </Link>
                <p className="eyebrow text-ink-muted mt-0.5 text-[10px] sm:text-xs">{article.date} &middot; {readTime}</p>
              </div>
            </div>
          </header>
        )}

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 md:py-16">

        <div className="mb-4 md:mb-8">
          <Breadcrumb
            crumbs={[
              ...(article.categoryName && article.categorySlug
                ? [{ label: article.categoryName, to: "/category/$slug", params: { slug: article.categorySlug } }]
                : []),
              { label: article.title, current: true as const },
            ]}
          />
        </div>

        <div className="mb-6 md:mb-0">
          <MobileShareBar url={articleUrl} title={article.title} />
        </div>

        <div className="grid grid-cols-12 gap-6 lg:gap-16">
          <aside className="hidden lg:flex col-span-1 flex-col items-center gap-4 pt-2">
            <div className="sticky top-32">
              <ShareButtons url={articleUrl} title={article.title} layout="vertical" />
            </div>
          </aside>

          <div className="col-span-12 lg:col-span-7">
            {article.content ? (
              <ArticleBody html={article.content} slot={AD_SLOTS.ARTICLE_IN_CONTENT} />
            ) : (
              <p className="font-serif-body text-lg text-ink-muted italic">No content available.</p>
            )}

            {readAlsoArticles && readAlsoArticles.length > 0 && (
              <div className="my-10 space-y-3">
                <p className="eyebrow text-ink-muted text-xs tracking-widest mb-4">Read Also</p>
                {readAlsoArticles.map((a: any) => (
                  <Link
                    key={a.slug}
                    to="/article/$slug"
                    params={{ slug: a.slug }}
                    className="group flex items-start gap-4 border border-rule hover:border-brand p-4 transition-colors bg-surface"
                  >
                    <div className="w-20 h-14 flex-shrink-0 overflow-hidden bg-ink/10">
                      <img
                        src={a.featuredImage}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      {a.categoryName && (
                        <p className="eyebrow text-brand text-[10px] mb-1">{a.categoryName}</p>
                      )}
                      <p className="font-display font-bold text-sm leading-snug text-ink group-hover:text-brand transition-colors line-clamp-2">
                        {a.title}
                      </p>
                      <p className="eyebrow text-ink-muted text-[10px] mt-1.5">{a.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {article.tags && article.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-rule flex flex-wrap gap-2">
                <span className="eyebrow text-ink-muted mr-2 self-center">Tags:</span>
                {article.tags.map((t) => (
                  <Link
                    key={t}
                    to="/tag/$tag"
                    params={{ tag: t.toLowerCase().replace(/\s+/g, "-") }}
                    className="px-3 py-1 border border-rule text-xs font-semibold hover:border-brand hover:text-brand transition-colors"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            )}

            <AdSlot format="leaderboard" slot={AD_SLOTS.ARTICLE_AFTER_BODY} position="article-after-body" className="my-14" />

            <CommentSection articleId={article.id} initialComments={articleComments} />
          </div>

          <aside className="col-span-12 lg:col-span-4 space-y-10">
            <div className="lg:sticky lg:top-28 space-y-10">
              {related.length > 0 && (
                <div>
                  <h4 className="eyebrow px-3 py-1.5 inline-block mb-6" style={{ backgroundColor: "var(--lime)", color: "var(--lime-foreground)" }}>More from this section</h4>
                  <div className="space-y-6">
                    {related.map((a, i) => (
                      <div key={a.slug} className="flex gap-4 pb-4 border-b border-rule last:border-0">
                        <span className="font-display text-3xl font-light text-rule w-8 shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <Link to="/article/$slug" params={{ slug: a.slug }} className="font-bold text-sm leading-snug hover:text-brand transition-colors block mb-1">
                            {a.title}
                          </Link>
                          <span className="eyebrow text-ink-muted text-xs">{a.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <NewsletterCard />
              <AdSlot format="mpu" slot={AD_SLOTS.SIDEBAR_MPU} position="sidebar-mpu" />
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-20 pt-14 border-t border-rule">
            <h3 className="font-display text-3xl font-black mb-8">Related Stories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
              {related.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </section>
        )}
        </div>
      </article>
    </>
  );
}

/* ── Comment section ─────────────────────────────────────────────────────── */
function CommentSection({
  articleId,
  initialComments,
}: {
  articleId: number;
  initialComments: ArticleComment[];
}) {
  const [allComments, setAllComments] = useState(initialComments);
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function initials(n: string) {
    return n.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }

  function formatCommentDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await submitCommentFn({ data: { articleId, name, email, content } });
      if (!result.ok) {
        setError(result.error);
      } else {
        setSuccess(true);
        setName(""); setEmail(""); setContent("");
      }
    } catch {
      setError("Failed to submit comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-16 pt-12 border-t-2 border-rule">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <MessageCircle size={20} className="text-brand" />
        <h3 className="font-display text-2xl font-black tracking-tight">
          {allComments.length > 0
            ? `${allComments.length} Comment${allComments.length === 1 ? "" : "s"}`
            : "Comments"}
        </h3>
      </div>

      {/* Approved comments */}
      {allComments.length > 0 ? (
        <div className="space-y-0 mb-14 divide-y divide-rule">
          {allComments.map((c) => (
            <div key={c.id} className="py-7 flex gap-4">
              <div className="size-10 rounded-full bg-ink text-background text-xs font-bold grid place-items-center shrink-0 mt-0.5">
                {initials(c.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                  <span className="font-display font-bold text-sm">{c.name}</span>
                  <span className="eyebrow text-ink-muted">{formatCommentDate(c.createdAt)}</span>
                </div>
                <p className="font-serif-body text-[15px] leading-relaxed text-ink whitespace-pre-line">
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-serif-body text-ink-muted italic mb-12">
          Be the first to share your thoughts on this article.
        </p>
      )}

      {/* Submit form */}
      <div className="bg-surface p-5 sm:p-8 md:p-10">
        <h4 className="font-display text-xl font-black mb-1">Join the Conversation</h4>
        <p className="text-sm text-ink-muted mb-7">
          Your email address will not be published. Comments are moderated.
        </p>

        {success ? (
          <div className="flex items-start gap-4 p-5 bg-green-50 border-l-4 border-green-500">
            <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-green-800 text-sm">Comment submitted successfully!</p>
              <p className="text-sm text-green-700 mt-1">
                Your comment is awaiting moderation and will appear shortly.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border-l-4 border-red-500 px-4 py-3">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="eyebrow text-ink-muted block mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adebayo Johnson"
                  className="w-full border-2 border-rule px-4 py-3 text-sm outline-none focus:border-brand transition-colors bg-background font-sans"
                />
              </div>
              <div>
                <label className="eyebrow text-ink-muted block mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border-2 border-rule px-4 py-3 text-sm outline-none focus:border-brand transition-colors bg-background font-sans"
                />
              </div>
            </div>

            <div>
              <label className="eyebrow text-ink-muted block mb-2">Your Comment *</label>
              <textarea
                required
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts on this article…"
                className="w-full border-2 border-rule px-4 py-3 text-sm outline-none focus:border-brand transition-colors font-serif-body bg-background resize-none"
              />
              <p className="eyebrow text-ink-muted mt-1.5">
                {content.length}/2000 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex items-center gap-3 bg-ink text-background px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-brand transition-colors disabled:opacity-60"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                <Send size={14} className="group-hover:translate-x-0.5 transition-transform" />
              )}
              {loading ? "Posting…" : "Post Comment"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

/* Split article HTML into chunks at </p> boundaries so we can insert
   AdSlots between them. Returns at least one chunk (the whole HTML). */
function splitContentForAds(html: string, adEveryN = 5, maxAds = 2): string[] {
  const chunks: string[] = [];
  const lower = html.toLowerCase();
  let start = 0;
  let paraCount = 0;
  let adsInserted = 0;
  let i = 0;

  while (i < lower.length && adsInserted < maxAds) {
    if (lower.startsWith("</p>", i)) {
      paraCount++;
      i += 4; // advance past </p>
      if (paraCount >= adEveryN) {
        chunks.push(html.slice(start, i));
        start = i;
        paraCount = 0;
        adsInserted++;
      }
    } else {
      i++;
    }
  }

  const tail = html.slice(start);
  if (tail.trim()) chunks.push(tail);

  return chunks.length > 1 ? chunks : [html];
}

/* Renders article HTML with AdSlots injected between paragraph chunks */
function ArticleBody({ html, slot }: { html: string; slot: string }) {
  const chunks = splitContentForAds(html);

  return (
    <>
      {chunks.map((chunk, i) => (
        <div key={i}>
          <div
            className="article-body font-serif-body text-base sm:text-lg leading-[1.75] sm:leading-[1.85] text-ink"
            dangerouslySetInnerHTML={{ __html: chunk }}
          />
          {i < chunks.length - 1 && (
            <AdSlot format="in-article" slot={slot} position="article-in-content" label />
          )}
        </div>
      ))}
    </>
  );
}
