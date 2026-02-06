import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { updateProfileSchema, updateSettingsSchema } from '../schemas/user.schema';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', userController.getProfile);

/**
 * @route   PATCH /api/v1/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.patch('/me', validate(updateProfileSchema), userController.updateProfile);

/**
 * @route   DELETE /api/v1/users/me
 * @desc    Delete current user account
 * @access  Private
 */
router.delete('/me', userController.deleteAccount);

/**
 * @route   POST /api/v1/users/me/avatar
 * @desc    Update user avatar
 * @access  Private
 */
router.post('/me/avatar', userController.updateAvatar);

/**
 * @route   GET /api/v1/users/me/settings
 * @desc    Get user settings
 * @access  Private
 */
router.get('/me/settings', userController.getSettings);

/**
 * @route   PATCH /api/v1/users/me/settings
 * @desc    Update user settings
 * @access  Private
 */
router.patch('/me/settings', validate(updateSettingsSchema), userController.updateSettings);

/**
 * @route   POST /api/v1/users/me/complete-onboarding
 * @desc    Complete user onboarding and update profile
 * @access  Private
 */
router.post('/me/complete-onboarding', userController.completeOnboarding);

export default router;
