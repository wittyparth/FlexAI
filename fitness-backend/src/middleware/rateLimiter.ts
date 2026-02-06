import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { TooManyRequestsError } from '../utils/errors';

/**
 * Rate limiter middleware configuration
 */
export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // Default: 15 minutes
  max: env.RATE_LIMIT_MAX, // Default: 100 requests per window
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  
  // Skip rate limiting in development and test
  skip: () => env.NODE_ENV === 'development' || env.NODE_ENV === 'test',
  
  // Generate key from IP
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  
  // Custom error handler
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError());
  },
});

/**
 * Factory for creating custom rate limiters
 */
export const createRateLimiter = (options: Partial<Parameters<typeof rateLimit>[0]>) => {
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => env.NODE_ENV === 'development' || env.NODE_ENV === 'test',
    keyGenerator: (req) => {
      return req.ip || req.socket.remoteAddress || 'unknown';
    },
    handler: (_req, _res, next) => {
      next(new TooManyRequestsError());
    },
    ...options,
  });
};

/**
 * Stricter rate limit for auth endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  
  skip: () => env.NODE_ENV === 'development' || env.NODE_ENV === 'test',
  
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('Too many authentication attempts'));
  },
});
