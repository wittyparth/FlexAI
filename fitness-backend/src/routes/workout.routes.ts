import { Router } from 'express';
import { workoutController } from '../controllers/workout.controller';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import {
  getWorkoutsQuerySchema,
  startWorkoutSchema,
  updateWorkoutSchema,
  addExerciseToWorkoutSchema,
  logSetSchema,
  updateSetSchema,
  completeWorkoutSchema,
} from '../schemas/workout.schema';

const router = Router();

// All workout routes require authentication
router.use(authenticate);

// =============================================================================
// WORKOUT ROUTES
// =============================================================================

/**
 * @route   POST /api/v1/workouts
 * @desc    Start a new workout
 * @access  Private
 */
router.post('/', validate(startWorkoutSchema), workoutController.startWorkout);

/**
 * @route   GET /api/v1/workouts
 * @desc    Get user's workouts
 * @access  Private
 */
router.get('/', validate(getWorkoutsQuerySchema, 'query'), workoutController.getWorkouts);

/**
 * @route   GET /api/v1/workouts/current
 * @desc    Get current in-progress workout
 * @access  Private
 */
router.get('/current', workoutController.getCurrentWorkout);

/**
 * @route   GET /api/v1/workouts/:id
 * @desc    Get workout by ID
 * @access  Private
 */
router.get('/:id', workoutController.getWorkoutById);

/**
 * @route   PATCH /api/v1/workouts/:id
 * @desc    Update workout
 * @access  Private
 */
router.patch('/:id', validate(updateWorkoutSchema), workoutController.updateWorkout);

/**
 * @route   DELETE /api/v1/workouts/:id
 * @desc    Delete workout
 * @access  Private
 */
router.delete('/:id', workoutController.deleteWorkout);

/**
 * @route   POST /api/v1/workouts/:id/complete
 * @desc    Complete workout
 * @access  Private
 */
router.post('/:id/complete', validate(completeWorkoutSchema), workoutController.completeWorkout);

/**
 * @route   POST /api/v1/workouts/:id/cancel
 * @desc    Cancel workout
 * @access  Private
 */
router.post('/:id/cancel', workoutController.cancelWorkout);

// =============================================================================
// EXERCISE IN WORKOUT ROUTES
// =============================================================================

/**
 * @route   POST /api/v1/workouts/:id/exercises
 * @desc    Add exercise to workout
 * @access  Private
 */
router.post('/:id/exercises', validate(addExerciseToWorkoutSchema), workoutController.addExercise);

/**
 * @route   DELETE /api/v1/workouts/:id/exercises/:exerciseId
 * @desc    Remove exercise from workout
 * @access  Private
 */
router.delete('/:id/exercises/:exerciseId', workoutController.removeExercise);

// =============================================================================
// SET ROUTES
// =============================================================================

/**
 * @route   POST /api/v1/workouts/:id/exercises/:exerciseId/sets
 * @desc    Log a set
 * @access  Private
 */
router.post('/:id/exercises/:exerciseId/sets', validate(logSetSchema), workoutController.logSet);

/**
 * @route   PATCH /api/v1/workouts/:id/sets/:setId
 * @desc    Update a set
 * @access  Private
 */
router.patch('/:id/sets/:setId', validate(updateSetSchema), workoutController.updateSet);

/**
 * @route   DELETE /api/v1/workouts/:id/sets/:setId
 * @desc    Delete a set
 * @access  Private
 */
router.delete('/:id/sets/:setId', workoutController.deleteSet);

export default router;
