import { createServerFn } from "@tanstack/react-start";
import { eq, asc, sql } from "drizzle-orm";
import { db, withRetry } from "../db";
import { authors, articles } from "../db/schema";
import { getSessionFn } from "./auth";

/* ── Public: get active authors for article dropdowns ──────────────────────── */
export const getAuthorsFn = createServerFn({ method: "GET" }).handler(async () => {
  return withRetry(() =>
    db.select({
      id:     authors.id,
      name:   authors.name,
      title:  authors.title,
      avatar: authors.avatar,
    })
    .from(authors)
    .where(eq(authors.isActive, true))
    .orderBy(asc(authors.name))
  );
});

/* ── Admin: get all authors with article count ──────────────────────────────── */
export const getAllAuthorsFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSessionFn();
  if (!session) throw new Error("Unauthorized");
  return withRetry(() =>
    db.select({
      id:        authors.id,
      name:      authors.name,
      email:     authors.email,
      bio:       authors.bio,
      avatar:    authors.avatar,
      title:     authors.title,
      twitter:   authors.twitter,
      instagram: authors.instagram,
      isActive:  authors.isActive,
      createdAt: authors.createdAt,
      articleCount: sql<number>`(SELECT COUNT(*) FROM articles WHERE articles.author = ${authors.name} AND articles.status = 'published')`,
    })
    .from(authors)
    .orderBy(asc(authors.name))
  );
});

/* ── Admin: create author ───────────────────────────────────────────────────── */
export const createAuthorFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as {
    name: string; email?: string; bio?: string; avatar?: string;
    title?: string; twitter?: string; instagram?: string;
  })
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthorized");
    if (!data.name.trim()) throw new Error("Name is required");
    await withRetry(() =>
      db.insert(authors).values({
        name:      data.name.trim(),
        email:     data.email?.trim() ?? "",
        bio:       data.bio?.trim() ?? "",
        avatar:    data.avatar?.trim() ?? "",
        title:     data.title?.trim() ?? "",
        twitter:   data.twitter?.trim() ?? "",
        instagram: data.instagram?.trim() ?? "",
      })
    );
    return { ok: true };
  });

/* ── Admin: update author ───────────────────────────────────────────────────── */
export const updateAuthorFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as {
    id: number; name: string; email?: string; bio?: string; avatar?: string;
    title?: string; twitter?: string; instagram?: string; isActive?: boolean;
  })
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthorized");
    await withRetry(() =>
      db.update(authors)
        .set({
          name:      data.name.trim(),
          email:     data.email?.trim() ?? "",
          bio:       data.bio?.trim() ?? "",
          avatar:    data.avatar?.trim() ?? "",
          title:     data.title?.trim() ?? "",
          twitter:   data.twitter?.trim() ?? "",
          instagram: data.instagram?.trim() ?? "",
          isActive:  data.isActive ?? true,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(authors.id, data.id))
    );
    return { ok: true };
  });

/* ── Admin: delete author ───────────────────────────────────────────────────── */
export const deleteAuthorFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as { id: number })
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthorized");
    await withRetry(() =>
      db.delete(authors).where(eq(authors.id, data.id))
    );
    return { ok: true };
  });
