import { Request, Response, NextFunction } from 'express';
import { routineService } from '../services/routine.service';
import type {
  CreateRoutineInput,
  UpdateRoutineInput,
  GetRoutinesQuery,
  AddExerciseToRoutineInput,
  UpdateRoutineExerciseInput,
  ReorderExercisesInput,
  GetPublicRoutinesQuery,
  GenerateWorkoutInput,
} from '../schemas/routine.schema';

import { workoutGenerationService } from '../services/ai/WorkoutGenerationService';

// Type helper for validated requests
interface ValidatedBody<T> extends Request {
  validated: T;
}

/**
 * Routine Controller - handles HTTP requests for routine management
 */
export const routineController = {
  /**
   * POST /api/v1/routines/generate - Generate AI workout
   */
  async generateWorkout(req: Request, res: Response, next: NextFunction) {
    try {
      const input = (req as ValidatedBody<GenerateWorkoutInput>).validated;
      const workoutPlan = await workoutGenerationService.generateWorkout({
        ...input,
        userId: req.userId!,
      });
      res.json({
        success: true,
        data: workoutPlan,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/routines - Create a new routine
   */
  async createRoutine(req: Request, res: Response, next: NextFunction) {
    try {
      const input = (req as ValidatedBody<CreateRoutineInput>).validated;
      const routine = await routineService.createRoutine(req.userId!, input);
      res.status(201).json({
        success: true,
        message: 'Routine created successfully',
        data: routine,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/routines - Get user's routines
   */
  async getRoutines(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req as unknown as { validated: GetRoutinesQuery }).validated;
      const result = await routineService.getRoutines(req.userId!, query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/routines/library - Get public/template routines
   */
  async getPublicRoutines(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req as unknown as { validated: GetPublicRoutinesQuery }).validated;
      const result = await routineService.getPublicRoutines(query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/routines/:id - Get routine by ID
   */
  async getRoutineById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid routine ID',
        });
        return;
      }
      const routine = await routineService.getRoutineById(req.userId!, id);
      res.json({
        success: true,
        data: routine,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/routines/:id - Update routine
   */
  async updateRoutine(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid routine ID',
        });
        return;
      }
      const input = (req as ValidatedBody<UpdateRoutineInput>).validated;
      const routine = await routineService.updateRoutine(req.userId!, id, input);
      res.json({
        success: true,
        message: 'Routine updated successfully',
        data: routine,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/routines/:id - Delete routine
   */
  async deleteRoutine(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid routine ID',
        });
        return;
      }
      const result = await routineService.deleteRoutine(req.userId!, id);
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/routines/:id/duplicate - Duplicate a routine
   */
  async duplicateRoutine(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid routine ID',
        });
        return;
      }
      const newName = req.body.name as string | undefined;
      const routine = await routineService.duplicateRoutine(req.userId!, id, newName);
      res.status(201).json({
        success: true,
        message: 'Routine duplicated successfully',
        data: routine,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/routines/:id/like - Like/unlike a routine
   */
  async toggleLike(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid routine ID',
        });
        return;
      }
      const routine = await routineService.toggleLike(req.userId!, id);
      res.json({
        success: true,
        message: 'Routine liked',
        data: { likes: routine.likes },
      });
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // ROUTINE EXERCISES
  // ============================================================================

  /**
   * POST /api/v1/routines/:id/exercises - Add exercise to routine
   */
  async addExercise(req: Request, res: Response, next: NextFunction) {
    try {
      const routineId = parseInt(req.params.id);
      if (isNaN(routineId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid routine ID',
        });
        return;
      }
      const input = (req as ValidatedBody<AddExerciseToRoutineInput>).validated;
      const exercise = await routineService.addExercise(req.userId!, routineId, input);
      res.status(201).json({
        success: true,
        message: 'Exercise added to routine',
        data: exercise,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/routines/:id/exercises/:exerciseId - Update routine exercise
   */
  async updateExercise(req: Request, res: Response, next: NextFunction) {
    try {
      const routineId = parseInt(req.params.id);
      const routineExerciseId = parseInt(req.params.exerciseId);
      if (isNaN(routineId) || isNaN(routineExerciseId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid ID',
        });
        return;
      }
      const input = (req as ValidatedBody<UpdateRoutineExerciseInput>).validated;
      const exercise = await routineService.updateExercise(
        req.userId!,
        routineId,
        routineExerciseId,
        input
      );
      res.json({
        success: true,
        message: 'Routine exercise updated',
        data: exercise,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/routines/:id/exercises/:exerciseId - Remove exercise from routine
   */
  async removeExercise(req: Request, res: Response, next: NextFunction) {
    try {
      const routineId = parseInt(req.params.id);
      const routineExerciseId = parseInt(req.params.exerciseId);
      if (isNaN(routineId) || isNaN(routineExerciseId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid ID',
        });
        return;
      }
      const result = await routineService.removeExercise(
        req.userId!,
        routineId,
        routineExerciseId
      );
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/routines/:id/exercises/reorder - Reorder exercises in routine
   */
  async reorderExercises(req: Request, res: Response, next: NextFunction) {
    try {
      const routineId = parseInt(req.params.id);
      if (isNaN(routineId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid routine ID',
        });
        return;
      }
      const input = (req as ValidatedBody<ReorderExercisesInput>).validated;
      const routine = await routineService.reorderExercises(req.userId!, routineId, input);
      res.json({
        success: true,
        message: 'Exercises reordered successfully',
        data: routine,
      });
    } catch (error) {
      next(error);
    }
  },
};
