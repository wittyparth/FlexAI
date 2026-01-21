import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import type {
  GetExercisesQuery,
  CreateExerciseInput,
  UpdateExerciseInput,
} from '../schemas/exercise.schema';

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Exercise Service - handles exercise library business logic
 */
export const exerciseService = {
  /**
   * Get paginated exercises with filters
   */
  async getExercises(query: GetExercisesQuery) {
    const {
      page,
      limit,
      muscleGroup,
      equipment,
      difficulty,
      exerciseType,
      exerciseClass,
      trainingGoal,
      hasFormCheck,
      isFeatured,
      search,
      sortBy,
      sortOrder,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause dynamically
    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (muscleGroup) {
      where.primaryMuscleGroups = { has: muscleGroup };
    }

    if (equipment) {
      where.equipment = { has: equipment };
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (exerciseType) {
      where.exerciseType = exerciseType;
    }

    if (exerciseClass) {
      where.exerciseClass = exerciseClass;
    }

    if (trainingGoal) {
      where.trainingGoals = { has: trainingGoal };
    }

    if (hasFormCheck !== undefined) {
      where.hasFormCheck = hasFormCheck;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    // Build order by
    const orderBy: Record<string, string> = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'difficulty') {
      orderBy.difficulty = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    }

    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          primaryMuscleGroups: true,
          secondaryMuscleGroups: true,
          equipment: true,
          difficulty: true,
          exerciseType: true,
          exerciseClass: true,
          movementPattern: true,
          trainingGoals: true,
          media: true,
          defaultSets: true,
          defaultReps: true,
          hasFormCheck: true,
          isFeatured: true,
          tags: true,
        },
      }),
      prisma.exercise.count({ where }),
    ]);

    return {
      exercises,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get exercise by ID
   */
  async getExerciseById(id: number) {
    const exercise = await prisma.exercise.findUnique({
      where: { id, isActive: true },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise');
    }

    return exercise;
  },

  /**
   * Get exercise by slug
   */
  async getExerciseBySlug(slug: string) {
    const exercise = await prisma.exercise.findUnique({
      where: { slug, isActive: true },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise');
    }

    return exercise;
  },

  /**
   * Search exercises (full-text)
   */
  async searchExercises(searchTerm: string, limit = 20) {
    const exercises = await prisma.exercise.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { tags: { has: searchTerm.toLowerCase() } },
        ],
      },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        primaryMuscleGroups: true,
        equipment: true,
        difficulty: true,
        media: true,
      },
    });

    return exercises;
  },

  /**
   * Create custom exercise (user-created)
   */
  async createExercise(userId: number, input: CreateExerciseInput) {
    const slug = input.slug || generateSlug(input.name);
    
    const exercise = await prisma.exercise.create({
      data: {
        ...input,
        slug,
        createdById: userId,
        isCustom: true,
        source: 'custom',
      },
    });

    return exercise;
  },

  /**
   * Update custom exercise
   */
  async updateExercise(userId: number, exerciseId: number, input: UpdateExerciseInput) {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise');
    }

    // Only creator can update custom exercises
    if (exercise.isCustom && exercise.createdById !== userId) {
      throw new ForbiddenError('You can only update your own custom exercises');
    }

    // Non-custom exercises cannot be updated by users
    if (!exercise.isCustom) {
      throw new ForbiddenError('Cannot update built-in exercises');
    }

    // Regenerate slug if name changed
    const updateData: Record<string, unknown> = { ...input };
    if (input.name && input.name !== exercise.name) {
      updateData.slug = generateSlug(input.name);
    }

    const updated = await prisma.exercise.update({
      where: { id: exerciseId },
      data: updateData,
    });

    return updated;
  },

  /**
   * Delete custom exercise (soft delete)
   */
  async deleteExercise(userId: number, exerciseId: number) {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise');
    }

    if (!exercise.isCustom) {
      throw new ForbiddenError('Cannot delete built-in exercises');
    }

    if (exercise.createdById !== userId) {
      throw new ForbiddenError('You can only delete your own custom exercises');
    }

    await prisma.exercise.update({
      where: { id: exerciseId },
      data: { isActive: false },
    });

    return { message: 'Exercise deleted successfully' };
  },

  /**
   * Get muscle groups (for filter options)
   */
  async getMuscleGroups() {
    const exercises = await prisma.exercise.findMany({
      where: { isActive: true },
      select: { primaryMuscleGroups: true },
    });

    const muscleGroupSet = new Set<string>();
    exercises.forEach((e: { primaryMuscleGroups: string[] }) => {
      e.primaryMuscleGroups.forEach((m: string) => muscleGroupSet.add(m));
    });

    return Array.from(muscleGroupSet).sort();
  },

  /**
   * Get equipment list (for filter options)
   */
  async getEquipmentList() {
    const exercises = await prisma.exercise.findMany({
      where: { isActive: true },
      select: { equipment: true },
    });

    const equipmentSet = new Set<string>();
    exercises.forEach((e: { equipment: string[] }) => {
      e.equipment.forEach((eq: string) => equipmentSet.add(eq));
    });

    return Array.from(equipmentSet).sort();
  },

  /**
   * Get exercise types (for filter options)
   */
  async getExerciseTypes() {
    const exercises = await prisma.exercise.findMany({
      where: { isActive: true },
      distinct: ['exerciseType'],
      select: { exerciseType: true },
    });

    return exercises.map((e: { exerciseType: string }) => e.exerciseType);
  },

  /**
   * Get training goals (for filter options)
   */
  async getTrainingGoals() {
    const exercises = await prisma.exercise.findMany({
      where: { isActive: true },
      select: { trainingGoals: true },
    });

    const goalsSet = new Set<string>();
    exercises.forEach((e: { trainingGoals: string[] }) => {
      e.trainingGoals.forEach((g: string) => goalsSet.add(g));
    });

    return Array.from(goalsSet).sort();
  },

  /**
   * Get featured exercises
   */
  async getFeaturedExercises(limit = 10) {
    const exercises = await prisma.exercise.findMany({
      where: { isActive: true, isFeatured: true },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        primaryMuscleGroups: true,
        difficulty: true,
        media: true,
      },
    });

    return exercises;
  },
};
