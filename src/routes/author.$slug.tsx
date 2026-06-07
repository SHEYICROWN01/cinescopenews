import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { User } from "lucide-react";
import { ArticleCard } from "@/components/site/ArticleCard";
import { AdSlot } from "@/components/site/AdSlot";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { AD_SLOTS } from "@/lib/ads";
import { getArticlesByAuthor } from "../fns/articles";

export const Route = createFileRoute("/author/$slug")({
  loader: async ({ params }) => {
    const result = await getArticlesByAuthor({ data: params.slug });
    if (result.articles.length === 0) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    const name = loaderData?.authorName ?? "";
    return {
      meta: [
        { title: `${name} — Cinescope Global Concept` },
        {
          name: "description",
          content: `Read all articles by ${name} on Cinescope Global Concept.`,
        },
      ],
      links: [
        {
          rel: "canonical",
          href: `https://www.cinescopeglobal.com/author/${loaderData?.articles[0]
            ? nameToSlug(loaderData.authorName)
            : ""}`,
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center">
      <User size={40} className="mx-auto text-rule mb-6" />
      <h1 className="font-display text-4xl font-black mb-4">Author not found</h1>
      <p className="text-ink-muted mb-8">No published articles by this author.</p>
      <Link to="/" className="text-brand underline eyebrow">Back to home</Link>
    </div>
  ),
  component: AuthorPage,
});

function nameToSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function AuthorPage() {
  const { articles, authorName } = Route.useLoaderData();

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-16">

      {/* Author header */}
      <div className="mb-12 pb-10 border-b border-rule">
        <div className="mb-6">
          <Breadcrumb crumbs={[{ label: authorName, current: true as const }]} />
        </div>
        <div className="flex items-center gap-6">
          <div className="size-20 bg-ink rounded-full grid place-items-center text-background text-2xl font-bold shrink-0 select-none">
            {getInitials(authorName)}
          </div>
          <div>
            <p className="eyebrow text-ink-muted mb-2">Author</p>
            <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight mb-1">
              {authorName}
            </h1>
            <p className="text-ink-muted text-sm">
              {articles.length} article{articles.length === 1 ? "" : "s"} published
            </p>
          </div>
        </div>
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
                    <AdSlot format="leaderboard" slot={AD_SLOTS.LEADERBOARD_TOP} />
                  </div>
                )}
              </>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <AdSlot format="mpu" slot={AD_SLOTS.SIDEBAR_MPU} />
          </div>
        </aside>

      </div>
    </div>
  );
}
