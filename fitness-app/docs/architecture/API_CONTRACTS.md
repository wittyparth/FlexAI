# 🔗 FitAI Frontend-Backend API Contracts

**Last Updated:** February 6, 2026  
**Document Version:** 1.0  
**Purpose:** Map frontend screens to backend API endpoints to ensure synchronization

> **See also:** [FRONTEND_HLD.md](./FRONTEND_HLD.md), [FRONTEND_LLD.md](./FRONTEND_LLD.md)

---

## Table of Contents

1. [API Endpoint Inventory](#1-api-endpoint-inventory)
2. [Screen-to-API Mapping](#2-screen-to-api-mapping)
3. [Type Contract Validation](#3-type-contract-validation)
4. [Missing API Analysis](#4-missing-api-analysis)
5. [Request/Response Examples](#5-requestresponse-examples)

---

## 1. API Endpoint Inventory

### 1.1 Complete Endpoint List

| Endpoint | Method | Controller | Frontend API File | Status |
|----------|--------|------------|-------------------|--------|
| `/auth/register` | POST | auth.controller | auth.api.ts | ✅ |
| `/auth/verify-email` | POST | auth.controller | auth.api.ts | ✅ |
| `/auth/resend-verification` | POST | auth.controller | auth.api.ts | ✅ |
| `/auth/login` | POST | auth.controller | auth.api.ts | ✅ |
| `/auth/google` | POST | oauth.controller | auth.api.ts | ✅ |
| `/auth/google` | DELETE | oauth.controller | auth.api.ts | ✅ |
| `/auth/refresh` | POST | auth.controller | auth.api.ts | ✅ |
| `/auth/logout` | POST | auth.controller | auth.api.ts | ✅ |
| `/auth/change-password` | POST | auth.controller | auth.api.ts | ✅ |
| `/auth/forgot-password` | POST | auth.controller | auth.api.ts | ✅ |
| `/auth/reset-password` | POST | auth.controller | auth.api.ts | ✅ |
| `/workouts` | POST | workout.controller | workout.api.ts | ✅ |
| `/workouts` | GET | workout.controller | workout.api.ts | ✅ |
| `/workouts/current` | GET | workout.controller | workout.api.ts | ✅ |
| `/workouts/:id` | GET | workout.controller | workout.api.ts | ✅ |
| `/workouts/:id` | PATCH | workout.controller | workout.api.ts | ✅ |
| `/workouts/:id` | DELETE | workout.controller | workout.api.ts | ✅ |
| `/workouts/:id/complete` | POST | workout.controller | workout.api.ts | ✅ |
| `/workouts/:id/cancel` | POST | workout.controller | workout.api.ts | ✅ |
| `/workouts/:id/exercises` | POST | workout.controller | workout.api.ts | ✅ |
| `/workouts/:id/exercises/:exerciseId` | DELETE | workout.controller | workout.api.ts | ✅ |
| `/workouts/:id/exercises/:exerciseId/sets` | POST | workout.controller | workout.api.ts | ✅ |
| `/workouts/:id/sets/:setId` | PATCH | workout.controller | workout.api.ts | ✅ |
| `/workouts/:id/sets/:setId` | DELETE | workout.controller | workout.api.ts | ✅ |
| `/routines` | GET | routine.controller | routine.api.ts | ✅ |
| `/routines/:id` | GET | routine.controller | routine.api.ts | ✅ |
| `/routines` | POST | routine.controller | routine.api.ts | ✅ |
| `/routines/:id` | PATCH | routine.controller | routine.api.ts | ✅ |
| `/routines/:id` | DELETE | routine.controller | routine.api.ts | ✅ |
| `/routines/:id/exercises` | POST | routine.controller | routine.api.ts | ✅ |
| `/routines/:id/exercises/:exerciseId` | PATCH | routine.controller | routine.api.ts | ✅ |
| `/routines/:id/exercises/reorder` | POST | routine.controller | routine.api.ts | ✅ |
| `/routines/:id/exercises/:exerciseId` | DELETE | routine.controller | routine.api.ts | ✅ |
| `/exercises` | GET | exercise.controller | exercise.api.ts | ✅ |
| `/exercises/:id` | GET | exercise.controller | exercise.api.ts | ✅ |
| `/exercises/search` | GET | exercise.controller | exercise.api.ts | ✅ |
| `/exercises/custom` | POST | exercise.controller | exercise.api.ts | ✅ |
| `/exercises/:id` | PATCH | exercise.controller | exercise.api.ts | ✅ |
| `/exercises/:id` | DELETE | exercise.controller | exercise.api.ts | ✅ |
| `/stats/prs` | GET | stats.controller | stats.api.ts | ✅ |
| `/stats/strength` | GET | stats.controller | stats.api.ts | ✅ |
| `/stats/volume` | GET | stats.controller | stats.api.ts | ✅ |
| `/stats/consistency` | GET | stats.controller | stats.api.ts | ✅ |
| `/stats/muscle-distribution` | GET | stats.controller | stats.api.ts | ✅ |
| `/stats/recovery` | GET | stats.controller | stats.api.ts | ✅ |
| `/stats/body` | GET | stats.controller | stats.api.ts | ✅ |
| `/stats/dashboard` | GET | stats.controller | stats.api.ts | ✅ |
| `/stats/workout-frequency` | GET | stats.controller | stats.api.ts | ✅ |
| `/stats/strength-progression/:exerciseId` | GET | stats.controller | stats.api.ts | ✅ |
| `/social/follow/:userId` | POST | social.controller | social.api.ts | ✅ |
| `/social/unfollow/:userId` | DELETE | social.controller | social.api.ts | ✅ |
| `/social/follow-status/:userId` | GET | social.controller | social.api.ts | ✅ |
| `/social/followers` | GET | social.controller | social.api.ts | ✅ |
| `/social/following` | GET | social.controller | social.api.ts | ✅ |
| `/feed` | GET | feed.controller | feed.api.ts | ✅ |
| `/feed/posts` | POST | feed.controller | feed.api.ts | ✅ |
| `/feed/posts/:id` | GET | feed.controller | feed.api.ts | ✅ |
| `/feed/posts/:id/like` | POST | feed.controller | feed.api.ts | ✅ |
| `/feed/posts/:id/unlike` | DELETE | feed.controller | feed.api.ts | ✅ |
| `/feed/posts/:id/comments` | POST | feed.controller | feed.api.ts | ✅ |
| `/feed/posts/:id/comments` | GET | feed.controller | feed.api.ts | ✅ |
| `/leaderboard` | GET | leaderboard.controller | leaderboard.api.ts | ✅ |
| `/leaderboard/challenges` | GET | leaderboard.controller | leaderboard.api.ts | ✅ |
| `/user/profile` | GET | user.controller | user.api.ts | ✅ |
| `/user/profile` | PATCH | user.controller | user.api.ts | ✅ |
| `/user/onboarding` | POST | user.controller | user.api.ts | ✅ |
| `/user/:id` | GET | user.controller | user.api.ts | ✅ |
| `/body/weight` | POST | body.controller | body.api.ts | ✅ |
| `/body/measurements` | POST | body.controller | body.api.ts | ✅ |
| `/body/photos` | POST | body.controller | body.api.ts | ✅ |
| `/coach/chat` | POST | coach.controller | ai.api.ts | ✅ |
| `/coach/generate-workout` | POST | coach.controller | ai.api.ts | ✅ |
| `/coach/analyze-form` | POST | coach.controller | ai.api.ts | ✅ |
| `/gamification/achievements` | GET | gamification.controller | gamification.api.ts | ✅ |
| `/notifications` | GET | notification.controller | notifications.api.ts | ✅ |
| `/notifications/register-device` | POST | notification.controller | notifications.api.ts | ✅ |
| `/notifications/:id/read` | PATCH | notification.controller | notifications.api.ts | ✅ |
| `/notifications/read-all` | PATCH | notification.controller | notifications.api.ts | ✅ |

**Total Endpoints:** 81

---

## 2. Screen-to-API Mapping

### 2.1 Authentication Screens (8 screens)

#### **WelcomeScreen**
- **APIs:** None (navigation only)

#### **LoginScreen**
- **APIs:**
  - `POST /auth/login` → Login with email/password
- **Request:** `{ email, password }`
- **Response:** `{ accessToken, refreshToken, user }`
- **Usage:** `useAuthQueries().loginMutation.mutate()`

#### **RegisterScreen**
- **APIs:**
  - `POST /auth/register` → Create new account
- **Request:** `{ email, password, name }`
- **Response:** `{ success: true, message: 'Verification email sent' }`
- **Navigation:** Auto-navigate to `EmailVerification`

#### **EmailVerificationScreen**
- **APIs:**
  - `POST /auth/verify-email` → Verify OTP
  - `POST /auth/resend-verification` → Resend OTP
- **Request:** `{ email, otp }` / `{ email }`
- **Response:** `{ accessToken, refreshToken, user }` / `{ success: true }`
- **Behavior:** Auto-login on successful verification

#### **ForgotPasswordScreen**
- **APIs:**
  - `POST /auth/forgot-password` → Request reset OTP
- **Request:** `{ email }`
- **Response:** `{ success: true, message: 'OTP sent' }`
- **Navigation:** → `PasswordReset`

#### **PasswordResetScreen**
- **APIs:**
  - `POST /auth/reset-password` → Reset password with OTP
- **Request:** `{ email, otp, newPassword }`
- **Response:** `{ success: true }`
- **Navigation:** → ` Login` (success)

#### **GoogleAuthScreen**
- **APIs:**
  - `POST /auth/google` → Authenticate with Google
- **Request:** `{ idToken }` (from Google Sign-In SDK)
- **Response:** `{ accessToken, refreshToken, user }`
- **Usage:** Google OAuth flow → backend validation

#### **PrivacyPolicyScreen** / **TermsOfServiceScreen**
- **APIs:** None (static content)

---

### 2.2 Workout Screens (18 screens)

#### **WorkoutHubScreen**
- **APIs:**
  - `GET /workouts?limit=5&status=completed` → Recent workouts
  - `POST /workouts` (via `workoutStore.startWorkout`) → Start new workout
  - `GET /workouts/current` → Check for in-progress workout
- **State:** `useWorkoutStore().activeWorkoutId`, `useWorkouts()`

#### **ActiveWorkoutScreen**
- **APIs (via workoutStore):**
  - `POST /workouts/:id/exercises/:exerciseId/sets` → Log set (optimistic)
  - `PATCH /workouts/:id/sets/:setId` → Update set
  - `DELETE /workouts/:id/sets/:setId` → Delete set
  - `POST /workouts/:id/complete` → Complete workout
  - `POST /workouts/:id/cancel` → Cancel workout
  - `POST /workouts/:id/exercises` → Add exercise mid-workout
  - `DELETE /workouts/:id/exercises/:exerciseId` → Remove exercise
- **State:** Primarily `workoutStore` (full session state)

#### **WorkoutDetailScreen**
- **APIs:**
  - `GET /workouts/:id` → Fetch workout details
  - `PATCH /workouts/:id` → Edit workout name/notes
  - `DELETE /workouts/:id` → Delete workout
- **Usage:** `useWorkout(workoutId)`, `useUpdateWorkout()`, `useDeleteWorkout()`

#### **WorkoutHistoryScreen**
- **APIs:**
  - `GET /workouts?page=1&limit=20&status=completed` → Paginated history
- **Usage:** `useWorkouts()` with pagination

#### **WorkoutSummaryScreen**
- **APIs:**
  - `GET /workouts/:id` → Display completed workout stats
- **Usage:** `useWorkout(workoutId)`

#### **SessionInsightsScreen**
- **APIs:**
  - `GET /workouts/:id` → Workout data
  - `GET /stats/volume` → Compare to average
- **Derived Data:** Volume, PRs achieved, muscle breakdown

#### **RoutineListScreen**
- **APIs:**
  - `GET /routines` → User's routines
  - `DELETE /routines/:id` → Delete routine
- **Usage:** `useRoutines()`, `useDeleteRoutine()`

#### **RoutineDetailScreen**
- **APIs:**
  - `GET /routines/:id` → Routine with exercises
  - `POST /workouts` (start from routine) → Start workout
- **Usage:** `useRoutine(routineId)`, `workoutStore.startWorkout({ routineId })`

#### **RoutineEditorScreen**
- **APIs:**
  - `POST /routines` → Create new routine
  - `PATCH /routines/:id` → Update routine metadata
  - `POST /routines/:id/exercises` → Add exercise
  - `DELETE /routines/:id/exercises/:exerciseId` → Remove exercise
  - `PATCH /routines/:id/exercises/:exerciseId` → Update sets/reps targets
  - `POST /routines/:id/exercises/reorder` → Reorder exercises
- **Usage:** `useCreateRoutine()`, `useUpdateRoutine()`, `useAddExerciseToRoutine()`

#### **AIGeneratorScreen**
- **APIs:**
  - `POST /coach/generate-workout` → AI-generated routine
- **Request:** `{ goal, muscleGroups, duration, difficulty }`
- **Response:** `{ routine: Routine }`
- **Usage:** `useAIQueries().generateWorkoutMutation`
- **Navigation:** → `AIPreview` with generated routine

#### **AIPreviewScreen**
- **APIs:**
  - `POST /routines` → Save AI-generated routine
  - `POST /workouts` → Start workout directly
- **Usage:** `useCreateRoutine()`, `workoutStore.startWorkout()`

#### **ExerciseSwapScreen**
- **APIs:**
  - `GET /exercises?muscleGroup=chest` → Alternative exercises
  - `PATCH /workouts/:id/exercises/:exerciseId` (swap logic) → Replace exercise
- **Usage:** `useExercises()`, custom mutation

#### **ExercisePickerScreen**
- **APIs:**
  - `GET /exercises` → Exercise library
  - `GET /exercises/search?query=bench` → Search
- **Usage:** `useExercises()`, search filtering

#### **ExerciseCreatorScreen**
- **APIs:**
  - `POST /exercises/custom` → Create custom exercise
- **Request:** `{ name, muscleGroup, equipment, difficulty, instructions }`
- **Usage:** `useCreateCustomExercise()`

#### **RestTimerScreen**
- **APIs:** None (UI timer only)
- **State:** Local `useTimer` hook

#### **SetHistoryScreen**
- **APIs:**
  - `GET /workouts?exerciseId=5` (filtered) → Past sets for this exercise
- **Usage:** Custom query with filters

#### **VolumeLadderScreen**
- **APIs:**
  - `GET /stats/volume?exerciseId=5&period=30d` → Exercise volume progression
- **Usage:** `useVolumeAnalytics()`

#### **WorkoutTemplatesScreen**
- **APIs:**
  - `GET /routines?isPublic=true` → Public routine templates
- **Usage:** `useRoutines({ isPublic: true })`

---

### 2.3 Profile Screens (33 screens) - **Key Examples**

#### **ProfileHubScreen**
- **APIs:**
  - `GET /stats/dashboard` → Overview stats (XP, streak, workouts)
  - `GET /user/profile` (via authStore) → User data
- **Usage:** `useDashboardStats()`, `authStore.user`

#### **EditProfileScreen** ⚠️ **MISSING FILE**
- **APIs:**
  - `GET /user/profile` → Current profile
  - `PATCH /user/profile` → Update profile
  - `POST /upload/avatar` ❌ **MISSING** (or use S3 presigned URL)
- **Required Implementation:** Create screen + handle avatar upload

#### **StatsHubScreen**
- **APIs:**
  - `GET /stats/prs` → Personal records
  - `GET /stats/volume` → Volume analytics
  - `GET /stats/strength-progression/:exerciseId` → Strength trends
- **Usage:** `usePersonalRecords()`, `useVolumeAnalytics()`, `useStrengthProgression()`

#### **PersonalRecordsScreen**
- **APIs:**
  - `GET /stats/prs` → All PRs with pagination
- **Usage:** `usePersonalRecords()`

#### **StrengthProgressionScreen**
- **APIs:**
  - `GET /stats/strength-progression/:exerciseId` → Exercise-specific strength curve
- **Usage:** `useStrengthProgression(exerciseId)`

#### **VolumeAnalyticsScreen**
- **APIs:**
  - `GET /stats/volume?period=30d` → Daily/weekly volume trends
- **Usage:** `useVolumeAnalytics({ period: '30d' })`

#### **MuscleDistributionScreen**
- **APIs:**
  - `GET /stats/muscle-distribution` → Muscle group training % (pie chart)
- **Usage:** `useMuscleDistribution()`

#### **MuscleHeatmapScreen**
- **APIs:**
  - `GET /stats/muscle-distribution` → 3D muscle heatmap data
- **Usage:** `useMuscleHeatmap()`

#### **WorkoutFrequencyScreen** ⚠️ **MISSING FILE**
- **APIs:**
  - `GET /stats/workout-frequency` → Weekly workout frequency trends
- **Required Implementation:** Create screen

#### **RecoveryStatusScreen** ⚠️ **MISSING FILE**
- **APIs:**
  - `GET /stats/recovery` → Recovery metrics
- **Required Implementation:** Create screen

#### **BodyTrackingHubScreen**
- **APIs:**
  - `GET /stats/body` → Weight/measurement history
- **Usage:** `useBodyStats()`

#### **WeightTrackerScreen**
- **APIs:**
  - `GET /stats/body?type=weight` → Weight history
  - `POST /body/weight` → Log weight
- **Usage:** `useBodyStats()`, `useLogWeight()`

#### **MeasurementTrackerScreen**
- **APIs:**
  - `GET /stats/body?type=measurements` → Measurement history
  - `POST /body/measurements` → Log measurements
- **Usage:** `useBodyStats()`, `useLogMeasurement()`

#### **ProgressPhotosScreen**
- **APIs:**
  - `GET /stats/body?type=photos` → Photo history
  - `POST /body/photos` → Upload photo
- **Usage:** `useBodyStats()`, `useUploadPhoto()`

#### **TakeProgressPhotoScreen** ⚠️ **MISSING FILE**
- **APIs:**
  - `POST /body/photos` → Upload photo
  - `POST /upload/photo` ❌ **MISSING** (or use S3 presigned URL)
- **Required Implementation:** Create camera screen

#### **AchievementsScreen** ⚠️ **MISSING FILE**
- **APIs:**
  - `GET /gamification/achievements` → All achievements + progress
- **Required Implementation:** Create screen

#### **XPLevelDetailScreen** / **XPHistoryScreen** ⚠️ **MISSING**
- **APIs:**
  - `GET /gamification/xp-history` ❌ **MISSING ENDPOINT**
- **Required Implementation:** Backend endpoint + frontend screen

#### **FullStreakCalendarScreen**
- **APIs:**
  - `GET /stats/consistency` → Streak + workout calendar
- **Usage:** `useConsistencyStats()`

#### **CoachHubScreen**
- **APIs:**
  - `GET /coach/chat` (conversation history) → Previous AI conversations
- **Usage:** `useCoachQueries()`

#### **CoachChatScreen**
- **APIs:**
  - `POST /coach/chat` → Send message to AI coach
- **Request:** `{ message, context }`
- **Response:** `{ reply, conversationId }`
- **Usage:** `useSendCoachMessage()`

#### **FormAnalysisScreen**
- **APIs:**
  - `POST /coach/analyze-form` → AI form check
- **Request:** `{ videoUrl, exerciseId }`
- **Response:** `{ feedback, score, suggestions }`
- **Usage:** `useAnalyzeForm()`

#### **CoachPromptsScreen** ⚠️ **MISSING FILE**
- **APIs:**
  - `GET /coach/prompts` ❌ **MISSING ENDPOINT** (or use static prompts)
- **Potential Implementation:** Static prompt library or backend endpoint

#### **SettingsScreen**
- **APIs:**
  - `POST /auth/logout` → Logout
  - `DELETE /auth/google` → Unlink Google
- **Usage:** `useAuthQueries().logoutMutation`, `unlinkGoogleMutation`

#### **NotificationPreferencesScreen**
- **APIs:**
  - `GET /notifications/preferences` ❌ **MISSING ENDPOINT**
  - `PATCH /notifications/preferences` ❌ **MISSING ENDPOINT**
- **Current:** Likely stored client-side in AsyncStorage
- **Recommendation:** Implement backend endpoints for cross-device sync

#### **AccountManagementScreen**
- **APIs:**
  - `POST /auth/change-password` → Change password
  - `DELETE /user/account` ❌ **MISSING ENDPOINT** (account deletion)
- **Required:** Account deletion endpoint

#### **HelpSupportScreen**
- **APIs:** None (static FAQ content)

#### **AboutScreen**
- **APIs:** None (app version, credits, links)

---

### 2.4 Social Screens (12 screens)

#### **SocialHomeScreen**
- **APIs:**
  - `GET /feed?page=1&limit=20` → Paginated social feed
- **Usage:** `useFeed()` with infinite scroll

#### **CreatePostScreen**
- **APIs:**
  - `POST /feed/posts` → Create post
  - `POST /upload/image` ❌ **MISSING** (image upload for posts)
- **Request:** `{ content, workoutId?, imageUrl? }`
- **Usage:** `useCreatePost()`

#### **PostDetailScreen**
- **APIs:**
  - `GET /feed/posts/:id` → Post details
  - `GET /feed/posts/:id/comments` → Comments
  - `POST /feed/posts/:id/like` → Like post
  - `DELETE /feed/posts/:id/unlike` → Unlike post
  - `POST /feed/posts/:id/comments` → Comment on post
- **Usage:** `usePost(postId)`, `useComments(postId)`, `useLikePost()`

#### **ShareWorkoutScreen** ⚠️ **MISSING FILE**
- **APIs:**
  - `POST /feed/posts` → Share workout as post
  - `POST /social/share-workout` ❌ **ALTERNATIVELY: Dedicated endpoint**
- **Required Implementation:** Create screen

#### **UserProfileScreen**
- **APIs:**
  - `GET /user/:id` → User profile
  - `GET /workouts?userId=:id&limit=10` → User's recent workouts
  - `GET /social/follow-status/:userId` → Check if following
  - `POST /social/follow/:userId` → Follow user
  - `DELETE /social/unfollow/:userId` → Unfollow user
- **Usage:** `useUserProfile(userId)`, `useFollowUser()`, `useUnfollowUser()`

#### **SearchUsersScreen**
- **APIs:**
  - `GET /user/search?query=john` ❌ **MISSING ENDPOINT**
- **Current Workaround:** Client-side search on followers/following
- **Recommendation:** Implement user search endpoint

#### **FollowersScreen** / **FollowingScreen**
- **APIs:**
  - `GET /social/followers` → List of followers
  - `GET /social/following` → List of following
- **Usage:** `useFollowers()`, `useFollowing()`

#### **LeaderboardScreen**
- **APIs:**
  - `GET /leaderboard?period=weekly` → Global leaderboard
- **Usage:** `useLeaderboard({ period: 'weekly' })`

#### **ChallengesListScreen**
- **APIs:**
  - `GET /leaderboard/challenges` → Active challenges
  - `POST /challenges/:id/join` ❌ **MISSING ENDPOINT**
- **Partial Implementation:** Only list endpoint exists

#### **ChallengeDetailScreen**
- **APIs:**
  - `GET /challenges/:id` ❌ **MISSING ENDPOINT**
  - `GET /challenges/:id/leaderboard` ❌ **MISSING ENDPOINT**
- **Required Implementation:** Challenge detail + leaderboard endpoints

#### **ActivityScreen** (Notifications)
- **APIs:**
  - `GET /notifications` → Recent notifications
  - `PATCH /notifications/:id/read` → Mark as read
  - `PATCH /notifications/read-all` → Mark all as read
  - `POST /notifications/register-device` → Register for push notifications
- **Usage:** `useNotifications()`, `useMarkAsRead()`, `useRegisterDevice()`

---

### 2.5 Explore Screens (6 screens)

#### **ExploreHubScreen**
- **APIs:** None (navigation hub)

#### **ExerciseLibraryScreen**
- **APIs:**
  - `GET /exercises` → All exercises
  - `GET /exercises/search?query=bench` → Search exercises
- **Usage:** `useExercises()`, search filtering

#### **ExerciseDetailScreen**
- **APIs:**
  - `GET /exercises/:id` → Exercise details
- **Usage:** `useExercise(exerciseId)`

#### **PublicRoutinesScreen**
- **APIs:**
  - `GET /routines?isPublic=true` → Community routines
- **Usage:** `useRoutines({ isPublic: true })`

#### **ExerciseCreatorScreen**
- **APIs:**
  - `POST /exercises/custom` → Create custom exercise
- **Usage:** `useCreateCustomExercise()`

#### **MyCustomExercisesScreen** ⚠️ **MISSING FILE**
- **APIs:**
  - `GET /exercises?custom=true` → User's custom exercises
  - `PATCH /exercises/:id` → Edit custom exercise
  - `DELETE /exercises/:id` → Delete custom exercise
- **Required Implementation:** Create screen

---

### 2.6 Onboarding Screens (11 screens)

#### **Onboarding screens (Welcome → Goal → Experience → Equipment → Schedule → Metrics → Complete)**
- **APIs:**
  - `POST /user/onboarding` → Submit all onboarding data at completion
- **Request:** `{ fitnessGoal, experienceLevel, equipment, workoutDays, metrics, ... }`
- **State:** `authStore.updatedUser` (staging) → `setOnboardingCompleted()`
- **Usage:** Single API call at end of onboarding flow

---

### 2.7 Home Screens (4 screens)

#### **HomeDashboardScreen**
- **APIs:**
  - `GET /stats/dashboard` → Today's summary, streak, XP, weekly progress
- **Usage:** `useDashboardStats()`

#### **HomeNotificationsScreen**
- **APIs:**
  - `GET /notifications?type=announcement` → App-wide notifications
- **Usage:** `useNotifications({ type: 'announcement' })`

#### **XPLevelDetailScreen**
- **APIs:**
  - `GET /gamification/achievements` → Level info + badge requirements
  - `GET /gamification/xp-history` ❌ **MISSING ENDPOINT**
- **Usage:** `useAchievements()`

#### **FullStreakCalendarScreen**
- **APIs:**
  - `GET /stats/consistency` → Streak calendar data
- **Usage:** `useConsistencyStats()`

---

## 3. Type Contract Validation

### 3.1 Request Type Alignment

**Example: StartWorkoutInput**

**Frontend (`backend.types.ts`):**
```typescript
interface StartWorkoutInput {
  name?: string;
  routineId?: number;
  notes?: string;
}
```

**Backend (`src/schemas/workout.schema.ts`):**
```typescript
export const startWorkoutSchema = z.object({
  name: z.string().optional(),
  routineId: z.number().int().positive().optional(),
  notes: z.string().optional(),
});
```

**Status:** ✅ **Aligned**

---

**Example: LogSetInput**

**Frontend:**
```typescript
interface LogSetInput {
  weight?: number;
  reps?: number;
  rpe?: number;
  rir?: number;
  setType?: 'warmup' | 'working' | 'drop' | 'failure' | 'amrap';
}
```

**Backend:**
```typescript
export const logSetSchema = z.object({
  weight: z.number().positive().optional(),
  reps: z.number().int().positive().optional(),
  rpe: z.number().min(1).max(10).optional(),
  rir: z.number().min(0).max(10).optional(),
  setType: z.enum(['warmup', 'working', 'drop', 'failure', 'amrap']).optional(),
});
```

**Status:** ✅ **Aligned**

---

### 3.2 Response Type Alignment

**Example: Workout Response**

**Frontend (`backend.types.ts`):**
```typescript
interface Workout {
  id: number;
  userId: number;
  name: string;
  startTime: string;
  endTime?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  exercises: WorkoutExercise[];
}
```

**Backend (Prisma model → controller response):**
```typescript
// Matches ✅
// Controller returns: include: { exercises: { include: { exercise: true, sets: true } } }
```

**Status:** ✅ **Aligned**

---

### 3.3 Enum Mismatches

**Potential Issue: Goal Types**

**Frontend (AIGeneratorScreen):**
```typescript
// Local UI uses: 'muscle', 'strength', 'fat', 'endurance'
```

**Backend Expects:**
```typescript
// backend.types.ts GoalType
type GoalType = 'muscle_gain' | 'strength' | 'fat_loss' | 'endurance';
```

**Fix Applied:** `AIPreviewScreen.tsx` maps local → backend:
```typescript
const goalMapping = {
  muscle: 'muscle_gain',
  fat: 'fat_loss',
  strength: 'strength',
  endurance: 'endurance',
};
```

**Status:** ✅ **Fixed** (2024-02-03 conversation)

---

## 4. Missing API Analysis

### 4.1 Missing Backend Endpoints

| Feature | Missing Endpoint | Priority | Screens Affected | Recommendation |
|---------|------------------|----------|------------------|----------------|
| **User Search** | `GET /user/search?query=john` | Medium | SearchUsersScreen | Implement search with pagination |
| **XP History** | `GET /gamification/xp-history` | Medium | XPHistoryScreen | Return XP gains per day/week |
| **Challenge Detail** | `GET /challenges/:id` | Low | ChallengeDetailScreen | Implement challenge CRUD |
| **Challenge Join** | `POST /challenges/:id/join` | Low | ChallengesListScreen | Allow joining challenges |
| **Challenge Leaderboard** | `GET /challenges/:id/leaderboard` | Low | ChallengeDetailScreen | Show rankings |
| **Account Deletion** | `DELETE /user/account` | High | AccountManagementScreen | GDPR compliance |
| **Avatar Upload** | `POST /upload/avatar` (or S3 presigned URL) | High | EditProfileScreen | Use S3 presigned URL pattern |
| **Photo Upload** | `POST /upload/photo` | Medium | TakeProgressPhotoScreen | S3 presigned URL |
| **Image Upload (Posts)** | `POST /upload/image` | Medium | CreatePostScreen | S3 presigned URL |
| **Notification Preferences** | `GET/PATCH /notifications/preferences` | Low | NotificationPreferencesScreen | Cross-device sync |
| **Coach Prompts** | `GET /coach/prompts` | Low | CoachPromptsScreen | Can be static client-side |
| **Social Share Workout** | `POST /social/share-workout` | Low | ShareWorkoutScreen | Alternative: use `POST /feed/posts` |

---

### 4.2 Missing Frontend Screens

| Screen | Required APIs | Priority | Complexity | Notes |
|--------|---------------|----------|------------|-------|
| **EditProfileScreen** | `GET/PATCH /user/profile` ✅, `POST /upload/avatar` ❌ | High | Medium | Endpoints exist except avatar upload |
| **AchievementsScreen** | `GET /gamification/achievements` ✅ | High | Low | Endpoint exists, just create UI |
| **XPHistoryScreen** | `GET /gamification/xp-history` ❌ | Medium | Low | Need backend endpoint first |
| **WorkoutFrequencyScreen** | `GET /stats/workout-frequency` ✅ | Medium | Low | Endpoint exists, create chart UI |
| **RecoveryStatusScreen** | `GET /stats/recovery` ✅ | Medium | Medium | Endpoint exists, visualize recovery metrics |
| **ShareWorkoutScreen** | `POST /feed/posts` ✅ | Medium | Low | Can reuse CreatePostScreen logic |
| **MyCustomExercisesScreen** | `GET /exercises?custom=true` ✅ | Low | Low | Filter existing endpoint |
| **TakeProgressPhotoScreen** | `POST /body/photos` ✅, `POST /upload/photo` ❌ | Low | Medium | Need photo upload endpoint |
| **CoachPromptsScreen** | Static data or `GET /coach/prompts` ❌ | Low | Low | Can be client-side static |

---

### 4.3 Recommendations

**High Priority (Blocking 92 screens):**
1. Implement S3 presigned URL generation for avatar/photo uploads
2. Create `EditProfileScreen` (high user value)
3. Create `AchievementsScreen` (gamification critical)
4. Implement `DELETE /user/account` (GDPR compliance)

**Medium Priority (User value):**
1. Implement `GET /gamification/xp-history` endpoint
2. Create `XPHistoryScreen`, `WorkoutFrequencyScreen`, `RecoveryStatusScreen`
3. Create `ShareWorkoutScreen` (social engagement)

**Low Priority (Nice to have):**
1. Challenge system (detail, join, leaderboard endpoints)
2. User search endpoint
3. `MyCustomExercisesScreen`, `CoachPromptsScreen`

---

## 5. Request/Response Examples

### 5.1 Common Patterns

**Standard Success Response:**
```json
{
  "success": true,
  "data": { /* resource */ }
}
```

**Standard Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "code": "VALIDATION_ERROR",
  "data": { /* field errors */ }
}
```

---

### 5.2 Example: Start Workout

**Request:**
```http
POST /api/v1/workouts
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "Push Day",
  "routineId": 5,
  "notes": "Focus on progressive overload"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "userId": 1,
    "name": "Push Day",
    "startTime": "2026-02-06T11:00:00Z",
    "endTime": null,
    "status": "in_progress",
    "exercises": [
      {
        "id": 1,
        "workoutId": 123,
        "exerciseId": 10,
        "exercise": {
          "id": 10,
          "name": "Bench Press",
          "muscleGroup": "Chest",
          "equipment": "Barbell"
        },
        "sets": [],
        "targetSets": 3,
        "targetRepsMin": 8,
        "targetRepsMax": 12
      }
    ]
  }
}
```

---

### 5.3 Example: Log Set (Optimistic)

**Frontend Flow:**
```typescript
// 1. Optimistic: Add temp set immediately
workoutStore.logSet(exerciseId, { weight: 80, reps: 10, rpe: 8 });
// UI updates instantly with temp ID

// 2. API Call (background)
POST /workouts/123/exercises/1/sets
{ "weight": 80, "reps": 10, "rpe": 8 }

// 3. Response: Reconcile temp → real ID
{ "data": { "id": "456", "weight": 80, "reps": 10, "rpe": 8 } }
```

**Request:**
```http
POST /api/v1/workouts/123/exercises/1/sets
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "weight": 80,
  "reps": 10,
  "rpe": 8,
  "setType": "working"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "456",
    "workoutExerciseId": 1,
    "weight": 80,
    "reps": 10,
    "rpe": 8,
    "rir": null,
    "setType": "working",
    "createdAt": "2026-02-06T11:15:00Z"
  }
}
```

---

## Appendix: Quick Reference

### API Domains Summary

| Domain | Endpoints | Frontend File | Screens Using |
|--------|-----------|---------------|---------------|
| **Auth** | 11 | auth.api.ts | 8 auth screens |
| **Workout** | 13 | workout.api.ts | 18 workout screens |
| **Routine** | 8 | routine.api.ts | 4-5 screens |
| **Exercise** | 6 | exercise.api.ts | 5 screens |
| **Stats** | 10 | stats.api.ts | 15+ profile/home screens |
| **Social** | 5 | social.api.ts | 7 social screens |
| **Feed** | 6 | feed.api.ts | 3-4 social screens |
| **Leaderboard** | 2 | leaderboard.api.ts | 2 screens |
| **User** | 4 | user.api.ts | Profile, onboarding |
| **Body** | 3 | body.api.ts | 3 body tracking screens |
| **Coach** | 3 | ai.api.ts | 3 AI screens |
| **Gamification** | 1 | gamification.api.ts | 2 screens |
| **Notifications** | 4 | notifications.api.ts | 1 screen |

**Total:** 81 endpoints across 14 route files

---

**Document End** | **See also:** [FRONTEND_HLD.md](./FRONTEND_HLD.md), [FRONTEND_LLD.md](./FRONTEND_LLD.md)
