# Fitness Backend API

Production-ready fitness app backend with AI form check, coaching, and social features.

## Tech Stack

- **Runtime:** Node.js 20 LTS
- **Language:** TypeScript 5.3+ (strict mode)
- **Framework:** Express.js 4.18
- **Database:** PostgreSQL 16+ with Prisma ORM
- **Cache:** Redis 7.x with ioredis
- **Queue:** BullMQ for background jobs
- **Auth:** JWT + OAuth2 (Google, Apple)

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Start database
docker-compose up -d postgres redis

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start development server
npm run dev
```

## Local Docker Runtime (API + DB + Redis)

Use this when you want the backend API running fully in Docker:

```bash
# 1) Create and configure env file
cp .env.example .env

# 2) Start full stack (api profile enabled)
docker compose --profile production up -d --build

# 3) Apply schema and seed data from host
npm run db:migrate
npm run db:seed
```

Notes:
- `docker-compose.yml` reads `.env` for required app secrets and overrides DB/Redis hosts for the Docker network.
- Keep real credentials only in `.env` (never in `.env.example`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `npm test` | Run all tests |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |

## API Documentation

API documentation available at `/api/docs` when server is running.

## Project Structure

```
src/
├── config/       # Configuration files
├── controllers/  # Route handlers
├── middleware/   # Express middleware
├── routes/       # API routes
├── services/     # Business logic
├── repositories/ # Data access layer
├── jobs/         # Background job processors
├── schemas/      # Zod validation schemas
└── utils/        # Utility functions
```
