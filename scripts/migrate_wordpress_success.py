#!/usr/bin/env python3
"""
WordPress Migration - Line by Line Parsing
Each WordPress post row is on a single line!
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
    content = re.sub(r'<!-- /?wp:[^>]+ -->', '', content)
    content = re.sub(r'\n{3,}', '\n\n', content)
    return content.strip()

def extract_featured_image(content):
    """Extract first image URL from content"""
    img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', content)
    if img_match:
        return img_match.group(1)
    img_match = re.search(r'(https?://[^\s<>"\')]+/wp-content/uploads/[^\s<>"\')]+\.(jpg|jpeg|png|gif|webp))', content, re.I)
    if img_match:
        return img_match.group(1)
    return None

def extract_excerpt(content, max_len=200):
    """Extract plain text excerpt"""
    text = re.sub(r'<[^>]+>', '', content)
    text = ' '.join(text.split())
    if len(text) > max_len:
        text = text[:max_len].rsplit(' ', 1)[0] + '...'
    return text

def parse_wp_value(text, start_pos):
    """
    Parse a single MySQL value from position
    Returns (value, next_pos)
    """
    # Skip whitespace and comma
    while start_pos < len(text) and text[start_pos] in ' ,\t':
        start_pos += 1
    
    if start_pos >= len(text):
        return None, start_pos
    
    # Quoted string
    if text[start_pos] == "'":
        chars = []
        pos = start_pos + 1
        while pos < len(text):
            if text[pos] == '\\' and pos + 1 < len(text):
                # Escape sequence
                next_char = text[pos + 1]
                if next_char == 'n':
                    chars.append('\n')
                elif next_char == 'r':
                    chars.append('\r')
                elif next_char == 't':
                    chars.append('\t')
                elif next_char == '\\':
                    chars.append('\\')
                elif next_char == "'":
                    chars.append("'")
                else:
                    chars.append(next_char)
                pos += 2
            elif text[pos] == "'":
                # Check for escaped quote ''
                if pos + 1 < len(text) and text[pos + 1] == "'":
                    chars.append("'")
                    pos += 2
                else:
                    # End of string
                    return ''.join(chars), pos + 1
            else:
                chars.append(text[pos])
                pos += 1
        return ''.join(chars), pos
    
    # Number or other value
    chars = []
    pos = start_pos
    while pos < len(text) and text[pos] not in ',)':
        chars.append(text[pos])
        pos += 1
    return ''.join(chars).strip(), pos

def parse_post_row(line):
    """Parse a WordPress post row (one line)"""
    # Remove surrounding parens and trailing comma/semicolon
    line = line.strip().rstrip(',;')
    if line.startswith('('):
        line = line[1:]
    if line.endswith(')'):
        line = line[:-1]
    
    # Parse values one by one
    values = []
    pos = 0
    while pos < len(line):
        val, pos = parse_wp_value(line, pos)
        if val is not None:
            values.append(val)
    
    # WordPress wpuh_posts has 23 fields:
    # 0:ID, 1:author, 2:post_date, 3:post_date_gmt, 4:post_content, 5:post_title,
    # 6:post_excerpt, 7:post_status, 8:comment_status, 9:ping_status, 10:post_password,
    # 11:post_name, 12:to_ping, 13:pinged, 14:post_modified, 15:post_modified_gmt,
    # 16:post_content_filtered, 17:post_parent, 18:guid, 19:menu_order, 20:post_type,
    # 21:post_mime_type, 22:comment_count
    
    if len(values) < 21:
        return None
    
    post_id = values[0]
    post_date = values[2]
    post_content = values[4]
    post_title = values[5]
    post_status = values[7]
    post_name = values[11]
    post_type = values[20]
    
    # Only published posts of type 'post'
    if post_status == 'publish' and post_type == 'post':
        return {
            'id': post_id,
            'title': post_title,
            'content': post_content,
            'slug': post_name,
            'date': post_date
        }
    
    return None

def main():
    print("=" * 70)
    print("WordPress Migration - WORKING VERSION")
    print("=" * 70)
    
    # Load SQL file LINE BY LINE
    sql_file = 'zipfolder/albaptzb_wp572.sql'
    print(f"\n📂 Loading: {sql_file}")
    
    with open(sql_file, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    
    print(f"   ✅ Loaded {len(lines)} lines\n")
    
    # Step 1: Extract categories
    print("📁 Step 1: Extracting Categories...")
    print("-" * 70)
    
    # Find terms and taxonomy from content
    content = ''.join(lines)
    
    terms = {}
    terms_match = re.search(r'INSERT INTO `wpuh_terms`.*?VALUES\s+(.+?);', content, re.DOTALL | re.IGNORECASE)
    if terms_match:
        rows = re.findall(r'\((\d+),\s*["\']([^"\']+)["\'],\s*["\']([^"\']+)["\']', terms_match.group(1))
        for term_id, name, slug in rows:
            terms[term_id] = {'name': name, 'slug': slug}
    
    categories = []
    category_term_map = {}
    
    taxonomy_match = re.search(r'INSERT INTO `wpuh_term_taxonomy`.*?VALUES\s+(.+?);', content, re.DOTALL | re.IGNORECASE)
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
                print(f"   ✅ {term_info['name']}")
    
    print(f"\n   📊 Total: {len(categories)} categories\n")
    
    # Step 2: Get post-category relationships
    print("🔗 Step 2: Post-Category Relationships...")
    print("-" * 70)
    
    post_category_map = {}
    rel_pattern = r'INSERT INTO `wpuh_term_relationships`.*?VALUES\s+(.+?);'
    rel_match = re.search(rel_pattern, content, re.DOTALL | re.IGNORECASE)
    
    if rel_match:
        rows = re.findall(r'\((\d+),\s*(\d+)', rel_match.group(1))
        for object_id, term_taxonomy_id in rows:
            for cat in categories:
                if cat['term_taxonomy_id'] == term_taxonomy_id:
                    post_category_map[object_id] = cat['term_id']
                    break
    
    print(f"   ✅ Found {len(post_category_map)} links\n")
    
    # Step 3: Extract posts LINE BY LINE
    print("📝 Step 3: Extracting Posts (Line by Line)...")
    print("-" * 70)
    
    articles = []
    seen_titles = set()
    in_posts_section = False
    
    for line_num, line in enumerate(lines):
        # Check if we're in the wpuh_posts section
        if 'INSERT INTO `wpuh_posts`' in line:
            in_posts_section = True
            continue
        
        if in_posts_section:
            # Check if we've left the posts section
            if line.startswith('INSERT INTO') or line.startswith('--'):
                in_posts_section = False
                continue
            
            # Try to parse this line as a post row
            if line.strip().startswith('('):
                post = parse_post_row(line)
                
                if not post:
                    continue
                
                title = post['title']
                
                # Skip invalid or duplicate titles
                if not title or len(title.strip()) < 3:
                    continue
                if title in seen_titles:
                    continue
                seen_titles.add(title)
                
                # Clean content
                content = post['content'] or ""
                clean_content = clean_html_content(content)
                
                # Extract metadata
                featured_image = extract_featured_image(clean_content)
                subtitle = extract_excerpt(clean_content)
                
                # Get category
                category_term_id = post_category_map.get(post['id'])
                category_name = None
                if category_term_id and category_term_id in category_term_map:
                    category_name = category_term_map[category_term_id]['name']
                
                # Clean slug
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
                
                cat_label = f"[{category_name}]" if category_name else "[No Cat]"
                if len(articles) <= 20 or len(articles) % 20 == 0:
                    print(f"   ✅ [{len(articles)}] {cat_label} {title[:50]}...")
    
    print(f"\n   📊 Total: {len(articles)} published articles\n")
    
    # Step 4: Save outputs
    print("💾 Step 4: Saving Files...")
    print("-" * 70)
    
    os.makedirs('migration_output', exist_ok=True)
    
    categories_clean = [{k: v for k, v in cat.items() if k not in ['term_taxonomy_id', 'term_id']} for cat in categories]
    
    with open('migration_output/categories_final.json', 'w', encoding='utf-8') as f:
        json.dump(categories_clean, f, indent=2, ensure_ascii=False)
    print("   ✅ migration_output/categories_final.json")
    
    with open('migration_output/articles_final.json', 'w', encoding='utf-8') as f:
        json.dump(articles, f, indent=2, ensure_ascii=False)
    print("   ✅ migration_output/articles_final.json")
    
    print("\n" + "=" * 70)
    print("✅ SUCCESS!")
    print("=" * 70)
    print(f"📁 {len(categories)} categories")
    print(f"📝 {len(articles)} articles")
    print("\nNext: Import to database and migrate images")
    print("=" * 70)

if __name__ == "__main__":
    main()
