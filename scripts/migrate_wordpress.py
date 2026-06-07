#!/usr/bin/env python3
"""
WordPress to DailyNewsTap Migration Script

This script migrates data from WordPress SQL dump to the new Turso database:
- Extracts articles from wp0n_posts
- Extracts categories from wp0n_terms and wp0n_term_taxonomy  
- Preserves original publish dates, slugs, and content
- Maps WordPress uploads folder images to new structure
"""

import re
import json
import sqlite3
import os
from datetime import datetime
from pathlib import Path
import html

# WordPress SQL file
WP_SQL_FILE = "zipfolder/albaptzb_wp251.sql"

# Turso database connection (you'll need to update this with your connection string)
TURSO_DB_URL = os.getenv("TURSO_DATABASE_URL", "libsql://dailynewstap-quovatech.aws-us-east-1.turso.io")
TURSO_AUTH_TOKEN = os.getenv("TURSO_AUTH_TOKEN", "")

# Category color mapping
CATEGORY_COLORS = {
    "politics": "#E63946",
    "business": "#457B9D",
    "technology": "#1D3557",
    "sports": "#2A9D8F",
    "entertainment": "#F77F00",
    "news": "#06A77D",
    "health": "#E76F51",
    "world": "#264653",
}

def clean_html_content(content):
    """Remove WordPress Gutenberg blocks and clean HTML"""
    # Remove WordPress comments
    content = re.sub(r'<!-- /?wp:[^\]]*?(?:\s+{[^}]*?})?\s*-->', '', content)
    
    # Decode HTML entities
    content = html.unescape(content)
    
    # Clean up excessive whitespace
    content = re.sub(r'\n\n+', '\n\n', content)
    content = content.strip()
    
    return content

def extract_featured_image(content):
    """Extract the first image URL from post content"""
    # Look for image tags
    img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', content, re.IGNORECASE)
    if img_match:
        img_url = img_match.group(1)
        
        # Check if it's from WordPress uploads
        if '/wp-content/uploads/' in img_url:
            # Extract the path after uploads/
            parts = img_url.split('/wp-content/uploads/')
            if len(parts) > 1:
                return f'/uploads/{parts[1]}'
        
        return img_url
    
    return ""

def extract_excerpt(content, max_length=200):
    """Extract first paragraph as excerpt"""
    # Find first paragraph
    p_match = re.search(r'<p>([^<]+)</p>', content)
    if p_match:
        text = p_match.group(1)
        # Remove any remaining HTML
        text = re.sub(r'<[^>]+>', '', text)
        if len(text) > max_length:
            return text[:max_length] + "..."
        return text
    return ""

def generate_slug(title, existing_slugs):
    """Generate URL-safe slug from title"""
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    
    # Ensure uniqueness
    original_slug = slug
    counter = 1
    while slug in existing_slugs:
        slug = f"{original_slug}-{counter}"
        counter += 1
    
    existing_slugs.add(slug)
    return slug

def parse_sql_insert_values(insert_statement):
    """
    Parse WordPress SQL INSERT statement values
    Returns list of tuples containing field values
    """
    values = []
    
    # Find VALUES clause
    values_match = re.search(r'VALUES\s+(.+);', insert_statement, re.DOTALL | re.IGNORECASE)
    if not values_match:
        return values
    
    values_str = values_match.group(1)
    
    # This regex handles nested parentheses and quoted strings
    # It's not perfect but works for most WordPress exports
    rows = re.findall(r'\(([^)]*(?:\([^)]*\)[^)]*)*)\)', values_str)
    
    for row in rows:
        # Split by commas not inside quotes
        fields = []
        current_field = ""
        in_quotes = False
        quote_char = None
        
        for char in row:
            if char in ("'", '"') and (not current_field or current_field[-1] != '\\'):
                if not in_quotes:
                    in_quotes = True
                    quote_char = char
                elif char == quote_char:
                    in_quotes = False
                    quote_char = None
            
            if char == ',' and not in_quotes:
                fields.append(current_field.strip())
                current_field = ""
            else:
                current_field += char
        
        if current_field:
            fields.append(current_field.strip())
        
        values.append(tuple(fields))
    
    return values

def clean_sql_value(value):
    """Clean and decode SQL value"""
    if value in ('NULL', 'null', ''):
        return None
    
    # Remove quotes
    if (value.startswith("'") and value.endswith("'")) or \
       (value.startswith('"') and value.endswith('"')):
        value = value[1:-1]
    
    # Unescape SQL strings
    value = value.replace("\\'", "'")
    value = value.replace('\\"', '"')
    value = value.replace('\\n', '\n')
    value = value.replace('\\r', '\r')
    value = value.replace('\\\\', '\\')
    
    return value

def main():
    print("🚀 WordPress to DailyNewsTap Migration Script\n")
    print("=" * 60)
    
    # Check if SQL file exists
    if not os.path.exists(WP_SQL_FILE):
        print(f"❌ ERROR: WordPress SQL file not found: {WP_SQL_FILE}")
        return 1
    
    print(f"📂 Reading WordPress SQL file...")
    with open(WP_SQL_FILE, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    file_size_mb = len(sql_content) / (1024 * 1024)
    print(f"   ✅ Loaded SQL file ({file_size_mb:.2f} MB)\n")
    
    # Extract categories
    print("📁 Step 1: Extracting Categories...")
    print("-" * 60)
    
    categories_data = []
    existing_slugs = set()
    
    # Find wp0n_terms INSERT statement
    terms_match = re.search(
        r'INSERT INTO `wp0n_terms`.*?VALUES\s+(.+?);',
        sql_content,
        re.DOTALL | re.IGNORECASE
    )
    
    if terms_match:
        terms_values = parse_sql_insert_values(f"INSERT INTO x VALUES {terms_match.group(1)};")
        
        for term_data in terms_values:
            if len(term_data) >= 3:
                term_id = clean_sql_value(term_data[0])
                name = clean_sql_value(term_data[1])
                slug = clean_sql_value(term_data[2])
                
                if name and slug:
                    # Assign color based on slug
                    color = CATEGORY_COLORS.get(slug.lower(), "#06A77D")
                    
                    categories_data.append({
                        'term_id': term_id,
                        'name': name,
                        'slug': slug,
                        'color': color,
                        'description': f'{name} news and updates'
                    })
                    existing_slugs.add(slug)
                    print(f"   ✅ Found category: {name} ({slug})")
    
    print(f"\n   📊 Total categories found: {len(categories_data)}\n")
    
    # Extract articles
    print("📝 Step 2: Extracting Articles...")
    print("-" * 60)
    
    articles_data = []
    article_slugs = set()
    
    # Find wp0n_posts INSERT statements
    posts_matches = re.finditer(
        r'INSERT INTO `wp0n_posts`.*?VALUES\s+(.+?);',
        sql_content,
        re.DOTALL | re.IGNORECASE
    )
    
    for posts_match in posts_matches:
        posts_values = parse_sql_insert_values(f"INSERT INTO x VALUES {posts_match.group(1)};")
        
        for post_data in posts_values:
            if len(post_data) < 24:
                continue
            
            # Parse WordPress post fields
            # (ID, post_author, post_date, post_date_gmt, post_content, post_title, ...)
            post_id = clean_sql_value(post_data[0])
            post_date = clean_sql_value(post_data[2])
            post_content = clean_sql_value(post_data[4]) or ""
            post_title = clean_sql_value(post_data[5]) or ""
            post_excerpt = clean_sql_value(post_data[6]) or ""
            post_status = clean_sql_value(post_data[7]) or ""
            post_name = clean_sql_value(post_data[11]) or ""
            post_type = clean_sql_value(post_data[21]) or ""
            
            # Only process published posts
            if post_type != 'post' or post_status != 'publish':
                continue
            
            # Skip if no title
            if not post_title or post_title.strip() == "":
                continue
            
            # Clean content
            clean_content = clean_html_content(post_content)
            
            # Extract featured image
            featured_image = extract_featured_image(clean_content)
            
            # Generate slug
            if post_name:
                slug = post_name
            else:
                slug = generate_slug(post_title, article_slugs)
            
            # Ensure slug is unique
            original_slug = slug
            counter = 1
            while slug in article_slugs:
                slug = f"{original_slug}-{counter}"
                counter += 1
            article_slugs.add(slug)
            
            # Extract subtitle/excerpt
            if post_excerpt:
                subtitle = post_excerpt[:200]
            else:
                subtitle = extract_excerpt(clean_content)
            
            articles_data.append({
                'title': post_title,
                'subtitle': subtitle,
                'slug': slug,
                'content': clean_content,
                'featured_image': featured_image,
                'author': 'Editorial Team',
                'status': 'published',
                'published_at': post_date,
                'created_at': post_date,
            })
            
            print(f"   ✅ Extracted: \"{post_title[:50]}...\"")
    
    print(f"\n   📊 Total articles extracted: {len(articles_data)}\n")
    
    # Save to JSON files for manual review and import
    print("💾 Step 3: Saving extracted data...")
    print("-" * 60)
    
    os.makedirs('migration_output', exist_ok=True)
    
    with open('migration_output/categories.json', 'w', encoding='utf-8') as f:
        json.dump(categories_data, f, indent=2, ensure_ascii=False)
    print("   ✅ Saved categories to: migration_output/categories.json")
    
    with open('migration_output/articles.json', 'w', encoding='utf-8') as f:
        json.dump(articles_data, f, indent=2, ensure_ascii=False)
    print("   ✅ Saved articles to: migration_output/articles.json")
    
    # Generate SQL insert statements for direct database import
    print("\n📤 Step 4: Generating SQL import file...")
    print("-" * 60)
    
    sql_statements = []
    sql_statements.append("-- DailyNewsTap WordPress Migration SQL")
    sql_statements.append("-- Generated: " + datetime.now().isoformat())
    sql_statements.append("")
    
    # Categories SQL
    sql_statements.append("-- Insert Categories")
    for cat in categories_data:
        name_escaped = cat['name'].replace("'", "''")
        sql_statements.append(
            f"INSERT INTO categories (name, slug, description, color) "
            f"VALUES ('{name_escaped}', '{cat['slug']}', "
            f"'{cat['description']}', '{cat['color']}') "
            f"ON CONFLICT(slug) DO NOTHING;"
        )
    
    sql_statements.append("")
    sql_statements.append("-- Insert Articles")
    for idx, article in enumerate(articles_data, 1):
        # Escape single quotes
        title = article['title'].replace("'", "''")
        subtitle = article['subtitle'].replace("'", "''")
        content = article['content'].replace("'", "''")
        
        sql_statements.append(
            f"INSERT INTO articles (title, subtitle, slug, content, featured_image, "
            f"author, status, published_at, created_at, category_id) "
            f"VALUES ("
            f"'{title}', "
            f"'{subtitle}', "
            f"'{article['slug']}', "
            f"'{content}', "
            f"'{article['featured_image']}', "
            f"'{article['author']}', "
            f"'published', "
            f"'{article['published_at']}', "
            f"'{article['created_at']}', "
            f"(SELECT id FROM categories LIMIT 1)"
            f") ON CONFLICT(slug) DO NOTHING;"
        )
    
    with open('migration_output/import.sql', 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_statements))
    print("   ✅ Saved SQL import file to: migration_output/import.sql")
    
    # Print summary
    print("\n" + "=" * 60)
    print("✨ Migration Extraction Complete!")
    print("=" * 60)
    print(f"""
📊 Summary:
   • Categories extracted: {len(categories_data)}
   • Articles extracted: {len(articles_data)}
   • Output files created in: migration_output/

📝 Next Steps:
   
   1. Review the extracted data:
      - migration_output/categories.json
      - migration_output/articles.json
   
   2. Import to database using the SQL file:
      - migration_output/import.sql
   
   3. Migrate images:
      mkdir -p public/uploads
      cp -r zipfolder/extracted_2025/2025/* public/uploads/
      cp -r zipfolder/extracted_2026/2026/* public/uploads/
   
   4. Run the import script (we'll create this next)
    """)
    
    return 0

if __name__ == '__main__':
    exit(main())
