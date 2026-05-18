import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CATEGORIES, byCategory, ARTICLES } from "@/lib/news-data";
import { ArticleCard, NumberedItem } from "@/components/site/ArticleCard";
import { NewsletterCard } from "@/components/site/NewsletterCard";
import { Search } from "lucide-react";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === params.slug);
    const name = cat?.name ?? "News";
    return {
      meta: [
        { title: `${name} — DailyNewsTap` },
        { name: "description", content: `Latest ${name} news, analysis and reporting from DailyNewsTap.` },
        { property: "og:title", content: `${name} — DailyNewsTap` },
      ],
    };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center">
      <h1 className="font-display text-5xl font-black mb-4">Category not found</h1>
      <Link to="/" className="text-brand underline">Back to home</Link>
    </div>
  ),
  loader: ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    return { category: cat };
  },
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { category } = Route.useLoaderData();
  const articles = byCategory(slug);
  const featured = articles[0] ?? ARTICLES[0];
  const grid = articles.slice(1);
  const trending = ARTICLES.slice(0, 5);

  return (
    <>
      {/* Category Hero Banner */}
      <section className="bg-ink text-background py-16 md:py-20 border-b border-ink">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="eyebrow text-brand mb-4">Section</p>
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter mb-6">
            {category.name}
          </h1>
          <p className="text-background/70 font-serif-body max-w-2xl text-lg">
            In-depth reporting, analysis, and commentary on {category.name.toLowerCase()} — from our newsroom across Nigeria and beyond.
          </p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 py-14">
        {/* Search/filter bar */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-12 pb-6 border-b border-rule">
          <div className="flex gap-3 overflow-x-auto">
            {["All", "Latest", "Most Read", "Editor's Picks"].map((f, i) => (
              <button key={f} className={`px-4 py-2 text-xs font-bold uppercase tracking-tight whitespace-nowrap transition-colors ${i === 0 ? "bg-ink text-background" : "border border-rule hover:border-ink"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 border border-rule px-4 py-2 md:w-80">
            <Search size={14} className="text-ink-muted" />
            <input type="text" placeholder={`Search in ${category.name}…`} className="bg-transparent outline-none text-sm flex-1" />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 lg:gap-12">
          <div className="col-span-12 lg:col-span-8">
            {/* Featured */}
            <Link to="/article/$slug" params={{ slug: featured.slug }} className="group block mb-14">
              <div className="aspect-[16/9] bg-surface overflow-hidden mb-6">
                <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <span className="eyebrow text-brand mb-3 block">Featured · {featured.category}</span>
              <h2 className="font-display text-3xl md:text-4xl font-black leading-tight group-hover:text-brand transition-colors mb-4">{featured.title}</h2>
              <p className="font-serif-body text-ink-muted leading-relaxed max-w-2xl">{featured.excerpt}</p>
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {grid.length > 0 ? grid.map((a) => <ArticleCard key={a.slug} article={a} />) : (
                <p className="text-ink-muted col-span-2 py-12 text-center font-serif-body italic">More stories in {category.name} coming soon.</p>
              )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-16">
              {[1, 2, 3, "…", 8].map((p, i) => (
                <button key={i} className={`size-10 text-sm font-semibold ${p === 1 ? "bg-ink text-background" : "border border-rule hover:border-ink"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <aside className="col-span-12 lg:col-span-4 lg:border-l lg:border-rule lg:pl-12 space-y-12">
            <div>
              <h4 className="bg-brand text-brand-foreground eyebrow px-3 py-1.5 inline-block mb-7">Trending Stories</h4>
              <div className="space-y-7">
                {trending.map((a, i) => <NumberedItem key={a.slug} article={a} index={i} />)}
              </div>
            </div>
            <NewsletterCard />
          </aside>
        </div>
      </div>
    </>
  );
}
