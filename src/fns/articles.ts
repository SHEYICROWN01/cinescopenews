import { createServerFn } from "@tanstack/react-start";
import { eq, desc, and, or, like, count } from "drizzle-orm";
import { db, withRetry } from "../db";
import { articles, categories, type NewArticle } from "../db/schema";

function formatDate(publishedAt: string | null, createdAt: string) {
  return new Date(publishedAt ?? createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function parseTags(tags: string | null): string[] {
  return tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
}

/* Generate a deterministic, beautiful fallback image via Picsum.
   The seed is the article slug so the same article always gets the same photo. */
function resolveImage(url: string | null, slug: string): string {
  if (url && url.trim().length > 8) return url.trim();
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/1200/675`;
}

const publicArticleSelect = {
  id:                   articles.id,
  title:                articles.title,
  subtitle:             articles.subtitle,
  slug:                 articles.slug,
  featuredImage:        articles.featuredImage,
  featuredImageCaption: articles.featuredImageCaption,
  author:               articles.author,
  publishedAt:          articles.publishedAt,
  createdAt:            articles.createdAt,
  isBreaking:           articles.isBreaking,
  isFeatured:           articles.isFeatured,
  tags:                 articles.tags,
  readTimeMinutes:      articles.readTimeMinutes,
  categoryName:         categories.name,
  categorySlug:         categories.slug,
  categoryColor:        categories.color,
} as const;

function computeReadTime(content: string | null | undefined): number {
  const words = (content ?? "").replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const getPublishedArticles = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await withRetry(() =>
    db
      .select(publicArticleSelect)
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.publishedAt))
      .limit(80)
  );
  return rows.map((r) => ({
    ...r,
    featuredImage: resolveImage(r.featuredImage, r.slug),
    tags: parseTags(r.tags),
    date: formatDate(r.publishedAt, r.createdAt),
  }));
});

const CATEGORY_PAGE_SIZE = 13;

export const getPublishedArticlesByCategory = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => input as { slug: string; page: number })
  .handler(async ({ data: { slug, page } }) => {
    const currentPage = Math.max(1, page ?? 1);
    const offset = (currentPage - 1) * CATEGORY_PAGE_SIZE;

    const [rows, [{ total }]] = await withRetry(() =>
      Promise.all([
        db
          .select(publicArticleSelect)
          .from(articles)
          .innerJoin(categories, and(eq(articles.categoryId, categories.id), eq(categories.slug, slug)))
          .where(eq(articles.status, "published"))
          .orderBy(desc(articles.publishedAt))
          .limit(CATEGORY_PAGE_SIZE)
          .offset(offset),
        db
          .select({ total: count() })
          .from(articles)
          .innerJoin(categories, and(eq(articles.categoryId, categories.id), eq(categories.slug, slug)))
          .where(eq(articles.status, "published")),
      ])
    );

    return {
      articles: rows.map((r) => ({
        ...r,
        featuredImage: resolveImage(r.featuredImage, r.slug),
        tags: parseTags(r.tags),
        date: formatDate(r.publishedAt, r.createdAt),
      })),
      total,
      page: currentPage,
      pageSize: CATEGORY_PAGE_SIZE,
      totalPages: Math.ceil(total / CATEGORY_PAGE_SIZE),
    };
  });

export const getPublishedArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator((slug: unknown) => slug as string)
  .handler(async ({ data: slug }) => {
    const [row] = await withRetry(() =>
      db
        .select({
          ...publicArticleSelect,
          content:        articles.content,
          seoTitle:       articles.seoTitle,
          seoDescription: articles.seoDescription,
          categoryId:     articles.categoryId,
        })
        .from(articles)
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
    );

    if (!row) return null;

    const related = row.categoryId
      ? (await withRetry(() =>
          db
            .select(publicArticleSelect)
            .from(articles)
            .leftJoin(categories, eq(articles.categoryId, categories.id))
            .where(and(eq(articles.status, "published"), eq(articles.categoryId, row.categoryId!)))
            .orderBy(desc(articles.publishedAt))
            .limit(4)
        ))
          .filter((r) => r.slug !== slug)
          .slice(0, 3)
          .map((r) => ({ ...r, tags: parseTags(r.tags), date: formatDate(r.publishedAt, r.createdAt) }))
      : [];

    return {
      article: {
        ...row,
        featuredImage: resolveImage(row.featuredImage, row.slug),
        tags: parseTags(row.tags),
        date: formatDate(row.publishedAt, row.createdAt),
      },
      related: related.map((r) => ({
        ...r,
        featuredImage: resolveImage(r.featuredImage, r.slug),
      })),
    };
  });

export const getArticlesByAuthor = createServerFn({ method: "GET" })
  .inputValidator((slug: unknown) => slug as string)
  .handler(async ({ data: slug }) => {
    if (!slug?.trim()) return { articles: [], authorName: "" };
    // Convert slug back to name pattern for DB matching (e.g. "john-doe" → like "%john%doe%")
    const nameParts = slug.trim().split("-").filter(Boolean);
    const term = `%${nameParts.join("%")}%`;
    const rows = await db
      .select(publicArticleSelect)
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(and(eq(articles.status, "published"), like(articles.author, term)))
      .orderBy(desc(articles.publishedAt));
    const mapped = rows.map((r) => ({
      ...r,
      featuredImage: resolveImage(r.featuredImage, r.slug),
      tags: parseTags(r.tags),
      date: formatDate(r.publishedAt, r.createdAt),
    }));
    const authorName = mapped[0]?.author ?? slug.replace(/-/g, " ");
    return { articles: mapped, authorName };
  });

export const getArticlesByTag = createServerFn({ method: "GET" })
  .inputValidator((tag: unknown) => tag as string)
  .handler(async ({ data: tag }) => {
    if (!tag?.trim()) return [];
    const term = `%${tag.trim()}%`;
    const rows = await db
      .select(publicArticleSelect)
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(and(eq(articles.status, "published"), like(articles.tags, term)))
      .orderBy(desc(articles.publishedAt));
    return rows.map((r) => ({
      ...r,
      featuredImage: resolveImage(r.featuredImage, r.slug),
      tags: parseTags(r.tags),
      date: formatDate(r.publishedAt, r.createdAt),
    }));
  });

export const searchArticles = createServerFn({ method: "GET" })
  .inputValidator((q: unknown) => q as string)
  .handler(async ({ data: q }) => {
    if (!q?.trim()) return [];
    const term = `%${q.trim()}%`;
    const rows = await db
      .select(publicArticleSelect)
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(
        and(
          eq(articles.status, "published"),
          or(
            like(articles.title,    term),
            like(articles.subtitle, term),
            like(articles.content,  term),
            like(articles.tags,     term),
            like(articles.author,   term),
          )
        )
      )
      .orderBy(desc(articles.publishedAt))
      .limit(40);
    return rows.map((r) => ({
      ...r,
      featuredImage: resolveImage(r.featuredImage, r.slug),
      tags: parseTags(r.tags),
      date: formatDate(r.publishedAt, r.createdAt),
    }));
  });

export const getArticles = createServerFn({ method: "GET" }).handler(async () => {
  return db
    .select({
      id:          articles.id,
      title:       articles.title,
      slug:        articles.slug,
      author:      articles.author,
      status:      articles.status,
      isBreaking:  articles.isBreaking,
      isFeatured:  articles.isFeatured,
      createdAt:   articles.createdAt,
      publishedAt: articles.publishedAt,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .orderBy(desc(articles.createdAt));
});

export const createArticle = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data as NewArticle)
  .handler(async ({ data }) => {
    if (!data.title?.trim()) throw new Error("Title is required");
    if (!data.slug?.trim())  throw new Error("Slug is required");

    const existing = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, data.slug));

    if (existing.length > 0) throw new Error("An article with this slug already exists");

    await db.insert(articles).values({
      title:                data.title.trim(),
      subtitle:             data.subtitle ?? "",
      slug:                 data.slug.trim(),
      content:              data.content ?? "",
      featuredImage:        data.featuredImage ?? "",
      featuredImageCaption: data.featuredImageCaption ?? "",
      readTimeMinutes:      computeReadTime(data.content),
      categoryId:           data.categoryId ?? null,
      author:               data.author ?? "",
      status:               data.status ?? "draft",
      isBreaking:           data.isBreaking ?? false,
      isFeatured:           data.isFeatured ?? false,
      tags:                 data.tags ?? "",
      seoTitle:             data.seoTitle ?? "",
      seoDescription:       data.seoDescription ?? "",
      publishedAt:          data.status === "published" ? new Date().toISOString() : null,
    });

    return { success: true };
  });

export const getArticleById = createServerFn({ method: "GET" })
  .inputValidator((id: unknown) => id as number)
  .handler(async ({ data: id }) => {
    const [article] = await db
      .select({
        id:             articles.id,
        title:          articles.title,
        subtitle:       articles.subtitle,
        slug:           articles.slug,
        content:        articles.content,
        featuredImage:        articles.featuredImage,
        featuredImageCaption: articles.featuredImageCaption,
        categoryId:           articles.categoryId,
        author:               articles.author,
        status:               articles.status,
        isBreaking:           articles.isBreaking,
        isFeatured:           articles.isFeatured,
        tags:                 articles.tags,
        seoTitle:             articles.seoTitle,
        seoDescription:       articles.seoDescription,
        publishedAt:          articles.publishedAt,
        createdAt:            articles.createdAt,
        categoryName:         categories.name,
        categoryColor:        categories.color,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(eq(articles.id, id));
    return article ?? null;
  });

export const updateArticle = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data as {
    id: number; title: string; subtitle: string; content: string;
    featuredImage: string; featuredImageCaption: string;
    categoryId: number | null; author: string;
    status: string; isBreaking: boolean; isFeatured: boolean;
    tags: string; seoTitle: string; seoDescription: string;
  })
  .handler(async ({ data }) => {
    if (!data.title?.trim()) throw new Error("Title is required");
    await db.update(articles)
      .set({
        title:                data.title.trim(),
        subtitle:             data.subtitle ?? "",
        content:              data.content ?? "",
        featuredImage:        data.featuredImage ?? "",
        featuredImageCaption: data.featuredImageCaption ?? "",
        readTimeMinutes:      computeReadTime(data.content),
        categoryId:           data.categoryId ?? null,
        author:               data.author ?? "",
        status:               data.status,
        isBreaking:           data.isBreaking,
        isFeatured:           data.isFeatured,
        tags:                 data.tags ?? "",
        seoTitle:             data.seoTitle ?? "",
        seoDescription:       data.seoDescription ?? "",
        publishedAt:          data.status === "published" ? new Date().toISOString() : null,
        updatedAt:            new Date().toISOString(),
      })
      .where(eq(articles.id, data.id));
    return { success: true };
  });

export const deleteArticle = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => id as number)
  .handler(async ({ data: id }) => {
    await db.delete(articles).where(eq(articles.id, id));
    return { success: true };
  });
