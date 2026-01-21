import { Request, Response, NextFunction } from 'express';
import { exerciseService } from '../services/exercise.service';
import type {
  GetExercisesQuery,
  CreateExerciseInput,
  UpdateExerciseInput,
} from '../schemas/exercise.schema';

// Type helper for validated requests
interface ValidatedBody<T> extends Request {
  validated: T;
}

/**
 * Exercise Controller - handles HTTP requests for exercise library
 */
export const exerciseController = {
  /**
   * GET /api/v1/exercises
   */
  async getExercises(req: Request, res: Response, next: NextFunction) {
    try {
      // Type assertion for validated query
      const query = (req as unknown as { validated: GetExercisesQuery }).validated;
      const result = await exerciseService.getExercises(query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/exercises/search
   */
  async searchExercises(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, limit } = req.query;
      const result = await exerciseService.searchExercises(
        q as string,
        limit ? parseInt(limit as string) : undefined
      );
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/exercises/muscle-groups
   */
  async getMuscleGroups(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await exerciseService.getMuscleGroups();
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/exercises/equipment
   */
  async getEquipment(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await exerciseService.getEquipmentList();
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/exercises/types
   */
  async getExerciseTypes(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await exerciseService.getExerciseTypes();
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/exercises/training-goals
   */
  async getTrainingGoals(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await exerciseService.getTrainingGoals();
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/exercises/featured
   */
  async getFeaturedExercises(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const result = await exerciseService.getFeaturedExercises(limit);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/exercises/:id
   */
  async getExerciseById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const exercise = await exerciseService.getExerciseById(id);
      res.json({
        success: true,
        data: exercise,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/exercises/slug/:slug
   */
  async getExerciseBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const exercise = await exerciseService.getExerciseBySlug(req.params.slug);
      res.json({
        success: true,
        data: exercise,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/exercises (custom exercise)
   */
  async createExercise(req: Request, res: Response, next: NextFunction) {
    try {
      const input = (req as ValidatedBody<CreateExerciseInput>).validated;
      const exercise = await exerciseService.createExercise(req.userId!, input);
      res.status(201).json({
        success: true,
        data: exercise,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/exercises/:id (custom exercise)
   */
  async updateExercise(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const input = (req as ValidatedBody<UpdateExerciseInput>).validated;
      const exercise = await exerciseService.updateExercise(req.userId!, id, input);
      res.json({
        success: true,
        data: exercise,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/exercises/:id (custom exercise)
   */
  async deleteExercise(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const result = await exerciseService.deleteExercise(req.userId!, id);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
