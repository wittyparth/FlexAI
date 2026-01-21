import { Router } from 'express';
import { exerciseController } from '../controllers/exercise.controller';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import {
  getExercisesQuerySchema,
  createExerciseSchema,
  updateExerciseSchema,
} from '../schemas/exercise.schema';

const router = Router();

// =============================================================================
// FILTER OPTIONS (must be before /:id routes)
// =============================================================================

/**
 * @route   GET /api/v1/exercises/muscle-groups
 * @desc    Get list of muscle groups for filtering
 * @access  Public
 */
router.get('/muscle-groups', exerciseController.getMuscleGroups);

/**
 * @route   GET /api/v1/exercises/equipment
 * @desc    Get list of equipment for filtering
 * @access  Public
 */
router.get('/equipment', exerciseController.getEquipment);

/**
 * @route   GET /api/v1/exercises/types
 * @desc    Get list of exercise types for filtering
 * @access  Public
 */
router.get('/types', exerciseController.getExerciseTypes);

/**
 * @route   GET /api/v1/exercises/training-goals
 * @desc    Get list of training goals for filtering
 * @access  Public
 */
router.get('/training-goals', exerciseController.getTrainingGoals);

/**
 * @route   GET /api/v1/exercises/featured
 * @desc    Get featured exercises
 * @access  Public
 */
router.get('/featured', exerciseController.getFeaturedExercises);

/**
 * @route   GET /api/v1/exercises/search
 * @desc    Quick search exercises
 * @access  Public
 */
router.get('/search', exerciseController.searchExercises);

// =============================================================================
// MAIN ROUTES
// =============================================================================

/**
 * @route   GET /api/v1/exercises
 * @desc    Get paginated exercises with filters
 * @access  Public
 */
router.get('/', validate(getExercisesQuerySchema, 'query'), exerciseController.getExercises);

/**
 * @route   POST /api/v1/exercises
 * @desc    Create custom exercise
 * @access  Private
 */
router.post('/', authenticate, validate(createExerciseSchema), exerciseController.createExercise);

/**
 * @route   GET /api/v1/exercises/slug/:slug
 * @desc    Get exercise by slug
 * @access  Public
 */
router.get('/slug/:slug', exerciseController.getExerciseBySlug);

/**
 * @route   GET /api/v1/exercises/:id
 * @desc    Get exercise by ID
 * @access  Public
 */
router.get('/:id', exerciseController.getExerciseById);

/**
 * @route   PATCH /api/v1/exercises/:id
 * @desc    Update custom exercise
 * @access  Private
 */
router.patch('/:id', authenticate, validate(updateExerciseSchema), exerciseController.updateExercise);

/**
 * @route   DELETE /api/v1/exercises/:id
 * @desc    Delete custom exercise
 * @access  Private
 */
router.delete('/:id', authenticate, exerciseController.deleteExercise);

export default router;
