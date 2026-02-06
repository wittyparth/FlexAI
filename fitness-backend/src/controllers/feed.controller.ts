import { NextFunction, Response } from 'express';

import { ValidatedRequest } from '../middleware';
import { feedService } from '../services/feed.service';

/**
 * Controller for feed endpoints
 */
export class FeedController {
  
  /**
   * Create a post
   */
  async createPost(req: ValidatedRequest<any>, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId!;
      const { content, imageUrl, workoutId, visibility } = req.body;

      const post = await feedService.createPost({
        userId,
        content,
        imageUrl,
        workoutId,
        visibility
      });

      res.status(201).json({ success: true, ...post });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get global public feed
   */
  async getGlobalFeed(req: ValidatedRequest<any>, res: Response, next: NextFunction) {
    try {
      const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const result = await feedService.getGlobalFeed({ cursor, limit });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
       next(error);
    }
  }

  /**
   * Get user's personalized feed (following)
   */
  async getMyFeed(req: ValidatedRequest<any>, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId!;
      const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const result = await feedService.getUserFeed(userId, { cursor, limit });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle like on a post
   */
  async toggleLike(req: ValidatedRequest<any>, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId!;
      const postId = parseInt(req.params.id);

      if (isNaN(postId)) {
        res.status(400).json({ error: 'Invalid post ID' });
        return;
      }

      const result = await feedService.likePost(userId, postId);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add comment to a post
   */
  async addComment(req: ValidatedRequest<any>, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId!;
      const postId = parseInt(req.params.id);
      const { content } = req.body;

      if (isNaN(postId)) {
        res.status(400).json({ error: 'Invalid post ID' });
        return;
      }
      if (!content) {
        res.status(400).json({ error: 'Comment content is required' });
        return;
      }

      const comment = await feedService.addComment(userId, postId, content);
      res.status(201).json({ success: true, ...comment });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get comments for a post
   */
  async getComments(req: ValidatedRequest<any>, res: Response, next: NextFunction) {
    try {
      const postId = parseInt(req.params.id);
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      
      if (isNaN(postId)) {
         res.status(400).json({ error: 'Invalid post ID' });
         return;
      }

      const comments = await feedService.getComments(postId, { page });
      res.status(200).json({ success: true, data: comments });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(req: ValidatedRequest<any>, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId!;
      const commentId = parseInt(req.params.id);

      if (isNaN(commentId)) {
        res.status(400).json({ error: 'Invalid comment ID' });
        return;
      }

      await feedService.deleteComment(userId, commentId);
      res.status(200).json({ success: true, message: 'Comment deleted' });
    } catch (error) {
      next(error);
    }
  }
}

export const feedController = new FeedController();
