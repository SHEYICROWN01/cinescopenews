import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const BASE_URL  = "https://www.cinescopeglobal.com";
const SITE_NAME = "Cinescope Global Concept";
const SITE_DESC = "Bold investigative journalism, in-depth analysis, and global news coverage from Cinescope Global Concept.";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toRfc822(dateStr: string | null | undefined): string {
  return new Date(dateStr ?? Date.now()).toUTCString();
}

function excerpt(content: string | null, subtitle: string | null, maxLen = 300): string {
  const text = subtitle?.trim() || stripHtml(content ?? "");
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

export const Route = createFileRoute("/feed.xml")({
  server: {
    handlers: {
      GET: async () => {
        const rows = await db
          .select({
            title:        articles.title,
            subtitle:     articles.subtitle,
            slug:         articles.slug,
            content:      articles.content,
            featuredImage: articles.featuredImage,
            author:       articles.author,
            publishedAt:  articles.publishedAt,
            createdAt:    articles.createdAt,
            categoryName: categories.name,
            categorySlug: categories.slug,
          })
          .from(articles)
          .leftJoin(categories, eq(articles.categoryId, categories.id))
          .where(eq(articles.status, "published"))
          .orderBy(desc(articles.publishedAt))
          .limit(50);

        const items = rows.map((a) => {
          const link    = `${BASE_URL}/article/${a.slug}`;
          const pubDate = toRfc822(a.publishedAt ?? a.createdAt);
          const desc    = escapeXml(excerpt(a.content, a.subtitle));
          const image   = a.featuredImage?.trim()
            ? `<enclosure url="${escapeXml(a.featuredImage)}" type="image/jpeg" length="0" />`
            : "";
          const category = a.categoryName
            ? `<category>${escapeXml(a.categoryName)}</category>`
            : "";

          return [
            "    <item>",
            `      <title>${escapeXml(a.title)}</title>`,
            `      <link>${link}</link>`,
            `      <guid isPermaLink="true">${link}</guid>`,
            `      <pubDate>${pubDate}</pubDate>`,
            `      <author>editors@cinescopeglobal.com (${escapeXml(a.author ?? "Cinescope Global Concept")})</author>`,
            category,
            `      <description>${desc}</description>`,
            image,
            "    </item>",
          ]
            .filter(Boolean)
            .join("\n");
        });

        const now = new Date().toUTCString();

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">`,
          `  <channel>`,
          `    <title>${SITE_NAME}</title>`,
          `    <link>${BASE_URL}</link>`,
          `    <description>${SITE_DESC}</description>`,
          `    <language>en-ng</language>`,
          `    <copyright>© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</copyright>`,
          `    <lastBuildDate>${now}</lastBuildDate>`,
          `    <ttl>60</ttl>`,
          `    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />`,
          `    <image>`,
          `      <url>${BASE_URL}/logo.png</url>`,
          `      <title>${SITE_NAME}</title>`,
          `      <link>${BASE_URL}</link>`,
          `    </image>`,
          ...items,
          `  </channel>`,
          `</rss>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=1800, s-maxage=1800",
          },
        });
      },
    },
  },
});
