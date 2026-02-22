import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed exercises from JSON in batches...');
  
  const jsonPath = path.join(__dirname, '../fitnessprogramer_exercises_complete.json');
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const exercises = JSON.parse(rawData);
  
  console.log(`Found ${exercises.length} exercises in the JSON file.`);
  
  // First, get all existing slugs to avoid duplicates (createMany doesn't have upsert)
  const existingExercises = await prisma.exercise.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existingExercises.map(e => e.slug));
  
  const newExercises = exercises.filter((ex: any) => !existingSlugs.has(ex.slug));
  console.log(`${existingSlugs.size} exercises already exist. ${newExercises.length} new exercises to insert.`);

  if (newExercises.length === 0) {
    console.log('Nothing to insert. Exiting.');
    return;
  }

  // Format the data for createMany
  const formattedData = newExercises.map((ex: any) => ({
    name: ex.name,
    slug: ex.slug,
    description: ex.description,
    instructions: ex.instructions || [],
    benefits: ex.benefits || [],
    primaryMuscleGroups: ex.primaryMuscleGroups || [],
    secondaryMuscleGroups: ex.secondaryMuscleGroups || [],
    equipment: ex.equipment || [],
    difficulty: ex.difficulty || 'intermediate',
    exerciseType: ex.exerciseType || 'strength',
    movementPattern: ex.movementPattern || null,
    exerciseClass: ex.exerciseClass || null,
    trainingGoals: ex.trainingGoals || [],
    media: ex.media || {},
    metrics: ex.metrics || {},
    defaultSets: ex.defaultSets || 3,
    defaultReps: ex.defaultReps || null,
    defaultRestTime: ex.defaultRestTime || 60,
    intensityGuidance: ex.intensityGuidance || null,
    safety: ex.safety || null,
    variations: ex.variations || [],
    progression: ex.progression || null,
    calories: ex.calories || null,
    tags: ex.tags || [],
    isActive: ex.isActive ?? true,
    isFeatured: ex.isFeatured ?? false,
    source: ex.source || 'imported',
    sourceUrl: ex._sourceUrl || null,
    isCustom: false,
    isPublic: true,
  }));

  try {
    const result = await prisma.exercise.createMany({
      data: formattedData,
      skipDuplicates: true, // Safety fallback
    });
    console.log(`Successfully inserted ${result.count} exercises in bulk!`);
  } catch (error) {
    console.error(`Failed during bulk insertion`);
    console.error(error);
  }

  console.log(`Seeding complete!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
