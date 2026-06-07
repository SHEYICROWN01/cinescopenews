import { createServerFn } from "@tanstack/react-start";
import { eq, desc, count, sql } from "drizzle-orm";
import { db, withRetry } from "../db";
import { categories, articles, type NewCategory } from "../db/schema";

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  return withRetry(() => db.select().from(categories).orderBy(categories.name));
});

export const getPublicCategories = createServerFn({ method: "GET" }).handler(async () => {
  return withRetry(() =>
    db
      .select({
        id:           categories.id,
        name:         categories.name,
        slug:         categories.slug,
        color:        categories.color,
        articleCount: count(articles.id),
      })
      .from(categories)
      .leftJoin(articles, sql`${articles.categoryId} = ${categories.id} AND ${articles.status} = 'published'`)
      .groupBy(categories.id)
      .orderBy(desc(count(articles.id)))
  );
});

export const createCategory = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data as Pick<NewCategory, "name" | "slug" | "description" | "color">)
  .handler(async ({ data }) => {
    if (!data.name?.trim()) throw new Error("Name is required");
    if (!data.slug?.trim()) throw new Error("Slug is required");

    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, data.slug));

    if (existing.length > 0) throw new Error("A category with this slug already exists");

    await db.insert(categories).values({
      name:        data.name.trim(),
      slug:        data.slug.trim(),
      description: data.description ?? "",
      color:       data.color ?? "#E63946",
    });

    return { success: true };
  });

export const updateCategory = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data as NewCategory & { id: number })
  .handler(async ({ data }) => {
    await db
      .update(categories)
      .set({
        name:        data.name,
        description: data.description,
        color:       data.color,
        updatedAt:   new Date().toISOString(),
      })
      .where(eq(categories.id, data.id!));

    return { success: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => id as number)
  .handler(async ({ data: id }) => {
    await db.delete(categories).where(eq(categories.id, id));
    return { success: true };
  });
