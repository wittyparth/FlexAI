import { NextFunction, Response } from 'express';

import { z } from 'zod';
import { ValidatedRequest } from '../middleware';
import { leaderboardService } from '../services/leaderboard.service';

/**
 * Controller for leaderboards and challenges
 */
export class LeaderboardController {
  /**
   * Get global leaderboard
   */
  async getLeaderboard(req: ValidatedRequest<any>, res: Response, next: NextFunction) {
    try {
      const type = req.params.type as 'strength' | 'volume' | 'consistency' | 'weekly';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      if (!['strength', 'volume', 'consistency', 'weekly'].includes(type)) {
        res.status(400).json({ error: 'Invalid leaderboard type' });
        return;
      }

      const result = await leaderboardService.getGlobalLeaderboard(type, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active challenges
   */
  async getChallenges(_req: ValidatedRequest<any>, res: Response, next: NextFunction) {
    try {
      const result = await leaderboardService.getChallenges();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

    /**
   * Create challenge (admin only strictly, but public for MVP)
   */
  async createChallenge(req: ValidatedRequest<any>, res: Response, next: NextFunction) {
    try {
        const schema = z.object({
          name: z.string().min(1),
          description: z.string().min(1),
          challengeType: z.string(),
          targetMetric: z.string(),
          startDate: z.string().or(z.date()).transform(d => new Date(d)),
          endDate: z.string().or(z.date()).transform(d => new Date(d)),
        });

        const validation = schema.safeParse(req.body);
        if (!validation.success) {
           res.status(422).json({ error: 'Invalid challenge data', details: validation.error });
           return;
        }

        const challenge = await leaderboardService.createChallenge(validation.data);
        res.status(201).json({ success: true, data: challenge });
    } catch (error) {
        next(error);
    }
  }

  /**
   * Join a challenge
   */
  async joinChallenge(req: ValidatedRequest<any>, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId!;
      const challengeId = parseInt(req.params.id);

      if (isNaN(challengeId)) {
        res.status(400).json({ error: 'Invalid challenge ID' });
        return;
      }

      const result = await leaderboardService.joinChallenge(userId, challengeId);
      res.status(200).json({ success: true, participation: result });
    } catch (error) {
      next(error);
    }
  }
}

export const leaderboardController = new LeaderboardController();
