#!/usr/bin/env python3
"""
WordPress Migration using MySQL parsing
Extract posts and categories properly
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
    # Also check for wp-content/uploads links
    img_match = re.search(r'(https?://[^\s<>"\')]+/wp-content/uploads/[^\s<>"\')]+\.(jpg|jpeg|png|gif|webp))', content, re.I)
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
    print("WordPress Migration - Using MySQL INSERT Parsing")
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
    term_to_taxonomy = {}  # term_id -> term_taxonomy_id
    
    taxonomy_match = re.search(r'INSERT INTO `wpuh_term_taxonomy`.*?VALUES\s+(.+?);', sql_content, re.DOTALL | re.IGNORECASE)
    if taxonomy_match:
        rows = re.findall(r'\((\d+),\s*(\d+),\s*["\']([^"\']+)["\']', taxonomy_match.group(1))
        for term_taxonomy_id, term_id, taxonomy in rows:
            term_to_taxonomy[term_id] = term_taxonomy_id
            
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
                print(f"   ✅ {term_info['name']} ({slug})")
    
    print(f"\n   📊 Total categories: {len(categories)}\n")
    
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
    
    # Step 3: Extract published posts using line-by-line parsing
    print("📝 Step 3: Extracting Published Posts...")
    print("-" * 70)
    
    articles = []
    seen_titles = set()
    
    # Split by lines and find post rows
    # Look for lines that end with post type 'post' and status 'publish'
    # Format: (...values..., 'publish', 'open', 'open'...'post-name'...'post', '', 0),
    
    # Better approach: Look for patterns specific to published posts
    # Search for: 'publish', 'open', 'open' followed eventually by 'post' as the type
    post_pattern = r"""\(
        (\d+),\s*                                   # ID
        \d+,\s*                                     # post_author
        '([^']+)',\s*                               # post_date
        '[^']*',\s*                                 # post_date_gmt
        '((?:[^'\\]|\\.|'')*?)',\s*                 # post_content (with escaping)
        '((?:[^'\\]|\\.)*?)',\s*                    # post_title
        '[^']*',\s*                                 # post_excerpt
        'publish'                                   # post_status = publish
        .*?
        'post'                                      # post_type = post
        [^)]*
    \)"""
    
    # Simpler: Just find all rows, then filter
    # Match a full row: (values, values, ...)
    print("   Searching for published posts...")
    
    # Extract INSERT INTO wpuh_posts section
    posts_section = re.search(r'INSERT INTO `wpuh_posts`.*?(?=INSERT INTO|$)', sql_content, re.DOTALL | re.IGNORECASE)
    
    if not posts_section:
        print("   ❌ Could not find wpuh_posts section")
        return
    
    posts_data = posts_section.group(0)
    
    # Now find individual rows - each row is wrapped in ()
    # But be careful with nested parentheses in content
    rows_found = 0
    articles_found = 0
    
    # Split by "),(" which separates rows
    # But first, mark the real boundaries
    parts = re.split(r'\),\s*\(', posts_data)
    
    print(f"   Found {len(parts)} potential post rows\n")
    
    for i, part in enumerate(parts):
        # Clean up the part
        part = part.strip()
        if not part:
            continue
        
        # Add back the parentheses
        if not part.startswith('('):
            part = '(' + part
        if not part.endswith(')'):
            part = part + ')'
        
        # Now extract fields - looking for specific positions
        # Fields: ID, author, date, date_gmt, content, title, excerpt, status, ...
        # Positions: 0,  1,      2,    3,        4,       5,      6,       7
        
        # Try to extract the critical fields
        # Pattern for a row:  (num, num, 'date', 'date', 'content', 'title', 'excerpt', 'status'
        match = re.match(r"""\(\s*
            (\d+),\s*                          # 0: ID
            (\d+),\s*                          # 1: author
            '([^']+)',\s*                      # 2: post_date
            '([^']*)',\s*                      # 3: post_date_gmt
            '((?:[^'\\]|\\'|\\\\)*?)',\s*      # 4: post_content (handle escaping)
            '((?:[^'\\]|\\'|\\\\)*?)',\s*      # 5: post_title
            '((?:[^'\\]|\\'|\\\\)*?)',\s*      # 6: post_excerpt
            '([^']*)'                          # 7: post_status
        """, part, re.VERBOSE | re.DOTALL)
        
        if not match:
            continue
        
        rows_found += 1
        post_id, author, post_date, post_date_gmt, content, title, excerpt, status = match.groups()
        
        # Check if this is a published post of type 'post'
        # Look for 'post' near the end of the row
        if "'publish'" not in part or "'post'" not in part:
            continue
        
        # More reliable check: look for the exact pattern near end
        # ..., 'slug-name', '', '', 'date', 'date', '', 0, 'url', 0, 'post', '', 0)
        if not re.search(r"'post',\s*'',\s*\d+\)", part):
            continue
        
        articles_found += 1
        
        # Clean title
        title = title.replace("\\'", "'").replace("\\\\", "\\")
        title = title.replace("\\n", " ").strip()
        
        if not title or len(title) < 3:
            continue
        
        # Skip duplicates
        if title in seen_titles:
            continue
        seen_titles.add(title)
        
        # Clean content
        content = content.replace("\\'", "'").replace("\\\\", "\\")
        content = content.replace("\\n", "\n")
        clean_content = clean_html_content(content)
        
        # Extract image and excerpt  
        featured_image = extract_featured_image(clean_content)
        subtitle = extract_excerpt(clean_content)
        
        # Get category
        category_term_id = post_category_map.get(post_id)
        category_name = None
        if category_term_id and category_term_id in category_term_map:
            category_name = category_term_map[category_term_id]['name']
        
        # Generate slug from title if needed
        slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
        
        articles.append({
            'id': post_id,
            'title': title,
            'subtitle': subtitle,
            'slug': slug,
            'content': clean_content,
            'featured_image': featured_image,
            'category': category_name,
            'published_at': post_date,
            'created_at': post_date,
        })
        
        cat_label = f"[{category_name}]" if category_name else "[No Category]"
        print(f"   ✅ [{len(articles)}] {cat_label} {title[:50]}...")
    
    print(f"\n   📊 Rows analyzed: {rows_found}")
    print(f"   📊 Articles extracted: {len(articles)}\n")
    
    # Step 4: Save outputs
    print("💾 Step 4: Saving data...")
    print("-" * 70)
    
    os.makedirs('migration_output', exist_ok=True)
    
    # Remove internal IDs from categories
    categories_clean = [{k: v for k, v in cat.items() if k not in ['term_taxonomy_id', 'term_id']} for cat in categories]
    
    with open('migration_output/categories_final.json', 'w', encoding='utf-8') as f:
        json.dump(categories_clean, f, indent=2, ensure_ascii=False)
    print("   ✅ Saved: migration_output/categories_final.json")
    
    with open('migration_output/articles_final.json', 'w', encoding='utf-8') as f:
        json.dump(articles, f, indent=2, ensure_ascii=False)
    print("   ✅ Saved: migration_output/articles_final.json")
    
    print("\n" + "=" * 70)
    print("✅ EXTRACTION COMPLETE!")
    print("=" * 70)
    print(f"📁 {len(categories)} categories")
    print(f"📝 {len(articles)} published articles")
    print("=" * 70)

if __name__ == "__main__":
    main()
