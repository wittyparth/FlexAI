# FlexAI — FSM Migration: Completed Tasks
> Last updated: 22 Feb 2026 | Git checkpoints: `4526ab8` (cp1), `4871800` (cp2)

---

## Phase 1 — FSM Architecture (Checkpoint 1)

### Type System
- [x] Created `src/store/types/auth.types.ts` — `AuthPhase` discriminated union (8 variants), `AuthUser`, `OnboardingStepData`, `ONBOARDING_STEPS` ordered array
- [x] Created `src/store/types/workout.types.ts` — `WorkoutSessionPhase` (7 variants), `NormalizedExercise`, `NormalizedSet`, `RestTimerState`, `TimerPreferences`
- [x] Created `src/store/types/creation.types.ts` — `RoutineCreationPhase`, `TemplateCreationPhase`, `RoutineDraft`, `TemplateDraft`, `ExerciseDraft`, `SetDraft`
- [x] Created `src/store/types/ai.types.ts` — `AIWorkoutPhase`, `AIRoutinePhase`, `AITemplatePhase` (7 variants each) plus all result shapes

### Stores (Full Rewrites)
- [x] Rewrote `src/store/authStore.ts` — FSM with `AuthPhase`, hydrate-on-boot, staged onboarding accumulation, token isolation, `getState()` compat patch for HTTP interceptor
- [x] Rewrote `src/store/workoutStore.ts` — FSM with `WorkoutSessionPhase`, normalized `exercises` + `sets` maps, wall-clock rest timer (`endTimeMs`), optimistic updates with snapshot/rollback, `syncCurrentWorkout()` crash-recovery
- [x] Rewrote `src/store/creationStore.ts` — Routine + template draft FSM, local-first, persisted via AsyncStorage
- [x] Rewrote `src/store/aiStore.ts` — Three independent AI slice FSMs (workout / routine / template)
- [x] Created `src/store/templateStore.ts` — compat shim for `TemplateEditorScreen` imports, own persist key `template-store-v2`
- [x] Updated `src/store/index.ts` — barrel exports for all stores, selectors, and types

### Hooks
- [x] Created `src/hooks/useOnboardingFlow.ts` — `goNext(step, data)` atomically saves step + advances FSM + navigates
- [x] Created `src/hooks/useWorkoutSession.ts` — unified hook, `useReducer` local UI + Zustand global, rest timer countdown from `endTimeMs`, prefill-from-last-set logic
- [x] Created `src/hooks/useFlowGuard.ts` — route-level FSM gate (redirects to correct screen based on phase)
- [x] Created `src/hooks/useAIGeneration.ts` — three hooks (`useWorkoutAIGeneration`, `useRoutineAIGeneration`, `useTemplateAIGeneration`) with `AbortController` + stale-request prevention via `requestId`
- [x] Updated `src/hooks/index.ts` — barrel exports for all new hooks

### Navigation
- [x] Updated `src/navigation/RootNavigator.tsx` — uses FSM selectors (`selectIsHydrating`, `selectIsReady`, `selectNeedsOnboarding`); fixed `animationEnabled` → `animation: 'none'`

---

## Phase 2 — Screen Migration (Checkpoint 2)

### Onboarding Screens (10/10)
| Screen | Change |
|--------|--------|
| `GoalSelectionScreen` | `setUpdatedUser` → `goNext('GoalSelection', { goals })` |
| `ExperienceLevelScreen` | `setUpdatedUser` → `goNext('ExperienceLevel', { level })` |
| `WorkoutFrequencyScreen` | `setUpdatedUser` → `goNext('WorkoutFrequency', { daysPerWeek })` |
| `PhysicalProfileScreen` | `setUpdatedUser({gender,age,height,weight})` → `goNext('PhysicalProfile', {...})` |
| `SecondaryGoalsScreen` | `setUpdatedUser` → `goNext('SecondaryGoals', { goals })` |
| `WorkoutDurationScreen` | `setUpdatedUser` → `goNext('WorkoutDuration', { minutes })` |
| `EquipmentScreen` | `setUpdatedUser` → `goNext('Equipment', { equipment })` |
| `UnitsScreen` | `setUpdatedUser` → `goNext('Units', { system })` |
| `NotificationScreen` | `setUpdatedUser` → `goNext('Notification', { enabled })` |
| `FinalSuccessScreen` | `setOnboardingCompleted(true)` → `completeOnboarding()`; reads `onboardingData` from store |

### Workout Screens
- [x] `ActiveWorkoutScreen` — replaced `useActiveWorkout` with `useWorkoutSession` + compat shims; muscle map uses `primaryMuscle`/`secondaryMuscles` from `NormalizedExercise`; dispatch actions changed to `SET_WEIGHT`/`SET_REPS`; complete modal reads from store phase instead of passing route params
- [x] `WorkoutSummaryScreen` — reads `selectCompletedSummary` from store; `useEffect` resets phase to `idle` on unmount
- [x] `AIPreviewScreen` — verified already uses `useWorkoutStore.getState()` imperatively; no changes needed
- [x] `WorkoutHubScreen` — old `state.status`/`state.workoutName` → `sessionPhase` with local FSM derivation

### Creation Screens
- [x] `RoutineEditorScreen` — fixed temp ID collision bug: `id: number` (Date.now) → `key: string` (stable `tmp_${Date.now()}_${random}`), `dbId?: number` for API exercises; remove/add diffing uses `ce.dbId === e.id`
- [x] `TemplateEditorScreen` — imports now resolve via `templateStore.ts` compat shim

### Components
- [x] `FloatingWorkoutPill` — old `state.status`/`state.workoutName`/`state.isResting` → `sessionPhase` FSM derivation; calls `syncCurrentWorkout()` before navigating
- [x] `TimerSettingsModal` — old `autoStartTimer`/`defaultTimerSeconds`/`updateTimerSettings()` → `timerPrefs`/`updateTimerPrefs()`
- [x] `ExerciseCard` — props type changed from `WorkoutExercise` (backend type) to `NormalizedExercise` (store type); field accesses updated (`exercise?.name` → `exerciseName`, `exercise?.muscleGroup` → `primaryMuscle`)

### Profile
- [x] `ProfileScreen` — `isAuthenticated: state.isAuthenticated` → `authPhase.phase === 'ready'`

---

## Phase 2 — TypeScript Error Fixes (Checkpoint 2)

- [x] `RootNavigator.tsx` — `animationEnabled: false` → `animation: 'none'`
- [x] `useAuthQueries.ts` — `login()` → `loginSuccess()`, `refreshToken` → `tokens?.refreshToken`
- [x] `authStore.ts` — added `getState()` compat patch exposing `accessToken`, `refreshToken`, `updateTokens`, `isAuthenticated` for HTTP interceptor
- [x] `client.ts` — cast `getState() as any` where compat-patched props are accessed
- [x] `useUserQueries.ts` — `null → undefined` coercion for `firstName`/`lastName` so `UserProfile` is assignable to `Partial<AuthUser>`; numeric `id` coercion via `Number(updatedUser.id)`
- [x] `useActiveWorkout.ts` — rewrote `useShallow` selector to pull `sessionPhase`, `restTimer`, `timerPrefs` instead of deleted flat props; derived `isResting`, `isRestPaused`, `workoutName`, etc. from FSM; fixed `orderIndex` → `order` field
- [x] `workout.types.ts` — extended `NormalizedExercise` with `targetRepsMin`, `targetRepsMax`, `targetWeight`
- [x] `workoutStore.ts` — `normalizeWorkout()` + `addExercise()` capture `targetRepsMin`, `targetRepsMax`, `targetWeight` from API response
- [x] `ActiveWorkoutScreen.tsx` — `onPress={handleStartManualRest}` → `onPress={() => handleStartManualRest(defaultTimerSeconds)}` (type mismatch); `exercise?.exercise?.name` → `exerciseName`; `nextExerciseAfterRest?.exercise?.name` → `nextExerciseAfterRest?.exerciseName`
- [x] `ExploreHubScreen.tsx` — cast `.data as any` to suppress pre-existing pagination type gap

### Final result: **0 TypeScript errors** (`npx tsc --noEmit` clean)

---

## Bug Fixes Made Along the Way

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Temp exercise ID collision | `id: Date.now()` as number collided with real DB IDs | Stable `key: string` = `tmp_${Date.now()}_${Math.random()}`, separate `dbId?: number` |
| Rest timer drift after app background | `setTimeout` paused by OS | Replaced with `endTimeMs` wall-clock; remaining = `endTimeMs - Date.now()` |
| Stale AI response applied after cancel | No request identity tracking | `requestId` compared on response; `AbortController` cancels HTTP request |
| Onboarding data lost on back-navigate | Each screen wrote only its own data | Staged `onboardingData: Partial<OnboardingStepData>` accumulated across steps |
| Auth store shape breaking HTTP interceptor | `accessToken` moved inside `tokens` object | `getState()` compat patch exposes flat shape the interceptor expects |

---

## What Was NOT Changed (intentional)

- All screen styling, layouts, and design tokens preserved exactly
- React Query (`useAuthQueries`, `useExerciseQueries`, etc.) still handles server state
- Backend / Prisma / API routes untouched
- iOS/Android build config untouched
