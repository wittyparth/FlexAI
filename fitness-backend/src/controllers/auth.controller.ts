import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import type {
  RegisterInput,
  LoginInput,
  VerifyEmailInput,
  ResendVerificationInput,
  RefreshTokenInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../schemas/auth.schema';

// Type helper for validated requests
interface ValidatedBody<T> extends Request {
  validated: T;
}

/**
 * Auth Controller - handles HTTP requests for authentication
 */
export const authController = {
  /**
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = (req as ValidatedBody<RegisterInput>).validated;
      const result = await authService.register(input);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/verify-email
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const input = (req as ValidatedBody<VerifyEmailInput>).validated;
      const result = await authService.verifyEmail(input);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/resend-verification
   */
  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const input = (req as ValidatedBody<ResendVerificationInput>).validated;
      const result = await authService.resendVerification(input.email);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = (req as ValidatedBody<LoginInput>).validated;
      const result = await authService.login(input);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/refresh
   */
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const input = (req as ValidatedBody<RefreshTokenInput>).validated;
      const result = await authService.refreshToken(input.refreshToken);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.body.refreshToken;
      const result = await authService.logout(req.userId!, refreshToken);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/change-password
   */
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const input = (req as ValidatedBody<ChangePasswordInput>).validated;
      const result = await authService.changePassword(req.userId!, input);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const input = (req as ValidatedBody<ForgotPasswordInput>).validated;
      const result = await authService.forgotPassword(input.email);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const input = (req as ValidatedBody<ResetPasswordInput>).validated;
      const result = await authService.resetPassword(input);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
