import { Request, Response, NextFunction } from 'express';
import { bodyTrackingService } from '../services/stats/body.service';
import { z } from 'zod';

export const bodyController = {
  // 3.3.1 Log Weight
  async logWeight(req: Request, res: Response, next: NextFunction): Promise<void | any> {
    try {
      const weightSchema = z.object({
        weight: z.number().positive(),
        date: z.string().optional()
      });

      const validated = weightSchema.parse(req.body);
      const userId = req.userId!;
      const result = await bodyTrackingService.logWeight(userId, validated.weight, validated.date ? new Date(validated.date) : undefined);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(422).json({ success: false, errors: error.errors });
        return;
      }
      next(error);
    }
  },

  // 3.3.1 Get Weight History
  async getWeightHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { startDate, endDate } = req.query;
      const history = await bodyTrackingService.getWeightHistory(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  },

  // 3.3.3 Log Measurements
  async logMeasurements(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const { date, ...measurements } = req.body;
        const result = await bodyTrackingService.logMeasurements(userId, measurements, date ? new Date(date) : undefined);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
  },

  // 3.3.3 Get Measurement History
  async getMeasurementHistory(req: Request, res: Response, next: NextFunction) {
      try {
          const userId = req.userId!;
          const { startDate, endDate } = req.query;
          const history = await bodyTrackingService.getMeasurementHistory(
              userId,
              startDate ? new Date(startDate as string) : undefined,
              endDate ? new Date(endDate as string) : undefined
          );
          res.json({ success: true, data: history });
      } catch (error) {
          next(error);
      }
  },

  // 3.3.4 Log Progress Photo
  async logProgressPhoto(req: Request, res: Response, next: NextFunction) {
      try {
          const userId = req.userId!;
          const { photoUrl, imageUrl, type, category, date, notes } = req.body;
          const url = photoUrl || imageUrl;
          const pose = type || category;
          const result = await bodyTrackingService.logProgressPhoto(userId, url, pose, date ? new Date(date) : undefined, notes);
          res.status(201).json({ success: true, data: result });
      } catch (error) {
          next(error);
      }
  },

  // 3.3.4 Get Progress Photos
  async getPhotos(req: Request, res: Response, next: NextFunction) {
      try {
          const userId = req.userId!;
          const { startDate, endDate } = req.query;
          const photos = await bodyTrackingService.getProgressPhotos(
              userId,
              startDate ? new Date(startDate as string) : undefined,
              endDate ? new Date(endDate as string) : undefined
          );
          res.json({ success: true, data: photos });
      } catch (error) {
          next(error);
      }
  }
};
