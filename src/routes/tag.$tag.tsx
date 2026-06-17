import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Tag } from "lucide-react";
import { ArticleCard } from "@/components/site/ArticleCard";
import { AdSlot } from "@/components/site/AdSlot";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { AD_SLOTS } from "@/lib/ads";
import { getArticlesByTag } from "../fns/articles";

export const Route = createFileRoute("/tag/$tag")({
  loader: async ({ params }) => {
    const articles = await getArticlesByTag({ data: params.tag });
    if (articles.length === 0) throw notFound();
    return { articles, tag: params.tag };
  },
  head: ({ loaderData }) => {
    const tag = loaderData?.tag ?? "";
    const display = tag.replace(/-/g, " ");
    return {
      meta: [
        { title: `${display} — Cinescope Global Concept` },
        {
          name: "description",
          content: `Browse all articles tagged with "${display}" on Cinescope Global Concept.`,
        },
        {
          rel: "canonical",
          href: `https://www.cinescopenews.com.ng/tag/${tag}`,
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center">
      <Tag size={40} className="mx-auto text-rule mb-6" />
      <h1 className="font-display text-4xl font-black mb-4">No articles found</h1>
      <p className="text-ink-muted mb-8">There are no published articles with this tag.</p>
      <Link to="/" className="text-brand underline eyebrow">Back to home</Link>
    </div>
  ),
  component: TagPage,
});

function TagPage() {
  const { articles, tag } = Route.useLoaderData();
  const display = tag.replace(/-/g, " ");

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-16">

      {/* Header */}
      <div className="mb-10 pb-8 border-b border-rule">
        <div className="mb-4">
          <Breadcrumb crumbs={[{ label: display, current: true as const }]} />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <Tag size={13} className="text-ink-muted" />
          <span className="eyebrow text-ink-muted">Tag</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight capitalize mb-3">
          {display}
        </h1>
        <p className="text-ink-muted text-sm">
          {articles.length} article{articles.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* Article grid */}
        <div className="col-span-12 lg:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
            {articles.map((article, i) => (
              <>
                <ArticleCard key={article.slug} article={article} />
                {(i + 1) % 6 === 0 && i < articles.length - 1 && (
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
          </div>
        </aside>

      </div>
    </div>
  );
}
