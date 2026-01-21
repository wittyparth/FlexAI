import { z } from 'zod';

// =============================================================================
// EXERCISE QUERY PARAMS
// =============================================================================

export const getExercisesQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
  
  // Filters
  muscleGroup: z.string().optional(),
  equipment: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  exerciseType: z.enum(['strength', 'cardio', 'flexibility', 'stretching']).optional(),
  exerciseClass: z.enum(['compound', 'isolation']).optional(),
  trainingGoal: z.string().optional(),
  hasFormCheck: z.string().optional().transform(v => v === 'true'),
  isFeatured: z.string().optional().transform(v => v === 'true'),
  
  // Search
  search: z.string().optional(),
  
  // Sort
  sortBy: z.enum(['name', 'difficulty', 'popularity', 'createdAt']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type GetExercisesQuery = z.infer<typeof getExercisesQuerySchema>;

// =============================================================================
// CREATE CUSTOM EXERCISE
// =============================================================================

const mediaSchema = z.object({
  thumbnail: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  videos: z.array(z.string().url()).optional(),
  gifs: z.array(z.string().url()).optional(),
  youtubeId: z.string().optional(),
  muscleDiagram: z.string().optional(),
}).optional();

const defaultRepsSchema = z.object({
  min: z.number().int().positive(),
  max: z.number().int().positive(),
  target: z.number().int().positive(),
}).optional();

const safetySchema = z.object({
  warnings: z.array(z.string()).optional(),
  commonMistakes: z.array(z.string()).optional(),
  tips: z.array(z.string()).optional(),
  contraindications: z.array(z.string()).optional(),
  requiredSkills: z.array(z.string()).optional(),
}).optional();

export const createExerciseSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(255).optional(), // Auto-generated if not provided
  description: z.string().max(5000).optional(),
  instructions: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  
  primaryMuscleGroups: z.array(z.string()),
  secondaryMuscleGroups: z.array(z.string()).optional(),
  
  equipment: z.array(z.string()).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  exerciseType: z.enum(['strength', 'cardio', 'flexibility', 'stretching']).default('strength'),
  movementPattern: z.string().optional(),
  exerciseClass: z.enum(['compound', 'isolation']).optional(),
  trainingGoals: z.array(z.string()).optional(),
  
  media: mediaSchema,
  
  defaultSets: z.number().int().positive().optional(),
  defaultReps: defaultRepsSchema,
  defaultRestTime: z.number().int().positive().optional(),
  
  safety: safetySchema,
  
  variations: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;

// =============================================================================
// UPDATE EXERCISE
// =============================================================================

export const updateExerciseSchema = createExerciseSchema.partial();

export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
