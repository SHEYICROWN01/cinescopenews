#!/usr/bin/env python3
"""
CORRECT WordPress Migration Script
Extracts ONLY real categories and published posts
"""

import re
import json
import os
from datetime import datetime
import html

# Correct WordPress SQL file
WP_SQL_FILE = "zipfolder/albaptzb_wp572.sql"

# Real category colors
CATEGORY_COLORS = {
    "business": "#457B9D",
    "politics": "#E63946",
    "health": "#E76F51",
    "sports": "#2A9D8F",
    "news": "#06A77D",
    "entertainment": "#F77F00",
    "metro": "#264653",
    "headlines": "#1D3557",
}

def clean_sql_value(value):
    """Clean SQL value"""
    if not value or value in ('NULL', 'null', ''):
        return None
    
    # Remove quotes
    if (value.startswith("'") and value.endswith("'")) or \
       (value.startswith('"') and value.endswith('"')):
        value = value[1:-1]
    
    # Unescape
    value = value.replace("\\'", "'")
    value = value.replace('\\"', '"')
    value = value.replace('\\n', '\n')
    value = value.replace('\\r', '\r')
    value = value.replace('\\\\', '\\')
    
    return value

def clean_html_content(content):
    """Remove WordPress Gutenberg blocks"""
    content = re.sub(r'<!-- /?wp:[^\]]*?(?:\s+{[^}]*?})?\s*-->', '', content)
    content = html.unescape(content)
    content = re.sub(r'\n\n+', '\n\n', content).strip()
    return content

def extract_featured_image(content):
    """Extract first image from content"""
    img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', content, re.IGNORECASE)
    if img_match:
        img_url = img_match.group(1)
        if '/wp-content/uploads/' in img_url:
            parts = img_url.split('/wp-content/uploads/')
            if len(parts) > 1:
                return f'/uploads/{parts[1]}'
        return img_url
    return ""

def extract_excerpt(content, max_length=200):
    """Extract first paragraph"""
    p_match = re.search(r'<p>([^<]+)</p>', content)
    if p_match:
        text = re.sub(r'<[^>]+>', '', p_match.group(1))
        if len(text) > max_length:
            return text[:max_length] + "..."
        return text
    return ""

def main():
    print("🚀 WordPress Migration - CORRECT VERSION\n")
    print("=" * 60)
    
    if not os.path.exists(WP_SQL_FILE):
        print(f"❌ SQL file not found: {WP_SQL_FILE}")
        return 1
    
    print(f"📂 Reading WordPress SQL file...")
    with open(WP_SQL_FILE, 'r', encoding='utf-8', errors='ignore') as f:
        sql_content = f.read()
    
    file_size_mb = len(sql_content) / (1024 * 1024)
    print(f"   ✅ Loaded ({file_size_mb:.2f} MB)\n")
    
    # Step 1: Extract REAL categories only
    print("📁 Step 1: Extracting REAL Categories (taxonomy='category')...")
    print("-" * 60)
    
    # Get terms
    terms = {}
    terms_match = re.search(r'INSERT INTO `wpuh_terms`.*?VALUES\s+(.+?);', sql_content, re.DOTALL | re.IGNORECASE)
    if terms_match:
        rows = re.findall(r'\((\d+),\s*["\']([^"\']+)["\'],\s*["\']([^"\']+)["\']', terms_match.group(1))
        for term_id, name, slug in rows:
            terms[term_id] = {'name': name, 'slug': slug}
    
    # Get taxonomy (filter by 'category' only)
    categories = []
    taxonomy_match = re.search(r'INSERT INTO `wpuh_term_taxonomy`.*?VALUES\s+(.+?);', sql_content, re.DOTALL | re.IGNORECASE)
    if taxonomy_match:
        rows = re.findall(r'\((\d+),\s*(\d+),\s*["\']([^"\']+)["\']', taxonomy_match.group(1))
        for term_taxonomy_id, term_id, taxonomy in rows:
            if taxonomy == 'category' and term_id in terms:
                term_info = terms[term_id]
                slug = term_info['slug'].lower()
                color = CATEGORY_COLORS.get(slug, "#06A77D")
                
                categories.append({
                    'term_id': term_id,
                    'name': term_info['name'],
                    'slug': slug,
                    'color': color,
                    'description': f'{term_info["name"]} news and updates'
                })
                print(f"   ✅ Found category: {term_info['name']} ({slug})")
    
    print(f"\n   📊 Total REAL categories: {len(categories)}\n")
    
    # Step 2: Extract published posts
    print("📝 Step 2: Extracting Published Posts...")
    print("-" * 60)
    
    articles = []
    seen_titles = set()
    
    # Find wpuh_posts INSERT statements
    posts_pattern = r'INSERT INTO `wpuh_posts`[^;]+;'
    posts_matches = list(re.finditer(posts_pattern, sql_content, re.DOTALL))
    
    print(f"   Found {len(posts_matches)} INSERT statements\n")
    
    for match_idx, match in enumerate(posts_matches):
        insert_stmt = match.group(0)
        
        # Extract individual post rows
        # Pattern: (ID, author, date, date_gmt, content, title, excerpt, status, ...)
        row_pattern = r"\((\d+),\s*\d+,\s*'([^']+)',\s*'[^']*',\s*'((?:[^'\\]|\\.)*)  ',\s*'((?:[^'\\]|\\.)*)',\s*'[^']*',\s*'(publish|draft)'"
        
        for row in re.finditer(row_pattern, insert_stmt):
            post_id, post_date, content, title, status = row.groups()
            
            # Only published posts
            if status != 'publish':
                continue
            
            # Clean title
            title = clean_sql_value(title)
            if not title or len(title.strip()) < 3:
                continue
            
            # Skip duplicates (same title)
            if title in seen_titles:
                continue
            seen_titles.add(title)
            
            # Clean content
            content = clean_sql_value(content) or ""
            clean_content = clean_html_content(content)
            
            # Extract image and excerpt
            featured_image = extract_featured_image(clean_content)
            subtitle = extract_excerpt(clean_content)
            
            # Generate slug
            slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
            
            articles.append({
                'id': post_id,
                'title': title,
                'subtitle': subtitle,
                'slug': slug,
                'content': clean_content,
                'featured_image': featured_image,
                'published_at': post_date,
                'created_at': post_date,
            })
            
            print(f"   ✅ [{len(articles)}] {title[:60]}...")
    
    print(f"\n   📊 Total articles extracted: {len(articles)}\n")
    
    # Step 3: Save to JSON
    print("💾 Step 3: Saving data...")
    print("-" * 60)
    
    os.makedirs('migration_output', exist_ok=True)
    
    with open('migration_output/categories_clean.json', 'w', encoding='utf-8') as f:
        json.dump(categories, f, indent=2, ensure_ascii=False)
    print("   ✅ Saved categories: migration_output/categories_clean.json")
    
    with open('migration_output/articles_clean.json', 'w', encoding='utf-8') as f:
        json.dump(articles, f, indent=2, ensure_ascii=False)
    print("   ✅ Saved articles: migration_output/articles_clean.json")
    
    # Generate import SQL
    print("\n📤 Step 4: Generating SQL import...")
    print("-" * 60)
    
    sql_lines = []
    sql_lines.append("-- Clean WordPress Migration SQL")
    sql_lines.append(f"-- Generated: {datetime.now().isoformat()}")
    sql_lines.append("")
    sql_lines.append("-- Clear old wrong data")
    sql_lines.append("DELETE FROM articles;")
    sql_lines.append("DELETE FROM categories;")
    sql_lines.append("")
    
    # Categories
    sql_lines.append("-- Insert REAL categories")
    for cat in categories:
        name = cat['name'].replace("'", "''")
        sql_lines.append(
            f"INSERT INTO categories (name, slug, description, color) "
            f"VALUES ('{name}', '{cat['slug']}', '{cat['description']}', '{cat['color']}');"
        )
    
    sql_lines.append("")
    sql_lines.append("-- Insert articles")
    for article in articles:
        title = article['title'].replace("'", "''")
        subtitle = article['subtitle'].replace("'", "''")
        content = article['content'].replace("'", "''")
        
        sql_lines.append(
            f"INSERT INTO articles (title, subtitle, slug, content, featured_image, "
            f"author, status, published_at, created_at, category_id) "
            f"VALUES ("
            f"'{title}', "
            f"'{subtitle}', "
            f"'{article['slug']}', "
            f"'{content}', "
            f"'{article['featured_image']}', "
            f"'Editorial Team', "
            f"'published', "
            f"'{article['published_at']}', "
            f"'{article['created_at']}', "
            f"(SELECT id FROM categories WHERE slug='news' LIMIT 1)"
            f");"
        )
    
    with open('migration_output/import_clean.sql', 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    print("   ✅ Saved SQL: migration_output/import_clean.sql")
    
    # Summary
    print("\n" + "=" * 60)
    print("✨ Migration Extraction Complete!")
    print("=" * 60)
    print(f"""
📊 Summary:
   • REAL Categories: {len(categories)}
   • Published Articles: {len(articles)}
   • Files: migration_output/
   
📝 Categories Found:
   {', '.join([c['name'] for c in categories])}
   
🚀 Next: Run the TypeScript import script
    """)
    
    return 0

if __name__ == '__main__':
    exit(main())
