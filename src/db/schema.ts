import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id:          integer("id").primaryKey({ autoIncrement: true }),
  name:        text("name").notNull(),
  slug:        text("slug").notNull().unique(),
  description: text("description").default(""),
  color:       text("color").notNull().default("#E63946"),
  createdAt:   text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt:   text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const articles = sqliteTable("articles", {
  id:             integer("id").primaryKey({ autoIncrement: true }),
  title:          text("title").notNull(),
  subtitle:       text("subtitle").default(""),
  slug:           text("slug").notNull().unique(),
  content:        text("content").default(""),
  featuredImage:        text("featured_image").default(""),
  featuredImageCaption: text("featured_image_caption").default(""),
  categoryId:     integer("category_id").references(() => categories.id),
  author:         text("author").default(""),
  status:         text("status").notNull().default("draft"),
  isBreaking:     integer("is_breaking", { mode: "boolean" }).notNull().default(false),
  isFeatured:     integer("is_featured", { mode: "boolean" }).notNull().default(false),
  tags:           text("tags").default(""),
  seoTitle:        text("seo_title").default(""),
  seoDescription:  text("seo_description").default(""),
  readTimeMinutes: integer("read_time_minutes").default(1),
  readAlso:        text("read_also").default(""),
  views:           integer("views").notNull().default(0),
  publishedAt:     text("published_at"),
  createdAt:      text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt:      text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const comments = sqliteTable("comments", {
  id:        integer("id").primaryKey({ autoIncrement: true }),
  articleId: integer("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  name:      text("name").notNull(),
  email:     text("email").notNull(),
  content:   text("content").notNull(),
  status:    text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const users = sqliteTable("users", {
  id:           integer("id").primaryKey({ autoIncrement: true }),
  name:         text("name").notNull(),
  email:        text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role:         text("role").notNull().default("reporter"),
  avatar:       text("avatar").default(""),
  bio:          text("bio").default(""),
  isActive:     integer("is_active", { mode: "boolean" }).notNull().default(true),
  lastLoginAt:  text("last_login_at"),
  createdAt:    text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt:    text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const pageViews = sqliteTable("page_views", {
  id:        integer("id").primaryKey({ autoIncrement: true }),
  path:      text("path").notNull(),
  source:    text("source").notNull().default("Direct"),
  country:   text("country").notNull().default(""),
  device:    text("device").notNull().default("Desktop"),
  browser:   text("browser").notNull().default("Other"),
  sessionId: text("session_id").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export type PageView    = typeof pageViews.$inferSelect;

export type Category    = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Article     = typeof articles.$inferSelect;
export type NewArticle  = typeof articles.$inferInsert;
export type User        = typeof users.$inferSelect;
export type NewUser     = typeof users.$inferInsert;
export type Comment     = typeof comments.$inferSelect;
export type NewComment  = typeof comments.$inferInsert;
