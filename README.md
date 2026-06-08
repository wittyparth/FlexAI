# FlexAI

AI-powered full-stack fitness platform with a React Native mobile app and a TypeScript backend.

FlexAI combines workout tracking, routine planning, AI-assisted coaching, social fitness features, and advanced fitness analytics in one system.

## What This Project Includes

- Mobile app built with Expo + React Native + TypeScript
- Backend API built with Express + TypeScript + Prisma
- PostgreSQL as the source of truth
- Redis for caching and background jobs
- AI integrations for coaching and advanced features
- Modular architecture for workouts, routines, social, body tracking, gamification, and notifications

## Product Vision

FlexAI is designed as an intelligent fitness companion that supports:

- Personalized onboarding and goals
- Fast workout logging and routine execution
- AI-generated workout guidance
- Body and progress tracking
- Social interactions and challenges
- Gamification and streak systems

For detailed planning and feature strategy, see:
- fitness-complete-features.md

## Repository Structure

- fitness-app: React Native mobile app (Expo)
- fitness-backend: Node.js API server and database layer
- docs: Product and process documentation
- fitness-app/docs: Frontend architecture and implementation documentation

## Architecture at a Glance

### Frontend (fitness-app)

- Framework: Expo 54 + React Native 0.81 + React 19
- Language: TypeScript
- Navigation: React Navigation (tabs + nested stacks)
- State: Zustand (local/session state) + React Query (server state)
- Networking: Axios API client modules by domain
- UI/UX: Design system + componentized screens
- Camera/AI foundation: Expo Camera + TensorFlow.js dependencies

Screen architecture and inventory:
- 92 screens planned
- 83 screens implemented
- 9 screens marked missing in analysis docs

Primary screen domains:
- Auth
- Onboarding
- Home
- Workout
- Explore
- Social
- Profile
- Settings
- Coach
- Analytics
- Body tracking

Key frontend docs:
- fitness-app/SCREENS_AND_NAVIGATION.md
- fitness-app/MISSING_SCREENS_ANALYSIS.md
- fitness-app/docs/architecture/README.md
- fitness-app/docs/architecture/FRONTEND_HLD.md
- fitness-app/docs/architecture/FRONTEND_LLD.md
- fitness-app/docs/architecture/API_CONTRACTS.md

### Backend (fitness-backend)

- Runtime: Node.js 20+
- Framework: Express 4
- Language: TypeScript
- Database: PostgreSQL + Prisma ORM
- Cache/Queue: Redis + BullMQ
- Validation: Zod
- Security middleware: Helmet, CORS, rate limiting, JWT

Main route modules:
- auth
- user
- workout
- routine
- exercise
- coach
- body
- stats
- feed
- social
- leaderboard
- gamification
- notification

Data model domains (Prisma):
- users and sessions
- settings and onboarding profile data
- exercises and exercise metadata
- workouts, workout exercises, sets
- routines and routine exercises
- body metrics and progress tracking
- social entities (posts, comments, follows, likes)
- achievements and gamification
- notifications and device tokens

Backend docs:
- fitness-backend/README.md

## Core Features

### 1) Authentication and Profile

- Email/password flows
- Google OAuth support (configurable)
- JWT-based auth with access and refresh handling
- User profile, settings, and preferences

### 2) Onboarding and Personalization

- Goal selection
- Experience level
- Physical profile and training preferences
- Equipment and workout schedule preferences

### 3) Workout and Routine System

- Create and manage routines
- Exercise discovery and selection
- Active workout flow and set tracking
- Workout history and session insights

### 4) AI and Coaching Layer

- AI API modules in frontend and backend
- Coach endpoints and conversation scaffolding
- Prompt-based generation workflows

### 5) Social and Community

- Feed and social modules
- Profile interactions
- Leaderboards and challenge-style mechanics

### 6) Body Tracking and Analytics

- Body metrics logging
- Progress and stats modules
- Gamification/XP support

### 7) Notifications and Engagement

- Notification APIs and settings
- Device token support on backend

## Technology Stack

### Mobile App

- expo
- react-native
- react-navigation
- @tanstack/react-query
- zustand
- axios
- expo-camera
- tensorflow/tfjs and pose-detection related packages

### Backend

- express
- prisma and @prisma/client
- zod
- jsonwebtoken
- passport and passport-jwt
- bullmq
- ioredis
- winston
- morgan
- bcryptjs

### Infra

- PostgreSQL (Docker compose ready)
- Redis (Docker compose ready)

## Local Development Setup

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop (for local Postgres and Redis)
- Expo CLI tooling via npx
- Android Studio/Xcode if running native simulators

## 1) Start Backend Dependencies

From fitness-backend directory:

1. Copy environment file
2. Start Postgres and Redis

Commands:

- cp .env.example .env
- docker compose up -d postgres redis

Windows alternative if cp is unavailable:
- copy .env.example .env

## 2) Configure Backend Environment

Edit fitness-backend/.env and set at least:

- DATABASE_URL
- JWT_SECRET
- JWT_REFRESH_SECRET
- CORS_ORIGINS

Optional for advanced flows:

- GEMINI_API_KEY
- SMTP_* variables
- GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- AWS_* variables
- SENTRY_DSN

## 3) Install and Run Backend

From fitness-backend:

- npm install
- npm run db:migrate
- npm run db:seed
- npm run dev

Backend default port: 3000

Useful backend scripts:

- npm run build
- npm start
- npm test
- npm run test:unit
- npm run test:integration
- npm run test:coverage
- npm run db:generate
- npm run db:studio

## 4) Install and Run Mobile App

From fitness-app:

- npm install
- npx expo start

Or run platform builds directly:

- npx expo run:android
- npx expo run:ios
- npm run web

App permissions already configured for camera access in app.json.

## 5) Run Full Stack in Parallel

Typical local workflow:

- Terminal 1: backend (fitness-backend) -> npm run dev
- Terminal 2: mobile app (fitness-app) -> npx expo run:android or npx expo start

## Dockerized API Runtime (Optional)

From fitness-backend:

- cp .env.example .env
- docker compose --profile production up -d --build
- npm run db:migrate
- npm run db:seed

This runs API + Postgres + Redis under Docker.

## API and Integration Notes

- Backend route composition is under fitness-backend/src/routes
- Frontend API modules are under fitness-app/src/api
- Domain-by-domain API files exist for auth, workout, routine, coach, social, stats, body, notifications, and more

## Current Implementation Status

Based on current architecture docs:

- Frontend screen plan: 92
- Implemented screens: 83
- Marked missing/unregistered areas: auth registration gaps and selected profile/social/explore screens

For the latest gap analysis:
- fitness-app/MISSING_SCREENS_ANALYSIS.md
- fitness-app/docs/architecture/API_CONTRACTS.md

## Security and Reliability Foundations

Implemented foundations include:

- JWT-based auth model
- Password hashing with bcrypt
- Validation with Zod
- Rate limiting
- Helmet for secure HTTP headers
- CORS configuration
- Structured logging and metrics-ready modules

Recommended for production hardening:

- Rotate and secure all secrets
- Enable Sentry/monitoring
- Enforce strict CORS origin lists
- Configure backup and restore for PostgreSQL
- Add CI checks for tests, linting, and migrations

## Documentation Map

### Product and Planning

- fitness-complete-features.md
- docs/FITNESS_APP_REDESIGN_PLAN.md
- docs/phase-wise-features.md
- docs/full-stack-step-by-step-process.md

### Frontend Architecture and Status

- fitness-app/SCREENS_AND_NAVIGATION.md
- fitness-app/MISSING_SCREENS_ANALYSIS.md
- fitness-app/docs/architecture/README.md
- fitness-app/docs/architecture/FRONTEND_HLD.md
- fitness-app/docs/architecture/FRONTEND_LLD.md
- fitness-app/docs/architecture/API_CONTRACTS.md

### Backend

- fitness-backend/README.md
- fitness-backend/prisma/schema.prisma

## Suggested Next Milestones

1. Register remaining auth screens and close navigation gaps
2. Implement remaining high-priority profile/social/explore screens
3. Validate all API contracts against implemented backend routes
4. Add end-to-end test coverage for auth -> onboarding -> first workout flow
5. Finalize AI form-check and coaching production pipelines

## License

This repository currently includes MIT licensing in backend package metadata. If you want a project-wide license at root, add a LICENSE file to the repository root.
