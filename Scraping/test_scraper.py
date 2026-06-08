#!/usr/bin/env python3
'''
Quick Test Scraper - Scrape just ONE muscle group to test
Perfect for testing before running the full scraper
'''

import requests
from bs4 import BeautifulSoup
import json

BASE_URL = 'https://fitnessprogramer.com'
MUSCLE_GROUP = 'chest'  # ⬅️ CHANGE THIS to test different muscles

print(f"Testing scraper on: {MUSCLE_GROUP.upper()}")
print("="*50)

# Get exercise list
url = f'{BASE_URL}/exercise-primary-muscle/{MUSCLE_GROUP}/'
response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

# Find exercise links
links = [a['href'] for a in soup.find_all('a', href=True) if '/exercise/' in a['href']]
links = list(set(links))[:5]  # Just first 5 for testing

print(f"Found {len(links)} exercises to scrape\n")

exercises = []
for i, link in enumerate(links, 1):
    print(f"[{i}/{len(links)}] Scraping: {link}")

    try:
        resp = requests.get(link, timeout=10)
        s = BeautifulSoup(resp.content, 'html.parser')

        # Extract data
        title = s.find('h1')
        name = title.get_text(strip=True) if title else ''

        # Get images and GIFs
        images = []
        gifs = []
        for img in s.find_all('img'):
            src = img.get('src', '')
            if src:
                if '.gif' in src:
                    gifs.append(src)
                else:
                    images.append(src)

        exercise = {
            'name': name,
            'url': link,
            'muscle_group': MUSCLE_GROUP,
            'images': images,
            'gifs': gifs
        }

        exercises.append(exercise)
        print(f"   ✓ {name} - {len(gifs)} GIFs, {len(images)} images")

    except Exception as e:
        print(f"   ✗ Error: {e}")

# Save results
with open(f'test_{MUSCLE_GROUP}_exercises.json', 'w', encoding='utf-8') as f:
    json.dump(exercises, f, indent=2)

print("\n" + "="*50)
print(f"✅ Test complete! Scraped {len(exercises)} exercises")
print(f"Saved to: test_{MUSCLE_GROUP}_exercises.json")
print("\nIf this works, run the full scraper: python scrape_exercises.py")