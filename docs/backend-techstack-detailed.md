# 🏗️ COMPLETE PRODUCTION-READY BACKEND TECH STACK
## Fitness App - Detailed Architecture & Specifications

**Last Updated:** January 2026  
**Target Scale:** 100k-1M users in Year 1  
**Performance Target:** <200ms API response, 10k req/sec capacity  

---

## 📋 EXECUTIVE SUMMARY - TECH STACK AT A GLANCE

```
TIER 1: CORE BACKEND
├─ Runtime: Node.js v20 LTS (V8 engine)
├─ Language: TypeScript 5.3+ (strict mode)
├─ Framework: Express.js 4.18+ with Fastify alternative
└─ Architecture: Layered + Event-driven (Microservices ready)

TIER 2: DATABASE LAYER
├─ Primary: PostgreSQL 16+ with Advanced Features
├─ ORM: Prisma 5.8+ (type-safe, migrations auto)
├─ Caching: Redis 7.x Cluster (high availability)
└─ Message Queue: Bull (Redis-backed job processing)

TIER 3: DATA LAYER
├─ Validation: Zod 3.22+ (runtime + type generation)
├─ Serialization: JSON serialization with compression
├─ Search (Future): OpenSearch / Elasticsearch
└─ Analytics DB (Future): TimescaleDB for time-series

TIER 4: INFRASTRUCTURE
├─ Containerization: Docker + Docker Compose
├─ Orchestration: Kubernetes (production) / Fly.io (MVP)
├─ API Gateway: NGINX / Kong (optional, advanced)
└─ Load Balancing: HAProxy / AWS ALB

TIER 5: SECURITY & MONITORING
├─ Authentication: JWT + OAuth2 (Passport.js)
├─ Authorization: RBAC (Role-based access control)
├─ Secrets: AWS Secrets Manager / Vault
├─ Logging: Winston + Morgan + ELK Stack
├─ Monitoring: Prometheus + Grafana
├─ Tracing: Jaeger / Datadog
├─ Error Tracking: Sentry
└─ Security Scanning: OWASP + SonarQube
```

---

## 🔧 DETAILED SPECIFICATIONS BY LAYER

### LAYER 1: RUNTIME & LANGUAGE

#### Node.js Configuration

```
Version: Node.js 20.11 LTS (or latest LTS)

Rationale:
- V8 engine: 80-90% faster execution than v18
- Latest async/await optimizations
- Worker threads (CPU-bound tasks)
- Native ESM support (if using modules)
- Security patches for 3+ years

Installation:
- Use NVM (Node Version Manager) for easy switching
- Lock version in .nvmrc: v20.11.0
- Docker: node:20-alpine (slim, 170MB vs 910MB for full)

Recommended flags for production:
- --max-old-space-size=4096 (heap size tuning)
- --enable-source-maps (for error tracking)
```

#### TypeScript Configuration

```typescript
// tsconfig.json - Production-ready settings
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,                    // IMPORTANT: Strict mode
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "sourceMap": true,                 // For error tracking
    "declaration": true,               // Generate .d.ts
    "declarationMap": true,
    "removeComments": false,           // Keep comments in source
    "noEmit": false,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "allowUnusedLabels": false
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

### LAYER 2: WEB FRAMEWORK

#### Express.js Configuration

```typescript
// src/app.ts - Production Express setup
import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import winston from 'winston';

const app: Express = express();

// 1. Security Middleware
app.use(helmet()); // HSTS, CSP, X-Frame-Options, etc.
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  maxAge: 3600
}));

// 2. Rate Limiting (global)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development',
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || 'unknown',
});
app.use('/api/', limiter);

// 3. Compression (reduce payload by 60-80%)
app.use(compression());

// 4. Body parsing
app.use(express.json({ limit: '50mb' })); // Video upload support
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 5. Logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// 6. Request ID tracking
app.use((req, res, next) => {
  req.id = req.get('X-Request-ID') || crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

export default app;
```

**Alternative: Fastify (2x faster than Express)**

```typescript
// Use if performance is critical (>5k concurrent users)
import Fastify from 'fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import fastifyRateLimit from '@fastify/rate-limit';

const fastify = Fastify({
  logger: true,
  bodyLimit: 50 * 1024 * 1024 // 50MB
});

await fastify.register(fastifyHelmet);
await fastify.register(fastifyCors);
await fastify.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '15 minutes'
});
```

---

### LAYER 3: DATABASE LAYER

#### PostgreSQL 16+ Configuration

```sql
-- PostgreSQL Production Tuning (postgresql.conf)

-- Memory Configuration
shared_buffers = 32GB              -- 25% of system RAM (256GB system)
effective_cache_size = 96GB        -- 75% of system RAM
work_mem = 256MB                   -- Per sort/hash operation
maintenance_work_mem = 4GB         -- For VACUUM, INDEX, etc.

-- Connection Management
max_connections = 500
max_prepared_transactions = 100

-- Query Optimization
random_page_cost = 1.1             -- For SSD (default 4.0 for HDD)
effective_io_concurrency = 200     -- Parallel I/O
jit = on                           -- JIT compilation for complex queries
jit_above_cost = 100000

-- WAL (Write-Ahead Logging) - for durability
wal_level = replica                -- Full replication support
synchronous_commit = local         -- Balance speed/safety
max_wal_senders = 10               -- Replication connections

-- Logging & Monitoring
log_statement = 'all'              -- In dev/staging (not prod)
log_duration = on
log_min_duration_statement = 1000  -- Log queries >1s
log_connections = on
log_disconnections = on
log_lock_waits = on
log_replication_commands = on

-- Vacuum & Autovacuum
autovacuum = on
autovacuum_max_workers = 4
autovacuum_naptime = '30s'
maintenance_work_mem = 4GB
```

#### Prisma ORM Setup

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "traceQueryEngine"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ======== CORE MODELS ========

model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique @db.VarChar(255)
  password  String    @db.VarChar(255)
  firstName String?   @db.VarChar(100)
  lastName  String?   @db.VarChar(100)
  
  // Profile
  age       Int?
  gender    String?   @db.VarChar(10)
  height    Float?    // cm
  weight    Float?    // kg
  experienceLevel String? @db.VarChar(50) // beginner, intermediate, advanced
  primaryGoal String?  @db.VarChar(50) // muscle gain, fat loss, strength
  
  // Account
  emailVerified Boolean @default(false)
  isActive  Boolean   @default(true)
  role      String    @default("user") // user, trainer, admin
  
  // Timestamps
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  // Relations
  workouts  Workout[]
  routines  Routine[]
  settings  UserSettings?
  sessions  Session[]
  followers Follower[] @relation("follower")
  following Follower[] @relation("following")
  posts     Post[]
  
  @@index([email])
  @@index([createdAt])
  @@map("users")
}

model Workout {
  id          Int       @id @default(autoincrement())
  userId      Int
  date        DateTime  @default(now())
  duration    Int       // minutes
  
  // Exercise data
  exercises   WorkoutExercise[]
  
  // Metrics
  totalVolume Float?    // weight × reps × sets sum
  averageRPE  Float?    // Rate of perceived exertion
  notes       String?   @db.Text
  
  // Form check data (from mobile)
  formCheckUsed Boolean @default(false)
  formScoreAvg Int?     // 0-100
  
  // Recovery data
  energyLevel Int?      // 1-10
  soreness    Json?     // { "chest": 3, "legs": 7 }
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([date])
  @@index([createdAt])
  @@map("workouts")
}

model WorkoutExercise {
  id        Int       @id @default(autoincrement())
  workoutId Int
  
  exerciseId Int       // Reference to exercise library
  
  // Set data (array)
  sets      Json      // [{ reps: 5, weight: 225, rpe: 8 }, ...]
  
  // Performance
  totalReps Int?
  totalWeight Float?
  personalRecord Boolean @default(false)
  
  // Form check (per exercise)
  formScore Int?      // 0-100
  formNotes String?   @db.Text
  
  createdAt DateTime  @default(now())
  
  workout Workout @relation(fields: [workoutId], references: [id], onDelete: Cascade)
  
  @@index([workoutId])
  @@index([exerciseId])
  @@map("workout_exercises")
}

model Exercise {
  id          Int       @id @default(autoincrement())
  name        String    @unique @db.VarChar(255)
  description String?   @db.Text
  
  // Classification
  primaryMuscle String  @db.VarChar(50)  // chest, back, legs, etc.
  secondaryMuscles Json? // ["biceps", "shoulders"]
  equipment   Json?     // ["barbell", "dumbbells"]
  difficulty  String    @db.VarChar(50) // beginner, intermediate, advanced
  
  // Form check capability
  hasFormCheck Boolean @default(false)
  formCheckMetrics Json? // Metrics tracked (depth, knee tracking, etc.)
  
  // Media
  videoUrl    String?   @db.VarChar(500)
  imageUrl    String?   @db.VarChar(500)
  formCues    String[]  @db.VarChar(500)[]
  commonMistakes Json?
  
  isCustom    Boolean   @default(false)
  createdBy   Int?      // User ID if custom
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([primaryMuscle])
  @@index([difficulty])
  @@fulltext([name, description])
  @@map("exercises")
}

model Routine {
  id        Int       @id @default(autoincrement())
  userId    Int
  
  name      String    @db.VarChar(255)
  description String? @db.Text
  
  // Schedule
  daysPerWeek Int
  schedule  Json      // { "monday": true, "tuesday": true, ... }
  
  // Exercises in routine
  exercises RoutineExercise[]
  
  // Metadata
  isPublic  Boolean   @default(false)
  likes     Int       @default(0)
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([isPublic])
  @@map("routines")
}

model RoutineExercise {
  id        Int       @id @default(autoincrement())
  routineId Int
  exerciseId Int
  
  targetSets Int
  targetReps Int?     // Range: 5-12 for hypertrophy
  targetWeight Float?
  restSeconds Int     // Between sets
  
  notes     String?   @db.Text
  
  routine Routine @relation(fields: [routineId], references: [id], onDelete: Cascade)
  
  @@index([routineId])
  @@map("routine_exercises")
}

model Session {
  id        Int       @id @default(autoincrement())
  userId    Int
  
  token     String    @unique @db.VarChar(500)
  expiresAt DateTime
  
  deviceInfo Json?    // { "userAgent": "...", "ip": "..." }
  isActive  Boolean   @default(true)
  
  createdAt DateTime  @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([expiresAt])
  @@map("sessions")
}

model Follower {
  id        Int       @id @default(autoincrement())
  followerId Int
  followingId Int
  
  createdAt DateTime  @default(now())
  
  follower User @relation("follower", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("following", fields: [followingId], references: [id], onDelete: Cascade)
  
  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
  @@map("followers")
}

model Post {
  id        Int       @id @default(autoincrement())
  userId    Int
  
  content   String    @db.Text
  workoutId Int?      // If posting about workout
  
  likes     Int       @default(0)
  comments  Comment[]
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([createdAt])
  @@map("posts")
}

model Comment {
  id        Int       @id @default(autoincrement())
  postId    Int
  
  content   String    @db.Text
  likes     Int       @default(0)
  
  createdAt DateTime  @default(now())
  
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  @@index([postId])
  @@map("comments")
}

model UserSettings {
  id        Int       @id @default(autoincrement())
  userId    Int       @unique
  
  // Preferences
  units     String    @default("metric") // metric, imperial
  theme     String    @default("system") // light, dark, system
  language  String    @default("en")
  
  // Notifications
  pushEnabled Boolean @default(true)
  emailUpdates Boolean @default(true)
  
  // Privacy
  profilePrivate Boolean @default(false)
  showStats Boolean @default(true)
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_settings")
}
```

---

### LAYER 4: CACHING LAYER (Redis)

#### Redis Configuration

```yaml
# docker-compose.yml - Redis Cluster Setup
version: '3.8'

services:
  redis-master:
    image: redis:7.2-alpine
    command: redis-server --maxmemory 4gb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - backend
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis-replica:
    image: redis:7.2-alpine
    command: redis-server --port 6380 --slaveof redis-master 6379 --maxmemory 4gb
    ports:
      - "6380:6380"
    depends_on:
      - redis-master
    networks:
      - backend
    
  redis-sentinel:
    image: redis:7.2-alpine
    command: redis-sentinel /etc/redis/sentinel.conf
    ports:
      - "26379:26379"
    volumes:
      - ./redis-sentinel.conf:/etc/redis/sentinel.conf
    depends_on:
      - redis-master
      - redis-replica
    networks:
      - backend

volumes:
  redis_data:

networks:
  backend:
```

#### Redis Usage Patterns

```typescript
// src/core/redis.ts - Redis client with connection pooling
import Redis from 'ioredis';
import { RedisCacheAdapter } from './cache-adapter';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
  // Connection pooling
  sentinels: [
    { host: 'redis-sentinel', port: 26379 }
  ],
  name: 'mymaster'
});

// Cache Strategies:

// 1. Session Caching
export const cacheSession = async (userId: number, token: string, ttl = 86400) => {
  await redis.set(
    `session:${userId}:${token}`,
    JSON.stringify({ userId, createdAt: Date.now() }),
    'EX',
    ttl
  );
};

// 2. User Stats Caching (1 hour TTL)
export const cacheUserStats = async (userId: number) => {
  const stats = await calculateStats(userId);
  await redis.set(
    `stats:${userId}`,
    JSON.stringify(stats),
    'EX',
    3600
  );
};

// 3. Leaderboard (Sorted Set - for rankings)
export const updateLeaderboard = async (userId: number, score: number) => {
  await redis.zadd('leaderboard:all-time', score, `user:${userId}`);
  await redis.zadd('leaderboard:monthly', score, `user:${userId}`);
  
  // Keep top 10k for memory
  await redis.zremrangebyrank('leaderboard:all-time', 0, -10001);
};

// 4. Rate Limiting (using INCR)
export const checkRateLimit = async (key: string, limit: number, window: number) => {
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, window);
  }
  return current <= limit;
};

// 5. Pub/Sub for Real-time Updates
export const subscribeToUpdates = (channel: string, callback: Function) => {
  redis.subscribe(channel, (err, count) => {
    if (err) console.error('Failed to subscribe:', err);
  });
  
  redis.on('message', (channel, message) => {
    callback(JSON.parse(message));
  });
};

export const publishUpdate = async (channel: string, data: any) => {
  await redis.publish(channel, JSON.stringify(data));
};

// 6. Pipeline (reduce network round-trips)
export const pipelinedUpdate = async (updates: Array<[string, any]>) => {
  const pipeline = redis.pipeline();
  
  for (const [key, value] of updates) {
    pipeline.set(key, JSON.stringify(value), 'EX', 3600);
  }
  
  await pipeline.exec();
};

export default redis;
```

#### Multi-Layer Caching Strategy

```typescript
// src/cache/multi-layer-cache.ts
class MultiLayerCache {
  private localCache = new Map(); // L1: In-memory
  private redis: Redis; // L2: Redis
  private db: PrismaClient; // L3: PostgreSQL

  async get(key: string, fetchFn: () => Promise<any>, ttl = 3600) {
    // L1: Check local cache (microseconds)
    if (this.localCache.has(key)) {
      return this.localCache.get(key);
    }

    // L2: Check Redis (milliseconds)
    const cached = await this.redis.get(key);
    if (cached) {
      const data = JSON.parse(cached);
      // Update L1 for 10s
      this.localCache.set(key, data);
      setTimeout(() => this.localCache.delete(key), 10000);
      return data;
    }

    // L3: Fetch from DB/compute
    const data = await fetchFn();
    
    // Update all layers
    this.localCache.set(key, data);
    await this.redis.set(key, JSON.stringify(data), 'EX', ttl);
    
    return data;
  }
}

// Usage
const cache = new MultiLayerCache();
const stats = await cache.get(
  `stats:${userId}`,
  () => calculateUserStats(userId),
  3600 // 1 hour Redis TTL
);
```

---

### LAYER 5: VALIDATION & SERIALIZATION

#### Zod Schemas

```typescript
// src/schemas/workout.ts
import { z } from 'zod';

export const createWorkoutSchema = z.object({
  exerciseId: z.number().int().positive(),
  sets: z.array(
    z.object({
      reps: z.number().int().positive().min(1).max(500),
      weight: z.number().positive().max(1000),
      rpe: z.number().min(1).max(10).optional(),
    })
  ).min(1).max(100),
  date: z.date().optional(),
  duration: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
  formScore: z.number().min(0).max(100).optional(),
});

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

// Runtime validation middleware
export const validateWorkout = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.validated = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
    }
  };
};
```

---

### LAYER 6: LOGGING & MONITORING

#### Winston Logger Setup

```typescript
// src/utils/logger.ts
import winston from 'winston';
import 'winston-mongodb';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'fitness-api' },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
    
    // Combined logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 30,
    }),
    
    // MongoDB (for querying)
    new winston.transports.MongoDB({
      db: process.env.MONGODB_URI,
      collection: 'logs',
      tryReconnect: true,
    }),
  ],
});

// Console logging in dev
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

export default logger;
```

#### Prometheus Metrics

```typescript
// src/utils/metrics.ts
import promClient from 'prom-client';

// Standard metrics
promClient.collectDefaultMetrics({ timeout: 5000 });

// Custom metrics
export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5], // seconds
});

export const databaseQueryDuration = new promClient.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
});

export const redisOperationDuration = new promClient.Histogram({
  name: 'redis_operation_duration_seconds',
  help: 'Duration of Redis operations',
  labelNames: ['operation'],
  buckets: [0.001, 0.01, 0.05, 0.1],
});

export const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

// Middleware to track request duration
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.observe(
      { method: req.method, route: req.route?.path || req.path, status: res.statusCode },
      duration
    );
  });
  
  next();
};
```

---

### LAYER 7: API GATEWAY & LOAD BALANCING

#### NGINX Configuration (API Gateway)

```nginx
# nginx.conf - Production setup
upstream backend {
    least_conn;
    server backend1:3000 weight=1 max_fails=3 fail_timeout=30s;
    server backend2:3000 weight=1 max_fails=3 fail_timeout=30s;
    server backend3:3000 weight=1 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name api.fitness.com;
    
    # SSL
    ssl_certificate /etc/letsencrypt/live/fitness.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fitness.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Caching
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:100m;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=100r/s;
    limit_req_zone $http_x_user_id zone=user_limit:10m rate=50r/s;
    
    location /api/v1/ {
        limit_req zone=general_limit burst=50 nodelay;
        limit_req zone=user_limit burst=20 nodelay;
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Request-ID $request_id;
        
        # Keep-alive
        proxy_set_header Connection "";
        
        # Caching (only GET requests)
        proxy_cache api_cache;
        proxy_cache_key "$scheme$request_method$host$request_uri";
        proxy_cache_valid 200 1h;
        proxy_cache_bypass $http_cache_control;
        add_header X-Cache-Status $upstream_cache_status;
        
        # Timeouts
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 30s;
    }
    
    # Health check
    location /health {
        access_log off;
        proxy_pass http://backend;
    }
}
```

---

### LAYER 8: DEPLOYMENT & CONTAINERIZATION

#### Dockerfile

```dockerfile
# Dockerfile - Multi-stage build for minimal image
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Build TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Security: Non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built app
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

USER nodejs

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

#### Docker Compose (Full Stack)

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: fitness_db
      POSTGRES_USER: fitness_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - backend
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fitness_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - backend
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://fitness_user:${POSTGRES_PASSWORD}@postgres:5432/fitness_db
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/letsencrypt:ro
    depends_on:
      - api
    networks:
      - backend

volumes:
  postgres_data:
  redis_data:

networks:
  backend:
    driver: bridge
```

---

## 🎯 PERFORMANCE SPECIFICATIONS

### Target Metrics

| Metric | Target | How Achieved |
|--------|--------|-------------|
| **API Response Time (p95)** | <200ms | Redis caching + query optimization |
| **API Response Time (p99)** | <500ms | Proper indexing + connection pooling |
| **Throughput** | 10k req/sec | Load balancing + horizontal scaling |
| **Database Query Time** | <50ms (avg) | Indexes + query optimization |
| **Cache Hit Rate** | >80% | Multi-layer caching strategy |
| **Uptime** | 99.99% | Redis Sentinel + DB replication |
| **Concurrent Users** | 100k+ | Stateless design + load balancing |

### Load Testing Results (Expected)

```
Scenario: 100 concurrent users, 30-minute test

Results:
- Avg Response Time: 145ms
- Max Response Time: 487ms
- Min Response Time: 12ms
- Requests/sec: 850 req/sec
- Error Rate: 0.02%
- CPU Usage: 45%
- Memory Usage: 2.3GB / 8GB
- Throughput: 45.6k req/30min

Bottleneck: Database queries
Solution: Add read replicas + connection pooling
```

---

## 🔐 SECURITY SPECIFICATIONS

### API Authentication Flow

```typescript
// JWT + Refresh Token Pattern
const authFlow = {
  login: {
    request: { email, password },
    response: { accessToken: <15min>, refreshToken: <7days> }
  },
  
  refresh: {
    request: { refreshToken },
    response: { accessToken: <new 15min> }
  },
  
  logout: {
    action: 'Invalidate both tokens in Redis'
  }
};
```

### Environment Secrets

```bash
# .env.production (never commit!)
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://:pass@host:6379
JWT_SECRET=<very-long-random-string>
JWT_REFRESH_SECRET=<different-long-random-string>
OAUTH_GOOGLE_ID=...
OAUTH_GOOGLE_SECRET=...
OAUTH_APPLE_ID=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
SENTRY_DSN=https://...@sentry.io/...
```

---

## 📊 MONITORING & OBSERVABILITY

### Key Dashboards

**1. System Health Dashboard**
- CPU, Memory, Disk usage
- Connections (DB, Redis, API)
- Request rate + errors
- Latency percentiles (p50, p95, p99)

**2. Application Dashboard**
- API endpoint performance
- Database query performance
- Cache hit/miss rates
- Error logs (by type, endpoint)

**3. User Analytics**
- DAU, MAU, signup rate
- Feature usage
- User retention
- Revenue metrics

---

## 🚀 SCALING STRATEGY

### Vertical Scaling (Initial)
- 16GB RAM, 4 CPU (for 10k users)
- 32GB RAM, 8 CPU (for 50k users)
- 64GB RAM, 16 CPU (for 100k users)

### Horizontal Scaling (Beyond 100k users)
- **API Layer:** Load balancer + multiple instances
- **Database:** Read replicas + sharding
- **Cache:** Redis Cluster
- **Storage:** CDN for static content
- **Search:** Elasticsearch cluster

### Microservices Transition (Year 2+)
- Analytics service (separate)
- Notifications service (separate)
- AI/ML service (separate)
- Payment processing (separate)

---

## 💾 BACKUP & DISASTER RECOVERY

```bash
# Daily backups
pg_dump fitness_db | gzip > backups/$(date +%Y-%m-%d).sql.gz

# Weekly full backup to S3
aws s3 cp backups/ s3://fitness-backups/$(date +%Y-W%V)/ --recursive

# Redis persistence
- RDB snapshots: Every 1 hour
- AOF log: Every 5 seconds
- Replication: Master-Slave setup

# Recovery Time Objective (RTO): 1 hour
# Recovery Point Objective (RPO): 5 minutes
```

---

## ✅ PRODUCTION CHECKLIST

Before deployment, ensure:

- [ ] All environment variables set
- [ ] Database migrations tested
- [ ] Logging configured
- [ ] Monitoring setup (Prometheus + Grafana)
- [ ] Error tracking (Sentry)
- [ ] Rate limiting configured
- [ ] CORS properly scoped
- [ ] HTTPS enforced
- [ ] SSL certificates installed
- [ ] Load balancer health checks working
- [ ] Database backups automated
- [ ] Disaster recovery plan documented
- [ ] Security audit completed
- [ ] Performance baseline established
- [ ] Alerting rules configured

---

## 🎓 COST ESTIMATION (Year 1)

```
AWS Costs (100k users):
├─ RDS PostgreSQL (db.r6i.xlarge): $800/month
├─ ElastiCache Redis (r6g.xlarge): $600/month
├─ EC2 instances (3x t3.large): $300/month
├─ Networking/Data Transfer: $200/month
├─ S3 (for backups): $50/month
└─ Monitoring/Logging: $200/month

Total Infrastructure: ~$2,150/month (~$26k/year)

Per-user cost: $0.26/user/year
```

---

**This is a comprehensive, production-grade tech stack for a high-performance fitness app backend supporting 100k-1M users.**
