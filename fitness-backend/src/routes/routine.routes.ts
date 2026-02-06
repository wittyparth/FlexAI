import { Router } from 'express';
import { routineController } from '../controllers/routine.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createRateLimiter } from '../middleware/rateLimiter';
import {
  createRoutineSchema,
  updateRoutineSchema,
  getRoutinesQuerySchema,
  addExerciseToRoutineSchema,
  updateRoutineExerciseSchema,
  reorderExercisesSchema,

  getPublicRoutinesQuerySchema,
  generateWorkoutSchema,
} from '../schemas/routine.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============================================================================
// ROUTINE CRUD
// ============================================================================

/**
 * POST /api/v1/routines/generate
 * Generate AI workout
 */
router.post(
  '/generate',
  createRateLimiter({ windowMs: 60000, max: 10 }), // Strict limit for AI generation
  validate(generateWorkoutSchema, 'body'),
  routineController.generateWorkout
);

/**
 * POST /api/v1/routines
 * Create a new routine
 */
router.post(
  '/',
  createRateLimiter({ windowMs: 60000, max: 30 }), // 30 creates per minute
  validate(createRoutineSchema, 'body'),
  routineController.createRoutine
);

/**
 * GET /api/v1/routines
 * Get user's routines (with pagination & filters)
 */
router.get(
  '/',
  createRateLimiter({ windowMs: 60000, max: 100 }),
  validate(getRoutinesQuerySchema, 'query'),
  routineController.getRoutines
);

/**
 * GET /api/v1/routines/library
 * Get public/template routines (library browser)
 */
router.get(
  '/library',
  createRateLimiter({ windowMs: 60000, max: 100 }),
  validate(getPublicRoutinesQuerySchema, 'query'),
  routineController.getPublicRoutines
);

/**
 * GET /api/v1/routines/:id
 * Get routine by ID (includes exercises)
 */
router.get(
  '/:id',
  createRateLimiter({ windowMs: 60000, max: 100 }),
  routineController.getRoutineById
);

/**
 * PATCH /api/v1/routines/:id
 * Update routine metadata
 */
router.patch(
  '/:id',
  createRateLimiter({ windowMs: 60000, max: 60 }),
  validate(updateRoutineSchema, 'body'),
  routineController.updateRoutine
);

/**
 * DELETE /api/v1/routines/:id
 * Delete routine
 */
router.delete(
  '/:id',
  createRateLimiter({ windowMs: 60000, max: 30 }),
  routineController.deleteRoutine
);

/**
 * POST /api/v1/routines/:id/duplicate
 * Duplicate a routine (copies to user's own routines)
 */
router.post(
  '/:id/duplicate',
  createRateLimiter({ windowMs: 60000, max: 20 }),
  routineController.duplicateRoutine
);

/**
 * POST /api/v1/routines/:id/like
 * Like a routine
 */
router.post(
  '/:id/like',
  createRateLimiter({ windowMs: 60000, max: 60 }),
  routineController.toggleLike
);

// ============================================================================
// ROUTINE EXERCISES
// ============================================================================

/**
 * POST /api/v1/routines/:id/exercises
 * Add exercise to routine
 */
router.post(
  '/:id/exercises',
  createRateLimiter({ windowMs: 60000, max: 100 }),
  validate(addExerciseToRoutineSchema, 'body'),
  routineController.addExercise
);

/**
 * PATCH /api/v1/routines/:id/exercises/:exerciseId
 * Update routine exercise (sets, reps, rest, etc.)
 */
router.patch(
  '/:id/exercises/:exerciseId',
  createRateLimiter({ windowMs: 60000, max: 100 }),
  validate(updateRoutineExerciseSchema, 'body'),
  routineController.updateExercise
);

/**
 * DELETE /api/v1/routines/:id/exercises/:exerciseId
 * Remove exercise from routine
 */
router.delete(
  '/:id/exercises/:exerciseId',
  createRateLimiter({ windowMs: 60000, max: 60 }),
  routineController.removeExercise
);

/**
 * PUT /api/v1/routines/:id/exercises/reorder
 * Reorder exercises within a routine
 */
router.put(
  '/:id/exercises/reorder',
  createRateLimiter({ windowMs: 60000, max: 30 }),
  validate(reorderExercisesSchema, 'body'),
  routineController.reorderExercises
);

export default router;
