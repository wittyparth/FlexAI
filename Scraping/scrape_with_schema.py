#!/usr/bin/env python3
"""
Advanced Exercise Scraper with Schema Mapping
Maps fitnessprogramer.com data to your Mongoose schema
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
from urllib.parse import urljoin

# ===== CONFIGURATION =====
BASE_URL = 'https://fitnessprogramer.com'
MUSCLE_GROUPS = [
    'neck', 'trapezius', 'shoulders', 'chest', 'back', 
    'erector-spinae', 'biceps', 'triceps', 'forearm', 'abs',
    'leg', 'calf', 'hip', 'cardio', 'full-body'
]

# ===== MAPPING DICTIONARIES =====

EQUIPMENT_MAPPING = {
    'barbell': 'barbell',
    'dumbbell': 'dumbbells', 'dumbbells': 'dumbbells',
    'kettlebell': 'kettlebell',
    'ez bar': 'ez_bar', 'ez-bar': 'ez_bar',
    'bench': 'bench',
    'squat rack': 'squat_rack', 'power rack': 'power_rack',
    'cable': 'cable_machine', 'cable machine': 'cable_machine',
    'machine': 'machine',
    'smith machine': 'smith_machine',
    'pull up bar': 'pull_up_bar', 'pull-up bar': 'pull_up_bar',
    'dip bar': 'dip_bars', 'dip bars': 'dip_bars',
    'resistance band': 'resistance_bands', 'bands': 'resistance_bands',
    'trx': 'trx', 'suspension': 'suspension_trainer',
    'box': 'box', 'plyo box': 'box',
    'medicine ball': 'medicine_ball', 'med ball': 'medicine_ball',
    'stability ball': 'stability_ball', 'swiss ball': 'stability_ball',
    'bodyweight': 'bodyweight', 'body weight': 'bodyweight',
    'no equipment': 'none', 'none': 'none'
}

MUSCLE_GROUP_MAPPING = {
    'chest': 'chest', 'pectorals': 'chest', 'pecs': 'chest',
    'back': 'back', 'lats': 'lats', 'latissimus': 'lats',
    'shoulders': 'shoulders', 'deltoids': 'shoulders', 'delts': 'shoulders',
    'biceps': 'biceps', 'bicep': 'biceps',
    'triceps': 'triceps', 'tricep': 'triceps',
    'forearms': 'forearms', 'forearm': 'forearms',
    'abs': 'abs', 'abdominals': 'abs', 'core': 'core',
    'obliques': 'obliques',
    'quadriceps': 'quadriceps', 'quads': 'quadriceps',
    'hamstrings': 'hamstrings', 'hamstring': 'hamstrings',
    'glutes': 'glutes', 'gluteus': 'glutes',
    'calves': 'calves', 'calf': 'calves',
    'trapezius': 'traps', 'traps': 'traps',
    'lower back': 'lower_back', 'erector spinae': 'lower_back',
    'neck': 'shoulders',  # Website uses neck, map to shoulders
    'full body': 'full_body',
    'cardio': 'cardiovascular'
}

DIFFICULTY_KEYWORDS = {
    'beginner': ['beginner', 'basic', 'simple', 'easy', 'introductory'],
    'intermediate': ['intermediate', 'moderate', 'standard'],
    'advanced': ['advanced', 'complex', 'heavy', 'explosive', 'plyometric']
}

MOVEMENT_PATTERNS = {
    'push': ['press', 'push', 'dip', 'fly', 'raise'],
    'pull': ['pull', 'row', 'curl', 'chin', 'deadlift'],
    'squat': ['squat', 'lunge'],
    'hinge': ['deadlift', 'good morning', 'swing', 'romanian'],
    'rotation': ['twist', 'rotation', 'wood chop', 'russian'],
    'isometric': ['plank', 'hold', 'static'],
    'explosive': ['jump', 'explosive', 'power', 'snatch', 'clean']
}

# ===== HELPER FUNCTIONS =====

def create_slug(name):
    """Generate URL-safe slug from name"""
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug

def normalize_equipment(equipment_list):
    """Map scraped equipment to schema enums"""
    normalized = set()
    for eq in equipment_list:
        eq_lower = eq.lower().strip()
        # Try direct mapping first
        if eq_lower in EQUIPMENT_MAPPING:
            normalized.add(EQUIPMENT_MAPPING[eq_lower])
        else:
            # Try partial matching
            for key, value in EQUIPMENT_MAPPING.items():
                if key in eq_lower:
                    normalized.add(value)
                    break
    return list(normalized) if normalized else ['bodyweight']

def normalize_muscle_groups(muscle_list):
    """Map scraped muscles to schema enums"""
    normalized = set()
    for muscle in muscle_list:
        muscle_lower = muscle.lower().strip()
        if muscle_lower in MUSCLE_GROUP_MAPPING:
            normalized.add(MUSCLE_GROUP_MAPPING[muscle_lower])
        else:
            # Partial matching
            for key, value in MUSCLE_GROUP_MAPPING.items():
                if key in muscle_lower:
                    normalized.add(value)
                    break
    return list(normalized)

def infer_difficulty(name, description, equipment):
    """Infer difficulty level from context"""
    text = (name + ' ' + description).lower()

    # Check for explicit difficulty mentions
    for level, keywords in DIFFICULTY_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            return level

    # Infer from equipment complexity
    if 'bodyweight' in equipment or 'none' in equipment:
        return 'beginner'
    elif any(eq in equipment for eq in ['barbell', 'power_rack', 'olympic']):
        return 'intermediate'

    return 'intermediate'  # Default

def infer_movement_pattern(name, instructions):
    """Infer movement pattern from name and instructions"""
    text = (name + ' ' + ' '.join(instructions)).lower()

    for pattern, keywords in MOVEMENT_PATTERNS.items():
        if any(kw in text for kw in keywords):
            return pattern

    return 'push'  # Default

def infer_exercise_type(name, equipment, description):
    """Infer exercise type"""
    text = (name + ' ' + description).lower()

    if any(kw in text for kw in ['cardio', 'running', 'cycling', 'aerobic']):
        return 'cardio'
    elif any(kw in text for kw in ['stretch', 'flexibility', 'mobility']):
        return 'flexibility'
    elif any(kw in text for kw in ['jump', 'explosive', 'plyometric']):
        return 'plyometric'
    elif 'bodyweight' in equipment:
        return 'calisthenics'
    else:
        return 'strength'

def infer_exercise_class(primary_muscles, secondary_muscles):
    """Determine if compound or isolation"""
    total_muscles = len(primary_muscles) + len(secondary_muscles)

    if total_muscles >= 3:
        return 'compound'
    elif total_muscles == 2:
        return 'hybrid'
    else:
        return 'isolation'

def extract_training_goals(benefits):
    """Extract training goals from benefits"""
    goals = set()
    text = ' '.join(benefits).lower()

    if any(kw in text for kw in ['strength', 'strong', 'power']):
        goals.add('strength')
    if any(kw in text for kw in ['muscle', 'hypertrophy', 'mass', 'size']):
        goals.add('hypertrophy')
    if any(kw in text for kw in ['endurance', 'stamina']):
        goals.add('endurance')
    if any(kw in text for kw in ['athletic', 'performance', 'sport']):
        goals.add('athletic_performance')
    if any(kw in text for kw in ['mobility', 'range of motion', 'flexibility']):
        goals.add('mobility')
    if any(kw in text for kw in ['injury', 'rehabilitation', 'recovery']):
        goals.add('rehabilitation')

    return list(goals) if goals else ['general_fitness']

def extract_warnings_and_mistakes(tips):
    """Separate warnings and common mistakes from tips"""
    warnings = []
    mistakes = []
    clean_tips = []

    for tip in tips:
        tip_lower = tip.lower()
        if any(kw in tip_lower for kw in ['do not', 'don\'t', 'avoid', 'never', 'caution']):
            if 'avoid' in tip_lower or 'do not' in tip_lower:
                mistakes.append(tip)
            else:
                warnings.append(tip)
        elif any(kw in tip_lower for kw in ['warning', 'danger', 'injury', 'strain']):
            warnings.append(tip)
        else:
            clean_tips.append(tip)

    return warnings, mistakes, clean_tips

def calculate_default_reps(difficulty, exercise_type):
    """Calculate rep ranges based on difficulty and type"""
    if exercise_type == 'strength':
        if difficulty == 'advanced':
            return {'min': 3, 'max': 6, 'target': 5}
        return {'min': 6, 'max': 10, 'target': 8}
    elif exercise_type == 'hypertrophy':
        return {'min': 8, 'max': 12, 'target': 10}
    elif exercise_type == 'endurance':
        return {'min': 12, 'max': 20, 'target': 15}
    else:
        return {'min': 8, 'max': 12, 'target': 10}

# ===== SCRAPING FUNCTIONS =====

def get_all_exercise_links(muscle_group):
    """Get all exercise links for a muscle group"""
    exercise_links = []
    page = 1

    while True:
        if page == 1:
            url = f'{BASE_URL}/exercise-primary-muscle/{muscle_group}/'
        else:
            url = f'{BASE_URL}/exercise-primary-muscle/{muscle_group}/page/{page}/'

        print(f"  Fetching page {page}...")
        try:
            response = requests.get(url, timeout=10)
            if response.status_code != 200:
                break
        except:
            break

        soup = BeautifulSoup(response.content, 'html.parser')
        exercise_cards = soup.find_all('a', href=True)
        page_links = [link['href'] for link in exercise_cards 
                     if '/exercise/' in link['href'] and link['href'] not in exercise_links]

        if not page_links:
            break

        exercise_links.extend(page_links)
        page += 1
        time.sleep(0.5)

    return list(set(exercise_links))

def scrape_exercise_details(exercise_url, muscle_group):
    """Scrape and map exercise to schema"""
    print(f"  Scraping: {exercise_url}")

    try:
        response = requests.get(exercise_url, timeout=10)
        if response.status_code != 200:
            return None
    except:
        return None

    soup = BeautifulSoup(response.content, 'html.parser')

    # ===== DIRECT EXTRACTION =====
    title = soup.find('h1')
    name = title.get_text(strip=True) if title else ''

    # Extract all text sections
    sections = {
        'overview': '',
        'starting_position': [],
        'execution': [],
        'tips': [],
        'benefits': [],
        'muscles_worked': [],
        'equipment': [],
        'primary_muscles': []
    }

    current_section = None
    for elem in soup.find_all(['p', 'li', 'h2', 'h3', 'strong']):
        text = elem.get_text(strip=True)
        if not text or len(text) < 3:
            continue

        # Identify sections
        if 'Overview' in text:
            current_section = 'overview'
        elif 'Starting Position' in text:
            current_section = 'starting_position'
        elif 'Execution' in text:
            current_section = 'execution'
        elif 'Comments and Tips' in text or 'Tips' in text:
            current_section = 'tips'
        elif 'Benefits' in text:
            current_section = 'benefits'
        elif 'Muscles Worked' in text:
            current_section = 'muscles_worked'
        elif 'Equipment:' in text:
            equipment_text = text.replace('Equipment:', '').strip()
            sections['equipment'] = [e.strip() for e in equipment_text.split(',')]
        elif 'Primary Muscles:' in text:
            muscles_text = text.replace('Primary Muscles:', '').strip()
            sections['primary_muscles'] = [m.strip() for m in muscles_text.split(',')]
        elif current_section:
            if current_section == 'overview' and len(text) > 50:
                sections['overview'] += text + ' '
            elif current_section in ['starting_position', 'execution', 'tips', 'benefits']:
                if text[0] in ['-', '•', '–'] or elem.name == 'li':
                    sections[current_section].append(text.lstrip('-•– '))
            elif current_section == 'muscles_worked' and len(text) > 10:
                sections['muscles_worked'].append(text)

    # Extract media
    images = []
    gifs = []
    for img in soup.find_all('img'):
        src = img.get('src', '') or img.get('data-src', '')
        if src:
            full_url = urljoin(BASE_URL, src)
            if '.gif' in src:
                gifs.append(full_url)
            elif any(ext in src for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                images.append(full_url)

    # ===== NORMALIZATION & INFERENCE =====
    normalized_equipment = normalize_equipment(sections['equipment'])
    primary_muscles = normalize_muscle_groups(sections['primary_muscles'])
    secondary_muscles = normalize_muscle_groups(sections['muscles_worked'])

    # Remove overlap
    secondary_muscles = [m for m in secondary_muscles if m not in primary_muscles]

    difficulty = infer_difficulty(name, sections['overview'], normalized_equipment)
    exercise_type = infer_exercise_type(name, normalized_equipment, sections['overview'])
    movement_pattern = infer_movement_pattern(name, sections['starting_position'] + sections['execution'])
    exercise_class = infer_exercise_class(primary_muscles, secondary_muscles)
    training_goals = extract_training_goals(sections['benefits'])
    warnings, mistakes, clean_tips = extract_warnings_and_mistakes(sections['tips'])
    default_reps = calculate_default_reps(difficulty, exercise_type)

    # ===== BUILD SCHEMA OBJECT =====
    exercise = {
        # Identification
        'name': name,
        'slug': create_slug(name),

        # Categorization
        'primaryMuscleGroups': primary_muscles,
        'secondaryMuscleGroups': secondary_muscles,
        'equipment': normalized_equipment,

        # Difficulty & Type
        'difficulty': difficulty,
        'exerciseType': exercise_type,
        'movementPattern': movement_pattern,
        'exerciseClass': exercise_class,
        'trainingGoals': training_goals,

        # Content
        'description': sections['overview'].strip()[:500],
        'instructions': sections['starting_position'] + sections['execution'],

        # Media
        'media': {
            'thumbnail': gifs[0] if gifs else (images[0] if images else ''),
            'images': images,
            'videos': [],
            'gifs': gifs,
            'youtubeId': ''
        },

        # Metrics (defaults)
        'metrics': {
            'averageRating': 0,
            'totalRatings': 0,
            'popularityScore': 0,
            'usageCount': 0,
            'completionRate': 0,
            'averageDuration': 0
        },

        # Workout Parameters
        'defaultSets': 3,
        'defaultReps': default_reps,
        'defaultRestTime': 90 if difficulty == 'advanced' else 60,

        # Intensity Guidance
        'intensityGuidance': {
            'rpe': {
                'min': 6 if difficulty == 'beginner' else 7,
                'max': 8 if difficulty == 'beginner' else 9
            },
            'tempo': '3-0-1-0',  # Standard tempo
            'restRecommendation': {
                'strength': 180,
                'hypertrophy': 60,
                'endurance': 30
            }
        },

        # Safety
        'safety': {
            'warnings': warnings,
            'commonMistakes': mistakes,
            'tips': clean_tips,
            'contraindications': [],
            'requiredSkills': []
        },

        # Variations
        'variations': [],

        # Progression (empty - fill manually later)
        'progression': {
            'prerequisiteExercises': [],
            'nextLevelExercises': []
        },

        # Calories (estimate based on intensity)
        'calories': {
            'perMinute': 5 if exercise_type == 'cardio' else 3,
            'baseRate': 60,
            'met': 6.0 if difficulty == 'advanced' else 4.0
        },

        # Tags
        'tags': [muscle_group, difficulty, exercise_type] + primary_muscles,

        # Status
        'isActive': True,
        'isFeatured': False,
        'source': 'imported',

        # Original URL for reference
        '_sourceUrl': exercise_url
    }

    return exercise

def main():
    """Main scraping function"""
    all_exercises = []

    import os
    os.makedirs('exercise_data_schema', exist_ok=True)

    for muscle_group in MUSCLE_GROUPS:
        print(f"\n{'='*60}")
        print(f"Processing: {muscle_group.upper()}")
        print(f"{'='*60}")

        exercise_links = get_all_exercise_links(muscle_group)
        print(f"Found {len(exercise_links)} exercises\n")

        muscle_exercises = []
        for link in exercise_links:
            exercise_data = scrape_exercise_details(link, muscle_group)
            if exercise_data:
                all_exercises.append(exercise_data)
                muscle_exercises.append(exercise_data)
            time.sleep(0.5)

        # Save by muscle group
        with open(f'exercise_data_schema/{muscle_group}_exercises.json', 'w', encoding='utf-8') as f:
            json.dump(muscle_exercises, f, indent=2, ensure_ascii=False)

        print(f"\n✅ Saved {len(muscle_exercises)} {muscle_group} exercises")

    # Save all exercises
    with open('exercise_data_schema/all_exercises_schema.json', 'w', encoding='utf-8') as f:
        json.dump(all_exercises, f, indent=2, ensure_ascii=False)

    # Create summary
    summary = {
        'total_exercises': len(all_exercises),
        'by_difficulty': {},
        'by_type': {},
        'by_muscle_group': {},
        'equipment_coverage': {}
    }

    for ex in all_exercises:
        # Count by difficulty
        diff = ex['difficulty']
        summary['by_difficulty'][diff] = summary['by_difficulty'].get(diff, 0) + 1

        # Count by type
        ex_type = ex['exerciseType']
        summary['by_type'][ex_type] = summary['by_type'].get(ex_type, 0) + 1

        # Count equipment
        for eq in ex['equipment']:
            summary['equipment_coverage'][eq] = summary['equipment_coverage'].get(eq, 0) + 1

    with open('exercise_data_schema/summary.json', 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)

    print(f"\n{'='*60}")
    print(f"✅ SCRAPING COMPLETE!")
    print(f"{'='*60}")
    print(f"Total: {len(all_exercises)} exercises")
    print(f"\nSaved to: exercise_data_schema/")
    print(f"  - all_exercises_schema.json (ready for MongoDB)")
    print(f"  - [muscle]_exercises.json (by muscle group)")
    print(f"  - summary.json (statistics)")

if __name__ == '__main__':
    main()
