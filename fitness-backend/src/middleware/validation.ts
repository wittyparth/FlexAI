import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

/**
 * Middleware factory for validating request data with Zod
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const validated = schema.parse(data);
      
      // Attach validated data to request
      (req as unknown as Record<string, unknown>).validated = validated;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Validation failed', details));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Type helper for accessing validated data
 */
export interface ValidatedRequest<T> extends Request {
  validated: T;
}
