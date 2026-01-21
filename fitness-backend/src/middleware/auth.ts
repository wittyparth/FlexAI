import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

/**
 * Auth middleware - verifies JWT and attaches user to request
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    const payload = verifyAccessToken(token);

    if (!payload) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    // Attach user info to request
    req.userId = payload.userId;
    (req as unknown as Record<string, unknown>).userEmail = payload.email;
    (req as unknown as Record<string, unknown>).userRole = payload.role;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional auth - doesn't fail if no token, but attaches user if present
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      
      if (payload) {
        req.userId = payload.userId;
        (req as unknown as Record<string, unknown>).userEmail = payload.email;
        (req as unknown as Record<string, unknown>).userRole = payload.role;
      }
    }

    next();
  } catch {
    // Ignore errors for optional auth
    next();
  }
};

/**
 * Role-based access control middleware
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = (req as unknown as Record<string, unknown>).userRole as string;
    
    if (!userRole) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(userRole)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};
