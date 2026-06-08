import requests
from bs4 import BeautifulSoup
import json
import os
from urllib.parse import urljoin
import time
import re
from slugify import slugify

# Create directories
os.makedirs('exercises_output', exist_ok=True)
os.makedirs('exercises_output/images', exist_ok=True)
os.makedirs('exercises_output/gifs', exist_ok=True)

base_url = 'https://fitnessprogramer.com'

# Mapping dictionaries for schema compliance
MUSCLE_GROUP_MAPPING = {
    'neck': ['traps'],
    'chest': ['chest'],
    'shoulders': ['shoulders'],
    'back': ['back', 'lats', 'upper_back', 'lower_back'],
    'biceps': ['biceps'],
    'triceps': ['triceps'],
    'forearms': ['forearms'],
    'abs': ['abs', 'core'],
    'obliques': ['obliques'],
    'legs': ['quadriceps', 'hamstrings'],
    'glutes': ['glutes'],
    'calves': ['calves'],
    'quadriceps': ['quadriceps'],
    'hamstrings': ['hamstrings'],
    'traps': ['traps'],
    'lats': ['lats']
}

EQUIPMENT_MAPPING = {
    'barbell': 'barbell',
    'dumbbell': 'dumbbells',
    'dumbbells': 'dumbbells',
    'kettlebell': 'kettlebell',
    'ez bar': 'ez_bar',
    'ez-bar': 'ez_bar',
    'bench': 'bench',
    'cable': 'cable_machine',
    'machine': 'machine',
    'smith machine': 'smith_machine',
    'pull-up bar': 'pull_up_bar',
    'pull up bar': 'pull_up_bar',
    'resistance band': 'resistance_bands',
    'bands': 'resistance_bands',
    'trx': 'trx',
    'medicine ball': 'medicine_ball',
    'stability ball': 'stability_ball',
    'bodyweight': 'bodyweight',
    'body weight': 'bodyweight',
    'none': 'none',
    'no equipment': 'none'
}

DIFFICULTY_MAPPING = {
    'beginner': 'beginner',
    'intermediate': 'intermediate',
    'advanced': 'advanced',
    'expert': 'advanced'
}

def normalize_muscle_group(muscle_text):
    """Convert scraped muscle text to schema-compliant values"""
    muscle_text = muscle_text.lower().strip()
    return MUSCLE_GROUP_MAPPING.get(muscle_text, [muscle_text])

def normalize_equipment(equipment_text):
    """Convert scraped equipment text to schema-compliant values"""
    equipment_text = equipment_text.lower().strip()
    for key, value in EQUIPMENT_MAPPING.items():
        if key in equipment_text:
            return value
    return 'machine'  # default

def normalize_difficulty(difficulty_text):
    """Convert scraped difficulty to schema-compliant values"""
    difficulty_text = difficulty_text.lower().strip()
    return DIFFICULTY_MAPPING.get(difficulty_text, 'intermediate')

def determine_movement_pattern(exercise_name, description):
    """Infer movement pattern from exercise name and description"""
    text = (exercise_name + ' ' + description).lower()
    
    if any(word in text for word in ['push up', 'press', 'chest press', 'shoulder press']):
        return 'push'
    elif any(word in text for word in ['pull', 'row', 'chin', 'curl']):
        return 'pull'
    elif any(word in text for word in ['squat', 'leg press']):
        return 'squat'
    elif any(word in text for word in ['deadlift', 'hinge', 'good morning']):
        return 'hinge'
    elif any(word in text for word in ['lunge', 'step']):
        return 'lunge'
    elif any(word in text for word in ['plank', 'hold', 'isometric']):
        return 'isometric'
    elif any(word in text for word in ['twist', 'rotation', 'russian']):
        return 'rotation'
    elif any(word in text for word in ['jump', 'explosive', 'power']):
        return 'explosive'
    else:
        return 'push'  # default

def determine_exercise_class(exercise_name, primary_muscles):
    """Determine if compound or isolation"""
    text = exercise_name.lower()
    
    # Compound exercises typically work multiple muscle groups
    if len(primary_muscles) > 1:
        return 'compound'
    
    compound_keywords = ['squat', 'deadlift', 'press', 'row', 'pull-up', 'chin-up', 'lunge', 'clean', 'snatch']
    if any(keyword in text for keyword in compound_keywords):
        return 'compound'
    
    isolation_keywords = ['curl', 'extension', 'raise', 'fly', 'flye', 'kickback']
    if any(keyword in text for keyword in isolation_keywords):
        return 'isolation'
    
    return 'compound'  # default

def download_media(url, folder, filename):
    """Download images/gifs and return local path"""
    try:
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            filepath = os.path.join(folder, filename)
            with open(filepath, 'wb') as f:
                f.write(response.content)
            return filepath
    except Exception as e:
        print(f"    ⚠️  Error downloading {url}: {e}")
    return None

def scrape_exercise_page(exercise_url):
    """Scrape individual exercise page and map to schema"""
    try:
        print(f"    Fetching: {exercise_url}")
        response = requests.get(exercise_url, timeout=15)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Initialize schema-compliant structure
        exercise = {
            'name': '',
            'slug': '',
            'primaryMuscleGroups': [],
            'secondaryMuscleGroups': [],
            'equipment': [],
            'difficulty': 'intermediate',
            'exerciseType': 'strength',
            'movementPattern': 'push',
            'trainingGoals': ['strength', 'hypertrophy'],
            'exerciseClass': 'compound',
            'description': '',
            'instructions': [],
            'media': {
                'thumbnail': '',
                'images': [],
                'videos': [],
                'gifs': [],
                'youtubeId': ''
            },
            'metrics': {
                'averageRating': 0,
                'totalRatings': 0,
                'popularityScore': 0,
                'usageCount': 0,
                'completionRate': 0,
                'averageDuration': 0
            },
            'defaultSets': 3,
            'defaultReps': {
                'min': 8,
                'max': 12,
                'target': 10
            },
            'defaultRestTime': 60,
            'intensityGuidance': {
                'rpe': {'min': 6, 'max': 8},
                'tempo': '2-0-2-0',
                'restRecommendation': {
                    'strength': 180,
                    'hypertrophy': 60,
                    'endurance': 30
                }
            },
            'safety': {
                'warnings': [],
                'commonMistakes': [],
                'tips': [],
                'contraindications': [],
                'requiredSkills': []
            },
            'variations': [],
            'progression': {
                'prerequisiteExercises': [],
                'nextLevelExercises': []
            },
            'calories': {
                'perMinute': 5,
                'baseRate': 5,
                'met': 3.5
            },
            'tags': [],
            'isActive': True,
            'isFeatured': False,
            'source': 'imported'
        }
        
        # === EXTRACT NAME ===
        title_elem = soup.find('h1', class_='entry-title') or soup.find('h1')
        if title_elem:
            exercise['name'] = title_elem.text.strip()
            exercise['slug'] = slugify(exercise['name'])
        
        # === EXTRACT METADATA FROM PAGE ===
        # Look for exercise info sections
        info_sections = soup.find_all(['div', 'span', 'p'], class_=re.compile('exercise-info|meta|details'))
        
        for section in info_sections:
            text = section.text.lower()
            
            # Extract difficulty
            if 'difficulty' in text:
                for diff in ['beginner', 'intermediate', 'advanced']:
                    if diff in text:
                        exercise['difficulty'] = diff
                        break
            
            # Extract equipment
            if 'equipment' in text:
                for equip_key in EQUIPMENT_MAPPING.keys():
                    if equip_key in text:
                        mapped = normalize_equipment(equip_key)
                        if mapped not in exercise['equipment']:
                            exercise['equipment'].append(mapped)
        
        # === EXTRACT MAIN CONTENT ===
        content = soup.find('div', class_='entry-content') or soup.find('article')
        
        if content:
            # Description (first paragraph)
            paragraphs = content.find_all('p', recursive=False)
            if paragraphs:
                desc_text = paragraphs[0].text.strip()
                exercise['description'] = desc_text[:500]  # Max 500 chars
            
            # Instructions
            for heading in content.find_all(['h2', 'h3', 'h4']):
                heading_text = heading.text.lower()
                
                if 'instruction' in heading_text or 'how to' in heading_text:
                    next_elem = heading.find_next_sibling()
                    if next_elem and next_elem.name == 'ol':
                        for li in next_elem.find_all('li'):
                            instruction = li.text.strip()[:200]  # Max 200 chars
                            if instruction:
                                exercise['instructions'].append(instruction)
                
                # Tips
                elif 'tip' in heading_text:
                    next_elem = heading.find_next_sibling()
                    if next_elem and next_elem.name in ['ul', 'ol']:
                        for li in next_elem.find_all('li'):
                            tip = li.text.strip()
                            if tip:
                                exercise['safety']['tips'].append(tip)
                
                # Common mistakes
                elif 'mistake' in heading_text or 'avoid' in heading_text:
                    next_elem = heading.find_next_sibling()
                    if next_elem and next_elem.name in ['ul', 'ol']:
                        for li in next_elem.find_all('li'):
                            mistake = li.text.strip()
                            if mistake:
                                exercise['safety']['commonMistakes'].append(mistake)
                
                # Variations
                elif 'variation' in heading_text:
                    next_elem = heading.find_next_sibling()
                    if next_elem:
                        variation_text = next_elem.text.strip()
                        if variation_text:
                            exercise['variations'].append({
                                'name': f"{exercise['name']} Variation",
                                'description': variation_text,
                                'difficulty': exercise['difficulty'],
                                'instructions': [],
                                'modificationType': 'alternative_equipment'
                            })
            
            # === EXTRACT MEDIA ===
            images = content.find_all('img')
            for idx, img in enumerate(images):
                img_url = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                if img_url:
                    img_url = urljoin(base_url, img_url)
                    
                    # Generate filename
                    safe_name = re.sub(r'[^a-z0-9]+', '_', exercise['name'].lower())
                    
                    if '.gif' in img_url.lower():
                        filename = f"{safe_name}_{idx}.gif"
                        local_path = download_media(img_url, 'exercises_output/gifs', filename)
                        if local_path:
                            exercise['media']['gifs'].append(img_url)
                            if idx == 0:  # First gif as thumbnail
                                exercise['media']['thumbnail'] = img_url
                    else:
                        filename = f"{safe_name}_{idx}.jpg"
                        local_path = download_media(img_url, 'exercises_output/images', filename)
                        if local_path:
                            exercise['media']['images'].append(img_url)
                            if not exercise['media']['thumbnail']:
                                exercise['media']['thumbnail'] = img_url
            
            # Look for YouTube videos
            iframes = content.find_all('iframe')
            for iframe in iframes:
                src = iframe.get('src', '')
                if 'youtube.com' in src or 'youtu.be' in src:
                    video_id_match = re.search(r'(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)', src)
                    if video_id_match:
                        exercise['media']['youtubeId'] = video_id_match.group(1)
                        exercise['media']['videos'].append(src)
        
        # === DERIVE FIELDS ===
        if not exercise['equipment']:
            exercise['equipment'] = ['bodyweight']
        
        exercise['movementPattern'] = determine_movement_pattern(
            exercise['name'], 
            exercise['description']
        )
        
        exercise['exerciseClass'] = determine_exercise_class(
            exercise['name'],
            exercise['primaryMuscleGroups']
        )
        
        # Generate tags
        exercise['tags'] = [
            exercise['difficulty'],
            exercise['exerciseType'],
            exercise['movementPattern']
        ] + exercise['equipment']
        
        return exercise
    
    except Exception as e:
        print(f"    ❌ Error scraping {exercise_url}: {e}")
        return None

def scrape_muscle_group_page(muscle_group):
    """Scrape all exercises for a muscle group"""
    url = f'{base_url}/exercise-primary-muscle/{muscle_group}/'
    print(f"\n{'='*60}")
    print(f"📍 Scraping muscle group: {muscle_group.upper()}")
    print(f"{'='*60}")
    
    try:
        response = requests.get(url, timeout=15)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find exercise links
        exercise_links = set()
        for link in soup.find_all('a', href=True):
            href = link['href']
            if '/exercise/' in href and '/exercise-primary-muscle/' not in href:
                full_url = urljoin(base_url, href)
                exercise_links.add(full_url)
        
        exercise_links = list(exercise_links)
        print(f"✅ Found {len(exercise_links)} exercises\n")
        
        exercises = []
        for idx, exercise_url in enumerate(exercise_links, 1):
            print(f"[{idx}/{len(exercise_links)}] Processing...")
            exercise_data = scrape_exercise_page(exercise_url)
            
            if exercise_data:
                # Add muscle group from URL
                normalized_muscles = normalize_muscle_group(muscle_group)
                exercise_data['primaryMuscleGroups'] = normalized_muscles
                exercises.append(exercise_data)
                print(f"    ✅ Scraped: {exercise_data['name']}")
            
            time.sleep(1)  # Be respectful
        
        return exercises
    
    except Exception as e:
        print(f"❌ Error scraping muscle group {muscle_group}: {e}")
        return []

# === MAIN EXECUTION ===
# muscle_groups = [
#     'neck', 'chest', 'shoulders', 'back', 'biceps', 'triceps',
#     'forearms', 'abs', 'obliques', 'legs', 'glutes', 'calves'
# ]
muscle_groups = [
    'hip','abs','shoulders'
]
all_exercises = []

print("\n" + "="*60)
print("🏋️  FITNESS PROGRAMER SCHEMA-BASED SCRAPER")
print("="*60)

for muscle_group in muscle_groups:
    exercises = scrape_muscle_group_page(muscle_group)
    all_exercises.extend(exercises)
    print(f"📊 Total exercises so far: {len(all_exercises)}")
    time.sleep(2)  # Pause between groups

# === SAVE OUTPUT ===
output_file = 'exercises_output/exercises_schema_compliant.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(all_exercises, f, indent=2, ensure_ascii=False)

# Save summary
summary = {
    'total_exercises': len(all_exercises),
    'by_muscle_group': {},
    'by_difficulty': {'beginner': 0, 'intermediate': 0, 'advanced': 0},
    'by_equipment': {},
    'total_images': sum(len(ex['media']['images']) for ex in all_exercises),
    'total_gifs': sum(len(ex['media']['gifs']) for ex in all_exercises)
}

for ex in all_exercises:
    # Count by muscle group
    for muscle in ex['primaryMuscleGroups']:
        summary['by_muscle_group'][muscle] = summary['by_muscle_group'].get(muscle, 0) + 1
    
    # Count by difficulty
    summary['by_difficulty'][ex['difficulty']] += 1
    
    # Count by equipment
    for equip in ex['equipment']:
        summary['by_equipment'][equip] = summary['by_equipment'].get(equip, 0) + 1

with open('exercises_output/scraping_summary.json', 'w', encoding='utf-8') as f:
    json.dump(summary, f, indent=2)

print("\n" + "="*60)
print("✅ SCRAPING COMPLETE!")
print("="*60)
print(f"📊 Total exercises scraped: {len(all_exercises)}")
print(f"📁 Output file: {output_file}")
print(f"🖼️  Total images: {summary['total_images']}")
print(f"🎞️  Total GIFs: {summary['total_gifs']}")
print(f"📄 Summary: exercises_output/scraping_summary.json")
print("="*60)