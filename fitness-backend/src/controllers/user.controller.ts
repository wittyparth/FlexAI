import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import type {
  CompleteOnboardingInput,
  UpdateProfileInput,
  UpdateSettingsInput,
} from '../schemas/user.schema';

// Type helper for validated requests
interface ValidatedBody<T> extends Request {
  validated: T;
}

/**
 * User Controller - handles HTTP requests for user profile and settings
 */
export const userController = {
  /**
   * GET /api/v1/users/me
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.userId!);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/users/me
   */
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const input = (req as ValidatedBody<UpdateProfileInput>).validated;
      const user = await userService.updateProfile(req.userId!, input);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/users/me
   */
  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.deleteAccount(req.userId!);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/users/me/avatar
   */
  async updateAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Handle file upload with multer and S3
      const avatarUrl = req.body.avatarUrl; // Temporary: accept URL directly
      const user = await userService.updateAvatar(req.userId!, avatarUrl);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/users/me/settings
   */
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await userService.getSettings(req.userId!);
      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/users/me/settings
   */
  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const input = (req as ValidatedBody<UpdateSettingsInput>).validated;
      const settings = await userService.updateSettings(req.userId!, input);
      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/users/me/complete-onboarding
   * Complete user onboarding and update profile with onboarding data
   */
  async completeOnboarding(req: Request, res: Response, next: NextFunction) {
    try {
      const onboardingData = (req as ValidatedBody<CompleteOnboardingInput>).validated;
      const user = await userService.completeOnboarding(req.userId!, onboardingData);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
};
