# FlexAI — App State Architecture
> All client state as of Checkpoint 2 (`4871800`) | 22 Feb 2026

---

## Overview

The app uses **Zustand + Immer** for global client state, organized into **4 stores**.
Each store is driven by a **discriminated union FSM** — illegal states are TypeScript compile errors, not runtime bugs.
Server state (API responses, caching, mutations) is handled by **React Query** alongside the stores.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT STATE                         │
│                                                             │
│  authStore         workoutStore         creationStore       │
│  authPhase FSM     sessionPhase FSM     routinePhase FSM    │
│  user + tokens     exercises + sets     drafts              │
│                    restTimer            templatePhase FSM   │
│                                                             │
│  aiStore           templateStore (compat shim)              │
│  workout FSM                                                │
│  routine FSM                                                │
│  template FSM                                               │
│                                                             │
│               React Query (server cache)                    │
│   exercises · routines · profile · settings · challenges    │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. `authStore`

**File:** `src/store/authStore.ts`  
**Persisted:** Yes (AsyncStorage via `storage` util)

### State Shape

```typescript
{
  authPhase: AuthPhase         // FSM — the only source of truth for auth status
  user: AuthUser | null        // populated when phase is 'onboarding' or 'ready'
  tokens: AuthTokens | null    // { accessToken, refreshToken }
  onboardingData: Partial<OnboardingStepData>  // staged across steps
}
```

### `authPhase` — Discriminated Union FSM

```
hydrating  ──hydrate()──► guest
                     └──► onboarding  ──advanceOnboarding()──► (next step)
                     └──► ready                                     │
                                                              completeOnboarding()
guest     ──beginLogin()──► logging_in ──loginSuccess()──► ready
                       └──►            ──loginFailed()──► guest
                                       ──lockAccount()──► locked

guest     ──beginRegister()──► registering ──registerSuccessNeedsVerify()──► verifying_email
                                            ──verifyEmailSuccess()──────────► onboarding

ready     ──logout()──► guest
locked    ──(timer expires)──► guest
```

| Phase | Fields on phase object | Meaning |
|-------|----------------------|---------|
| `hydrating` | — | App boot, checking AsyncStorage |
| `guest` | — | Not logged in |
| `logging_in` | `email: string` | Network request in flight |
| `registering` | `email: string` | Register request in flight |
| `verifying_email` | `email: string` | Awaiting email verification |
| `onboarding` | `userId`, `currentStep`, `completedSteps` | Logged in, onboarding not done |
| `ready` | `userId: number` | Fully authenticated + onboarded |
| `locked` | `email`, `unlockAtMs` | Account locked, shows countdown |

### `AuthUser` shape

```typescript
{
  id: number
  email: string
  username: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  onboardingCompleted: boolean
  // Onboarding fields — accumulated via saveOnboardingStep()
  goals?: string[]
  experienceLevel?: string
  height?: number
  weight?: number
  targetWeight?: number
  gender?: string
  dateOfBirth?: string
  secondaryGoals?: string[]
  workoutTypes?: string[]
  workoutFrequency?: number
  workoutDuration?: number
  availableEquipment?: string[]
  preferredUnits?: 'metric' | 'imperial'
  notificationsEnabled?: boolean
}
```

### `onboardingData` — Per-Step Typed Staging

```typescript
{
  GoalSelection?:    { goals: string[] }
  ExperienceLevel?:  { level: string }
  PhysicalProfile?:  { height, weight, gender, dateOfBirth }
  SecondaryGoals?:   { goals: string[] }
  WorkoutInterests?: { types: string[] }
  WorkoutFrequency?: { daysPerWeek: number }
  WorkoutDuration?:  { minutes: number }
  Equipment?:        { equipment: string[] }
  Units?:            { system: 'metric' | 'imperial' }
  Notification?:     { enabled: boolean }
}
```

### Key Selectors

```typescript
selectIsHydrating    // authPhase.phase === 'hydrating'
selectIsReady        // authPhase.phase === 'ready'
selectNeedsOnboarding// authPhase.phase === 'onboarding'
selectCurrentUser    // state.user
selectAccessToken    // state.tokens?.accessToken
selectRefreshToken   // state.tokens?.refreshToken
```

### Key Actions

| Action | What it does |
|--------|-------------|
| `hydrate()` | Reads AsyncStorage, restores session or goes to guest |
| `beginLogin(email)` | Transitions → `logging_in` |
| `loginSuccess(tokens, user)` | Transitions → `onboarding` or `ready`, persists tokens |
| `saveOnboardingStep(step, data)` | Merges step data into `onboardingData`, marks step complete |
| `advanceOnboarding(nextStep)` | Updates `currentStep` in `onboarding` phase |
| `completeOnboarding()` | Merges `onboardingData` into `user`, calls API, transitions → `ready` |
| `refreshTokens(tokens)` | Updates `tokens` in place (called by HTTP interceptor only) |
| `logout()` | Clears storage, transitions → `guest` |

---

## 2. `workoutStore`

**File:** `src/store/workoutStore.ts`  
**Persisted:** Workout phase + exercises + sets (via AsyncStorage, for crash recovery)

### State Shape

```typescript
{
  sessionPhase: WorkoutSessionPhase   // FSM
  exercises: Record<number, NormalizedExercise>  // key: workoutExerciseId
  sets: Record<string, NormalizedSet>            // key: set id (temp_xxx or real)
  currentExerciseId: number | null    // not persisted
  minimized: boolean                  // not persisted
  elapsedSeconds: number
  restTimer: RestTimerState           // wall-clock immune to app backgrounding
  timerPrefs: TimerPreferences        // persisted
}
```

### `sessionPhase` — Discriminated Union FSM

```
idle  ──startWorkout()──►  starting  ──(API success)──►  active
                                     ──(API error)──►    error

active  ──completeWorkout()──►  completing  ──(API success)──►  completed
active  ──cancelWorkout()──►    cancelling  ──(API success)──►  idle

completed  ──(screen mounts, reads summary)──►  idle  (reset triggered by WorkoutSummaryScreen unmount)
error  ──clearError()──► idle
```

| Phase | Fields | Meaning |
|-------|--------|---------|
| `idle` | — | No active workout |
| `starting` | `name`, `routineId?` | `POST /workouts` in flight |
| `active` | `workoutId`, `name`, `startTime` | Workout in progress |
| `completing` | `workoutId`, `name` | `PATCH /workouts/:id/complete` in flight |
| `completed` | `workoutId`, `summary` | Summary embedded, shown to user |
| `cancelling` | `workoutId` | Delete in flight |
| `error` | `error`, `previousPhase` | Something failed |

### `NormalizedExercise` shape

```typescript
{
  id: number           // workoutExerciseId (joins to DB)
  exerciseId: number   // exercise definition id
  exerciseName: string
  order: number
  notes?: string
  restSeconds?: number
  targetSets?: number
  targetRepsMin?: number
  targetRepsMax?: number
  targetWeight?: number
  primaryMuscle?: string        // for muscle map highlighter
  secondaryMuscles?: string[]   // for muscle map highlighter
}
```

### `NormalizedSet` shape

```typescript
{
  id: string              // 'temp_xxx' before sync, real id after
  workoutExerciseId: number
  setType: 'warmup' | 'working' | 'drop' | 'failure' | 'amrap'
  weight?: number
  reps?: number
  rpe?: number
  rir?: number
  status: 'pending' | 'syncing' | 'synced' | 'failed'
  tempId?: string         // kept for reconciliation after API responds
}
```

### `restTimer` — Wall-Clock Rest Timer

```typescript
// Inactive
{ active: false }

// Counting down
{ active: true; paused: false; endTimeMs: number; durationSeconds: number }
// Remaining = endTimeMs - Date.now()  — survives app backgrounding

// Paused
{ active: true; paused: true; remainingSeconds: number; durationSeconds: number }
```

### `timerPrefs` — Persisted User Preferences

```typescript
{
  autoStart: boolean    // auto-start timer after each logged set
  defaultSeconds: number // default rest duration
}
```

### Key Actions

| Action | What it does |
|--------|-------------|
| `startWorkout(input)` | `POST /workouts`, normalizes response into `exercises` + `sets` maps |
| `logSet(exerciseId, input)` | Optimistic: temp set → API → reconcile real id |
| `updateSet(setId, input)` | Optimistic: snapshot → update → API → rollback on fail |
| `deleteSet(exerciseId, setId)` | Optimistic delete with rollback |
| `addExercise(exerciseId)` | API call + normalizes returned `WorkoutExercise` |
| `removeExercise(workoutExerciseId)` | Optimistic remove with rollback |
| `completeWorkout(summaryInput)` | Builds `WorkoutSummaryData`, transitions → `completing` → `completed` |
| `startRest(seconds)` | Sets `endTimeMs = Date.now() + seconds * 1000` |
| `pauseRest()` | Saves remaining, clears `endTimeMs` |
| `resumeRest()` | Restores `endTimeMs` from saved remaining |
| `extendRest(seconds)` | Adds seconds to `endTimeMs` |
| `tick()` | Increments `elapsedSeconds` (called by 1s interval in hooks) |
| `syncCurrentWorkout()` | Re-fetches workout from API, re-normalizes (crash recovery) |
| `recoverFromStorage()` | On app relaunch, restores in-progress session |

---

## 3. `creationStore`

**File:** `src/store/creationStore.ts`  
**Persisted:** Yes (AsyncStorage, drafts survive app close)

### State Shape

```typescript
{
  routinePhase:   RoutineCreationPhase
  routineDraft:   RoutineDraft | null
  templatePhase:  TemplateCreationPhase
  templateDraft:  TemplateDraft | null
}
```

### `RoutineCreationPhase` FSM

```
idle  ──startDraft()──►  draft  ──saveRoutine()──►  saving  ──►  saved
                               ──discardDraft()──► idle           │
                         error ◄──(API fail)──────────────────────┘
```

| Phase | Fields | Meaning |
|-------|--------|---------|
| `idle` | — | No draft |
| `draft` | `draftId`, `mode` ('create'\|'edit'), `routineId?` | Editing in progress |
| `saving` | `draftId` | `POST/PATCH /routines` in flight |
| `saved` | `routineId`, `name` | Briefly shown, then navigate away |
| `error` | `error`, `draftId` | Save failed, draft preserved |

### `RoutineDraft` / `TemplateDraft` shape

```typescript
// RoutineDraft
{
  draftId: string
  name: string
  description?: string
  exercises: ExerciseDraft[]
  tags?: string[]
  isPublic?: boolean
  createdAt: number   // unix ms
  updatedAt: number
}

// ExerciseDraft
{
  id: string          // stable temp key  e.g. 'tmp_1234_0.92'
  exerciseId: number
  exerciseName: string
  sets: SetDraft[]
  notes?: string
  restSeconds?: number
  order: number
}

// SetDraft
{
  id: string
  setType: 'warmup' | 'working' | 'drop' | 'failure' | 'amrap'
  targetReps?: number
  targetWeight?: number
  rpe?: number
  duration?: number
}

// TemplateDraft adds weekly structure:
{
  draftId: string
  name: string
  durationWeeks: number
  days: TemplateDayDraft[]   // 1-7 days
  // ...
}

// TemplateDayDraft
{
  dayId: number         // 1–7
  isRestDay: boolean
  name?: string         // 'Push Day'
  exercises: ExerciseDraft[]
}
```

---

## 4. `aiStore`

**File:** `src/store/aiStore.ts`  
**Persisted:** No (transient — results navigated away from)

### State Shape

```typescript
{
  workoutPhase:  AIWorkoutPhase
  routinePhase:  AIRoutinePhase
  templatePhase: AITemplatePhase
}
```

### All Three FSMs are identical in structure:

```
idle  ──startConfiguring()──►  configuring  ──generate()──►  generating
                                                              ──(AbortController cancel)──► idle
                                                              ──(API success)──► preview
                                                              ──(API error)──►  error

preview  ──apply()──►  applying  ──(API success)──►  done
                  ──reject()──► idle

done   ──reset()──► idle
error  ──reset()──► idle
       ──retry()──► generating
```

| Phase | Fields |
|-------|--------|
| `configuring` | `prompt?`, `goal?`, `durationMins?` (workout) / `weeksCount?`, `daysPerWeek?` (routine) |
| `generating` | `prompt`, `requestId` (matches AbortController key) |
| `preview` | `requestId`, `result` (full typed result) |
| `applying` | `result` |
| `done` | `workoutId`/`routineId`/`templateId`, `name` |
| `error` | `error`, `canRetry` |

### AI Result shapes (in `preview` phase)

```typescript
// AIWorkoutResult
{
  name: string
  description?: string
  estimatedDuration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  targetMuscles: string[]
  exercises: AIExercise[]       // { exerciseName, sets, reps, rest, notes }
}

// AIRoutineResult
{
  name: string
  weeks: number
  daysPerWeek: number
  weekSchedule: AIRoutineDay[]  // { dayName, focus, exercises, isRestDay }
}

// AITemplateResult
{
  name: string
  durationWeeks: number
  days: Array<{ dayId, isRestDay, focus?, exercises }>
}
```

---

## 5. `templateStore` (Compat Shim)

**File:** `src/store/templateStore.ts`  
**Persisted:** Yes, key `template-store-v2`

Thin Zustand store used by `TemplateEditorScreen`. Stores local template drafts as:

```typescript
{
  templates: Record<string, Template & { days: TemplateDay[] }>
}
```

Actions: `createTemplate()`, `updateTemplate()`, `deleteTemplate()`, `updateTemplateDay()`

---

## The Onboarding Steps (Ordered)

```
1. GoalSelection
2. ExperienceLevel
3. PhysicalProfile
4. SecondaryGoals
5. WorkoutInterests
6. WorkoutFrequency
7. WorkoutDuration
8. Equipment
9. Units
10. Notification
11. AppTour
12. FinalSuccess
```

Each step's data is typed in `OnboardingStepData`. `saveOnboardingStep()` merges data into `onboardingData`. `completeOnboarding()` merges all staged data into `user` and calls `PATCH /users/me/onboarding`.

---

## React Query (Server State)

Runs **alongside** Zustand. Zustand = local flow logic. React Query = API caching.

| Query key | Source | Used by |
|-----------|--------|---------|
| `['auth', 'me']` | `GET /auth/me` | `useAuthQueries` |
| `['user', 'profile']` | `GET /users/me` | `useUserQueries` |
| `['user', 'settings']` | `GET /users/settings` | `useUserQueries` |
| `['exercises', ...]` | `GET /exercises` | `useExerciseQueries` |
| `['routines', ...]` | `GET /routines` | Explore + Hub screens |
| `['workout', id]` | `GET /workouts/:id` | Post-workout screens |

---

## Persistence Map

| Store | Persisted? | Storage key | What's saved |
|-------|-----------|-------------|-------------|
| `authStore` | Partial | AsyncStorage (manual) | `accessToken`, `refreshToken`, `user` |
| `workoutStore` | Partial | AsyncStorage (zustand persist) | `sessionPhase`, `exercises`, `sets`, `elapsedSeconds`, `restTimer`, `timerPrefs` |
| `creationStore` | Full | AsyncStorage (zustand persist) | `routinePhase`, `routineDraft`, `templatePhase`, `templateDraft` |
| `aiStore` | None | — | Transient only |
| `templateStore` | Full | `template-store-v2` | All local templates |

---

## Hook Layer (consumes stores)

| Hook | What it provides |
|------|-----------------|
| `useOnboardingFlow` | `goNext(step, data)`, `completeOnboarding()`, current step, step data |
| `useWorkoutSession` | All active workout UI + actions (unified `useReducer` local + Zustand global) |
| `useFlowGuard` | Phase-based route protection |
| `useWorkoutAIGeneration` | AI workout flow with AbortController |
| `useRoutineAIGeneration` | AI routine flow with AbortController |
| `useTemplateAIGeneration` | AI template flow with AbortController |
| `useActiveWorkout` | Legacy hook — compat wrapper still used by `ExerciseCard` for `SetType` import |
