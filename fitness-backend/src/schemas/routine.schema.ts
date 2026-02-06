import { z } from 'zod';

// ============================================================================
// ROUTINE SCHEMAS
// ============================================================================

/**
 * Create Routine Input
 */
export const createRoutineSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  daysPerWeek: z.number().int().min(1).max(7).optional(),
  schedule: z.object({
    monday: z.boolean().optional(),
    tuesday: z.boolean().optional(),
    wednesday: z.boolean().optional(),
    thursday: z.boolean().optional(),
    friday: z.boolean().optional(),
    saturday: z.boolean().optional(),
    sunday: z.boolean().optional(),
  }).optional(),
  estimatedDuration: z.number().int().min(10).max(300).optional(),
  goal: z.enum(['muscle_gain', 'strength', 'fat_loss', 'endurance', 'athletic', 'general']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  splitType: z.enum(['ppl', 'upper_lower', 'full_body', 'bro', 'custom']).optional(),
  isPublic: z.boolean().optional().default(false),
});

export type CreateRoutineInput = z.infer<typeof createRoutineSchema>;

/**
 * Update Routine Input
 */
export const updateRoutineSchema = createRoutineSchema.partial().extend({
  isArchived: z.boolean().optional(),
});

export type UpdateRoutineInput = z.infer<typeof updateRoutineSchema>;

/**
 * Get Routines Query
 */
export const getRoutinesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  goal: z.enum(['muscle_gain', 'strength', 'fat_loss', 'endurance', 'athletic', 'general']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  splitType: z.enum(['ppl', 'upper_lower', 'full_body', 'bro', 'custom']).optional(),
  isTemplate: z.coerce.boolean().optional(),
  isArchived: z.coerce.boolean().optional().default(false),
  search: z.string().max(100).optional(),
});

export type GetRoutinesQuery = z.infer<typeof getRoutinesQuerySchema>;

/**
 * Add Exercise to Routine Input
 */
export const addExerciseToRoutineSchema = z.object({
  exerciseId: z.number().int().positive(),
  orderIndex: z.number().int().min(0).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(), // 0 = Monday, 6 = Sunday
  targetSets: z.number().int().min(1).max(20).default(3),
  targetRepsMin: z.number().int().min(1).max(100).optional(),
  targetRepsMax: z.number().int().min(1).max(100).optional(),
  targetWeight: z.number().positive().optional(),
  targetRPE: z.number().min(1).max(10).optional(),
  restSeconds: z.number().int().min(0).max(600).default(90),
  supersetGroup: z.number().int().min(1).optional(),
  notes: z.string().max(500).optional(),
});

export type AddExerciseToRoutineInput = z.infer<typeof addExerciseToRoutineSchema>;

/**
 * Update Routine Exercise Input
 */
export const updateRoutineExerciseSchema = addExerciseToRoutineSchema.partial();

export type UpdateRoutineExerciseInput = z.infer<typeof updateRoutineExerciseSchema>;

/**
 * Reorder Exercises Input
 */
export const reorderExercisesSchema = z.object({
  exercises: z.array(z.object({
    routineExerciseId: z.number().int().positive(),
    orderIndex: z.number().int().min(0),
    dayOfWeek: z.number().int().min(0).max(6).optional(),
  })),
});

export type ReorderExercisesInput = z.infer<typeof reorderExercisesSchema>;

/**
 * Get Public Routines Query (Template Library)
 */
export const getPublicRoutinesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  goal: z.enum(['muscle_gain', 'strength', 'fat_loss', 'endurance', 'athletic', 'general']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  splitType: z.enum(['ppl', 'upper_lower', 'full_body', 'bro', 'custom']).optional(),
  daysPerWeek: z.coerce.number().int().min(1).max(7).optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['likes', 'copiedCount', 'createdAt']).optional().default('likes'),
});

export type GetPublicRoutinesQuery = z.infer<typeof getPublicRoutinesQuerySchema>;

/**
 * Generate Workout Input (AI)
 */
export const generateWorkoutSchema = z.object({
  goal: z.string().min(1).max(100),
  duration: z.number().int().min(10).max(120), // minutes
  equipment: z.array(z.string()).min(1),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  injuries: z.string().optional(),
  preferences: z.string().optional(),
});

export type GenerateWorkoutInput = z.infer<typeof generateWorkoutSchema>;

