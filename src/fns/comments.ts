import { createServerFn } from "@tanstack/react-start";
import { eq, desc, asc, and, count } from "drizzle-orm";
import { db } from "../db";
import { comments, articles } from "../db/schema";
import { getSessionFn } from "./auth";

/* ── Public: fetch approved comments for one article ───────────────────── */
export const getApprovedCommentsFn = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => d as number)
  .handler(async ({ data: articleId }) => {
    return db
      .select({
        id:        comments.id,
        name:      comments.name,
        content:   comments.content,
        createdAt: comments.createdAt,
      })
      .from(comments)
      .where(and(eq(comments.articleId, articleId), eq(comments.status, "approved")))
      .orderBy(asc(comments.createdAt));
  });

/* ── Public: submit a new comment ──────────────────────────────────────── */
export const submitCommentFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: unknown) =>
      d as { articleId: number; name: string; email: string; content: string }
  )
  .handler(async ({ data }) => {
    const name    = data.name.trim();
    const email   = data.email.trim().toLowerCase();
    const content = data.content.trim();

    if (!name || !email || !content)
      return { ok: false, error: "All fields are required." } as const;
    if (content.length < 10)
      return { ok: false, error: "Comment must be at least 10 characters." } as const;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return { ok: false, error: "Please enter a valid email address." } as const;

    await db.insert(comments).values({
      articleId: data.articleId,
      name,
      email,
      content,
      status: "pending",
    });

    return { ok: true } as const;
  });

/* ── Admin: get all comments with article info ──────────────────────────── */
export const getAllCommentsFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSessionFn();
  if (!session) throw new Error("Unauthorized");

  return db
    .select({
      id:           comments.id,
      articleId:    comments.articleId,
      articleTitle: articles.title,
      articleSlug:  articles.slug,
      name:         comments.name,
      email:        comments.email,
      content:      comments.content,
      status:       comments.status,
      createdAt:    comments.createdAt,
    })
    .from(comments)
    .leftJoin(articles, eq(comments.articleId, articles.id))
    .orderBy(desc(comments.createdAt));
});

/* ── Admin: pending count for the nav badge ─────────────────────────────── */
export const getPendingCountFn = createServerFn({ method: "GET" }).handler(async () => {
  const [row] = await db
    .select({ n: count() })
    .from(comments)
    .where(eq(comments.status, "pending"));
  return row?.n ?? 0;
});

/* ── Admin: set comment status ──────────────────────────────────────────── */
export const moderateCommentFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as { id: number; status: string })
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthorized");

    await db
      .update(comments)
      .set({ status: data.status, updatedAt: new Date().toISOString() })
      .where(eq(comments.id, data.id));
    return { ok: true };
  });

/* ── Admin: bulk moderate ───────────────────────────────────────────────── */
export const bulkModerateCommentsFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as { ids: number[]; status: string })
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthorized");

    for (const id of data.ids) {
      await db
        .update(comments)
        .set({ status: data.status, updatedAt: new Date().toISOString() })
        .where(eq(comments.id, id));
    }
    return { ok: true };
  });

/* ── Admin: delete comment ──────────────────────────────────────────────── */
export const deleteCommentFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as { id: number })
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthorized");

    await db.delete(comments).where(eq(comments.id, data.id));
    return { ok: true };
  });
