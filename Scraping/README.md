# Fitness Programer Exercise Scraper

Scrapes all exercises from fitnessprogramer.com including:
- Exercise names and descriptions
- Step-by-step instructions
- Benefits and tips
- Muscles worked
- Equipment needed
- Images and GIFs

## Quick Start

### 1. Install dependencies
```bash
pip install requests beautifulsoup4
```

### 2. Run the scraper
```bash
# Without downloading images (faster)
python scrape_exercises.py

# With image/GIF downloads
python scrape_exercises.py --download-images
```

### 3. Check the output
All data will be saved in the `exercise_data/` folder:
- `all_exercises.json` - Complete database with all exercises
- `[muscle_group]_exercises.json` - Exercises grouped by muscle
- `summary.json` - Statistics about the scraping
- `images/` - Downloaded media (if enabled)

## Output Format

Each exercise is saved as JSON with this structure:

```json
{
  "url": "https://fitnessprogramer.com/exercise/lying-weighted-lateral-neck-flexion/",
  "name": "Weighted Lateral Neck Flexion",
  "slug": "lying-weighted-lateral-neck-flexion",
  "muscle_group": "neck",
  "overview": "Description of the exercise...",
  "instructions": {
    "starting_position": ["Step 1", "Step 2"],
    "execution": ["Step 1", "Step 2"],
    "repetitions": ["Repeat instructions"]
  },
  "tips": ["Tip 1", "Tip 2"],
  "benefits": ["Benefit 1", "Benefit 2"],
  "muscles_worked": ["Sternocleidomastoid", "Scalene Muscles"],
  "equipment": ["Head Harness", "Weight Plate", "Incline Bench"],
  "primary_muscles": ["Neck"],
  "images": ["https://..."],
  "gifs": ["https://..."]
}
```

## Muscle Groups Covered

The scraper fetches exercises for all 15 muscle groups:
- Neck
- Trapezius
- Shoulder
- Chest
- Back/Wing
- Erector Spinae
- Biceps
- Triceps
- Forearm
- Abs/Core
- Leg
- Calf
- Hips
- Cardio
- Full Body

## Estimated Time

- Without images: ~15-20 minutes
- With images: ~30-45 minutes (depends on internet speed)

## Requirements

- Python 3.6+
- requests
- beautifulsoup4

## Notes

- The script includes delays between requests to be respectful to the server
- Progress is saved after each muscle group
- If interrupted, you can resume by commenting out completed muscle groups
- Images/GIFs are saved with exercise slugs as filenames

## Troubleshooting

**Script stops or times out?**
- Check your internet connection
- The site might be temporarily down
- Try increasing the timeout in the code (line: `timeout=10`)

**Missing data for some exercises?**
- The HTML structure might vary between exercises
- Check the exercise URL manually
- Some exercises might have different formatting

**Want to scrape specific muscle groups only?**
Edit the `MUSCLE_GROUPS` list in the script to include only what you need.

## License

MIT License - Free to use and modify
