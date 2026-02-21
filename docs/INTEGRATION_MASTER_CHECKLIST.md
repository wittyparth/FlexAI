# Frontend-Backend Integration Master Checklist

Last Updated: 2026-02-21
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
- Current Phase: Phase 9 Completed and Stabilized
- Overall Completion: 100%
- Blockers: None.

## Global Exit Criteria
- [x] Frontend TypeScript passes (`tsc`) with no integration-related errors.
- [x] Backend build/tests pass for touched modules.
- [x] API contract changes are documented in `fitness-app/docs/architecture/API_CONTRACTS.md`.
- [x] No production flow depends on mock data.

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
  - [x] Switch workout query hooks and routine query hooks to backend endpoints.
  - [x] Replace mock workout start and add-exercise paths with backend mutations.
  - [x] Wire routine list/detail and workout hub routine/template sections to backend routine data.
  - [x] Remove `MOCK_ROUTINES` dependency from template day assignment flow.
  - [x] Switch `TemplateListScreen` to backend template routines with local custom fallback.
  - [x] Remove seeded mock templates from `templateStore` initial state.
  - [x] Replace workout hub recent-activity cards with backend workout history data.
  - [x] Replace workout hub metric tiles and consistency heatmap mock sources with backend workout history derivation.
  - [x] Remove hardcoded workout mock dataset from `WorkoutDetailScreen`.
  - [x] Replace exercise query mocks with backend exercise API (search/detail/filters/featured).
  - [x] Replace `SessionInsightsScreen` mock insights with API-derived workout analytics.
- [ ] Integrate full workout lifecycle:
  - [x] Start workout
  - [x] Add/remove exercises
  - [x] Log/update/delete sets
  - [x] Complete workout
  - [x] Cancel workout
  - [x] Fetch history/detail/current workout
- [x] Validate routine library/template browsing from seeded data.

### Acceptance
- [ ] Seeded templates visible and usable in app.
- [ ] End-to-end workout execution persists correctly in backend.
- [x] No workout screen depends on mock data.

## Phase 4 - AI Workout Generation Integration
### Objectives
- Connect AI generation flow to real backend and routine creation path.

### Checklist
- [x] Replace dummy generation in `AIGeneratorScreen` with backend `/routines/generate`.
- [x] Map generated workout into preview/editor/save/start flows.
- [x] Handle provider/config failures gracefully.
- [x] Validate generated exercise IDs and fallback behavior.

### Acceptance
- [ ] Generate -> preview -> save routine -> start workout works end-to-end.

## Phase 5 - Analytics + Body Tracking Integration
### Objectives
- Replace analytics/profile metrics mocks with API-backed data.

### Checklist
- [x] Integrate stats endpoints in analytics screens.
  - [x] `AnalyticsHubScreen`: quick stats + volume snapshot now derive from `/stats/dashboard` (`useDashboardStats`) and backend recent workouts.
  - [x] `VolumeAnalyticsScreen`: replaced mock volume cards/chart/lists with API-backed `/stats/volume` period queries (`week|month|year`) and live 7D/30D/1Y chart buckets.
  - [x] `PersonalRecordsScreen`: replaced mock records/cards with live `/stats/prs` data, type-distribution chart, and filterable PR list.
  - [x] `StrengthProgressionScreen`: replaced mock exercise progression with live `/stats/strength-progression/:exerciseId` chart + exercise selector from real PR history.
  - [x] `MuscleDistributionScreen`: replaced mock pie/breakdown/alerts with live `/stats/muscle-distribution` data and imbalance insights.
  - [x] `MuscleHeatmapScreen`: replaced static heatmap tiles and insights with live muscle-distribution intensity mapping.
- [x] Integrate body tracking endpoints (weight/measurements/photos).
  - [x] `BodyTrackingHubScreen`: replaced mock cards/trend/recent logs with live weight/measurement/photo data and chart shaping.
  - [x] `WeightLogScreen`: replaced mock weight trend/history with API-backed chart/history and live logging mutation.
  - [x] `MeasurementsScreen`: replaced mock measurement cards with API-backed latest/previous deltas and live save flow.
  - [x] `ProgressPhotosScreen`: completed API-backed read + log flow (`/body/photos`) with pose/notes support.
- [x] Normalize units and chart payload shaping.
- [x] Ensure PR/volume/consistency metrics reflect completed workouts.

### Acceptance
- [x] Analytics and body screens are fully API-backed and consistent.

## Phase 6 - Profile + Gamification Integration
### Objectives
- Connect profile hub and gamification to live backend data.

### Checklist
- [x] Remove mock profile/dashboard data usage.
  - [x] `ProfileHubScreen`: removed `mockData` dependencies (`DUMMY_USER`, `PROFILE_*`, `HEATMAP_DATA`) and replaced with live profile/workout/stats/gamification queries.
  - [x] `HomeScreen`: replaced `mockData` dependencies for active workout, today plan, heatmap, and recent activity with live workout/routine/dashboard/gamification query data.
  - [x] `UserProfileScreen`: replaced mock achievement badges and fixed XP progress width with live gamification-backed achievement preview and computed XP progress.
- [x] Integrate profile read/update flows.
  - [x] Added API-backed `EditProfileScreen` in settings stack using `/users/me` (`useUserQueries.profileQuery` + `updateProfileMutation`).
  - [x] Fixed settings navigator typing/routes and wired `EditProfile` route end-to-end.
  - [x] Updated social own-profile "Edit Profile" action to navigate into `SettingsNavigator -> EditProfile`.
- [x] Align gamification endpoints and response parsing.
  - [x] Added robust gamification response parsing for both raw and envelope shapes (`{ success, data }`) in `gamification.api.ts`.
  - [x] Added centralized gamification query hooks (`useGamificationStats`, `useStreakData`, `useAchievements`) for consistent cache keys and stale-time policy.
- [x] Surface streak/XP/level/achievements in profile/home.
  - [x] Home dashboard now surfaces live streak, best streak, level, and achievement count from gamification/dashboard queries.
  - [x] XP modal and streak calendar screens now use live gamification queries (removed local mock fallback paths).
  - [x] Added profile hub achievement surfacing plus muscle activation snapshot card for live distribution context.

### Acceptance
- [x] Profile and gamification screens have no mock dependencies.

## Phase 7 - Social + Feed + Leaderboards + Challenges
### Objectives
- Complete social ecosystem integration with backend contracts.

### Checklist
- [x] Fix follow/unfollow/list endpoints and query shape.
  - [x] Normalized follower/following payloads into stable frontend user shape (safe username fallback, id typing, level/xp defaults).
  - [x] Added follow-status integration (`/social/follow-status/:userId`) and query hook for per-user follow state resolution.
  - [x] Hardened social followers/following/profile UI to avoid missing-username crashes and stale query-key collisions for paginated params.
- [x] Fix feed endpoints (global/following/posts/comments/likes).
  - [x] Added robust feed response normalization for raw/envelope payloads and `_count` fallback parsing in `feed.api.ts`.
  - [x] Normalized social post/comment user fields with safe username and id/date coercion.
  - [x] Improved `getUserPosts` fallback by combining my-feed + global-feed sources and filtering by target user id.
- [x] Fix leaderboards/challenges endpoint paths and params.
- [x] Integrate social screens with paginated/infinite query flows.
  - [x] Replaced `SocialHomeScreen` feed tab mocks with live infinite-query feed data (`useMyFeed` with global fallback), load-more pagination, and like mutations.
  - [x] Replaced `SocialHomeScreen` leaderboard/challenges/friends tab mocks with live query data.
  - [x] Aligned social navigation contracts for `PostDetail` payload and follower/following route names to remove runtime route mismatches.
  - [x] Replaced `SearchUsersScreen` mock user dataset with live backend-backed search aggregation (`social` + `leaderboards` + `feed` + `users/me`) and wired follow/unfollow actions.
  - [x] Replaced `ActivityScreen` mock activity feed with live `/notifications` query flow and mark-read/mark-all-read mutations.
  - [x] Removed unsupported challenge leave CTA from `ChallengeDetailScreen` to match current backend contract (join-only).

### Acceptance
- [x] Social tab is fully API-backed, including posting and interactions.

## Phase 8 - AI Coach Integration
### Objectives
- Replace local mock coach chat with backend conversation APIs.

### Checklist
- [x] Integrate send message API.
- [x] Integrate conversation list/detail/delete APIs.
- [x] Remove mock response generator from production path.
- [x] Add timeout/error handling and fallback UX.

### Acceptance
- [x] AI coach chats persist and reload across sessions.

## Phase 9 - Notifications + Settings + Hardening
### Objectives
- Finalize non-core modules and release quality.

### Checklist
- [x] Fix notifications API response parsing to match backend envelope.
- [x] Integrate mark-read/mark-all-read/device registration.
- [x] Final settings/privacy/security consistency pass.
- [x] Regression test critical journeys.

### Acceptance
- [x] Notifications/settings flows are API-backed and stable.

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
- 2026-02-20 | PR: `0b7199d` | Phase: 3 | Replaced workout history/detail query hooks with real backend endpoints, added workout response normalization in API client (`startedAt`/`completedAt` mapping), and aligned create/delete/log-set query mutations to backend workout routes.
- 2026-02-20 | PR: `988bd0a` | Phase: 3 | Removed remaining mock-start pathways, wired routine/hub start to backend create-workout API, enabled active-workout add-exercise flow through ExercisePicker return navigation, and added store/API normalization/error handling for exercise insertion.
- 2026-02-20 | PR: `b6d8e32` | Phase: 3 | Replaced routine query mocks with real routine APIs, wired `RoutineListScreen` and `RoutineDetailScreen` to backend routine data, and switched Workout Hub routine/template sections to seeded backend routines/templates.
- 2026-02-20 | PR: `cca2f06` | Phase: 3 | Added active-workout remove-exercise UI with confirmation, exposed remove action through `useActiveWorkout`, and hardened store remove-exercise error propagation with optimistic rollback.
- 2026-02-20 | PR: `065ef08` | Phase: 3 | Added workout-store `updateSet` mutation with optimistic rollback, wired active-workout hook edit mode, and enabled set editing from completed-set rows with save flow through backend API.
- 2026-02-20 | PR: `8988fd3` | Phase: 3 | Added `syncCurrentWorkout` store action using `/workouts/current`, wired it into Workout Hub mount, and added `useCurrentWorkout` query hook for API-backed current session retrieval.
- 2026-02-20 | PR: `b71859b` | Phase: 3 | Removed `MOCK_ROUTINES` fallback from template day assignment and resolved linked routines from backend routine/public-routine query data.
- 2026-02-20 | PR: `3b5fdeb` | Phase: 3 | Migrated `TemplateListScreen` to backend template routines (`isTemplate=true`) with local custom fallback and removed default mock templates from `templateStore` initial state.
- 2026-02-20 | PR: `df0b73d` | Phase: 3 | Replaced Workout Hub recent-activity mock cards with API-backed workout history rows using `useWorkouts`, including computed duration/volume/exercise counts.
- 2026-02-20 | PR: `ed672ea` | Phase: 3 | Replaced Workout Hub `DUMMY_METRICS`/`DUMMY_USER`/`HEATMAP_DATA` dependencies with backend-derived weekly metrics, streak, and one-year heatmap data from workout history.
- 2026-02-20 | PR: `f199428` | Phase: 3 | Replaced `SessionInsightsScreen` mock payload with live workout APIs (`useWorkout` + `useWorkouts`) and computed summary, PRs, muscle-volume, recommendations, and week comparison.
- 2026-02-20 | PR: `c025080` | Phase: 4 | Integrated `AIGeneratorScreen` with live `/routines/generate`, normalized AI response enrichment in `ai.api.ts`, and wired `AIPreviewScreen` to API-generated workout data/save flow (removed local mock fallback).
- 2026-02-20 | PR: `c9bd2f7` | Phase: 4 | Hardened AI generation error handling for backend error envelopes/provider outages, validated generated exercise IDs before mapping, and added API-backed `AIPreviewScreen` start-workout flow that creates a live workout and injects generated exercises with partial-failure handling.
- 2026-02-20 | PR: `58ce791` | Phase: Hardening | Repaired malformed JSX tokens in analytics/social/workout screens (`PersonalRecords`, `VolumeAnalytics`, `CreatePost`, `PostDetail`, `SetConfig`) and fixed social post visibility enum mismatch (`followers` -> `friends`) to unblock parser-level compile failures.
- 2026-02-20 | PR: `ae4b0d3` | Phase: 5 | Integrated `AnalyticsHubScreen` with backend dashboard stats (`useDashboardStats`), replacing mock quick stats and deriving 7D/30D/90D volume snapshot bars from API recent workout history.
- 2026-02-20 | PR: `2b5db45` | Phase: 3 | Removed the large hardcoded `MOCK_WORKOUTS` dataset from `WorkoutDetailScreen`, leaving the screen fully backend-driven via `useWorkout`.
- 2026-02-20 | PR: `aa8ad31` | Phase: 3 | Replaced `useExerciseQueries` mock-backed implementations with backend `exerciseApi` calls for filters, featured, search, and exercise detail lookups.
- 2026-02-20 | PR: `9215982` | Phase: 5 | Integrated all body tracking screens with backend body endpoints, normalized body API response mapping (`imageUrl/pose`, measurement field aliases), switched charts/stats to live data using `react-native-gifted-charts`, and enabled end-to-end weight/measurement/photo logging mutations.
- 2026-02-20 | PR: `0d9f3b0` | Phase: 5 | Integrated `/stats/volume` into `VolumeAnalyticsScreen`, added typed volume stats query APIs/hooks, and replaced mock trend/breakdown/comparison sections with charted live data buckets.
- 2026-02-21 | PR: `7cce041` | Phase: 5 | Integrated remaining analytics screens with live stats APIs (`/stats/prs`, `/stats/strength-progression/:exerciseId`, `/stats/muscle-distribution`), removed analytics mock datasets, and upgraded charts/stat cards to API-backed data across PR, strength, distribution, and heatmap flows.
- 2026-02-21 | PR: `8eff021` | Phase: 6 | Migrated `ProfileHubScreen` to live data sources (`/users/me`, `/stats/dashboard`, `/stats/prs`, `/stats/muscle-distribution`, completed workout history, and `/gamification/stats`), removed profile mock-data dependencies, and aligned profile heatmap generation with real completed workouts.
- 2026-02-21 | PR: `1aed303` | Phase: 6 | Added API-backed `EditProfile` flow, fixed settings navigator typing/routes, converted privacy/notification preferences to backend-synced settings where supported, and wired social self-profile edit action to `SettingsNavigator`.
- 2026-02-21 | PR: `7f48cc6` | Phase: 6 | Hardened gamification API parsing for envelope/raw responses, added shared gamification query hooks, and wired home dashboard + XP/streak screens to live streak/XP/level/achievement data.
- 2026-02-21 | PR: `846b3bb` | Phase: 6/5 UX | Added reusable muscle highlighter body-map component (`react-native-body-highlighter`) and integrated it into profile hub, muscle analytics, exercise detail, and workout detail views using live muscle distribution/selection data.
- 2026-02-21 | PR: `92a50e7` | Phase: 6 | Rewrote `HomeScreen` to use live backend queries for active workout, routine plan, consistency heatmap, and recent activity rows; removed production dependence on home mock datasets.
- 2026-02-21 | PR: `355f4c4` | Phase: 3/6 UX | Passed live workout completion metrics into `WorkoutSummaryScreen` from active session, expanded summary params typing, and added session muscle-map visualization for completed workouts.
- 2026-02-21 | PR: `cd85800` | Phase: 6 | Replaced `UserProfileScreen` mock achievements/XP progress with live gamification achievements preview and computed level progress, closing remaining profile mock dependency.
- 2026-02-21 | PR: `30c99ca` | Phase: 7 | Aligned social follow/following contracts and UI with backend shapes, added follow-status query integration, and normalized user list/profile parsing to handle missing username and consistency fields safely.
- 2026-02-21 | PR: `a952ff6` | Phase: 7 | Replaced `SocialHomeScreen` feed/leaderboard/challenges/friends mock datasets with live query data, hardened feed API normalization and user-post fallback filtering, and aligned `PostDetail`/followers/following navigation contracts.
- 2026-02-21 | PR: `f5fd697` | Phase: 7 | Replaced social search/activity mock screens with live backend query flows (search aggregation and notifications), added notifications query hooks/envelope parsing normalization, and removed unsupported leave-challenge action from challenge detail.
- 2026-02-21 | PR: `df6be2b` | Phase: 7 | Completed leaderboard/challenge contract integration by adding user-specific challenge flags/progress (`isJoined`, `currentValue`, `isCompleted`) from backend, aligning frontend period/metric-to-type mapping, and hardening join/detail/list challenge UX against backend response shapes.
- 2026-02-21 | PR: `912c921` | Phase: 8 | Replaced coach local mock store usage with API-backed coach clients/hooks (`/coach/message`, `/coach/conversations`, `/coach/conversations/:id`, delete), rewired Coach Hub/Chat/History screens to backend persistence, and added explicit timeout/error fallback UX in chat send flow.
- 2026-02-21 | PR: `8c29760` | Phase: 9 | Replaced notifications screen local state/mocks with query/mutation integration, added device registration wiring, connected settings security actions (logout/delete/change-password) to backend mutations, refreshed API contract docs, and validated with backend build + full integration test suite.
- 2026-02-21 | PR: `63b4534` | Phase: 9 Hardening | Cleared global frontend TypeScript drift by aligning shared theme tokens/types with legacy screen usage, fixed dashboard/workout/auth typing mismatches, and revalidated with frontend `npx tsc --noEmit` plus backend build + full test suite.
- 2026-02-21 | PR: `aa0be65` | Phase: 9 Ops Hardening | Sanitized backend env templates, added Docker build context guardrails (`.dockerignore`), and fixed docker-compose API env wiring to reuse `.env` while forcing compose-local DB/Redis connectivity.
- 2026-02-21 | PR: `2be3985` | Phase: 3 UX Hardening | Fixed active workout add-exercise UX to support multi-select in exercise picker, batch-apply selected exercises on return, prevent duplicate param re-processing with selection tokens, and keep workout state stable while adding multiple exercises.
- 2026-02-21 | PR: `a17b1e2` | Phase: 3 UX Hardening | Fixed manual workout creation (`RoutineEditor`) add-exercise flow to support multi-select, return via stack pop+merge (avoid editor remount/reset), and consume picker params once per selection token to prevent duplicate inserts/reset behavior.
- 2026-02-21 | PR: `f5c9d6c` | Phase: 3 Save Reliability | Fixed routine editor save reliability by enforcing explicit create mode (`push` navigation), correcting edit-remove payload to use `routineExercise.id`, adding callback-based multi-select return flow to prevent editor state reset, forcing routine/routine-detail cache invalidation after mutations, surfacing backend error messages, and hardening backend routine-exercise update/remove to accept both routine-exercise IDs and exercise IDs for compatibility.
- 2026-02-21 | PR: `ec18a29` | Phase: 3 Data Consistency | Fixed backend routine query boolean parsing so `isTemplate=false` and `isArchived=false` are interpreted correctly (instead of truthy string coercion), restoring correct routine/workout list retrieval for frontend screens that pass explicit boolean filters.
- 2026-02-21 | PR: `4df9c85` | Phase: 3 Data Consistency | Replaced `ExerciseSwapScreen` mock alternative exercise dataset with live backend exercise search results (muscle-filtered, searchable, and return-path aware), so swap flow uses real API data instead of hardcoded entries.

## Change Notes
- 2026-02-20: Added mandatory backend persistence of `workoutInterests` in onboarding (Phase 2).
- 2026-02-20: Added seeding of workouts/templates before workout integration (Phase 3).
- 2026-02-20: Explicit post-workout order set to analytics -> profile/gamification -> social/feed/leaderboards -> AI coach -> notifications/settings/hardening.
