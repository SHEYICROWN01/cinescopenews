import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArticleCard, NumberedItem } from "@/components/site/ArticleCard";
import { NewsletterCard } from "@/components/site/NewsletterCard";
import { AdSlot } from "@/components/site/AdSlot";
import { AD_SLOTS } from "@/lib/ads";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getPublishedArticlesByCategory } from "../fns/articles";
import { getPublicCategories } from "../fns/categories";

type CategoryLoaderResult = Awaited<ReturnType<typeof loader>>;

async function loader({ params, search }: { params: { slug: string }; search: { page?: number } }) {
  const page = Math.max(1, Number(search.page ?? 1));
  const [allCategories, result] = await Promise.all([
    getPublicCategories(),
    getPublishedArticlesByCategory({ data: { slug: params.slug, page } }),
  ]);
  const category = allCategories.find((c) => c.slug === params.slug);
  if (!category) throw notFound();
  return { category, ...result };
}

export const Route = createFileRoute("/category/$slug")({
  validateSearch: (search: Record<string, unknown>) => ({
    page: typeof search.page === "number" ? search.page : 1,
  }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  head: ({ loaderData }) => {
    const cat = (loaderData as CategoryLoaderResult | undefined)?.category;
    const page = (loaderData as CategoryLoaderResult | undefined)?.page ?? 1;
    const name = cat?.name ?? "News";
    const pageLabel = page > 1 ? ` — Page ${page}` : "";
    return {
      meta: [
        { title: `${name}${pageLabel} — Cinescope Global Concept` },
        { name: "description", content: `Latest ${name} news, analysis and reporting from Cinescope Global Concept.` },
        { property: "og:title", content: `${name} — Cinescope Global Concept` },
      ],
      links: [
        {
          rel: "canonical",
          href: `https://www.cinescopenews.com.ng/category/${cat?.slug ?? ""}${page > 1 ? `?page=${page}` : ""}`,
        },
      ],
    };
  },
  loader: ({ params, deps }) => loader({ params, search: { page: deps.page } }),
  notFoundComponent: () => (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center">
      <h1 className="font-display text-5xl font-black mb-4">Category not found</h1>
      <Link to="/" className="text-brand underline">Back to home</Link>
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category, articles, page, totalPages, total } = Route.useLoaderData() as CategoryLoaderResult;
  const featured = page === 1 ? articles[0] : null;
  const grid = page === 1 ? articles.slice(1) : articles;

  return (
    <>
      {/* Category hero — only on page 1 */}
      {page === 1 && (
        <section
          className="relative text-background py-20 md:py-28 border-b-4 border-brand overflow-hidden"
          style={{ backgroundColor: category.color ?? "#E63946" }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
          />
          <div className="max-w-[1800px] mx-auto px-6 lg:px-12 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              Section
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6">
              {category.name}
            </h1>
            <p className="text-background/80 font-serif-body max-w-3xl text-base md:text-xl leading-relaxed">
              In-depth reporting, analysis, and commentary on {category.name.toLowerCase()} from our newsroom.
            </p>
          </div>
        </section>
      )}

      {/* Page N header (non-first pages) */}
      {page > 1 && (
        <div
          className="border-b-4 py-10"
          style={{ borderColor: category.color ?? "#E63946" }}
        >
          <div className="max-w-[1800px] mx-auto px-6 lg:px-12 flex items-center gap-4">
            <Link
              to="/category/$slug"
              params={{ slug: category.slug }}
              search={{ page: 1 }}
              className="eyebrow text-ink-muted hover:text-brand transition-colors"
            >
              {category.name}
            </Link>
            <span className="text-rule">/</span>
            <span className="eyebrow text-ink">Page {page}</span>
          </div>
        </div>
      )}

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-16 lg:py-20">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-14 pb-6 border-b-2 border-rule">
          <div className="flex items-center gap-3 border-2 border-rule rounded-full px-5 py-2.5 md:w-96 hover:border-brand transition-colors">
            <Search size={16} className="text-ink-muted" />
            <input
              type="text"
              placeholder={`Search in ${category.name}...`}
              className="bg-transparent outline-none text-sm flex-1 placeholder:text-ink-muted"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = (e.target as HTMLInputElement).value.trim();
                  if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
                }
              }}
            />
          </div>
          <p className="eyebrow text-ink-muted shrink-0">
            {total} article{total === 1 ? "" : "s"}
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6 lg:gap-14">
          <div className="col-span-12 lg:col-span-8">

            {/* Featured article — page 1 only */}
            {featured && (
              <Link to="/article/$slug" params={{ slug: featured.slug }} className="group block mb-16">
                <div className="aspect-[16/9] bg-surface overflow-hidden rounded-2xl mb-6 shadow-xl">
                  {featured.featuredImage
                    ? <img src={featured.featuredImage} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    : <div className="w-full h-full bg-surface" />
                  }
                </div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-4" style={{ backgroundColor: "color-mix(in oklab, var(--lime) 15%, transparent)", color: "var(--accent-red)" }}>
                  Featured
                </span>
                <h2 className="font-display text-3xl md:text-5xl font-black leading-tight group-hover:text-brand transition-colors mb-5">
                  {featured.title}
                </h2>
                {featured.subtitle && (
                  <p className="font-serif-body text-lg text-ink-muted leading-relaxed max-w-3xl">{featured.subtitle}</p>
                )}
              </Link>
            )}

            {/* Article grid */}
            {grid.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
                {grid.map((a, i) => (
                  <>
                    <ArticleCard key={a.slug} article={a} />
                    {(i + 1) % 6 === 0 && i < grid.length - 1 && (
                      <div key={`ad-${i}`} className="md:col-span-2">
                        <AdSlot format="leaderboard" slot={AD_SLOTS.LEADERBOARD_TOP} position="leaderboard-top" />
                      </div>
                    )}
                  </>
                ))}
              </div>
            ) : (
              <p className="text-ink-muted py-16 text-center font-serif-body text-lg italic">
                More stories in {category.name} coming soon.
              </p>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Pagination" className="mt-16 pt-10 border-t border-rule flex items-center justify-between gap-4">
                {page > 1 ? (
                  <Link
                    to="/category/$slug"
                    params={{ slug: category.slug }}
                    search={{ page: page - 1 }}
                    className="flex items-center gap-2 eyebrow text-ink hover:text-brand transition-colors"
                  >
                    <ChevronLeft size={16} /> Newer stories
                  </Link>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "…" ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-ink-muted eyebrow">…</span>
                      ) : (
                        <Link
                          key={p}
                          to="/category/$slug"
                          params={{ slug: category.slug }}
                          search={{ page: p }}
                          className={`size-9 grid place-items-center text-sm font-bold transition-colors ${
                            p === page
                              ? "bg-ink text-background"
                              : "hover:bg-surface text-ink"
                          }`}
                        >
                          {p}
                        </Link>
                      )
                    )}
                </div>

                {page < totalPages ? (
                  <Link
                    to="/category/$slug"
                    params={{ slug: category.slug }}
                    search={{ page: page + 1 }}
                    className="flex items-center gap-2 eyebrow text-ink hover:text-brand transition-colors"
                  >
                    Older stories <ChevronRight size={16} />
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </div>

          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-4 lg:border-l-2 lg:border-rule lg:pl-12 space-y-12">
            {page === 1 && articles.length > 0 && (
              <div>
                <h4 className="px-4 py-2 text-xs font-bold uppercase tracking-wider inline-block mb-8" style={{ backgroundColor: "var(--lime)", color: "var(--lime-foreground)" }}>
                  Trending Stories
                </h4>
                <div className="space-y-7">
                  {articles.slice(0, 5).map((a, i) => (
                    <NumberedItem key={a.slug} article={a} index={i} />
                  ))}
                </div>
              </div>
            )}
            <AdSlot format="mpu" slot={AD_SLOTS.SIDEBAR_MPU} position="sidebar-mpu" />
            <NewsletterCard />
          </aside>
        </div>
      </div>
    </>
  );
}
