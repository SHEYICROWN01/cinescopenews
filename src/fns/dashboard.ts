import { createServerFn } from "@tanstack/react-start";
import { eq, desc, count } from "drizzle-orm";
import { db } from "../db";
import { articles, categories, comments } from "../db/schema";

export const getDashboardData = createServerFn({ method: "GET" }).handler(async () => {
  const [
    totalArticlesResult,
    publishedResult,
    draftResult,
    totalCategoriesResult,
    pendingCommentsResult,
    totalCommentsResult,
    recentArticles,
  ] = await Promise.all([
    db.select({ count: count() }).from(articles),
    db.select({ count: count() }).from(articles).where(eq(articles.status, "published")),
    db.select({ count: count() }).from(articles).where(eq(articles.status, "draft")),
    db.select({ count: count() }).from(categories),
    db.select({ count: count() }).from(comments).where(eq(comments.status, "pending")),
    db.select({ count: count() }).from(comments),
    db
      .select({
        id:            articles.id,
        title:         articles.title,
        author:        articles.author,
        status:        articles.status,
        createdAt:     articles.createdAt,
        publishedAt:   articles.publishedAt,
        isBreaking:    articles.isBreaking,
        categoryName:  categories.name,
        categoryColor: categories.color,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .orderBy(desc(articles.createdAt))
      .limit(6),
  ]);

  return {
    totalArticles:     totalArticlesResult[0]?.count ?? 0,
    publishedArticles: publishedResult[0]?.count ?? 0,
    draftArticles:     draftResult[0]?.count ?? 0,
    totalCategories:   totalCategoriesResult[0]?.count ?? 0,
    pendingComments:   pendingCommentsResult[0]?.count ?? 0,
    totalComments:     totalCommentsResult[0]?.count ?? 0,
    recentArticles,
  };
});
