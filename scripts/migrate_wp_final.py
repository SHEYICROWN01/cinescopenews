#!/usr/bin/env python3
"""
WordPress to TanStack Migration - FINAL VERSION
Extracts REAL categories and published posts from WordPress SQL dump
"""

import re
import json
import os
from datetime import datetime

# Category colors
CATEGORY_COLORS = {
    'business': '#457B9D',
    'politics': '#E63946',
    'health': '#E76F51',
    'sports': '#2A9D8F',
    'news': '#06A77D',
    'entertainment': '#F77F00',
    'metro': '#264653',
    'headlines': '#1D3557'
}

def extract_field_value(text, start_pos):
    """
    Extract a single field value from SQL, handling quotes and escapes
    Returns: (value, next_position)
    """
    # Skip whitespace and comma
    while start_pos < len(text) and text[start_pos] in ' ,\n\t':
        start_pos += 1
    
    if start_pos >= len(text):
        return None, start_pos
    
    # Check if it's a quoted string
    if text[start_pos] == "'":
        value = []
        pos = start_pos + 1
        escape_next = False
        
        while pos < len(text):
            char = text[pos]
            
            if escape_next:
                value.append(char)
                escape_next = False
            elif char == '\\':
                escape_next = True
            elif char == "'":
                # End of string
                return ''.join(value), pos + 1
            else:
                value.append(char)
            
            pos += 1
        
        return ''.join(value), pos
    
    # Not a string - read until comma or paren
    value = []
    pos = start_pos
    while pos < len(text) and text[pos] not in ',)':
        value.append(text[pos])
        pos += 1
    
    return ''.join(value).strip(), pos

def parse_post_row(row_text):
    """
    Parse a single post row from WordPress
    Returns dict with post data or None
    """
    # Remove surrounding parens
    row_text = row_text.strip()
    if row_text.startswith('('):
        row_text = row_text[1:]
    if row_text.endswith(')'):
        row_text = row_text[:-1]
    
    # Extract fields one by one
    fields = []
    pos = 0
    
    while pos < len(row_text):
        value, pos = extract_field_value(row_text, pos)
        if value is not None:
            fields.append(value)
        else:
            break
    
    # WordPress wpuh_posts has 23 fields
    if len(fields) < 21:
        return None
    
    post_id = fields[0]
    post_date = fields[2]
    post_content = fields[4]
    post_title = fields[5]
    post_status = fields[7]
    post_name = fields[11]
    post_type = fields[20] if len(fields) > 20 else ''
    
    # Only return published posts of type 'post'
    if post_status == 'publish' and post_type == 'post':
        return {
            'id': post_id,
            'title': post_title,
            'content': post_content,
            'slug': post_name,
            'date': post_date
        }
    
    return None

def clean_html_content(content):
    """Clean WordPress HTML/Gutenberg content"""
    # Remove Gutenberg comments
    content = re.sub(r'<!-- /?wp:[^>]+ -->', '', content)
    # Clean up extra newlines
    content = re.sub(r'\n{3,}', '\n\n', content)
    return content.strip()

def extract_featured_image(content):
    """Extract first image URL from content"""
    img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', content)
    if img_match:
        return img_match.group(1)
    return None

def extract_excerpt(content, max_len=200):
    """Extract plain text excerpt"""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', content)
    # Clean up whitespace
    text = ' '.join(text.split())
    # Truncate
    if len(text) > max_len:
        text = text[:max_len].rsplit(' ', 1)[0] + '...'
    return text

def main():
    print("=" * 70)
    print("WordPress to TanStack Migration - FINAL VERSION")
    print("=" * 70)
    
    # Load SQL file
    sql_file = 'zipfolder/albaptzb_wp572.sql'
    print(f"\n📂 Loading: {sql_file}")
    
    with open(sql_file, 'r', encoding='utf-8', errors='ignore') as f:
        sql_content = f.read()
    
    file_size_mb = len(sql_content) / (1024 * 1024)
    print(f"   ✅ Loaded {file_size_mb:.2f} MB\n")
    
    # Step 1: Extract REAL categories
    print("📁 Step 1: Extracting REAL Categories...")
    print("-" * 70)
    
    # Get terms
    terms = {}
    terms_match = re.search(r'INSERT INTO `wpuh_terms`.*?VALUES\s+(.+?);', sql_content, re.DOTALL | re.IGNORECASE)
    if terms_match:
        rows = re.findall(r'\((\d+),\s*["\']([^"\']+)["\'],\s*["\']([^"\']+)["\']', terms_match.group(1))
        for term_id, name, slug in rows:
            terms[term_id] = {'name': name, 'slug': slug}
    
    # Get taxonomy (filter by 'category' only)
    categories = []
    category_term_map = {}  # term_id -> category info
    
    taxonomy_match = re.search(r'INSERT INTO `wpuh_term_taxonomy`.*?VALUES\s+(.+?);', sql_content, re.DOTALL | re.IGNORECASE)
    if taxonomy_match:
        rows = re.findall(r'\((\d+),\s*(\d+),\s*["\']([^"\']+)["\']', taxonomy_match.group(1))
        for term_taxonomy_id, term_id, taxonomy in rows:
            if taxonomy == 'category' and term_id in terms:
                term_info = terms[term_id]
                slug = term_info['slug'].lower()
                color = CATEGORY_COLORS.get(slug, "#06A77D")
                
                cat_data = {
                    'term_id': term_id,
                    'term_taxonomy_id': term_taxonomy_id,
                    'name': term_info['name'],
                    'slug': slug,
                    'color': color,
                    'description': f'{term_info["name"]} news and updates'
                }
                
                categories.append(cat_data)
                category_term_map[term_id] = cat_data
                print(f"   ✅ {term_info['name']} ({slug}) - {color}")
    
    print(f"\n   📊 Total REAL categories: {len(categories)}\n")
    
    # Step 2: Get post-category relationships
    print("🔗 Step 2: Loading Post-Category Relationships...")
    print("-" * 70)
    
    post_category_map = {}  # post_id -> category term_id
    rel_pattern = r'INSERT INTO `wpuh_term_relationships`.*?VALUES\s+(.+?);'
    rel_match = re.search(rel_pattern, sql_content, re.DOTALL | re.IGNORECASE)
    
    if rel_match:
        rows = re.findall(r'\((\d+),\s*(\d+)', rel_match.group(1))
        for object_id, term_taxonomy_id in rows:
            # Find which category this term_taxonomy_id belongs to
            for cat in categories:
                if cat['term_taxonomy_id'] == term_taxonomy_id:
                    post_category_map[object_id] = cat['term_id']
                    break
    
    print(f"   ✅ Found {len(post_category_map)} post-category links\n")
    
    # Step 3: Extract published posts
    print("📝 Step 3: Extracting Published Posts...")
    print("-" * 70)
    
    articles = []
    seen_titles = set()
    
    # Find all wpuh_posts INSERT statements
    posts_pattern = r'INSERT INTO `wpuh_posts`[^;]+VALUES\s*(.+?);'
    posts_matches = list(re.finditer(posts_pattern, sql_content, re.DOTALL))
    
    print(f"   Found {len(posts_matches)} INSERT statements\n")
    
    for match in posts_matches:
        values_text = match.group(1)
        
        # Split into individual rows by finding balanced parens
        rows = []
        depth = 0
        current_row = []
        
        for char in values_text:
            if char == '(' and depth == 0:
                depth = 1
                current_row = ['(']
            elif depth > 0:
                current_row.append(char)
                if char == ')':
                    depth -= 1
                    if depth == 0:
                        rows.append(''.join(current_row))
                        current_row = []
        
        # Parse each row
        for row_text in rows:
            post = parse_post_row(row_text)
            
            if not post:
                continue
            
            title = post['title']
            
            # Skip short or duplicate titles
            if not title or len(title.strip()) < 3:
                continue
            if title in seen_titles:
                continue
            
            seen_titles.add(title)
            
            # Clean content
            content = post['content'] or ""
            clean_content = clean_html_content(content)
            
            # Extract image and excerpt
            featured_image = extract_featured_image(clean_content)
            subtitle = extract_excerpt(clean_content)
            
            # Get category
            category_term_id = post_category_map.get(post['id'])
            category_name = None
            if category_term_id and category_term_id in category_term_map:
                category_name = category_term_map[category_term_id]['name']
            
            # Generate clean slug if needed
            slug = post['slug'] or re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
            
            articles.append({
                'id': post['id'],
                'title': title,
                'subtitle': subtitle,
                'slug': slug,
                'content': clean_content,
                'featured_image': featured_image,
                'category': category_name,
                'published_at': post['date'],
                'created_at': post['date'],
            })
            
            cat_label = f"[{category_name}]" if category_name else "[No Category]"
            print(f"   ✅ [{len(articles)}] {cat_label} {title[:50]}...")
    
    print(f"\n   📊 Total articles extracted: {len(articles)}\n")
    
    # Step 4: Save to JSON
    print("💾 Step 4: Saving data...")
    print("-" * 70)
    
    os.makedirs('migration_output', exist_ok=True)
    
    # Remove term_taxonomy_id from categories before saving
    categories_clean = [{k: v for k, v in cat.items() if k != 'term_taxonomy_id'} for cat in categories]
    
    with open('migration_output/categories_final.json', 'w', encoding='utf-8') as f:
        json.dump(categories_clean, f, indent=2, ensure_ascii=False)
    print("   ✅ Saved categories: migration_output/categories_final.json")
    
    with open('migration_output/articles_final.json', 'w', encoding='utf-8') as f:
        json.dump(articles, f, indent=2, ensure_ascii=False)
    print("   ✅ Saved articles: migration_output/articles_final.json")
    
    # Generate import SQL
    print("\n📤 Step 5: Generating SQL import...")
    print("-" * 70)
    
    sql_lines = []
    sql_lines.append("-- WordPress Migration SQL - FINAL")
    sql_lines.append(f"-- Generated: {datetime.now().isoformat()}")
    sql_lines.append(f"-- Categories: {len(categories)} | Articles: {len(articles)}")
    sql_lines.append("")
    sql_lines.append("-- Clear old data")
    sql_lines.append("DELETE FROM articles;")
    sql_lines.append("DELETE FROM categories;")
    sql_lines.append("")
    
    # Categories
    sql_lines.append("-- Insert REAL categories")
    for cat in categories_clean:
        name = cat['name'].replace("'", "''")
        slug = cat['slug']
        desc = cat['description'].replace("'", "''")
        color = cat['color']
        sql_lines.append(
            f"INSERT INTO categories (name, slug, description, color) "
            f"VALUES ('{name}', '{slug}', '{desc}', '{color}');"
        )
    
    sql_lines.append("")
    sql_lines.append(f"-- Insert {len(articles)} articles")
    sql_lines.append("-- NOTE: Update categoryId after categories are inserted")
    
    with open('migration_output/import_final.sql', 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    print("   ✅ Saved SQL: migration_output/import_final.sql")
    
    print("\n" + "=" * 70)
    print("✅ MIGRATION COMPLETE!")
    print("=" * 70)
    print(f"📁 {len(categories)} categories")
    print(f"📝 {len(articles)} published articles")
    print("\nNext steps:")
    print("1. Import categories to database")
    print("2. Import articles and link to categories")
    print("3. Migrate images from extracted folders")
    print("=" * 70)

if __name__ == "__main__":
    main()
