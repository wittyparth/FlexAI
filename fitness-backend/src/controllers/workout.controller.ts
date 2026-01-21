import { Request, Response, NextFunction } from 'express';
import { workoutService } from '../services/workout.service';
import type {
  GetWorkoutsQuery,
  StartWorkoutInput,
  UpdateWorkoutInput,
  AddExerciseToWorkoutInput,
  LogSetInput,
  UpdateSetInput,
  CompleteWorkoutInput,
} from '../schemas/workout.schema';

// Type helper for validated requests
interface ValidatedBody<T> extends Request {
  validated: T;
}

/**
 * Workout Controller - handles HTTP requests for workout logging
 */
export const workoutController = {
  /**
   * POST /api/v1/workouts - Start a new workout
   */
  async startWorkout(req: Request, res: Response, next: NextFunction) {
    try {
      const input = (req as ValidatedBody<StartWorkoutInput>).validated;
      const workout = await workoutService.startWorkout(req.userId!, input);
      res.status(201).json({
        success: true,
        data: workout,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/workouts - Get user's workouts
   */
  async getWorkouts(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req as unknown as { validated: GetWorkoutsQuery }).validated;
      const result = await workoutService.getWorkouts(req.userId!, query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/workouts/current - Get current in-progress workout
   */
  async getCurrentWorkout(req: Request, res: Response, next: NextFunction) {
    try {
      const workout = await workoutService.getCurrentWorkout(req.userId!);
      res.json({
        success: true,
        data: workout,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/workouts/:id - Get workout by ID
   */
  async getWorkoutById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const workout = await workoutService.getWorkoutById(req.userId!, id);
      res.json({
        success: true,
        data: workout,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/workouts/:id - Update workout
   */
  async updateWorkout(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const input = (req as ValidatedBody<UpdateWorkoutInput>).validated;
      const workout = await workoutService.updateWorkout(req.userId!, id, input);
      res.json({
        success: true,
        data: workout,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/workouts/:id - Delete workout
   */
  async deleteWorkout(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const result = await workoutService.deleteWorkout(req.userId!, id);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/workouts/:id/exercises - Add exercise to workout
   */
  async addExercise(req: Request, res: Response, next: NextFunction) {
    try {
      const workoutId = parseInt(req.params.id);
      const input = (req as ValidatedBody<AddExerciseToWorkoutInput>).validated;
      const exercise = await workoutService.addExercise(req.userId!, workoutId, input);
      res.status(201).json({
        success: true,
        data: exercise,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/workouts/:id/exercises/:exerciseId - Remove exercise
   */
  async removeExercise(req: Request, res: Response, next: NextFunction) {
    try {
      const workoutId = parseInt(req.params.id);
      const workoutExerciseId = parseInt(req.params.exerciseId);
      const result = await workoutService.removeExercise(req.userId!, workoutId, workoutExerciseId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/workouts/:id/exercises/:exerciseId/sets - Log a set
   */
  async logSet(req: Request, res: Response, next: NextFunction) {
    try {
      const workoutId = parseInt(req.params.id);
      const workoutExerciseId = parseInt(req.params.exerciseId);
      const input = (req as ValidatedBody<LogSetInput>).validated;
      const set = await workoutService.logSet(req.userId!, workoutId, workoutExerciseId, input);
      res.status(201).json({
        success: true,
        data: set,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/workouts/:id/sets/:setId - Update a set
   */
  async updateSet(req: Request, res: Response, next: NextFunction) {
    try {
      const workoutId = parseInt(req.params.id);
      const setId = parseInt(req.params.setId);
      const input = (req as ValidatedBody<UpdateSetInput>).validated;
      const set = await workoutService.updateSet(req.userId!, workoutId, setId, input);
      res.json({
        success: true,
        data: set,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/workouts/:id/sets/:setId - Delete a set
   */
  async deleteSet(req: Request, res: Response, next: NextFunction) {
    try {
      const workoutId = parseInt(req.params.id);
      const setId = parseInt(req.params.setId);
      const result = await workoutService.deleteSet(req.userId!, workoutId, setId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/workouts/:id/complete - Complete workout
   */
  async completeWorkout(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const input = (req as ValidatedBody<CompleteWorkoutInput>).validated;
      const workout = await workoutService.completeWorkout(req.userId!, id, input);
      res.json({
        success: true,
        data: workout,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/workouts/:id/cancel - Cancel workout
   */
  async cancelWorkout(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const workout = await workoutService.cancelWorkout(req.userId!, id);
      res.json({
        success: true,
        data: workout,
      });
    } catch (error) {
      next(error);
    }
  },
};
