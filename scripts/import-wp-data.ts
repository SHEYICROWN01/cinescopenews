#!/usr/bin/env bun
/**
 * Import WordPress data to Turso database
 * Run: bun scripts/import-wp-data.ts
 */

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { categories, articles } from '../src/db/schema';
import categoriesData from '../migration_output/categories_final.json';
import articlesData from '../migration_output/articles_final.json';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client);

async function main() {
  console.log('=' .repeat(70));
  console.log('WordPress Data Import to Turso');
  console.log('='.repeat(70));
  console.log('');

  // Step 1: Clear existing data
  console.log('🗑️  Step 1: Clearing existing data...');
  console.log('-'.repeat(70));
  
  await db.delete(articles);
  console.log('   ✅ Cleared articles');
  
  await db.delete(categories);
  console.log('   ✅ Cleared categories');
  console.log('');

  // Step 2: Import categories
  console.log('📁 Step 2: Importing categories...');
  console.log('-'.repeat(70));
  
  const categoryMap = new Map<string, number>(); // slug -> id
  
  for (const cat of categoriesData) {
    const [inserted] = await db.insert(categories).values({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      color: cat.color,
    }).returning();
    
    categoryMap.set(cat.slug, inserted.id);
    console.log(`   ✅ [${inserted.id}] ${cat.name} (${cat.slug})`);
  }
  
  console.log(`\n   📊 Total: ${categoriesData.length} categories imported\n`);

  // Step 3: Import articles
  console.log('📝 Step 3: Importing articles...');
  console.log('-'.repeat(70));
  
  let importedCount = 0;
  let skippedCount = 0;
  
  for (const article of articlesData) {
    // Find category ID
    let categoryId: number | null = null;
    if (article.category) {
      // Find category by name
      const catEntry = categoriesData.find(c => c.name === article.category);
      if (catEntry) {
        categoryId = categoryMap.get(catEntry.slug) || null;
      }
    }
    
    // Convert WordPress image URLs to local paths
    let featuredImage = article.featured_image;
    if (featuredImage && featuredImage.includes('/wp-content/uploads/')) {
      // Convert: http://dailynewstap.com/wp-content/uploads/2025/04/image.jpg
      // To: /uploads/2025/04/image.jpg
      featuredImage = featuredImage.replace(/.*\/wp-content\/uploads\//, '/uploads/');
    }
    
    // Convert image URLs in content and scrub internal dailynewstap.com links
    let content = article.content;
    if (content) {
      content = content.replace(/https?:\/\/[^\/]+\/wp-content\/uploads\//g, '/uploads/');
      content = content.replace(/https?:\/\/(?:www\.)?dailynewstap\.com/g, 'https://www.cinescopeglobal.com');
    }
    
    try {
      await db.insert(articles).values({
        title: article.title,
        subtitle: article.subtitle || null,
        slug: article.slug,
        content: content || '',
        featuredImage: featuredImage || null,
        categoryId: categoryId,
        author: 'WordPress Admin',
        status: 'published' as const,
        isBreaking: false,
        isFeatured: false,
        tags: null,
        seoTitle: article.title,
        seoDescription: article.subtitle || null,
        publishedAt: article.published_at ?? new Date().toISOString(),
      });
      
      importedCount++;
      
      if (importedCount <= 20 || importedCount % 20 === 0) {
        const catLabel = article.category ? `[${article.category}]` : '[No Cat]';
        console.log(`   ✅ [${importedCount}] ${catLabel} ${article.title.substring(0, 50)}...`);
      }
    } catch (error) {
      console.error(`   ❌ Failed to import: ${article.title}`);
      console.error(`      Error: ${error}`);
      skippedCount++;
    }
  }
  
  console.log(`\n   📊 Total: ${importedCount} articles imported, ${skippedCount} skipped\n`);

  console.log('='.repeat(70));
  console.log('✅ IMPORT COMPLETE!');
  console.log('='.repeat(70));
  console.log(`📁 ${categoriesData.length} categories`);
  console.log(`📝 ${importedCount} articles`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Migrate images from zipfolder/extracted_*/');
  console.log('2. Check your site at http://localhost:3000');
  console.log('='.repeat(70));

  client.close();
}

main().catch((error) => {
  console.error('Import failed:', error);
  process.exit(1);
});
