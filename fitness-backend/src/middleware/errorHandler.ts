import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { env } from '../config/env';

// Error response interface
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId?: string;
}

/**
 * Global error handler middleware
 * Must be registered last in Express middleware chain
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = req.id as string | undefined;

  // Log the error
  if (err instanceof AppError && err.isOperational) {
    // Operational errors (expected, handled)
    logger.warn({
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      requestId,
      path: req.path,
      method: req.method,
    });
  } else {
    // Programming or unknown errors (unexpected)
    logger.error({
      message: err.message,
      stack: err.stack,
      requestId,
      path: req.path,
      method: req.method,
    });
  }

  // Determine response based on error type
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: env.NODE_ENV !== 'production' ? err.details : undefined,
      },
      requestId,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as Error & { code: string };
    let message = 'Database error';
    let statusCode = 500;

    if (prismaError.code === 'P2002') {
      message = 'A record with this value already exists';
      statusCode = 409;
    } else if (prismaError.code === 'P2025') {
      message = 'Record not found';
      statusCode = 404;
    }

    const response: ErrorResponse = {
      success: false,
      error: { code: 'DATABASE_ERROR', message },
      requestId,
    };
    res.status(statusCode).json(response);
    return;
  }

  // Default error response (unknown errors)
  const response: ErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message,
    },
    requestId,
  };
  res.status(500).json(response);
};

/**
 * 404 handler for unmatched routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
    requestId: req.id,
  });
};
