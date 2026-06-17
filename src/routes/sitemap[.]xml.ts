import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const BASE_URL = "https://www.cinescopenews.com.ng";

function toW3CDate(dateStr: string | null | undefined): string {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  return new Date(dateStr).toISOString().split("T")[0];
}

function url(
  loc: string,
  opts: { lastmod?: string | null; changefreq: string; priority: string }
) {
  const lastmod = opts.lastmod ? `\n    <lastmod>${toW3CDate(opts.lastmod)}</lastmod>` : "";
  return `  <url>\n    <loc>${BASE_URL}${loc}</loc>${lastmod}\n    <changefreq>${opts.changefreq}</changefreq>\n    <priority>${opts.priority}</priority>\n  </url>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [publishedArticles, allCategories] = await Promise.all([
          db
            .select({
              slug:        articles.slug,
              publishedAt: articles.publishedAt,
              updatedAt:   articles.updatedAt,
            })
            .from(articles)
            .where(eq(articles.status, "published"))
            .orderBy(desc(articles.publishedAt)),
          db
            .select({ slug: categories.slug, updatedAt: categories.updatedAt })
            .from(categories),
        ]);

        const staticPages = [
          url("/",        { lastmod: new Date().toISOString(), changefreq: "hourly",  priority: "1.0" }),
          url("/about",   { changefreq: "monthly",  priority: "0.5" }),
          url("/contact", { changefreq: "monthly",  priority: "0.5" }),
          url("/privacy", { changefreq: "yearly",   priority: "0.3" }),
        ];

        const categoryPages = allCategories.map((c) =>
          url(`/category/${c.slug}`, {
            lastmod: c.updatedAt,
            changefreq: "daily",
            priority: "0.8",
          })
        );

        const articlePages = publishedArticles.map((a) =>
          url(`/article/${a.slug}`, {
            lastmod: a.publishedAt ?? a.updatedAt,
            changefreq: "weekly",
            priority: "0.7",
          })
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...staticPages,
          ...categoryPages,
          ...articlePages,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});
