import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { ArticleCard } from "@/components/site/ArticleCard";
import { AdSlot } from "@/components/site/AdSlot";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { AD_SLOTS } from "@/lib/ads";
import { searchArticles } from "../fns/articles";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ deps }) => searchArticles({ data: deps.q }),
  head: ({ match }) => {
    const q = (match.search as { q?: string }).q ?? "";
    return {
      meta: [
        { title: q ? `Search: "${q}" — Cinescope Global Concept` : "Search — Cinescope Global Concept" },
        { name: "robots", content: "noindex, follow" },
      ],
    };
  },
  component: SearchPage,
});

function SearchPage() {
  const results = Route.useLoaderData();
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [input, setInput] = useState(q);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    navigate({ search: { q: trimmed }, replace: true });
  }

  function clearSearch() {
    setInput("");
    navigate({ search: { q: "" }, replace: true });
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-16">

      {/* Search bar */}
      <div className="max-w-2xl mb-12">
        <div className="mb-5">
          <Breadcrumb crumbs={[{ label: q ? `"${q}"` : "Search", current: true as const }]} />
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight mb-6">
          Search
        </h1>
        <form onSubmit={handleSubmit} className="relative flex gap-0">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
            />
            <input
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search articles, topics, authors…"
              autoFocus
              className="w-full h-12 pl-11 pr-4 border border-rule bg-background text-ink placeholder:text-ink-muted text-sm focus:outline-none focus:border-ink transition-colors"
            />
            {input && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="h-12 px-6 bg-ink text-background text-[11px] font-bold uppercase tracking-widest hover:bg-brand transition-colors shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      {q ? (
        <>
          <div className="flex items-baseline gap-3 mb-8 border-b border-rule pb-4">
            <span className="font-display text-xl font-bold">
              {results.length > 0
                ? `${results.length} result${results.length === 1 ? "" : "s"} for`
                : "No results for"}
            </span>
            <span className="font-display text-xl text-brand">"{q}"</span>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-12 gap-6">
              {/* Article grid */}
              <div className="col-span-12 lg:col-span-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
                  {results.map((article, i) => (
                    <>
                      <ArticleCard key={article.slug} article={article} />
                      {/* In-feed ad after every 6th result */}
                      {(i + 1) % 6 === 0 && i < results.length - 1 && (
                        <div key={`ad-${i}`} className="md:col-span-2">
                          <AdSlot format="leaderboard" slot={AD_SLOTS.LEADERBOARD_TOP} position="leaderboard-top" />
                        </div>
                      )}
                    </>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <aside className="col-span-12 lg:col-span-4">
                <div className="lg:sticky lg:top-28 space-y-8">
                  <AdSlot format="mpu" slot={AD_SLOTS.SIDEBAR_MPU} position="sidebar-mpu" />
                  <div className="border border-rule p-6">
                    <h3 className="eyebrow text-ink-muted mb-4">Can't find what you need?</h3>
                    <p className="text-sm text-ink-muted leading-relaxed mb-4">
                      Try browsing by category or check our latest stories.
                    </p>
                    <Link
                      to="/"
                      className="inline-block text-[11px] font-bold uppercase tracking-widest border border-ink px-4 py-2 hover:bg-ink hover:text-background transition-colors"
                    >
                      Browse latest
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          ) : (
            <div className="py-16 text-center max-w-md mx-auto">
              <Search size={40} className="mx-auto text-rule mb-6" />
              <p className="font-display text-2xl font-bold mb-3">Nothing found</p>
              <p className="text-ink-muted text-sm leading-relaxed mb-8">
                We couldn't find any articles matching "{q}". Try a different keyword or browse by category.
              </p>
              <Link
                to="/"
                className="inline-block text-[11px] font-bold uppercase tracking-widest border border-ink px-6 py-3 hover:bg-ink hover:text-background transition-colors"
              >
                Go to homepage
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="py-16 text-center max-w-md mx-auto">
          <Search size={40} className="mx-auto text-rule mb-6" />
          <p className="text-ink-muted text-sm leading-relaxed">
            Type a keyword above to search across all articles.
          </p>
        </div>
      )}
    </div>
  );
}
