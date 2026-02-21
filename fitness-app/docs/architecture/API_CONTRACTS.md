# FitAI Frontend-Backend API Contracts

Last Updated: February 21, 2026
Version: 2.0

This document records the API contracts used by the integrated mobile app.

## Base Contract

- Base URL: `/api/v1`
- Auth: `Authorization: Bearer <accessToken>` for protected routes
- Standard response envelope:

```json
{
  "success": true,
  "data": {}
}
```

- Error shape used by frontend client:

```json
{
  "message": "Human readable message",
  "status": 400,
  "code": "OPTIONAL_CODE",
  "data": {}
}
```

## Auth Contracts

Frontend client: `fitness-app/src/api/auth.api.ts`

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/verify-email`
- `POST /auth/resend-verification`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/change-password`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

## User Profile and Settings Contracts

Frontend client: `fitness-app/src/api/user.api.ts`

- `GET /users/me`
- `PATCH /users/me`
- `DELETE /users/me`
- `POST /users/me/complete-onboarding`
- `POST /users/me/avatar`
- `GET /users/me/settings`
- `PATCH /users/me/settings`

Notes:

- Onboarding persists `workoutInterests`.
- Settings support `units`, `pushEnabled`, `workoutReminders`, `socialNotifications`, `emailUpdates`, `profilePrivate`, `showStats`, and `showWorkouts`.

## Social, Leaderboards, and Challenges Contracts

Frontend clients:

- `fitness-app/src/api/social.api.ts`
- `fitness-app/src/api/feed.api.ts`
- `fitness-app/src/api/leaderboard.api.ts`

Leaderboards:

- `GET /leaderboards/rankings/:type`
- Supported `type`: `strength | volume | consistency | weekly`

Challenges:

- `GET /leaderboards/challenges`
- `POST /leaderboards/challenges/:id/join`

Challenge list payload fields used by frontend:

- `id`
- `name`
- `description`
- `challengeType`
- `targetValue`
- `startDate`
- `endDate`
- `_count.participants`
- `isJoined`
- `currentValue`
- `isCompleted`

## Coach Contracts

Frontend client: `fitness-app/src/api/coach.api.ts`

- `POST /coach/message`
  - Request: `{ message: string, conversationId?: number }`
  - Response data: `{ conversationId, message }`
- `GET /coach/conversations`
- `GET /coach/conversations/:id`
- `DELETE /coach/conversations/:id`

Notes:

- Coach message send uses a longer client timeout to allow model generation.
- Frontend handles timeout and transient failure messages with fallback UX.

## Notifications Contracts

Frontend client: `fitness-app/src/api/notifications.api.ts`

- `GET /notifications?limit&offset`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`
- `POST /notifications/register-device`
  - Request: `{ deviceToken: string, platform: 'android' | 'ios' | 'web' }`

Notes:

- Frontend normalizes backend `isRead` and `read` fields into `read`.
- Device registration is called from notifications/settings flows.

## Analytics, Workouts, and Other Integrated Modules

Integrated and API-backed modules are implemented through these clients and hooks:

- `fitness-app/src/api/workout.api.ts`
- `fitness-app/src/api/routine.api.ts`
- `fitness-app/src/api/exercise.api.ts`
- `fitness-app/src/api/stats.api.ts`
- `fitness-app/src/api/body.api.ts`
- `fitness-app/src/api/gamification.api.ts`
- `fitness-app/src/api/ai.api.ts`

## Current Known Gaps

- Some optional app UX features do not yet have dedicated backend endpoints (for example, account session management or challenge leave).
- Frontend has known global TypeScript drift outside integration scope; this is tracked in `docs/INTEGRATION_MASTER_CHECKLIST.md`.
