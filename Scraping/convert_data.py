#!/usr/bin/env python3
import json
import csv
import sqlite3
from pathlib import Path

def json_to_csv(json_file='exercise_data/all_exercises.json', csv_file='exercises.csv'):
    print(f"Converting {json_file} to {csv_file}...")

    with open(json_file, 'r', encoding='utf-8') as f:
        exercises = json.load(f)

    flattened = []
    for ex in exercises:
        row = {
            'name': ex.get('name', ''),
            'url': ex.get('url', ''),
            'muscle_group': ex.get('muscle_group', ''),
            'overview': ex.get('overview', ''),
            'equipment': ', '.join(ex.get('equipment', [])),
            'primary_muscles': ', '.join(ex.get('primary_muscles', [])),
            'tips': ' | '.join(ex.get('tips', [])),
            'image_count': len(ex.get('images', [])),
            'gif_count': len(ex.get('gifs', [])),
            'first_gif': ex.get('gifs', [''])[0] if ex.get('gifs') else '',
        }
        flattened.append(row)

    if flattened:
        with open(csv_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=flattened[0].keys())
            writer.writeheader()
            writer.writerows(flattened)

        print(f"✅ Created {csv_file} with {len(flattened)} exercises")

def json_to_sqlite(json_file='exercise_data/all_exercises.json', db_file='exercises.db'):
    print(f"Converting {json_file} to {db_file}...")

    with open(json_file, 'r', encoding='utf-8') as f:
        exercises = json.load(f)

    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    cursor.execute('''CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT, slug TEXT, url TEXT, muscle_group TEXT,
        overview TEXT, equipment TEXT, primary_muscles TEXT
    )''')

    cursor.execute('''CREATE TABLE IF NOT EXISTS media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_id INTEGER, type TEXT, url TEXT
    )''')

    for ex in exercises:
        cursor.execute('''INSERT INTO exercises 
            (name, slug, url, muscle_group, overview, equipment, primary_muscles)
            VALUES (?, ?, ?, ?, ?, ?, ?)''', (
            ex.get('name', ''), ex.get('slug', ''), ex.get('url', ''),
            ex.get('muscle_group', ''), ex.get('overview', ''),
            ', '.join(ex.get('equipment', [])),
            ', '.join(ex.get('primary_muscles', []))
        ))

        exercise_id = cursor.lastrowid

        for img_url in ex.get('images', []):
            cursor.execute('INSERT INTO media (exercise_id, type, url) VALUES (?, ?, ?)',
                         (exercise_id, 'image', img_url))

        for gif_url in ex.get('gifs', []):
            cursor.execute('INSERT INTO media (exercise_id, type, url) VALUES (?, ?, ?)',
                         (exercise_id, 'gif', gif_url))

    conn.commit()
    cursor.execute('SELECT COUNT(*) FROM exercises')
    print(f"✅ Created {db_file} with {cursor.fetchone()[0]} exercises")
    conn.close()

if __name__ == '__main__':
    if not Path('exercise_data/all_exercises.json').exists():
        print("❌ Error: Run scrape_exercises.py first!")
        exit(1)

    print("Converting data...\n")
    json_to_csv()
    json_to_sqlite()
    print("\n✅ Done! Created exercises.csv and exercises.db")
