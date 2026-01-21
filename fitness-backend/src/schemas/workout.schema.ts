import { z } from 'zod';

// =============================================================================
// WORKOUT QUERIES
// =============================================================================

export const getWorkoutsQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
  status: z.enum(['in_progress', 'completed', 'cancelled']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type GetWorkoutsQuery = z.infer<typeof getWorkoutsQuerySchema>;

// =============================================================================
// START WORKOUT
// =============================================================================

export const startWorkoutSchema = z.object({
  name: z.string().max(255).optional(),
  routineId: z.number().int().positive().optional(),
  notes: z.string().max(2000).optional(),
});

export type StartWorkoutInput = z.infer<typeof startWorkoutSchema>;

// =============================================================================
// UPDATE WORKOUT
// =============================================================================

export const updateWorkoutSchema = z.object({
  name: z.string().max(255).optional(),
  notes: z.string().max(2000).optional(),
  energyLevel: z.number().int().min(1).max(10).optional(),
  sleepQuality: z.number().int().min(1).max(10).optional(),
  stressLevel: z.number().int().min(1).max(10).optional(),
});

export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;

// =============================================================================
// ADD EXERCISE TO WORKOUT
// =============================================================================

export const addExerciseToWorkoutSchema = z.object({
  exerciseId: z.number().int().positive(),
  notes: z.string().max(2000).optional(),
});

export type AddExerciseToWorkoutInput = z.infer<typeof addExerciseToWorkoutSchema>;

// =============================================================================
// LOG SET
// =============================================================================

export const logSetSchema = z.object({
  weight: z.number().positive().optional(),
  reps: z.number().int().positive().optional(),
  rpe: z.number().min(1).max(10).optional(),
  rir: z.number().int().min(0).max(10).optional(),
  setType: z.enum(['warmup', 'working', 'drop', 'failure', 'amrap']).default('working'),
  tempoEccentric: z.number().int().positive().optional(),
  tempoPause: z.number().int().min(0).optional(),
  tempoConcentric: z.number().int().positive().optional(),
  restTaken: z.number().int().min(0).optional(),
});

export type LogSetInput = z.infer<typeof logSetSchema>;

// =============================================================================
// UPDATE SET
// =============================================================================

export const updateSetSchema = logSetSchema.partial();

export type UpdateSetInput = z.infer<typeof updateSetSchema>;

// =============================================================================
// COMPLETE WORKOUT
// =============================================================================

export const completeWorkoutSchema = z.object({
  notes: z.string().max(2000).optional(),
  energyLevel: z.number().int().min(1).max(10).optional(),
  sleepQuality: z.number().int().min(1).max(10).optional(),
  stressLevel: z.number().int().min(1).max(10).optional(),
});

export type CompleteWorkoutInput = z.infer<typeof completeWorkoutSchema>;
