#!/usr/bin/env bun
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { categories, articles } from '../src/db/schema';
import { sql } from 'drizzle-orm';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client);

// Get counts
const catCount = await db.select({ count: sql`count(*)` }).from(categories);
const artCount = await db.select({ count: sql`count(*)` }).from(articles);

console.log(`\n📊 Database Status:\n`);
console.log(`Categories: ${catCount[0].count}`);
console.log(`Articles: ${artCount[0].count}`);

// Get sample articles
const samples = await db.select({
  title: articles.title,
  category: categories.name,
  publishedAt: articles.publishedAt
}).from(articles)
  .leftJoin(categories, sql`${articles.categoryId} = ${categories.id}`)
  .limit(10);

console.log(`\n📝 Sample Articles:\n`);
samples.forEach((s: any, i: number) => {
  const date = s.publishedAt ? new Date(s.publishedAt).toLocaleDateString() : 'No date';
  console.log(`${i + 1}. [${s.category || 'No Cat'}] ${s.title.substring(0, 60)}... (${date})`);
});

// Category breakdown
const breakdown = await db.select({
  category: categories.name,
  count: sql`count(${articles.id})`
}).from(categories)
  .leftJoin(articles, sql`${categories.id} = ${articles.categoryId}`)
  .groupBy(categories.name);

console.log(`\n📁 Articles by Category:\n`);
breakdown.forEach((b: any) => {
  console.log(`   ${b.category}: ${b.count} articles`);
});

client.close();
