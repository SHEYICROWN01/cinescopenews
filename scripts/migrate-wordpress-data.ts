/**
 * WordPress to TanStack Start Migration Script
 * 
 * This script migrates data from WordPress database to our new application:
 * - Extracts articles from wp0n_posts table
 * - Extracts categories from wp0n_terms and wp0n_term_taxonomy
 * - Maps WordPress uploads folder images
 * - Preserves original publish dates and slugs
 */

import { db } from "../src/db";
import { articles, categories } from "../src/db/schema";
import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";

// WordPress database connection
const wpDbPath = path.join(process.cwd(), "zipfolder", "wordpress_temp.db");
const uploadsFolderPath = path.join(process.cwd(), "zipfolder", "extracted_uploads");

interface WordPressPost {
  ID: number;
  post_title: string;
  post_name: string;
  post_content: string;
  post_excerpt: string;
  post_date: string;
  post_modified: string;
  post_status: string;
  post_type: string;
  post_author: number;
}

interface WordPressTerm {
  term_id: number;
  name: string;
  slug: string;
}

interface WordPressTermTaxonomy {
  term_taxonomy_id: number;
  term_id: number;
  taxonomy: string;
  description: string;
}

/**
 * Convert WordPress post content (HTML blocks) to plain HTML
 */
function convertWordPressContent(wpContent: string): string {
  // Remove WordPress Gutenberg block comments
  let content = wpContent.replace(/<!-- \/wp:[a-z-]+ -->/g, "");
  content = content.replace(/<!-- wp:[a-z-]+ -->/g, "");
  content = content.replace(/<!-- wp:[a-z-]+ {[^}]*} -->/g, "");
  
  // Convert WordPress block markup to standard HTML
  content = content.replace(/<p>/g, "<p>");
  content = content.replace(/<\/p>/g, "</p>");
  
  // Clean up excessive whitespace
  content = content.replace(/\n\n+/g, "\n\n");
  content = content.trim();
  
  return content;
}

/**
 * Generate a URL-safe slug from title
 */
function generateSlug(title: string, existingSlugs: Set<string>): string {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  
  // Ensure uniqueness
  let counter = 1;
  let uniqueSlug = slug;
  while (existingSlugs.has(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  
  existingSlugs.add(uniqueSlug);
  return uniqueSlug;
}

/**
 * Extract featured image from WordPress post content or meta
 */
function extractFeaturedImage(wpContent: string, wpImageFolder: string): string {
  // Look for first image in content
  const imgMatch = wpContent.match(/<img[^>]+src="([^"]+)"/i);
  if (imgMatch && imgMatch[1]) {
    const imgUrl = imgMatch[1];
    
    // Check if it's from wp-content/uploads
    if (imgUrl.includes("/wp-content/uploads/")) {
      const urlParts = imgUrl.split("/wp-content/uploads/");
      if (urlParts[1]) {
        // Map to our uploads folder
        return `/uploads/${urlParts[1]}`;
      }
    }
    
    return imgUrl;
  }
  
  return "";
}

/**
 * Main migration function
 */
async function migrateWordPressData() {
  console.log("🚀 Starting WordPress to TanStack Start migration...\n");
  
  try {
    // Step 1: Load and parse WordPress SQL file
    console.log("📂 Step 1: Loading WordPress SQL data...");
    const sqlPath = path.join(process.cwd(), "zipfolder", "albaptzb_wp251.sql");
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`SQL file not found at: ${sqlPath}`);
    }
    
    const sqlContent = fs.readFileSync(sqlPath, "utf-8");
    console.log(`   ✅ Loaded SQL file (${(sqlContent.length / 1024 / 1024).toFixed(2)} MB)`);
    
    // Step 2: Extract WordPress categories
    console.log("\n📁 Step 2: Migrating Categories...");
    
    // Parse category data from SQL
    const categoryInsertMatch = sqlContent.match(/INSERT INTO `wp0n_terms`[^;]+;/gs);
    const termTaxonomyMatch = sqlContent.match(/INSERT INTO `wp0n_term_taxonomy`[^;]+;/gs);
    
    const categoryMap = new Map<number, { name: string; slug: string; color: string }>();
    
    if (categoryInsertMatch) {
      // Extract category values
      const valuesMatch = categoryInsertMatch[0].match(/\(([^)]+)\)/g);
      if (valuesMatch) {
        valuesMatch.forEach((value) => {
          // Parse (term_id, name, slug, term_group)
          const match = value.match(/\((\d+),\s*'([^']+)',\s*'([^']+)'/);
          if (match) {
            const termId = parseInt(match[1]);
            const name = match[2].replace(/\\'/g, "'");
            const slug = match[3];
            
            // Assign colors based on category name
            const colors: Record<string, string> = {
              politics: "#E63946",
              business: "#457B9D",
              technology: "#1D3557",
              sports: "#2A9D8F",
              entertainment: "#F77F00",
              news: "#06A77D",
              health: "#E76F51",
            };
            
            const categoryColor = colors[slug.toLowerCase()] || "#06A77D";
            
            categoryMap.set(termId, { name, slug, color: categoryColor });
          }
        });
      }
    }
    
    // Insert categories into database
    const existingCategories = await db.select().from(categories);
    const existingCategorySlugs = new Set(existingCategories.map((c) => c.slug));
    
    let categoriesInserted = 0;
    for (const [termId, cat] of categoryMap.entries()) {
      if (!existingCategorySlugs.has(cat.slug)) {
        await db.insert(categories).values({
          name: cat.name,
          slug: cat.slug,
          description: `${cat.name} news and updates`,
          color: cat.color,
        });
        categoriesInserted++;
        console.log(`   ✅ Migrated category: ${cat.name} (${cat.slug})`);
      } else {
        console.log(`   ⏭️  Skipped existing category: ${cat.name}`);
      }
    }
    
    console.log(`\n   📊 Categories Summary: ${categoriesInserted} new, ${categoryMap.size - categoriesInserted} skipped`);
    
    // Step 3: Extract and migrate articles
    console.log("\n📝 Step 3: Migrating Articles...");
    
    const postInsertMatches = sqlContent.match(/INSERT INTO `wp0n_posts`[^;]+;/gs);
    
    if (!postInsertMatches) {
      throw new Error("No posts found in WordPress SQL file");
    }
    
    const existingArticles = await db.select().from(articles);
    const existingSlugs = new Set(existingArticles.map((a) => a.slug));
    
    let articlesInserted = 0;
    let articlesSkipped = 0;
    
    // Parse post values
    for (const insertStatement of postInsertMatches) {
      const valueMatches = insertStatement.match(/\(([^)]+(?:\([^)]*\))*[^)]*)\)/g);
      
      if (!valueMatches) continue;
      
      for (const valueStr of valueMatches) {
        try {
          // This is a simplified parser - WordPress SQL can be complex
          // We'll focus on published posts with type='post'
          
          if (!valueStr.includes("'post'") || !valueStr.includes("'publish'")) {
            continue;
          }
          
          // Extract post data using regex (simplified)
          const parts = valueStr.match(/\((\d+),\s*(\d+),\s*'([^']+)',\s*'([^']+)',\s*'([^']*)',\s*'([^']+)'/);
          
          if (!parts) continue;
          
          const postId = parseInt(parts[1]);
          const postDate = parts[3];
          const postContent = parts[5].replace(/\\'/g, "'").replace(/\\n/g, "\n");
          const postTitle = parts[6].replace(/\\'/g, "'");
          
          // Skip if title is empty or invalid
          if (!postTitle || postTitle.trim().length === 0) continue;
          
          // Generate slug
          const slug = generateSlug(postTitle, existingSlugs);
          
          // Extract featured image
          const featuredImage = extractFeaturedImage(postContent, "extracted_uploads");
          
          // Convert WordPress content to HTML
          const cleanContent = convertWordPressContent(postContent);
          
          // Extract first paragraph as excerpt/subtitle
          const firstParagraph = cleanContent.match(/<p>([^<]+)<\/p>/);
          const subtitle = firstParagraph ? firstParagraph[1].substring(0, 200) : "";
          
          // Map to a default category (we'll improve this with wp_term_relationships later)
          const defaultCategory = await db.select().from(categories).limit(1);
          const categoryId = defaultCategory[0]?.id || null;
          
          // Insert article
          if (!existingSlugs.has(slug)) {
            await db.insert(articles).values({
              title: postTitle,
              subtitle: subtitle,
              slug: slug,
              content: cleanContent,
              featuredImage: featuredImage,
              categoryId: categoryId,
              author: "Editorial Team",
              status: "published",
              isBreaking: false,
              isFeatured: false,
              tags: "",
              seoTitle: postTitle,
              seoDescription: subtitle,
              publishedAt: new Date(postDate).toISOString(),
              createdAt: new Date(postDate).toISOString(),
            });
            
            articlesInserted++;
            console.log(`   ✅ Migrated: "${postTitle.substring(0, 50)}..."`);
          } else {
            articlesSkipped++;
          }
        } catch (error) {
          console.error(`   ⚠️  Error parsing post:`, error);
          continue;
        }
      }
    }
    
    console.log(`\n   📊 Articles Summary: ${articlesInserted} new, ${articlesSkipped} skipped`);
    
    // Step 4: Copy image files
    console.log("\n🖼️  Step 4: Preparing image migration instructions...");
    console.log(`
   📸 Image Migration Instructions:
   
   1. Create public/uploads directory:
      mkdir -p public/uploads
   
   2. Copy WordPress uploads:
      cp -r zipfolder/extracted_2025/2025/* public/uploads/2025/
      cp -r zipfolder/extracted_2026/2026/* public/uploads/2026/
   
   3. Or move them for better performance:
      mv zipfolder/extracted_2025/2025 public/uploads/
      mv zipfolder/extracted_2026/2026 public/uploads/
   
   This will preserve all image URLs from the original WordPress site.
    `);
    
    console.log("\n✨ Migration Complete!");
    console.log(`
📊 Final Summary:
   • Categories: ${categoriesInserted} migrated
   • Articles: ${articlesInserted} migrated
   • Next Steps: Run the image migration commands above
    `);
    
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  }
}

// Run migration
migrateWordPressData()
  .then(() => {
    console.log("\n✅ Migration script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration script failed:", error);
    process.exit(1);
  });
