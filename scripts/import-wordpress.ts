// WordPress Migration Import Script
// Run with: bun run scripts/import-wordpress.ts

import { db } from "../src/db";
import { categories, articles } from "../src/db/schema";
import { readFileSync, existsSync } from "fs";
import { eq } from "drizzle-orm";

const WP_SQL_FILE = "zipfolder/albaptzb_wp251.sql";

// Category color mapping
const CATEGORY_COLORS: Record<string, string> = {
  politics: "#E63946",
  business: "#457B9D",
  technology: "#1D3557",
  sports: "#2A9D8F",
  entertainment: "#F77F00",
  news: "#06A77D",
  health: "#E76F51",
  world: "#264653",
};

interface Post {
  ID: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  date: string;
  status: string;
  type: string;
}

function cleanWordPressContent(content: string): string {
  // Remove WordPress Gutenberg block comments
  let cleaned = content.replace(/<!-- \/?wp:[^\]]*?(?:\s+{[^}]*?})?\s*-->/g, "");
  
  // Decode HTML entities
  cleaned = cleaned.replace(/&amp;/g, "&")
                   .replace(/&lt;/g, "<")
                   .replace(/&gt;/g, ">")
                   .replace(/&quot;/g, '"')
                   .replace(/&#039;/g, "'");
  
  // Clean excessive whitespace
  cleaned = cleaned.replace(/\n\n+/g, "\n\n").trim();
  
  return cleaned;
}

function extractFeaturedImage(content: string): string {
  const imgMatch = content.match(/<img[^>]+src=["\']([^"\']+)["\']/i);
  if (imgMatch) {
    const imgUrl = imgMatch[1];
    if (imgUrl.includes("/wp-content/uploads/")) {
      const parts = imgUrl.split("/wp-content/uploads/");
      return `/uploads/${parts[1]}`;
    }
    return imgUrl;
  }
  return "";
}

function extractSubtitle(content: string): string {
  const pMatch = content.match(/<p>([^<]+)<\/p>/);
  if (pMatch) {
    let text = pMatch[1].replace(/<[^>]+>/g, "");
    if (text.length > 200) text = text.substring(0, 200) + "...";
    return text;
  }
  return "";
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  console.log("🚀 WordPress Data Import Starting...\n");
  
  if (!existsSync(WP_SQL_FILE)) {
    throw new Error(`SQL file not found: ${WP_SQL_FILE}`);
  }
  
  console.log("📂 Loading categories.json...");
  const categoriesJson = JSON.parse(readFileSync("migration_output/categories.json", "utf-8"));
  
  // Import categories
  console.log("\n📁 Importing Categories...");
  let categoriesImported = 0;
  
  for (const cat of categoriesJson) {
    const existing = await db.select().from(categories).where(eq(categories.slug, cat.slug));
    
    if (existing.length === 0) {
      await db.insert(categories).values({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        color: cat.color,
      });
      categoriesImported++;
      console.log(`   ✅ Imported: ${cat.name}`);
    }
  }
  
  console.log(`\n   📊 Categories: ${categoriesImported} imported\n`);
  
  // Now let's parse posts directly from SQL
  console.log("📝 Parsing WordPress posts from SQL...\n");
  
  const sqlContent = readFileSync(WP_SQL_FILE, "utf-8");
  
  // Find all INSERT INTO wp0n_posts statements
  const insertMatches = sqlContent.matchAll(/INSERT INTO `wp0n_posts`[^;]+;/gs);
  
  const posts: Post[] = [];
  
  for (const match of insertMatches) {
    const insertStatement = match[0];
    
    // Extract VALUES portion
    const valuesMatch = insertStatement.match(/VALUES\s+(.+);$/s);
    if (!valuesMatch) continue;
    
    // Simple regex to find post entries (this handles most WordPress exports)
    // Looking for: (ID, author, date, date_gmt, content, title, excerpt, status, ...)
    const valuePattern = /\((\d+),\s*\d+,\s*'([^']+)',\s*'[^']*',\s*'((?:[^'\\]|\\.)*)  ',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)',\s*'(publish|draft)'/g;
    
    let valueMatch;
    while ((valueMatch = valuePattern.exec(valuesMatch[1])) !== null) {
      const [, id, date, content, title, excerpt, status] = valueMatch;
      
      // Skip if no title
      if (!title || title.trim() === "") continue;
      
      // Check if it's near a 'post' type indicator
      const contextStart = Math.max(0, valueMatch.index - 200);
      const contextEnd = Math.min(valuesMatch[1].length, valueMatch.index + valueMatch[0].length + 200);
      const context = valuesMatch[1].substring(contextStart, contextEnd);
      
      if (!context.includes("'post'") || context.includes("'revision'") || context.includes("'attachment'")) {
        continue;
      }
      
      const cleanedTitle = title.replace(/\\'/g, "'");
      const cleanedContent = content.replace(/\\'/g, "'").replace(/\\n/g, "\n");
      
      posts.push({
        ID: parseInt(id),
        title: cleanedTitle,
        slug: excerpt || generateSlug(cleanedTitle),
        content: cleanedContent,
        excerpt: excerpt.replace(/\\'/g, "'"),
        date: date,
        status: status,
        type: "post",
      });
    }
  }
  
  console.log(`   Found ${posts.length} potential posts\n`);
  
  // Import articles
  console.log("💾 Importing Articles...\n");
  
  const defaultCategory = await db.select().from(categories).where(eq(categories.slug, "news")).limit(1);
  const categoryId = defaultCategory[0]?.id || (await db.select().from(categories).limit(1))[0]?.id;
  
  let articlesImported = 0;
  const existingArticles = await db.select().from(articles);
  const existingSlugs = new Set(existingArticles.map((a) => a.slug));
  
  for (const post of posts) {
    if (post.status !== "publish") continue;
    
    let slug = post.slug || generateSlug(post.title);
    
    // Ensure unique slug
    let counter = 1;
    const originalSlug = slug;
    while (existingSlugs.has(slug)) {
      slug = `${originalSlug}-${counter}`;
      counter++;
    }
    existingSlugs.add(slug);
    
    const cleanContent = cleanWordPressContent(post.content);
    const featuredImage = extractFeaturedImage(cleanContent);
    const subtitle = post.excerpt || extractSubtitle(cleanContent);
    
    try {
      await db.insert(articles).values({
        title: post.title,
        subtitle: subtitle.substring(0, 200),
        slug: slug,
        content: cleanContent,
        featuredImage: featuredImage,
        categoryId: categoryId,
        author: "Editorial Team",
        status: "published",
        isBreaking: false,
        isFeatured: false,
        tags: "",
        seoTitle: post.title,
        seoDescription: subtitle.substring(0, 160),
        publishedAt: new Date(post.date).toISOString(),
        createdAt: new Date(post.date).toISOString(),
      });
      
      articlesImported++;
      console.log(`   ✅ [${articlesImported}] ${post.title.substring(0, 60)}...`);
    } catch (error) {
      console.error(`   ❌ Failed to import: ${post.title}`, error);
    }
  }
  
  console.log(`\n   📊 Articles: ${articlesImported} imported\n`);
  
  console.log("✨ Migration Complete!\n");
  console.log(`
📊 Final Summary:
   • Categories: ${categoriesImported} new categories
   • Articles: ${articlesImported} new articles
   
📝 Next Step:
   Migrate images from WordPress uploads folder:
   
   mkdir -p public/uploads
   cp -r zipfolder/extracted_2025/2025 public/uploads/
   cp -r zipfolder/extracted_2026/2026 public/uploads/
  `);
}

main()
  .then(() => {
    console.log("\n✅ Import completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Import failed:", error);
    process.exit(1);
  });
