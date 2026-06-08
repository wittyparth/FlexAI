import Redis from 'ioredis';
import { env } from './env';

export const isRedisEnabled = env.REDIS_ENABLED;

// Create Redis client
// Common Redis options
const commonOptions = {
  retryStrategy: (times: number) => {
    // Exponential backoff with max 2 seconds
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
};

// Create Redis client based on configuration
// Connection event handlers
const getRedisConfig = () => {
  if (env.REDIS_URL) {
    return { url: env.REDIS_URL };
  }

  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    console.log('🔌 Connecting to Upstash using REST credentials...');
    const url = new URL(env.UPSTASH_REDIS_REST_URL);
    return {
      host: url.hostname,
      port: 6379,
      password: env.UPSTASH_REDIS_REST_TOKEN,
      tls: {},
    };
  }

  return {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    tls: env.REDIS_HOST.includes('upstash') ? {} : undefined,
  };
};

const config = isRedisEnabled ? getRedisConfig() : null;

// Create Redis client based on configuration (optional)
export const redis: Redis | null = isRedisEnabled
  ? ('url' in (config as any)
      ? new Redis((config as any).url as string, commonOptions)
      : new Redis({
          ...(config as object),
          ...commonOptions,
        } as any))
  : null;

if (redis) {
  console.log('Redis config resolved. Instantiating Redis client...');
  try {
    console.log('Config details:', {
      ...config,
      password: (config as any).password ? '***' : undefined,
      url: (config as any).url,
    });
  } catch {
    console.log('Error logging config');
  }

  console.log('Redis client instantiated.');

  // Connection event handlers
  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });

  redis.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
  });

  redis.on('close', () => {
    console.log('⚠️ Redis connection closed');
  });
} else {
  console.log('⚠️ Redis disabled (REDIS_ENABLED=false). Running without cache/leaderboards in Redis.');
}

// Helper functions for common cache operations
export const cache = {
  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  },

  /**
   * Set cached value with TTL
   */
  async set(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
    if (!redis) return;
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  },

  /**
   * Delete cached value
   */
  async del(key: string): Promise<void> {
    if (!redis) return;
    await redis.del(key);
  },

  /**
   * Delete multiple keys by pattern
   */
  async delPattern(pattern: string): Promise<void> {
    if (!redis) return;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!redis) return false;
    const result = await redis.exists(key);
    return result === 1;
  },

  /**
   * Increment counter
   */
  async incr(key: string): Promise<number> {
    if (!redis) return 0;
    return redis.incr(key);
  },

  /**
   * Set expiry on existing key
   */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    if (!redis) return;
    await redis.expire(key, ttlSeconds);
  },
};

export default redis;
