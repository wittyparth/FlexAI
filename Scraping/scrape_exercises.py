#!/usr/bin/env python3
"""
Fitness Programer Exercise Scraper
Scrapes all exercises from fitnessprogramer.com
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import os
from urllib.parse import urljoin

# List of all muscle groups
MUSCLE_GROUPS = [
    'neck', 'trapezius', 'shoulder', 'chest', 'back-wing', 
    'erector-spinae', 'biceps', 'triceps', 'forearm', 'abs-core',
    'leg', 'calf', 'hips', 'cardio', 'full-body'
]

BASE_URL = 'https://fitnessprogramer.com'

def get_all_exercise_links(muscle_group):
    """Get all exercise links for a specific muscle group"""
    exercise_links = []
    page = 1

    while True:
        if page == 1:
            url = f'{BASE_URL}/exercise-primary-muscle/{muscle_group}/'
        else:
            url = f'{BASE_URL}/exercise-primary-muscle/{muscle_group}/page/{page}/'

        print(f"Fetching {muscle_group} - Page {page}...")
        try:
            response = requests.get(url, timeout=10)
            if response.status_code != 200:
                break
        except:
            break

        soup = BeautifulSoup(response.content, 'html.parser')

        # Find all exercise links
        exercise_cards = soup.find_all('a', href=True)
        page_links = [link['href'] for link in exercise_cards 
                     if '/exercise/' in link['href'] and link['href'] not in exercise_links]

        if not page_links:
            break

        exercise_links.extend(page_links)
        page += 1
        time.sleep(0.5)

    return list(set(exercise_links))  # Remove duplicates

def download_media(url, save_path):
    """Download images and GIFs"""
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            return True
    except:
        pass
    return False

def scrape_exercise_details(exercise_url, download_images=False):
    """Scrape detailed information from an exercise page"""
    print(f"Scraping: {exercise_url}")

    try:
        response = requests.get(exercise_url, timeout=10)
        if response.status_code != 200:
            return None
    except:
        return None

    soup = BeautifulSoup(response.content, 'html.parser')

    exercise_data = {
        'url': exercise_url,
        'name': '',
        'slug': exercise_url.split('/')[-2] if exercise_url.endswith('/') else exercise_url.split('/')[-1],
        'overview': '',
        'instructions': {
            'starting_position': [],
            'execution': [],
            'repetitions': []
        },
        'tips': [],
        'benefits': [],
        'muscles_worked': [],
        'equipment': [],
        'primary_muscles': [],
        'images': [],
        'gifs': []
    }

    # Extract title/name
    title = soup.find('h1')
    if title:
        exercise_data['name'] = title.get_text(strip=True)

    # Extract all images and GIFs
    for img in soup.find_all('img'):
        img_src = img.get('src', '') or img.get('data-src', '')
        if img_src:
            full_url = urljoin(BASE_URL, img_src)
            if img_src.endswith('.gif') or '.gif' in img_src:
                exercise_data['gifs'].append(full_url)
                if download_images:
                    filename = f"exercise_data/images/{exercise_data['slug']}_{len(exercise_data['gifs'])}.gif"
                    download_media(full_url, filename)
            elif any(ext in img_src.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                exercise_data['images'].append(full_url)
                if download_images:
                    ext = img_src.split('.')[-1].split('?')[0]
                    filename = f"exercise_data/images/{exercise_data['slug']}_{len(exercise_data['images'])}.{ext}"
                    download_media(full_url, filename)

    # Extract equipment and primary muscles from the listing
    equipment_elem = soup.find(string=lambda text: text and 'Equipment:' in text)
    if equipment_elem:
        parent = equipment_elem.find_parent()
        if parent:
            equipment_text = parent.get_text()
            exercise_data['equipment'] = [e.strip() for e in equipment_text.replace('Equipment:', '').split(',')]

    muscles_elem = soup.find(string=lambda text: text and 'Primary Muscles:' in text)
    if muscles_elem:
        parent = muscles_elem.find_parent()
        if parent:
            muscles_text = parent.get_text()
            exercise_data['primary_muscles'] = [m.strip() for m in muscles_text.replace('Primary Muscles:', '').split(',')]

    # Extract text content by sections
    current_section = None
    all_text_elements = soup.find_all(['p', 'li', 'h2', 'h3', 'h4', 'strong'])

    for elem in all_text_elements:
        text = elem.get_text(strip=True)

        if not text or len(text) < 3:
            continue

        # Identify sections
        if 'Overview' in text or 'What is' in text:
            current_section = 'overview'
            continue
        elif 'Starting Position' in text:
            current_section = 'starting_position'
            continue
        elif 'Execution' in text:
            current_section = 'execution'
            continue
        elif 'Repetitions' in text:
            current_section = 'repetitions'
            continue
        elif 'Comments and Tips' in text or 'Tips:' in text:
            current_section = 'tips'
            continue
        elif 'Benefits' in text:
            current_section = 'benefits'
            continue
        elif 'Muscles Worked' in text:
            current_section = 'muscles_worked'
            continue

        # Add content to appropriate section
        if current_section == 'overview':
            if len(text) > 50:  # Only substantial text
                exercise_data['overview'] += text + ' '
        elif current_section == 'starting_position' and text and text[0] in ['-', '•', '–']:
            exercise_data['instructions']['starting_position'].append(text.lstrip('-•– '))
        elif current_section == 'execution' and text and text[0] in ['-', '•', '–']:
            exercise_data['instructions']['execution'].append(text.lstrip('-•– '))
        elif current_section == 'repetitions' and text and text[0] in ['-', '•', '–']:
            exercise_data['instructions']['repetitions'].append(text.lstrip('-•– '))
        elif current_section == 'tips' and text and text[0] in ['-', '•', '–']:
            exercise_data['tips'].append(text.lstrip('-•– '))
        elif current_section == 'benefits' and len(text) > 20:
            exercise_data['benefits'].append(text)
        elif current_section == 'muscles_worked' and len(text) > 10:
            exercise_data['muscles_worked'].append(text)

    exercise_data['overview'] = exercise_data['overview'].strip()

    return exercise_data

def main(download_images=False):
    """Main scraping function"""
    all_exercises = []

    # Create output directory
    os.makedirs('exercise_data', exist_ok=True)
    if download_images:
        os.makedirs('exercise_data/images', exist_ok=True)

    for muscle_group in MUSCLE_GROUPS:
        print(f"\n{'='*50}")
        print(f"Processing: {muscle_group.upper()}")
        print(f"{'='*50}")

        # Get all exercise links for this muscle group
        exercise_links = get_all_exercise_links(muscle_group)
        print(f"Found {len(exercise_links)} exercises for {muscle_group}")

        # Scrape each exercise
        muscle_exercises = []
        for link in exercise_links:
            exercise_data = scrape_exercise_details(link, download_images)
            if exercise_data:
                exercise_data['muscle_group'] = muscle_group
                all_exercises.append(exercise_data)
                muscle_exercises.append(exercise_data)

            time.sleep(0.5)

        # Save progress after each muscle group
        with open(f'exercise_data/{muscle_group}_exercises.json', 'w', encoding='utf-8') as f:
            json.dump(muscle_exercises, f, indent=2, ensure_ascii=False)

        print(f"✅ Saved {len(muscle_exercises)} {muscle_group} exercises")

    # Save all exercises to a single file
    with open('exercise_data/all_exercises.json', 'w', encoding='utf-8') as f:
        json.dump(all_exercises, f, indent=2, ensure_ascii=False)

    # Create a summary
    summary = {
        'total_exercises': len(all_exercises),
        'by_muscle_group': {},
        'total_images': sum(len(ex['images']) for ex in all_exercises),
        'total_gifs': sum(len(ex['gifs']) for ex in all_exercises)
    }

    for muscle_group in MUSCLE_GROUPS:
        count = len([ex for ex in all_exercises if ex['muscle_group'] == muscle_group])
        summary['by_muscle_group'][muscle_group] = count

    with open('exercise_data/summary.json', 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)

    print(f"\n{'='*50}")
    print(f"✅ SCRAPING COMPLETE!")
    print(f"{'='*50}")
    print(f"Total exercises: {len(all_exercises)}")
    print(f"Total images: {summary['total_images']}")
    print(f"Total GIFs: {summary['total_gifs']}")
    print(f"\nData saved to: exercise_data/")
    print(f"  - all_exercises.json (all data)")
    print(f"  - [muscle_group]_exercises.json (by muscle)")
    print(f"  - summary.json (statistics)")
    if download_images:
        print(f"  - images/ (downloaded media)")

    return all_exercises

if __name__ == '__main__':
    import sys
    download_imgs = '--download-images' in sys.argv or '-d' in sys.argv

    print("Fitness Programer Exercise Scraper")
    print("="*50)
    if download_imgs:
        print("⚠️  Image downloading ENABLED")
    else:
        print("ℹ️  Image downloading DISABLED (use --download-images to enable)")
    print("="*50)

    exercises = main(download_images=download_imgs)
