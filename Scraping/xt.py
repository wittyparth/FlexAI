import requests
from bs4 import BeautifulSoup
import json
import re

def slugify(text):
    """Convert text to URL-friendly slug"""
    return re.sub(r'[^\w\s-]', '', text.lower()).strip().replace(' ', '-')

def extract_exercise_details(url):
    """Extract ALL exercise details from individual exercise page"""
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract name
        name = ""
        h1 = soup.find('h1')
        if h1:
            name = h1.text.strip()
            name = re.sub(r'^How To Do (A |An )?', '', name, flags=re.I)
            name = name.replace(' (Visual Tutorial)', '').strip()
        
        # Extract primary and secondary muscles
        primary_muscles = []
        secondary_muscles = []
        
        # Method 1: From spec_group muscle_groups
        muscle_div = soup.find('div', class_='spec_group muscle_groups')
        if muscle_div:
            primary_section = muscle_div.find('div', class_='title', string='Primary:')
            if primary_section:
                primary_ul = primary_section.find_next_sibling('ul')
                if primary_ul:
                    for li in primary_ul.find_all('li'):
                        muscle = li.get_text().strip()
                        if muscle:
                            primary_muscles.append(muscle)
            
            secondary_section = muscle_div.find('div', class_='title', string='Secondary:')
            if secondary_section:
                secondary_ul = secondary_section.find_next_sibling('ul')
                if secondary_ul:
                    for li in secondary_ul.find_all('li'):
                        muscle = li.get_text().strip()
                        if muscle:
                            secondary_muscles.append(muscle)
        
        # Method 2: From progress bars (detailed muscles)
        detailed_muscles = []
        progress_bars = soup.find_all('div', class_='vc_progress_bar')
        for progress_bar in progress_bars:
            for bar in progress_bar.find_all('div', class_='vc_single_bar'):
                label = bar.find('small', class_='vc_label')
                if label:
                    muscle_name = label.get_text().strip()
                    if muscle_name and muscle_name not in detailed_muscles:
                        detailed_muscles.append(muscle_name)
        
        # Combine muscles intelligently
        if detailed_muscles:
            if len(detailed_muscles) <= 3:
                primary_muscles = detailed_muscles
            else:
                primary_muscles = detailed_muscles[:2]
                secondary_muscles.extend(detailed_muscles[2:])
        
        # Remove duplicates
        primary_muscles = list(dict.fromkeys(primary_muscles))
        secondary_muscles = list(dict.fromkeys(secondary_muscles))
        
        # Extract muscle diagram image
        muscle_diagram_url = ""
        for img_wrapper in soup.find_all('div', class_='wpb_single_image'):
            img = img_wrapper.find('img')
            if img and img.get('src'):
                src = img.get('src')
                alt = img.get('alt', '').lower()
                # Look for muscle diagram images
                if any(keyword in alt for keyword in ['muscle', 'worked', 'anatomy', 'target']):
                    muscle_diagram_url = src
                    break
        
        # Extract equipment
        equipment = []
        equip_div = soup.find('div', class_='spec_group equipment')
        if equip_div:
            equip_content = equip_div.find('div', class_='group-content')
            if equip_content:
                for li in equip_content.find_all('li'):
                    equip = li.get_text().strip()
                    if equip:
                        equipment.append(equip)
        
        if not equipment:
            equipment = ['Bodyweight']
        
        # Extract difficulty
        difficulty = "intermediate"
        difficulty_div = soup.find('div', class_='spec_group level')
        if difficulty_div:
            level_text = difficulty_div.get_text().lower()
            if 'beginner' in level_text:
                difficulty = "beginner"
            elif 'advanced' in level_text:
                difficulty = "advanced"
        
        # Extract exercise type
        exercise_type = "strength"
        type_div = soup.find('div', class_='spec_group type')
        if type_div:
            type_text = type_div.get_text().lower()
            if 'cardio' in type_text:
                exercise_type = "cardio"
            elif 'plyometric' in type_text:
                exercise_type = "plyometrics"
            elif 'strength' in type_text:
                exercise_type = "strength"
        
        # Extract description
        description = ""
        overview = soup.find(['h2', 'h3'], string=re.compile('Overview', re.I))
        if overview:
            desc_p = overview.find_next('p')
            if desc_p:
                description = desc_p.get_text().strip()
        
        # Extract instructions
        instructions = []
        seen_instructions = set()
        
        for heading in soup.find_all(['h2', 'h3', 'h4', 'strong']):
            heading_text = heading.get_text()
            if any(word in heading_text for word in ['How to', 'Starting Position', 'Execution', 'Repetitions', 'Perform']):
                next_elem = heading.find_next(['ul', 'ol'])
                if next_elem:
                    for li in next_elem.find_all('li'):
                        instruction = li.get_text().strip()
                        if instruction and instruction not in seen_instructions:
                            instructions.append(instruction)
                            seen_instructions.add(instruction)
        
        # Extract tips
        tips = []
        seen_tips = set()
        
        for heading in soup.find_all(['h2', 'h3', 'h4']):
            heading_text = heading.get_text()
            if any(word in heading_text for word in ['Tips', 'Comments', 'Form Tip', 'Safety']):
                next_list = heading.find_next(['ul', 'ol'])
                if next_list:
                    for li in next_list.find_all('li'):
                        tip = li.get_text().strip()
                        if tip and tip not in seen_tips:
                            tips.append(tip)
                            seen_tips.add(tip)
        
        # Extract common mistakes
        common_mistakes = []
        seen_mistakes = set()
        
        for heading in soup.find_all(['h2', 'h3', 'h4']):
            heading_text = heading.get_text()
            if any(word in heading_text for word in ['Mistake', 'Avoid', 'Error', 'Wrong', 'Don\'t']):
                next_elem = heading.find_next(['ul', 'ol', 'p'])
                if next_elem:
                    if next_elem.name in ['ul', 'ol']:
                        for li in next_elem.find_all('li'):
                            mistake = li.get_text().strip()
                            if mistake and mistake not in seen_mistakes:
                                common_mistakes.append(mistake)
                                seen_mistakes.add(mistake)
                    elif next_elem.name == 'p':
                        mistake = next_elem.get_text().strip()
                        if mistake and mistake not in seen_mistakes:
                            common_mistakes.append(mistake)
                            seen_mistakes.add(mistake)
        
        # Extract benefits
        benefits = []
        for heading in soup.find_all(['h2', 'h3', 'h4']):
            if any(word in heading.get_text() for word in ['Benefit', 'Advantage']):
                next_list = heading.find_next(['ul', 'ol'])
                if next_list:
                    for li in next_list.find_all('li'):
                        benefit = li.get_text().strip()
                        if ':' in benefit:
                            benefit = benefit.split(':')[0].strip()
                        if benefit:
                            benefits.append(benefit)
        
        # Extract variations
        variations = []
        for heading in soup.find_all(['h2', 'h3', 'h4']):
            if any(word in heading.get_text() for word in ['Variation', 'Alternative']):
                next_list = heading.find_next(['ul', 'ol'])
                if next_list:
                    for li in next_list.find_all('li'):
                        variation = li.get_text().strip()
                        if variation:
                            variations.append(variation)
        
        # Extract media
        gifs = []
        images = []
        youtube_id = ""
        
        for img in soup.find_all('img'):
            src = img.get('src', '')
            if src and 'logo' not in src.lower():
                if src.endswith('.gif'):
                    if src not in gifs:
                        gifs.append(src)
                else:
                    if src not in images:
                        images.append(src)
        
        iframe = soup.find('iframe', src=re.compile('youtube'))
        if iframe:
            youtube_match = re.search(r'embed/([a-zA-Z0-9_-]+)', iframe.get('src', ''))
            if youtube_match:
                youtube_id = youtube_match.group(1)
        
        thumbnail = gifs[0] if gifs else (images[0] if images else "")
        
        # Determine characteristics
        exercise_class = "compound"
        movement_pattern = "compound"
        training_goals = ["strength", "hypertrophy"]
        
        if exercise_type == "plyometrics":
            training_goals = ["power", "explosiveness"]
        elif exercise_type == "cardio":
            training_goals = ["endurance", "conditioning"]
        
        if len(primary_muscles) == 1 or 'isolation' in soup.get_text().lower():
            exercise_class = "isolation"
            movement_pattern = "isolation"
        
        # Build final JSON
        exercise_data = {
            "name": name,
            "slug": slugify(name),
            "primaryMuscleGroups": primary_muscles,
            "secondaryMuscleGroups": secondary_muscles,
            "equipment": equipment,
            "difficulty": difficulty,
            "exerciseType": exercise_type,
            "movementPattern": movement_pattern,
            "exerciseClass": exercise_class,
            "trainingGoals": training_goals,
            "description": description,
            "instructions": instructions,
            "benefits": benefits,
            "media": {
                "thumbnail": thumbnail,
                "images": images[:5],
                "videos": [],
                "gifs": gifs,
                "youtubeId": youtube_id,
                "muscleDiagram": muscle_diagram_url
            },
            "metrics": {
                "averageRating": 0,
                "totalRatings": 0,
                "popularityScore": 0,
                "usageCount": 0,
                "completionRate": 0,
                "averageDuration": 0
            },
            "defaultSets": 3,
            "defaultReps": {
                "min": 8,
                "max": 12,
                "target": 10
            },
            "defaultRestTime": 60,
            "intensityGuidance": {
                "rpe": {
                    "min": 6,
                    "max": 8
                },
                "tempo": "3-0-1-0",
                "restRecommendation": {
                    "strength": 180,
                    "hypertrophy": 60,
                    "endurance": 30
                }
            },
            "safety": {
                "warnings": [],
                "commonMistakes": common_mistakes,
                "tips": tips,
                "contraindications": [],
                "requiredSkills": []
            },
            "variations": variations,
            "progression": {
                "prerequisiteExercises": [],
                "nextLevelExercises": []
            },
            "calories": {
                "perMinute": 5 if exercise_type in ["cardio", "plyometrics"] else 3,
                "baseRate": 60,
                "met": 6.0 if exercise_type in ["cardio", "plyometrics"] else 4.0
            },
            "tags": [primary_muscles[0].lower() if primary_muscles else "full-body", difficulty, exercise_type],
            "isActive": True,
            "isFeatured": False,
            "source": "imported",
            "_sourceUrl": url
        }
        
        return exercise_data
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None

# TEST with neck exercise
test_url = "https://fitnessprogramer.com/exercise/lying-weighted-lateral-neck-flexion/"
print(f"🧪 Testing: {test_url}\n")

result = extract_exercise_details(test_url)

if result:
    # Save to file
    with open('test_exercise_complete.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    # Pretty print results
    print("✅ EXTRACTION SUCCESSFUL!\n")
    print(f"📝 Name: {result['name']}")
    print(f"🎯 Slug: {result['slug']}")
    print(f"\n💪 Primary Muscles: {result['primaryMuscleGroups']}")
    print(f"💪 Secondary Muscles ({len(result['secondaryMuscleGroups'])}): {result['secondaryMuscleGroups']}")
    print(f"\n🏋️ Equipment: {result['equipment']}")
    print(f"📊 Difficulty: {result['difficulty']}")
    print(f"🏃 Type: {result['exerciseType']}")
    print(f"\n📖 Description: {result['description'][:100]}...")
    print(f"\n📋 Instructions: {len(result['instructions'])} steps")
    print(f"💡 Tips: {len(result['safety']['tips'])} tips")
    print(f"⚠️  Common Mistakes: {len(result['safety']['commonMistakes'])} found")
    print(f"✨ Benefits: {len(result['benefits'])} listed")
    print(f"🔄 Variations: {len(result['variations'])} alternatives")
    print(f"\n🎬 Media:")
    print(f"   - GIFs: {len(result['media']['gifs'])}")
    print(f"   - Images: {len(result['media']['images'])}")
    print(f"   - Muscle Diagram: {'✓' if result['media']['muscleDiagram'] else '✗'}")
    if result['media']['muscleDiagram']:
        print(f"     URL: {result['media']['muscleDiagram']}")
    
    print(f"\n💾 Saved to: test_exercise_complete.json")
    print(f"\n📄 Full JSON preview:")
    print(json.dumps(result, indent=2)[:500] + "...")
else:
    print("❌ EXTRACTION FAILED")
