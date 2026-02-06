import { NextFunction, Response } from 'express';

import { ValidatedRequest } from '../middleware';
import { socialService } from '../services/social.service';

/**
 * Controller for social endpoints
 */
export class SocialController {
  /**
   * Follow a user
   */
  async followUser(req: ValidatedRequest<any>, res: Response, next: NextFunction) {
    try {
      const followerId = (req as any).userId!;
      const followingId = parseInt(req.params.userId);

      if (isNaN(followingId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      await socialService.followUser(followerId, followingId);

      res.status(200).json({
        success: true,
        message: 'You are now following this user'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(req: ValidatedRequest<any>, res: Response, next: NextFunction) {
    try {
      const followerId = (req as any).userId!;
      const followingId = parseInt(req.params.userId);

      if (isNaN(followingId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      await socialService.unfollowUser(followerId, followingId);

      res.status(200).json({
        success: true,
        message: 'Unfollowed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get followers of the current user
   */
  async getFollowers(req: ValidatedRequest<any>, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await socialService.getFollowers(userId, { page, limit });

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get who the current user is following
   */
  async getFollowing(req: ValidatedRequest<any>, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await socialService.getFollowing(userId, { page, limit });

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

    /**
   * Get status (is following?) for a specific user
   */
  async getFollowStatus(req: ValidatedRequest<any>, res: Response, next: NextFunction) {
    try {
      const followerId = (req as any).userId!;
      const targetId = parseInt(req.params.userId);
      
      if (isNaN(targetId)) {
         res.status(400).json({ error: 'Invalid user ID' });
         return;
      }

      const result = await socialService.getFollowStatus(followerId, targetId);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const socialController = new SocialController();
