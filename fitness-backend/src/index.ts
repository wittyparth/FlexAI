import { createApp } from './app';
import { env, prisma, redis } from './config';
import { logger } from './utils';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      id?: string;
      userId?: number;
    }
  }
}

/**
 * Bootstrap and start the server
 */
async function bootstrap() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected');

    // Test Redis connection (optional)
    if (env.REDIS_ENABLED && redis) {
      await redis.connect();
      logger.info('✅ Redis connected');
    } else {
      logger.warn('⚠️ Redis is disabled. Continuing without Redis-backed features.');
    }

    // Create Express app
    const app = createApp();

    // Start server - bind to 0.0.0.0 to allow external connections
    const server = app.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${env.PORT}`);
      logger.info(`📍 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 Local: http://localhost:${env.PORT}/health`);
      logger.info(`🔗 Network: http://192.168.1.6:${env.PORT}/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      // Stop accepting new connections
      server.close(async () => {
        logger.info('HTTP server closed');

        // Close database connection
        await prisma.$disconnect();
        logger.info('Database disconnected');

        // Close Redis connection (if enabled)
        if (env.REDIS_ENABLED && redis) {
          await redis.quit();
          logger.info('Redis disconnected');
        }

        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Run the server
bootstrap();
