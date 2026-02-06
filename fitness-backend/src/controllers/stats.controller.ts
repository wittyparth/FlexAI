import { Request, Response, NextFunction } from 'express';
import { statsService } from '../services/stats/stats.service';
import { prisma } from '../config/database';

export const statsController = {
  // 3.1 Personal Records
  async getPRs(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const exerciseId = req.query.exerciseId ? parseInt(req.query.exerciseId as string) : undefined;

      const whereObj: any = { userId };
      if (exerciseId) whereObj.exerciseId = exerciseId;

      const prs = await prisma.personalRecord.findMany({
        where: whereObj,
        include: { exercise: { select: { name: true } } },
        orderBy: { date: 'desc' },
        take: exerciseId ? undefined : 50 // Limit all PRs fetch
      });

      res.json({ success: true, data: prs });
    } catch (error) {
      next(error);
    }
  },

  async getStrengthMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const metrics = await statsService.getStrengthMetrics(userId);
      res.json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  },

  // 3.2 Volume & Consistency
  async getVolumeStats(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const timeframe = (req.query.timeframe as 'week'|'month'|'year') || 'month';
        const data = await statsService.getVolumeStats(userId, timeframe);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
  },

  async getConsistencyStats(req: Request, res: Response, next: NextFunction) {
      try {
          const userId = req.userId!;
          const data = await statsService.getConsistencyStats(userId);
          res.json({ success: true, data });
      } catch (error) {
          next(error);
      }
  },

  // 3.4 Muscle Distribution (Heatmap)
  async getMuscleHeatmap(req: Request, res: Response, next: NextFunction) {
      try {
          const userId = req.userId!;
          const data = await statsService.getMuscleDistribution(userId);
          res.json({ success: true, data });
      } catch (error) {
          next(error);
      }
  },

  // 3.5 Recovery
  async getRecoveryStatus(req: Request, res: Response, next: NextFunction) {
      try {
          const userId = req.userId!;
          const data = await statsService.getRecoveryStatus(userId);
          res.json({ success: true, data });
      } catch (error) {
          next(error);
      }
  },

  // 3.3 Body Tracking
  async getBodyStats(req: Request, res: Response, next: NextFunction) {
      try {
          const userId = req.userId!;
          const timeframe = (req.query.timeframe as any) || '3m';
          
          // Lazy load body service
          const { bodyTrackingService } = await import('../services/stats/body.service');
          const data = await bodyTrackingService.getBodyStats(userId, timeframe);
          
          res.json({ success: true, data });
      } catch (error) {
          next(error);
      }
  },

  // 3.6 Dashboard
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
      try {
          const userId = req.userId!;
          const { dashboardService } = await import('../services/stats/dashboard.service');
          const data = await dashboardService.getDashboardStats(userId);
          res.json({ success: true, data });
      } catch (error) {
          next(error);
      }
  },

  // 3.1 Strength Progression
  async getStrengthProgression(req: Request, res: Response, next: NextFunction) {
      try {
          const userId = req.userId!;
          const { exerciseId } = req.params;
          const data = await statsService.getStrengthProgression(userId, Number(exerciseId));
          res.json({ success: true, data });
      } catch (error) {
          next(error);
      }
  },

  // 3.2 Workout Frequency
  async getWorkoutFrequency(req: Request, res: Response, next: NextFunction) {
      try {
          const userId = req.userId!;
          const { timeframe } = req.query;
          const data = await statsService.getWorkoutFrequency(userId, timeframe as 'week' | 'month' | 'year');
          res.json({ success: true, data });
      } catch (error) {
          next(error);
      }
  }
};
