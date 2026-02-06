import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { gamificationService } from './gamification.service';
import type {
  GetWorkoutsQuery,
  StartWorkoutInput,
  UpdateWorkoutInput,
  AddExerciseToWorkoutInput,
  LogSetInput,
  UpdateSetInput,
  CompleteWorkoutInput,
} from '../schemas/workout.schema';

/**
 * Workout Service - handles workout logging business logic
 */
export const workoutService = {
  /**
   * Start a new workout
   */
  async startWorkout(userId: number, input: StartWorkoutInput) {
    // Check for existing in-progress workout
    const existingWorkout = await prisma.workout.findFirst({
      where: { userId, status: 'in_progress' },
    });

    if (existingWorkout) {
      throw new BadRequestError('You already have a workout in progress');
    }

    const workout = await prisma.workout.create({
      data: {
        userId,
        name: input.name,
        routineId: input.routineId,
        notes: input.notes,
        status: 'in_progress',
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });

    return workout;
  },

  /**
   * Get user's workouts with filters
   */
  async getWorkouts(userId: number, query: GetWorkoutsQuery) {
    const { page, limit, status, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) {
        (where.startedAt as Record<string, unknown>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.startedAt as Record<string, unknown>).lte = new Date(endDate);
      }
    }

    const [workouts, total] = await Promise.all([
      prisma.workout.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit,
        include: {
          exercises: {
            include: {
              exercise: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
      }),
      prisma.workout.count({ where }),
    ]);

    return {
      workouts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get workout by ID
   */
  async getWorkoutById(userId: number, workoutId: number) {
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        exercises: {
          orderBy: { orderIndex: 'asc' },
          include: {
            exercise: true,
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
        },
        routine: {
          select: { id: true, name: true },
        },
      },
    });

    if (!workout) {
      throw new NotFoundError('Workout');
    }

    if (workout.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    return workout;
  },

  /**
   * Update workout
   */
  async updateWorkout(userId: number, workoutId: number, input: UpdateWorkoutInput) {
    const workout = await this.verifyWorkoutOwnership(userId, workoutId);

    if (workout.status !== 'in_progress') {
      throw new BadRequestError('Cannot update a completed workout');
    }

    const updated = await prisma.workout.update({
      where: { id: workoutId },
      data: input,
    });

    return updated;
  },

  /**
   * Delete workout
   */
  async deleteWorkout(userId: number, workoutId: number) {
    await this.verifyWorkoutOwnership(userId, workoutId);

    await prisma.workout.delete({
      where: { id: workoutId },
    });

    return { message: 'Workout deleted successfully' };
  },

  /**
   * Add exercise to workout
   */
  async addExercise(userId: number, workoutId: number, input: AddExerciseToWorkoutInput) {
    const workout = await this.verifyWorkoutOwnership(userId, workoutId);

    if (workout.status !== 'in_progress') {
      throw new BadRequestError('Cannot add exercises to a completed workout');
    }

    // Check if exercise exists
    const exercise = await prisma.exercise.findUnique({
      where: { id: input.exerciseId },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise');
    }

    // Get next order index
    const lastExercise = await prisma.workoutExercise.findFirst({
      where: { workoutId },
      orderBy: { orderIndex: 'desc' },
    });

    const orderIndex = lastExercise ? lastExercise.orderIndex + 1 : 0;

    const workoutExercise = await prisma.workoutExercise.create({
      data: {
        workoutId,
        exerciseId: input.exerciseId,
        orderIndex,
        notes: input.notes,
      },
      include: {
        exercise: true,
        sets: true,
      },
    });

    return workoutExercise;
  },

  /**
   * Remove exercise from workout
   */
  async removeExercise(userId: number, workoutId: number, workoutExerciseId: number) {
    const workout = await this.verifyWorkoutOwnership(userId, workoutId);

    if (workout.status !== 'in_progress') {
      throw new BadRequestError('Cannot modify a completed workout');
    }

    await prisma.workoutExercise.delete({
      where: { id: workoutExerciseId },
    });

    return { message: 'Exercise removed from workout' };
  },

  /**
   * Log a set
   */
  async logSet(userId: number, workoutId: number, workoutExerciseId: number, input: LogSetInput) {
    const workout = await this.verifyWorkoutOwnership(userId, workoutId);

    if (workout.status !== 'in_progress') {
      throw new BadRequestError('Cannot log sets to a completed workout');
    }

    // Verify workout exercise exists and belongs to workout
    const workoutExercise = await prisma.workoutExercise.findUnique({
      where: { id: workoutExerciseId },
    });

    if (!workoutExercise || workoutExercise.workoutId !== workoutId) {
      throw new NotFoundError('Workout exercise');
    }

    // Get next set number
    const lastSet = await prisma.workoutSet.findFirst({
      where: { workoutExerciseId },
      orderBy: { setNumber: 'desc' },
    });

    const setNumber = lastSet ? lastSet.setNumber + 1 : 1;

    const set = await prisma.workoutSet.create({
      data: {
        workoutExerciseId,
        setNumber,
        ...input,
        completed: true,
      },
    });

    return set;
  },

  /**
   * Update a set
   */
  async updateSet(userId: number, workoutId: number, setId: number, input: UpdateSetInput) {
    const workout = await this.verifyWorkoutOwnership(userId, workoutId);

    if (workout.status !== 'in_progress') {
      throw new BadRequestError('Cannot update sets in a completed workout');
    }

    // Verify set belongs to this workout
    const set = await prisma.workoutSet.findUnique({
      where: { id: setId },
      include: { workoutExercise: true },
    });

    if (!set || set.workoutExercise.workoutId !== workoutId) {
      throw new NotFoundError('Set');
    }

    const updated = await prisma.workoutSet.update({
      where: { id: setId },
      data: input,
    });

    return updated;
  },

  /**
   * Delete a set
   */
  async deleteSet(userId: number, workoutId: number, setId: number) {
    const workout = await this.verifyWorkoutOwnership(userId, workoutId);

    if (workout.status !== 'in_progress') {
      throw new BadRequestError('Cannot delete sets from a completed workout');
    }

    // Verify set belongs to this workout
    const set = await prisma.workoutSet.findUnique({
      where: { id: setId },
      include: { workoutExercise: true },
    });

    if (!set || set.workoutExercise.workoutId !== workoutId) {
      throw new NotFoundError('Set');
    }

    await prisma.workoutSet.delete({
      where: { id: setId },
    });

    return { message: 'Set deleted' };
  },

  /**
   * Complete workout
   */
  async completeWorkout(userId: number, workoutId: number, input: CompleteWorkoutInput) {
    const workout = await this.verifyWorkoutOwnership(userId, workoutId);

    if (workout.status !== 'in_progress') {
      throw new BadRequestError('Workout is already completed');
    }

    // Calculate workout metrics
    const exercises = await prisma.workoutExercise.findMany({
      where: { workoutId },
      include: { sets: true },
    });

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;
    let totalRpe = 0;
    let rpeCount = 0;

    exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed) {
          totalSets++;
          if (set.reps) totalReps += set.reps;
          if (set.weight && set.reps) {
            totalVolume += set.weight * set.reps;
          }
          if (set.rpe) {
            totalRpe += set.rpe;
            rpeCount++;
          }
        }
      });
    });

    const now = new Date();
    const duration = Math.round(
      (now.getTime() - new Date(workout.startedAt).getTime()) / 60000
    );

    const completed = await prisma.workout.update({
      where: { id: workoutId },
      data: {
        status: 'completed',
        completedAt: now,
        duration,
        totalVolume,
        totalSets,
        totalReps,
        averageRPE: rpeCount > 0 ? totalRpe / rpeCount : null,
        ...input,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });

    // Update user's streak
    // Using centralized gamification service
    await gamificationService.updateStreak(userId, now);
    await gamificationService.processAction(userId, 'WORKOUT_COMPLETE');

    // Check for Personal Records
    let newPRs: any[] = [];
    try {
        const { statsService } = await import('./stats/stats.service'); 
        newPRs = await statsService.checkAndSavePRs(userId, workoutId);
    } catch (error) {
        console.error("Failed to check PRs:", error);
        // Don't fail the whole request just because stats failed
    }

    return { ...completed, newPRs };
  },

  /**
   * Cancel workout
   */
  async cancelWorkout(userId: number, workoutId: number) {
    const workout = await this.verifyWorkoutOwnership(userId, workoutId);

    if (workout.status !== 'in_progress') {
      throw new BadRequestError('Workout is not in progress');
    }

    const cancelled = await prisma.workout.update({
      where: { id: workoutId },
      data: { status: 'cancelled' },
    });

    return cancelled;
  },

  /**
   * Get current in-progress workout
   */
  async getCurrentWorkout(userId: number) {
    const workout = await prisma.workout.findFirst({
      where: { userId, status: 'in_progress' },
      include: {
        exercises: {
          orderBy: { orderIndex: 'asc' },
          include: {
            exercise: true,
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
        },
      },
    });

    return workout;
  },

  // Helper methods

  async verifyWorkoutOwnership(userId: number, workoutId: number) {
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
    });

    if (!workout) {
      throw new NotFoundError('Workout');
    }

    if (workout.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    return workout;
  },
};

