import { Request, Response, NextFunction } from 'express';
import { oauthService } from '../services/oauth.service';
import type { GoogleAuthInput } from '../schemas/oauth.schema';

// Type helper for validated requests
interface ValidatedBody<T> extends Request {
  validated: T;
}

/**
 * OAuth Controller - handles OAuth authentication endpoints
 */
export const oauthController = {
  /**
   * POST /api/v1/auth/google
   * Authenticate with Google ID token
   */
  async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const input = (req as ValidatedBody<GoogleAuthInput>).validated;
      const result = await oauthService.googleAuth(input.idToken);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/auth/google
   * Unlink Google account from user
   */
  async unlinkGoogle(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await oauthService.unlinkGoogle(req.userId!);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
