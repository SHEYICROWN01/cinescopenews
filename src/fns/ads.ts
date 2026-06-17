import { createServerFn } from "@tanstack/react-start";
import { eq, and, sql } from "drizzle-orm";
import { db, withRetry } from "../db";
import { advertisements } from "../db/schema";
import { getSessionFn } from "./auth";

export const AD_POSITIONS = [
  { key: "leaderboard-top",      label: "Leaderboard — Top of page",       size: "970 × 90" },
  { key: "article-in-content",   label: "In-Article — Mid content",        size: "Responsive" },
  { key: "article-after-body",   label: "Leaderboard — After article",     size: "970 × 90" },
  { key: "sidebar-mpu",          label: "Sidebar MPU — Article sidebar",   size: "300 × 250" },
  { key: "homepage-mpu-1",       label: "Homepage Sidebar — Top",          size: "300 × 250" },
  { key: "homepage-mpu-2",       label: "Homepage Sidebar — Bottom",       size: "300 × 250" },
  { key: "footer-leaderboard",   label: "Footer Leaderboard",              size: "970 × 90" },
] as const;

export type AdPosition = typeof AD_POSITIONS[number]["key"];

/* ── Public: get all active ads for frontend rendering ─────────────────────── */
export const getActiveAdsFn = createServerFn({ method: "GET" }).handler(async () => {
  const now = new Date().toISOString().slice(0, 10);
  return withRetry(() =>
    db.select({
      id:         advertisements.id,
      title:      advertisements.title,
      advertiser: advertisements.advertiser,
      imageUrl:   advertisements.imageUrl,
      linkUrl:    advertisements.linkUrl,
      position:   advertisements.position,
    })
    .from(advertisements)
    .where(
      and(
        eq(advertisements.status, "active"),
        sql`(${advertisements.startDate} IS NULL OR ${advertisements.startDate} <= ${now})`,
        sql`(${advertisements.endDate}   IS NULL OR ${advertisements.endDate}   >= ${now})`
      )
    )
  );
});

/* ── Admin: get all ads ─────────────────────────────────────────────────────── */
export const getAllAdsFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSessionFn();
  if (!session) throw new Error("Unauthorized");
  return withRetry(() =>
    db.select().from(advertisements).orderBy(sql`${advertisements.createdAt} DESC`)
  );
});

/* ── Admin: create ad ───────────────────────────────────────────────────────── */
export const createAdFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as {
    title: string; advertiser: string; imageUrl: string; linkUrl: string;
    position: string; status: string; startDate?: string; endDate?: string; notes?: string;
  })
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthorized");
    await withRetry(() =>
      db.insert(advertisements).values({
        title:      data.title.trim(),
        advertiser: data.advertiser.trim(),
        imageUrl:   data.imageUrl.trim(),
        linkUrl:    data.linkUrl.trim(),
        position:   data.position,
        status:     data.status,
        startDate:  data.startDate || null,
        endDate:    data.endDate   || null,
        notes:      data.notes?.trim() ?? "",
      })
    );
    return { ok: true };
  });

/* ── Admin: update ad ───────────────────────────────────────────────────────── */
export const updateAdFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as {
    id: number; title: string; advertiser: string; imageUrl: string; linkUrl: string;
    position: string; status: string; startDate?: string; endDate?: string; notes?: string;
  })
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthorized");
    await withRetry(() =>
      db.update(advertisements)
        .set({
          title:      data.title.trim(),
          advertiser: data.advertiser.trim(),
          imageUrl:   data.imageUrl.trim(),
          linkUrl:    data.linkUrl.trim(),
          position:   data.position,
          status:     data.status,
          startDate:  data.startDate || null,
          endDate:    data.endDate   || null,
          notes:      data.notes?.trim() ?? "",
          updatedAt:  new Date().toISOString(),
        })
        .where(eq(advertisements.id, data.id))
    );
    return { ok: true };
  });

/* ── Admin: toggle status ───────────────────────────────────────────────────── */
export const toggleAdStatusFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as { id: number; status: string })
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthorized");
    await withRetry(() =>
      db.update(advertisements)
        .set({ status: data.status, updatedAt: new Date().toISOString() })
        .where(eq(advertisements.id, data.id))
    );
    return { ok: true };
  });

/* ── Admin: delete ad ───────────────────────────────────────────────────────── */
export const deleteAdFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as { id: number })
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthorized");
    await withRetry(() =>
      db.delete(advertisements).where(eq(advertisements.id, data.id))
    );
    return { ok: true };
  });

/* ── Public: track ad click ─────────────────────────────────────────────────── */
export const trackAdClickFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as { id: number })
  .handler(async ({ data }) => {
    await withRetry(() =>
      db.update(advertisements)
        .set({ clicks: sql`${advertisements.clicks} + 1` })
        .where(eq(advertisements.id, data.id))
    ).catch(() => {});
    return { ok: true };
  });

/* ── Public: track ad impression ────────────────────────────────────────────── */
export const trackAdImpressionFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as { id: number })
  .handler(async ({ data }) => {
    await withRetry(() =>
      db.update(advertisements)
        .set({ impressions: sql`${advertisements.impressions} + 1` })
        .where(eq(advertisements.id, data.id))
    ).catch(() => {});
    return { ok: true };
  });
