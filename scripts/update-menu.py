#!/usr/bin/env python3
"""Hent oppdatert meny fra rootsandflame.no og skriv til shared/data/menu.json"""
import re
import json
import urllib.request
import urllib.parse

SLUGS = [
    'pizza', 'salater', 'kebab-retter', 'kj%C3%B8ttretter',
    'gryte-retter', 'burgerretter', 'pastaretter', 'barnemeny',
    'dessert', 'english-takeaway-menu',
]

def scrape_menu(slug):
    url = f'https://www.rootsandflame.no/menus?menu={slug}'
    html = urllib.request.urlopen(url, timeout=15).read().decode('utf-8', errors='ignore')
    menu_match = re.search(r'data-hook="menu\.name"[^>]*>([^<]+)', html)
    menu_name = menu_match.group(1).strip() if menu_match else slug
    sec_names = re.findall(r'data-hook="section\.name"[^>]*>([^<]+)', html)
    items = []
    for part in re.split(r'(?=data-hook="item\.name")', html)[1:]:
        name_m = re.search(r'data-hook="item\.name"[^>]*>([^<]+)', part)
        if not name_m:
            continue
        desc_m = re.search(r'data-hook="item\.description"[^>]*>([^<]*)', part)
        price_m = re.search(r'data-hook="item\.price"[^>]*>([^<]*)', part)
        vnames = re.findall(r'data-hook="variant\.name"[^>]*>([^<]+)', part)
        vprices = re.findall(r'data-hook="variant\.price"[^>]*>([^<]+)', part)
        items.append({
            'name': name_m.group(1).strip(),
            'desc': (desc_m.group(1).strip() if desc_m else ''),
            'price': (price_m.group(1).strip() if price_m else ''),
            'variants': [
                {'name': vnames[i].strip(), 'price': vprices[i].strip()}
                for i in range(min(len(vnames), len(vprices)))
            ],
            'labels': [],
        })
    return {
        'id': urllib.parse.unquote(slug),
        'slug': slug,
        'title': menu_name,
        'sections': [s.strip() for s in sec_names if s.strip()],
        'items': items,
    }

def main():
    categories = [scrape_menu(s) for s in SLUGS]
    data = {
        'source': 'https://www.rootsandflame.no/menus',
        'updated': __import__('datetime').date.today().isoformat(),
        'pizzaNote': {
            'no': 'Medium: tynn, sprø bunn. Stor: luftig amerikansk bunn.',
            'en': 'Medium: thin, crispy crust. Large: airy American-style crust.',
        },
        'extras': {
            'dressings': [
                {'name': 'Hvitløksdressing', 'price': '25 kr'},
                {'name': 'Kaldrørt bearnaise', 'price': '25 kr'},
            ],
            'glutenFree': {
                'no': 'Alle pizzaer kan lages glutenfri i medium størrelse.',
                'en': 'All pizzas can be made gluten-free in medium size.',
            },
        },
        'categories': categories,
    }
    import os
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json_path = os.path.join(root, 'shared/data/menu.json')
    js_path = os.path.join(root, 'shared/js/menu-data.js')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write('/* Auto-generated from menu.json */\nconst RF_MENU_DATA = ')
        json.dump(data, f, ensure_ascii=False)
        f.write(';\n')
    total = sum(len(c['items']) for c in categories)
    print(f'Wrote {total} items -> {json_path} + menu-data.js')

if __name__ == '__main__':
    main()
