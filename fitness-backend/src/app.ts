import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { randomUUID } from 'crypto';

import { env } from './config';
import { logger } from './utils';
import { errorHandler, notFoundHandler, rateLimiter } from './middleware';
import apiRoutes from './routes';

/**
 * Create and configure Express application
 */
export const createApp = (): Express => {
  const app = express();

  // ==========================================================================
  // SECURITY MIDDLEWARE
  // ==========================================================================
  
  // Security headers (HSTS, CSP, X-Frame-Options, etc.)
  app.use(helmet());
  
  // CORS configuration
  const corsOrigins = env.CORS_ORIGINS.split(',').map(origin => origin.trim());
  app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    maxAge: 86400, // 24 hours
  }));

  // ==========================================================================
  // PERFORMANCE MIDDLEWARE
  // ==========================================================================
  
  // Response compression (gzip)
  app.use(compression());
  
  // Rate limiting
  app.use('/api/', rateLimiter);

  // ==========================================================================
  // REQUEST PARSING
  // ==========================================================================
  
  // Parse JSON bodies
  app.use(express.json({ limit: '10mb' }));
  
  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ==========================================================================
  // REQUEST TRACKING
  // ==========================================================================
  
  // Add request ID for tracing
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = req.get('X-Request-ID') || randomUUID();
    req.id = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  });

  // HTTP request logging
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim(), { type: 'http' })
    },
    skip: (req: Request) => req.path === '/health'
  }));

  // ==========================================================================
  // HEALTH CHECK
  // ==========================================================================
  
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // ==========================================================================
  // API ROUTES
  // ==========================================================================
  
  app.use('/api/v1', apiRoutes);

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================
  
  // 404 handler (must be before error handler)
  app.use(notFoundHandler);
  
  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};

export default createApp;
