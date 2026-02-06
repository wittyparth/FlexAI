import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import type {
  CreateRoutineInput,
  UpdateRoutineInput,
  GetRoutinesQuery,
  AddExerciseToRoutineInput,
  UpdateRoutineExerciseInput,
  ReorderExercisesInput,
  GetPublicRoutinesQuery,
} from '../schemas/routine.schema';

/**
 * Routine Service - handles routine management business logic
 */
export const routineService = {
  /**
   * Create a new routine
   */
  async createRoutine(userId: number, input: CreateRoutineInput) {
    const routine = await prisma.routine.create({
      data: {
        userId,
        name: input.name,
        description: input.description,
        daysPerWeek: input.daysPerWeek,
        schedule: input.schedule,
        estimatedDuration: input.estimatedDuration,
        goal: input.goal,
        difficulty: input.difficulty,
        splitType: input.splitType,
        isPublic: input.isPublic ?? false,
      },
      include: {
        exercises: {
          include: {
            exercise: {
              select: { id: true, name: true, slug: true, primaryMuscleGroups: true },
            },
          },
          orderBy: [{ dayOfWeek: 'asc' }, { orderIndex: 'asc' }],
        },
      },
    });

    return routine;
  },

  /**
   * Get user's routines with filters
   */
  async getRoutines(userId: number, query: GetRoutinesQuery) {
    const { page, limit, goal, difficulty, splitType, isTemplate, isArchived, search } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };

    if (goal) where.goal = goal;
    if (difficulty) where.difficulty = difficulty;
    if (splitType) where.splitType = splitType;
    if (isTemplate !== undefined) where.isTemplate = isTemplate;
    if (isArchived !== undefined) where.isArchived = isArchived;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [routines, total] = await Promise.all([
      prisma.routine.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          exercises: {
            include: {
              exercise: {
                select: { id: true, name: true, slug: true },
              },
            },
            orderBy: [{ dayOfWeek: 'asc' }, { orderIndex: 'asc' }],
          },
          _count: {
            select: { workouts: true },
          },
        },
      }),
      prisma.routine.count({ where }),
    ]);

    return {
      routines,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get routine by ID
   */
  async getRoutineById(userId: number, routineId: number) {
    const routine = await prisma.routine.findUnique({
      where: { id: routineId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: [{ dayOfWeek: 'asc' }, { orderIndex: 'asc' }],
        },
        _count: {
          select: { workouts: true },
        },
      },
    });

    if (!routine) {
      throw new NotFoundError('Routine');
    }

    // Check access: must be owner or routine must be public
    if (routine.userId !== userId && !routine.isPublic) {
      throw new ForbiddenError('Access denied');
    }

    return routine;
  },

  /**
   * Update routine
   */
  async updateRoutine(userId: number, routineId: number, input: UpdateRoutineInput) {
    await this.verifyRoutineOwnership(userId, routineId);

    const updated = await prisma.routine.update({
      where: { id: routineId },
      data: input,
      include: {
        exercises: {
          include: {
            exercise: {
              select: { id: true, name: true, slug: true },
            },
          },
          orderBy: [{ dayOfWeek: 'asc' }, { orderIndex: 'asc' }],
        },
      },
    });

    return updated;
  },

  /**
   * Delete routine
   */
  async deleteRoutine(userId: number, routineId: number) {
    await this.verifyRoutineOwnership(userId, routineId);

    await prisma.routine.delete({
      where: { id: routineId },
    });

    return { message: 'Routine deleted successfully' };
  },

  /**
   * Duplicate a routine (copy to own routines)
   */
  async duplicateRoutine(userId: number, routineId: number, newName?: string) {
    const routine = await prisma.routine.findUnique({
      where: { id: routineId },
      include: {
        exercises: true,
      },
    });

    if (!routine) {
      throw new NotFoundError('Routine');
    }

    // Check access: must be owner or routine must be public
    if (routine.userId !== userId && !routine.isPublic) {
      throw new ForbiddenError('Access denied');
    }

    // Create copy
    const copy = await prisma.routine.create({
      data: {
        userId,
        name: newName || `${routine.name} (Copy)`,
        description: routine.description,
        daysPerWeek: routine.daysPerWeek,
        schedule: routine.schedule as object | undefined,
        estimatedDuration: routine.estimatedDuration,
        goal: routine.goal,
        difficulty: routine.difficulty,
        splitType: routine.splitType,
        isPublic: false,
        isTemplate: false,
        exercises: {
          create: routine.exercises.map(ex => ({
            exerciseId: ex.exerciseId,
            orderIndex: ex.orderIndex,
            dayOfWeek: ex.dayOfWeek,
            targetSets: ex.targetSets,
            targetRepsMin: ex.targetRepsMin,
            targetRepsMax: ex.targetRepsMax,
            targetWeight: ex.targetWeight,
            targetRPE: ex.targetRPE,
            restSeconds: ex.restSeconds,
            supersetGroup: ex.supersetGroup,
            notes: ex.notes,
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: {
              select: { id: true, name: true, slug: true },
            },
          },
          orderBy: [{ dayOfWeek: 'asc' }, { orderIndex: 'asc' }],
        },
      },
    });

    // Increment copied count on original if it's not owned by the user
    if (routine.userId !== userId) {
      await prisma.routine.update({
        where: { id: routineId },
        data: { copiedCount: { increment: 1 } },
      });
    }

    return copy;
  },

  /**
   * Add exercise to routine
   */
  async addExercise(userId: number, routineId: number, input: AddExerciseToRoutineInput) {
    await this.verifyRoutineOwnership(userId, routineId);

    // Check if exercise exists
    const exercise = await prisma.exercise.findUnique({
      where: { id: input.exerciseId },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise');
    }

    // Get next order index if not provided
    let orderIndex = input.orderIndex;
    if (orderIndex === undefined) {
      const lastExercise = await prisma.routineExercise.findFirst({
        where: { routineId, dayOfWeek: input.dayOfWeek ?? null },
        orderBy: { orderIndex: 'desc' },
      });
      orderIndex = lastExercise ? lastExercise.orderIndex + 1 : 0;
    }

    const routineExercise = await prisma.routineExercise.create({
      data: {
        routineId,
        exerciseId: input.exerciseId,
        orderIndex,
        dayOfWeek: input.dayOfWeek,
        targetSets: input.targetSets,
        targetRepsMin: input.targetRepsMin,
        targetRepsMax: input.targetRepsMax,
        targetWeight: input.targetWeight,
        targetRPE: input.targetRPE,
        restSeconds: input.restSeconds,
        supersetGroup: input.supersetGroup,
        notes: input.notes,
      },
      include: {
        exercise: true,
      },
    });

    return routineExercise;
  },

  /**
   * Update routine exercise
   */
  async updateExercise(
    userId: number,
    routineId: number,
    routineExerciseId: number,
    input: UpdateRoutineExerciseInput
  ) {
    await this.verifyRoutineOwnership(userId, routineId);

    const routineExercise = await prisma.routineExercise.findUnique({
      where: { id: routineExerciseId },
    });

    if (!routineExercise || routineExercise.routineId !== routineId) {
      throw new NotFoundError('Routine exercise');
    }

    const updated = await prisma.routineExercise.update({
      where: { id: routineExerciseId },
      data: input,
      include: {
        exercise: true,
      },
    });

    return updated;
  },

  /**
   * Remove exercise from routine
   */
  async removeExercise(userId: number, routineId: number, routineExerciseId: number) {
    await this.verifyRoutineOwnership(userId, routineId);

    const routineExercise = await prisma.routineExercise.findUnique({
      where: { id: routineExerciseId },
    });

    if (!routineExercise || routineExercise.routineId !== routineId) {
      throw new NotFoundError('Routine exercise');
    }

    await prisma.routineExercise.delete({
      where: { id: routineExerciseId },
    });

    return { message: 'Exercise removed from routine' };
  },

  /**
   * Reorder exercises in routine
   */
  async reorderExercises(userId: number, routineId: number, input: ReorderExercisesInput) {
    await this.verifyRoutineOwnership(userId, routineId);

    // Update each exercise's order
    await prisma.$transaction(
      input.exercises.map(ex =>
        prisma.routineExercise.update({
          where: { id: ex.routineExerciseId },
          data: {
            orderIndex: ex.orderIndex,
            dayOfWeek: ex.dayOfWeek,
          },
        })
      )
    );

    // Return updated routine
    const routine = await this.getRoutineById(userId, routineId);
    return routine;
  },

  /**
   * Get public/template routines (library)
   */
  async getPublicRoutines(query: GetPublicRoutinesQuery) {
    const { page, limit, goal, difficulty, splitType, daysPerWeek, search, sortBy } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      OR: [{ isPublic: true }, { isTemplate: true }],
    };

    if (goal) where.goal = goal;
    if (difficulty) where.difficulty = difficulty;
    if (splitType) where.splitType = splitType;
    if (daysPerWeek) where.daysPerWeek = daysPerWeek;
    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {};
    if (sortBy === 'likes') orderBy.likes = 'desc';
    else if (sortBy === 'copiedCount') orderBy.copiedCount = 'desc';
    else orderBy.createdAt = 'desc';

    const [routines, total] = await Promise.all([
      prisma.routine.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
          exercises: {
            include: {
              exercise: {
                select: { id: true, name: true, slug: true },
              },
            },
            orderBy: [{ dayOfWeek: 'asc' }, { orderIndex: 'asc' }],
          },
        },
      }),
      prisma.routine.count({ where }),
    ]);

    return {
      routines,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Like/unlike a routine
   */
  async toggleLike(userId: number, routineId: number) {
    const routine = await prisma.routine.findUnique({
      where: { id: routineId },
    });

    if (!routine) {
      throw new NotFoundError('Routine');
    }

    if (!routine.isPublic && routine.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    // For now, just increment likes (a full like system would need a separate table)
    const updated = await prisma.routine.update({
      where: { id: routineId },
      data: { likes: { increment: 1 } },
    });

    return updated;
  },

  // Helper methods

  async verifyRoutineOwnership(userId: number, routineId: number) {
    const routine = await prisma.routine.findUnique({
      where: { id: routineId },
    });

    if (!routine) {
      throw new NotFoundError('Routine');
    }

    if (routine.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    return routine;
  },
};
