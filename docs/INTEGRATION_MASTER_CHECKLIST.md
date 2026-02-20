# Frontend-Backend Integration Master Checklist

Last Updated: 2026-02-20
Owner: FlexAI team
Branch Baseline: main

## Purpose
This document is the source of truth for integration execution and progress tracking.
Every integration PR must update this file.

## Update Rules (Mandatory)
- Update checkboxes immediately when tasks are completed.
- Add a log entry in `Progress Updates` for each merged PR.
- Keep `Current Phase` and `Overall Completion` in sync.
- If scope changes, add a `Change Note` entry before implementation.

## Current Status
- Current Phase: Phase 3
- Overall Completion: 38%
- Blockers: None

## Global Exit Criteria
- [ ] Frontend TypeScript passes (`tsc`) with no integration-related errors.
- [ ] Backend build/tests pass for touched modules.
- [ ] API contract changes are documented in `fitness-app/docs/architecture/API_CONTRACTS.md`.
- [ ] No production flow depends on mock data.

## Phase 0 - Contract Lock + Integration Baseline
### Objectives
- Freeze API contracts and remove architecture ambiguity.

### Checklist
- [x] Finalize one active root navigation architecture (remove duplicate root flow risk).
- [x] Remove auth bypass paths from app entry flow.
- [x] Audit and fix route mismatches between frontend API clients and backend routers:
  - [x] `social.api.ts`
  - [x] `feed.api.ts`
  - [x] `leaderboard.api.ts`
  - [x] `gamification.api.ts`
  - [x] `exercise.api.ts`
  - [x] `routine.api.ts`
- [ ] Standardize response envelope assumptions (`{ success, data }`) per endpoint.
- [ ] Update API contract documentation.

### Acceptance
- [ ] No endpoint mismatch remains for Phase 1-3 critical paths (auth/onboarding/workouts).

## Phase 1 - Auth Integration
### Objectives
- Fully productionize auth/session flow.

### Checklist
- [ ] Align auth contracts between frontend and backend:
  - [x] Register
  - [x] Login
  - [x] Verify email
  - [x] Refresh token
  - [x] Logout
- [x] Implement stable token attach + refresh queue logic in API client.
- [x] Persist and restore session on app boot.
- [x] Ensure route guards: unauth -> auth stack, auth+not-onboarded -> onboarding, auth+onboarded -> main app.
- [x] Remove all dev-only auth bypass behavior.

### Acceptance
- [ ] Register -> verify -> login flow passes.
- [ ] Restart app restores session.
- [ ] Expired access token refreshes and retries once.
- [ ] Logout clears session and redirects correctly.

## Phase 2 - Onboarding Integration + Persist workoutInterests (Backend)
### Objectives
- Complete onboarding end-to-end and persist all required fields.

### Checklist
- [x] Add `workoutInterests` field to backend user model (`prisma/schema.prisma`).
- [x] Create and run migration for `workoutInterests`.
- [x] Persist `workoutInterests` in onboarding service.
- [x] Return `workoutInterests` in user profile responses.
- [x] Align frontend onboarding payload/types with backend model.
- [x] Validate onboarding state transitions and completion flag behavior.

### Acceptance
- [ ] Onboarding saves all fields including `workoutInterests`.
- [ ] `/users/me` reflects saved onboarding fields.
- [ ] Onboarding gate is enforced correctly.

## Phase 3 - Seed Workouts/Templates First, Then Workout Integration
### Objectives
- Seed deterministic routine/template data before wiring full workout flows.

### Checklist
#### Seeding
- [x] Create missing backend seed script (`fitness-backend/prisma/seed.ts`).
- [x] Ensure seed script is idempotent.
- [x] Seed template/public routines referencing existing seeded exercises.
- [x] Seed optional sample workout history for dev/test users.

#### Workout Integration
- [ ] Replace workout mocks in hooks/screens/stores with real API calls.
- [ ] Integrate full workout lifecycle:
  - [ ] Start workout
  - [ ] Add/remove exercises
  - [ ] Log/update/delete sets
  - [ ] Complete workout
  - [ ] Cancel workout
  - [ ] Fetch history/detail/current workout
- [ ] Validate routine library/template browsing from seeded data.

### Acceptance
- [ ] Seeded templates visible and usable in app.
- [ ] End-to-end workout execution persists correctly in backend.
- [ ] No workout screen depends on mock data.

## Phase 4 - AI Workout Generation Integration
### Objectives
- Connect AI generation flow to real backend and routine creation path.

### Checklist
- [ ] Replace dummy generation in `AIGeneratorScreen` with backend `/routines/generate`.
- [ ] Map generated workout into preview/editor/save/start flows.
- [ ] Handle provider/config failures gracefully.
- [ ] Validate generated exercise IDs and fallback behavior.

### Acceptance
- [ ] Generate -> preview -> save routine -> start workout works end-to-end.

## Phase 5 - Analytics + Body Tracking Integration
### Objectives
- Replace analytics/profile metrics mocks with API-backed data.

### Checklist
- [ ] Integrate stats endpoints in analytics screens.
- [ ] Integrate body tracking endpoints (weight/measurements/photos).
- [ ] Normalize units and chart payload shaping.
- [ ] Ensure PR/volume/consistency metrics reflect completed workouts.

### Acceptance
- [ ] Analytics and body screens are fully API-backed and consistent.

## Phase 6 - Profile + Gamification Integration
### Objectives
- Connect profile hub and gamification to live backend data.

### Checklist
- [ ] Remove mock profile/dashboard data usage.
- [ ] Integrate profile read/update flows.
- [ ] Align gamification endpoints and response parsing.
- [ ] Surface streak/XP/level/achievements in profile/home.

### Acceptance
- [ ] Profile and gamification screens have no mock dependencies.

## Phase 7 - Social + Feed + Leaderboards + Challenges
### Objectives
- Complete social ecosystem integration with backend contracts.

### Checklist
- [ ] Fix follow/unfollow/list endpoints and query shape.
- [ ] Fix feed endpoints (global/following/posts/comments/likes).
- [ ] Fix leaderboards/challenges endpoint paths and params.
- [ ] Integrate social screens with paginated/infinite query flows.

### Acceptance
- [ ] Social tab is fully API-backed, including posting and interactions.

## Phase 8 - AI Coach Integration
### Objectives
- Replace local mock coach chat with backend conversation APIs.

### Checklist
- [ ] Integrate send message API.
- [ ] Integrate conversation list/detail/delete APIs.
- [ ] Remove mock response generator from production path.
- [ ] Add timeout/error handling and fallback UX.

### Acceptance
- [ ] AI coach chats persist and reload across sessions.

## Phase 9 - Notifications + Settings + Hardening
### Objectives
- Finalize non-core modules and release quality.

### Checklist
- [ ] Fix notifications API response parsing to match backend envelope.
- [ ] Integrate mark-read/mark-all-read/device registration.
- [ ] Final settings/privacy/security consistency pass.
- [ ] Regression test critical journeys.

### Acceptance
- [ ] Notifications/settings flows are API-backed and stable.

## Suggested PR Sequence
- [ ] PR-1: Phase 0 contract lock + navigation/auth bypass cleanup
- [ ] PR-2: Phase 1 auth integration
- [ ] PR-3: Phase 2 onboarding + workoutInterests backend persistence
- [ ] PR-4: Phase 3 seeding (templates/workouts)
- [ ] PR-5: Phase 3 workout lifecycle integration
- [ ] PR-6: Phase 4 AI workout generation integration
- [ ] PR-7: Phase 5 analytics + body tracking integration
- [ ] PR-8: Phase 6 profile + gamification integration
- [ ] PR-9: Phase 7 social/feed/leaderboards/challenges
- [ ] PR-10: Phase 8 AI coach integration
- [ ] PR-11: Phase 9 notifications/settings + hardening

## Commit Protocol (Required)
- Use one logical commit per scoped change.
- Commit message format:
  - `<area>: <short summary>`
  - Example: `auth: align verify-email contract and session restore flow`
- Include checklist updates in same commit as implementation when possible.
- Do not mix unrelated modules in one commit.

## Per-PR Definition of Done
- [ ] Code implemented.
- [ ] Tests updated/added for touched behavior.
- [ ] Manual verification completed for changed flows.
- [ ] This checklist updated.
- [ ] API contract docs updated if endpoint/request/response changed.

## Progress Updates
### Template
- Date:
- PR:
- Phase:
- Summary:
- Checklist items completed:
- Risks/Blockers:
- Next step:

### Log
- 2026-02-20 | PR: N/A | Phase: Planning | Created master checklist and execution order.
- 2026-02-20 | PR: `78fb2a0` | Phase: 0 | Unified app entry to `src/navigation/RootNavigator`, added dedicated onboarding stack, expanded auth stack registration, removed auth bypass mode.
- 2026-02-20 | PR: `0c8b9d5` | Phase: 0 | Aligned frontend API clients with backend route paths/contracts for social, feed, leaderboards, gamification, exercises, and routines; added safe fallbacks where backend endpoints are not yet exposed.
- 2026-02-20 | PR: `3f9e3cc` | Phase: 1 | Aligned auth contracts (verify/register response handling), fixed verification flow to login handoff, added single-flight refresh queue/retry behavior, and hardened session hydration rules.
- 2026-02-20 | PR: `701a9b9` | Phase: 2 | Added `workoutInterests` to backend schema and migration, persisted it via onboarding service, returned it in profile/onboarding responses, added onboarding request validation, and aligned frontend onboarding payload/types.
- 2026-02-20 | PR: `9adfdef` | Phase: 3 | Added deterministic idempotent seed script to create template/public routines and sample completed workout history using existing exercise data, with stable seed users.
- 2026-02-20 | PR: Pending commit (Phase 3 - workout query hook API switch) | Phase: 3 | Replaced workout history/detail query hooks with real backend endpoints, added workout response normalization in API client (`startedAt`/`completedAt` mapping), and aligned create/delete/log-set query mutations to backend workout routes.

## Change Notes
- 2026-02-20: Added mandatory backend persistence of `workoutInterests` in onboarding (Phase 2).
- 2026-02-20: Added seeding of workouts/templates before workout integration (Phase 3).
- 2026-02-20: Explicit post-workout order set to analytics -> profile/gamification -> social/feed/leaderboards -> AI coach -> notifications/settings/hardening.
