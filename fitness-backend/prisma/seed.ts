import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, type Exercise } from '@prisma/client';

const prisma = new PrismaClient();
const SEED_TAG = '[seed-v1]';
const SEED_PASSWORD = 'Password123!';
const SALT_ROUNDS = 12;

type TemplateExerciseSeed = {
  orderIndex: number;
  dayOfWeek?: number;
  preferredSlugs: string[];
  fallbackMuscleGroup?: string;
  targetSets: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
  restSeconds?: number;
};

type TemplateSeed = {
  name: string;
  description: string;
  goal: string;
  difficulty: string;
  splitType: string;
  daysPerWeek: number;
  estimatedDuration: number;
  exercises: TemplateExerciseSeed[];
};

type WorkoutSetSeed = {
  setNumber: number;
  weight?: number;
  reps?: number;
  setType?: string;
};

type WorkoutExerciseSeed = {
  orderIndex: number;
  preferredSlugs: string[];
  fallbackMuscleGroup?: string;
  sets: WorkoutSetSeed[];
};

type WorkoutSeed = {
  name: string;
  notes: string;
  startedAt: Date;
  completedAt: Date;
  exercises: WorkoutExerciseSeed[];
};

const templateSeeds: TemplateSeed[] = [
  {
    name: `${SEED_TAG} Push Strength Template`,
    description: 'Upper push focus for chest, shoulders, and triceps.',
    goal: 'strength',
    difficulty: 'intermediate',
    splitType: 'ppl',
    daysPerWeek: 3,
    estimatedDuration: 60,
    exercises: [
      {
        orderIndex: 0,
        dayOfWeek: 0,
        preferredSlugs: ['barbell-bench-press', 'bench-press'],
        fallbackMuscleGroup: 'chest',
        targetSets: 4,
        targetRepsMin: 5,
        targetRepsMax: 8,
        restSeconds: 150,
      },
      {
        orderIndex: 1,
        dayOfWeek: 0,
        preferredSlugs: ['overhead-press', 'standing-overhead-press'],
        fallbackMuscleGroup: 'shoulders',
        targetSets: 4,
        targetRepsMin: 6,
        targetRepsMax: 10,
        restSeconds: 120,
      },
      {
        orderIndex: 2,
        dayOfWeek: 0,
        preferredSlugs: ['incline-dumbbell-press'],
        fallbackMuscleGroup: 'chest',
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 12,
        restSeconds: 90,
      },
      {
        orderIndex: 3,
        dayOfWeek: 0,
        preferredSlugs: ['lateral-raise', 'dumbbell-lateral-raise'],
        fallbackMuscleGroup: 'shoulders',
        targetSets: 3,
        targetRepsMin: 12,
        targetRepsMax: 15,
        restSeconds: 60,
      },
      {
        orderIndex: 4,
        dayOfWeek: 0,
        preferredSlugs: ['triceps-pushdown', 'rope-triceps-pushdown'],
        fallbackMuscleGroup: 'triceps',
        targetSets: 3,
        targetRepsMin: 10,
        targetRepsMax: 15,
        restSeconds: 60,
      },
    ],
  },
  {
    name: `${SEED_TAG} Full Body Fundamentals`,
    description: 'Balanced full-body template for beginner/intermediate trainees.',
    goal: 'general',
    difficulty: 'beginner',
    splitType: 'full_body',
    daysPerWeek: 3,
    estimatedDuration: 50,
    exercises: [
      {
        orderIndex: 0,
        dayOfWeek: 0,
        preferredSlugs: ['back-squat', 'barbell-back-squat', 'squat'],
        fallbackMuscleGroup: 'quadriceps',
        targetSets: 3,
        targetRepsMin: 5,
        targetRepsMax: 8,
        restSeconds: 150,
      },
      {
        orderIndex: 1,
        dayOfWeek: 0,
        preferredSlugs: ['romanian-deadlift', 'deadlift'],
        fallbackMuscleGroup: 'hamstrings',
        targetSets: 3,
        targetRepsMin: 6,
        targetRepsMax: 10,
        restSeconds: 120,
      },
      {
        orderIndex: 2,
        dayOfWeek: 0,
        preferredSlugs: ['bench-press', 'barbell-bench-press'],
        fallbackMuscleGroup: 'chest',
        targetSets: 3,
        targetRepsMin: 6,
        targetRepsMax: 10,
        restSeconds: 120,
      },
      {
        orderIndex: 3,
        dayOfWeek: 0,
        preferredSlugs: ['barbell-row', 'bent-over-row', 'seated-cable-row'],
        fallbackMuscleGroup: 'back',
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 12,
        restSeconds: 90,
      },
      {
        orderIndex: 4,
        dayOfWeek: 0,
        preferredSlugs: ['plank', 'hanging-leg-raise'],
        fallbackMuscleGroup: 'core',
        targetSets: 3,
        targetRepsMin: 12,
        targetRepsMax: 20,
        restSeconds: 45,
      },
    ],
  },
];

const workoutSeeds: WorkoutSeed[] = [
  {
    name: `${SEED_TAG} Sample Push Workout`,
    notes: 'Seeded completed workout for analytics/social development.',
    startedAt: new Date('2026-02-10T06:30:00.000Z'),
    completedAt: new Date('2026-02-10T07:22:00.000Z'),
    exercises: [
      {
        orderIndex: 0,
        preferredSlugs: ['bench-press', 'barbell-bench-press'],
        fallbackMuscleGroup: 'chest',
        sets: [
          { setNumber: 1, weight: 60, reps: 8 },
          { setNumber: 2, weight: 65, reps: 8 },
          { setNumber: 3, weight: 67.5, reps: 6 },
        ],
      },
      {
        orderIndex: 1,
        preferredSlugs: ['overhead-press', 'standing-overhead-press'],
        fallbackMuscleGroup: 'shoulders',
        sets: [
          { setNumber: 1, weight: 35, reps: 10 },
          { setNumber: 2, weight: 37.5, reps: 8 },
          { setNumber: 3, weight: 40, reps: 6 },
        ],
      },
    ],
  },
  {
    name: `${SEED_TAG} Sample Full Body Workout`,
    notes: 'Seeded full-body session to validate history and volume analytics.',
    startedAt: new Date('2026-02-13T06:15:00.000Z'),
    completedAt: new Date('2026-02-13T07:08:00.000Z'),
    exercises: [
      {
        orderIndex: 0,
        preferredSlugs: ['back-squat', 'barbell-back-squat', 'squat'],
        fallbackMuscleGroup: 'quadriceps',
        sets: [
          { setNumber: 1, weight: 70, reps: 8 },
          { setNumber: 2, weight: 75, reps: 6 },
          { setNumber: 3, weight: 75, reps: 6 },
        ],
      },
      {
        orderIndex: 1,
        preferredSlugs: ['barbell-row', 'bent-over-row', 'seated-cable-row'],
        fallbackMuscleGroup: 'back',
        sets: [
          { setNumber: 1, weight: 50, reps: 10 },
          { setNumber: 2, weight: 55, reps: 8 },
          { setNumber: 3, weight: 55, reps: 8 },
        ],
      },
    ],
  },
];

function resolveExercise(
  exercises: Exercise[],
  preferredSlugs: string[],
  fallbackMuscleGroup?: string
): Exercise | null {
  const bySlug = preferredSlugs
    .map((slug) => exercises.find((exercise) => exercise.slug === slug))
    .find(Boolean);
  if (bySlug) {
    return bySlug;
  }

  if (fallbackMuscleGroup) {
    const normalized = fallbackMuscleGroup.toLowerCase();
    return (
      exercises.find((exercise) =>
        exercise.primaryMuscleGroups.some(
          (group) => group.toLowerCase() === normalized || group.toLowerCase().includes(normalized)
        )
      ) ?? null
    );
  }

  return null;
}

function summarizeWorkout(workout: WorkoutExerciseSeed[]) {
  let totalSets = 0;
  let totalReps = 0;
  let totalVolume = 0;

  for (const exercise of workout) {
    for (const set of exercise.sets) {
      totalSets += 1;
      totalReps += set.reps ?? 0;
      totalVolume += (set.weight ?? 0) * (set.reps ?? 0);
    }
  }

  return { totalSets, totalReps, totalVolume };
}

async function ensureSeedUser(email: string, firstName: string, lastName: string) {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

  return prisma.user.upsert({
    where: { email },
    update: {
      firstName,
      lastName,
      isActive: true,
      emailVerified: true,
      onboardingCompleted: true,
    },
    create: {
      email,
      passwordHash,
      firstName,
      lastName,
      emailVerified: true,
      onboardingCompleted: true,
      settings: { create: {} },
    },
  });
}

async function seedTemplates(templateOwnerId: number, allExercises: Exercise[]) {
  for (const template of templateSeeds) {
    const routineExerciseCreates = template.exercises
      .map((exerciseSeed) => {
        const exercise = resolveExercise(
          allExercises,
          exerciseSeed.preferredSlugs,
          exerciseSeed.fallbackMuscleGroup
        );

        if (!exercise) {
          console.warn(
            `Skipping template exercise for "${template.name}" - no matching exercise for slugs: ${exerciseSeed.preferredSlugs.join(', ')}`
          );
          return null;
        }

        return {
          exerciseId: exercise.id,
          orderIndex: exerciseSeed.orderIndex,
          dayOfWeek: exerciseSeed.dayOfWeek,
          targetSets: exerciseSeed.targetSets,
          targetRepsMin: exerciseSeed.targetRepsMin,
          targetRepsMax: exerciseSeed.targetRepsMax,
          restSeconds: exerciseSeed.restSeconds ?? 90,
        };
      })
      .filter((value): value is NonNullable<typeof value> => Boolean(value));

    if (!routineExerciseCreates.length) {
      console.warn(`Skipping template "${template.name}" - no exercises were resolved.`);
      continue;
    }

    await prisma.routine.deleteMany({
      where: {
        userId: templateOwnerId,
        name: template.name,
        isTemplate: true,
      },
    });

    await prisma.routine.create({
      data: {
        userId: templateOwnerId,
        name: template.name,
        description: template.description,
        goal: template.goal,
        difficulty: template.difficulty,
        splitType: template.splitType,
        daysPerWeek: template.daysPerWeek,
        estimatedDuration: template.estimatedDuration,
        isPublic: true,
        isTemplate: true,
        exercises: {
          create: routineExerciseCreates,
        },
      },
    });
  }
}

async function seedSampleWorkouts(userId: number, allExercises: Exercise[]) {
  for (const workoutSeed of workoutSeeds) {
    const exerciseCreates = workoutSeed.exercises
      .map((exerciseSeed) => {
        const exercise = resolveExercise(
          allExercises,
          exerciseSeed.preferredSlugs,
          exerciseSeed.fallbackMuscleGroup
        );

        if (!exercise) {
          console.warn(
            `Skipping workout exercise for "${workoutSeed.name}" - no match for slugs: ${exerciseSeed.preferredSlugs.join(', ')}`
          );
          return null;
        }

        return {
          exerciseId: exercise.id,
          orderIndex: exerciseSeed.orderIndex,
          sets: {
            create: exerciseSeed.sets.map((set) => ({
              setNumber: set.setNumber,
              weight: set.weight,
              reps: set.reps,
              completed: true,
              setType: set.setType ?? 'working',
            })),
          },
        };
      })
      .filter((value): value is NonNullable<typeof value> => Boolean(value));

    if (!exerciseCreates.length) {
      console.warn(`Skipping workout "${workoutSeed.name}" - no exercises were resolved.`);
      continue;
    }

    const summary = summarizeWorkout(workoutSeed.exercises);
    const durationMinutes = Math.max(
      1,
      Math.round((workoutSeed.completedAt.getTime() - workoutSeed.startedAt.getTime()) / 60000)
    );

    await prisma.workout.deleteMany({
      where: {
        userId,
        name: workoutSeed.name,
      },
    });

    await prisma.workout.create({
      data: {
        userId,
        name: workoutSeed.name,
        notes: workoutSeed.notes,
        status: 'completed',
        startedAt: workoutSeed.startedAt,
        completedAt: workoutSeed.completedAt,
        duration: durationMinutes,
        totalSets: summary.totalSets,
        totalReps: summary.totalReps,
        totalVolume: summary.totalVolume,
        exercises: {
          create: exerciseCreates,
        },
      },
    });
  }
}

async function main() {
  const [templateOwner, workoutOwner] = await Promise.all([
    ensureSeedUser('seed.templates@flexai.dev', 'Template', 'Owner'),
    ensureSeedUser('seed.workouts@flexai.dev', 'Workout', 'Owner'),
  ]);

  const exercises = await prisma.exercise.findMany({
    where: { isActive: true },
  });

  if (!exercises.length) {
    throw new Error(
      'No active exercises found. Seed exercises first, then run `npm run db:seed` again.'
    );
  }

  await seedTemplates(templateOwner.id, exercises);
  await seedSampleWorkouts(workoutOwner.id, exercises);

  console.log('Seed completed.');
  console.log(`Template owner email: ${templateOwner.email}`);
  console.log(`Workout owner email: ${workoutOwner.email}`);
  console.log(`Seed password: ${SEED_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
