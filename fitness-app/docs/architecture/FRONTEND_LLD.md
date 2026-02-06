# 🔧 FitAI Frontend - Low-Level Design (LLD)

**Last Updated:** February 6, 2026  
**Document Version:** 1.0  
**Application:** FitAI - AI-Powered Fitness Tracking Mobile App  
**Platform:** React Native (iOS & Android)

> **Note:** This document provides implementation-level specifications. See [FRONTEND_HLD.md](./FRONTEND_HLD.md) for architectural overview.

---

## Table of Contents

1. [Component Architecture](#1-component-architecture)
2. [Screen Specifications](#2-screen-specifications)
3. [State Management Specifications](#3-state-management-specifications)
4. [API Client Specifications](#4-api-client-specifications)
5. [Type Definitions](#5-type-definitions)
6. [Custom Hooks](#6-custom-hooks)
7. [Utility Functions](#7-utility-functions)

---

## 1. Component Architecture

### 1.1 Component Hierarchy (Atomic Design)

```
src/components/
├── atoms/                    # Basic building blocks
│   ├── Button.tsx           # Primary buttons, outline, text variants
│   ├── Input.tsx            # Text input with validation states
│   ├── IconButton.tsx       # Icon-only buttons
│   ├── Badge.tsx            # Status badges (XP, level, difficulty)
│   └── Avatar.tsx           # User profile images
│
├── molecules/               # Combinations of atoms
│   ├── Card.tsx             # Base card component
│   ├── WorkoutCard.tsx      # Workout preview card
│   ├── ExerciseCard.tsx     # Exercise display card
│   ├── RoutineCard.tsx      # Routine preview card
│   ├── SetRow.tsx           # Single set display/input
│   ├── MuscleGroupBadge.tsx # Muscle group indicator
│   └── StatCard.tsx         # Statistics display card
│
├── organisms/               # Complex UI sections
│   ├── WorkoutPlayer.tsx    # Floating active workout bar
│   ├── ExerciseList.tsx     # Scrollable exercise list
│   ├── RoutineEditor.tsx    # Routine creation form
│   ├── SocialFeed.tsx       # Social media feed
│   ├── StatsChart.tsx       # Chart.js wrapper
│   └── NavigationHeader.tsx # Custom headers
│
└── templates/               # Screen layouts
    ├── LoadingState.tsx     # Full-screen loading
    ├── ErrorState.tsx       # Error display with retry
    └── EmptyState.tsx       # No data placeholder
```

### 1.2 Core Component Specifications

#### **Button Component** (`src/components/atoms/Button.tsx`)

```typescript
interface ButtonProps {
  onPress: () => void;
  title?: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string; // Ionicons name
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
}

// Usage
<Button 
  title="Start Workout"
  variant="primary"
  size="large"
  icon="play"
  onPress={handleStart}
  loading={isStarting}
/>
```

#### **Card Component** (`src/components/molecules/Card.tsx`)

```typescript
interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  elevation?: number; // Shadow depth
  padding?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: number;
  backgroundColor?: string;
  style?: ViewStyle;
}

// Derivatives
// WorkoutCard extends Card with workout-specific layout
// ExerciseCard extends Card with exercise preview
// RoutineCard extends Card with routine metadata
```

#### **WorkoutPlayer Component** (`src/components/organisms/WorkoutPlayer.tsx`)

```typescript
interface WorkoutPlayerProps {
  workoutId: number;
  workoutName: string;
  elapsedSeconds: number;
  minimized: boolean;
  onMinimize: (minimized: boolean) => void;
  onNavigateToWorkout: () => void;
  onCancel: () => void;
}

// State Dependencies
// - useWorkoutStore: activeWorkoutId, workoutName, elapsedSeconds
// - local state: minimized UI state

// Behavior
// - Sticky bottom bar when minimized
// - Expands to show current exercise when tapped
// - Shows elapsed timer
// - Cancel button with confirmation
```

---

## 2. Screen Specifications

> **Note:** For brevity, this section shows detailed specs for representative screens from each navigator. The pattern applies to all 92 screens.

### 2.1 Authentication Screens (8 screens)

#### 🔐 **LoginScreen**

**File:** `src/screens/auth/LoginScreen.tsx`  
**Navigator:** AuthStack  
**Route:** `Login`  
**Params:** `undefined`

**State Dependencies:**
- Zustand: None (stateless form)
- React Query: `useAuthQueries().loginMutation`

**API Calls:**
```typescript
POST /auth/login
Request: { email: string, password: string }
Response: { accessToken, refreshToken, user }
```

**UI Components:**
- `Input` (email, password)
- `Button` (Login, Forgot Password)
- `ErrorBanner` (validation/API errors)

**Navigation Targets:**
- `Register` (sign up link)
- `ForgotPassword` (reset link)
- `Main` (on success → automatic via `isAuthenticated`)

**Form State:**
```typescript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

const validate = () => {
  if (!email.includes('@')) errors.email = 'Invalid email';
  if (password.length < 6) errors.password = 'Password too short';
  return Object.keys(errors).length === 0;
};
```

**Error Handling:**
- Invalid credentials → Show API error message
- Network error → "Check your connection" with retry
- Validation errors → Field-specific error text

---

#### 📧 **VerifyEmailScreen**

**File:** `src/screens/auth/VerifyEmailScreen.tsx`  
**Navigator:** AuthStack  
**Route:** `EmailVerification`  
**Params:** `{ email: string }`

**State Dependencies:**
- React Query: `useAuthQueries().verifyEmailMutation`, `resendVerificationMutation`

**API Calls:**
```typescript
POST /auth/verify-email
Request: { email: string, otp: string }
Response: { accessToken, refreshToken, user }

POST /auth/resend-verification
Request: { email: string }
Response: { success: true }
```

**UI Components:**
- `OTPInput` (6-digit code)
- `Button` (Verify, Resend Code)
- `Countdown Timer` (60s before resend enabled)

**Behavior:**
- Auto-submit when 6 digits entered
- Resend button disabled for 60s after send
- Auto-login on successful verification

---

### 2.2 Workout Screens (18 screens) - **Detailed**

#### 💪 **WorkoutHubScreen**

**File:** `src/screens/workout/WorkoutHubScreen.tsx`  
**Navigator:** WorkoutNavigator  
**Route:** `WorkoutHub`  
**Params:** `undefined`

**State Dependencies:**
```typescript
// Zustand
const { activeWorkoutId, status, workoutName, minimized } = useWorkoutStore();

// React Query
const { data: workouts, isLoading } = useWorkouts({ limit: 5, status: 'completed' });
```

**API Calls:**
```typescript
GET /workouts?limit=5&status=completed
Response: { data: Workout[], pagination: {...} }

POST /workouts (via workoutStore.startWorkout)
Request: { name?: string, routineId?: number }
Response: { data: Workout }
```

**UI Sections:**
1. **Active Workout Player** (if `activeWorkoutId`)
   - Minimized bar showing workout name + elapsed time
   - Tap to navigate to `ActiveWorkout`
   - Floating at bottom

2. **Quick Start**
   - "Start Empty Workout" button
   - "Resume from Routine" → navigate to `RoutineList`
   - "AI Generate" → navigate to `AIGenerator`

3. **Recent Workouts**
   - FlatList of last 5 workouts
   - Each row: workout name, date, duration, exercises count
   - Tap to navigate to `WorkoutDetail`

4. **Navigation Buttons**
   - "View All History" → `WorkoutHistory`
   - "My Routines" → `RoutineList`

**Navigation Targets:**
- `ActiveWorkout` (start or resume)
- `WorkoutHistory` (see all workouts)
- `RoutineList` (start from routine)
- `AIGenerator` (AI workout)
- `WorkoutDetail` (view past workout)

**Loading States:**
- Skeleton loaders for recent workouts
- Disable buttons while starting workout

**Error States:**
- Failed to load workouts → "Error loading workouts" with retry
- Failed to start workout → Alert with error message

---

#### 🏋️ **ActiveWorkoutScreen**

**File:** `src/screens/workout/ActiveWorkoutScreen.tsx`  
**Navigator:** WorkoutNavigator  
**Route:** `ActiveWorkout`  
**Params:** `{ routineId?: number; workoutId?: number }`

**State Dependencies:**
```typescript
// Zustand (Primary State)
const {
  activeWorkoutId,
  workoutName,
  status,
  exercises, // Record<number, WorkoutExercise>
  sets, // Record<string, WorkoutSet>
  elapsedSeconds,
  logSet,
  deleteSet,
  completeWorkout,
  cancelWorkout,
} = use WorkoutStore();

// React Query (for exercise metadata)
const { data: exercise } = useExercise(currentExerciseId);
```

**API Calls:**
```typescript
// Via workoutStore
POST /workouts/:id/exercises/:exerciseId/sets
Request: { weight, reps, rpe, rir, setType }
Response: { data: WorkoutSet }

DELETE /workouts/:id/sets/:setId
Response: { success: true }

POST /workouts/:id/complete
Request: { notes, energyLevel, sleepQuality }
Response: { data: Workout }
```

**UI Sections:**
1. **Header**
   - Workout name (editable)
   - Elapsed timer (MM:SS)
   - Menu (cancel workout)

2. **Exercise Tabs/Carousel**
   - Horizontal scroll of exercises
   - Active exercise highlighted
   - Swipe to change exercise

3. **Current Exercise View**
   - Exercise name, muscle group
   - Target: 3 sets × 8-12 reps @ RPE 7
   - Swap button → `ExerciseSwap`
   - Notes button

4. **Sets List**
   - Previous sets from past workouts (reference)
   - Current session sets (editable)
   - Log new set button

5. **Log Set Modal/Bottom Sheet**
   - Weight input (kg/lbs with unit toggle)
   - Reps input
   - RPE/RIR slider
   - Set type dropdown (warmup, working, drop, failure)
   - Submit button → optimistic update

6. **Rest Timer** (after logging set)
   - Countdown from `restSeconds` (e.g., 90s)
   - Adjustable (+/-15s buttons)
   - Skip button
   - Sound/haptic feedback on completion

7. **Bottom Actions**
   - "Previous Set" (copy last set)
   - "Swap Exercise" → `ExerciseSwap`
   - "Finish Workout" → Complete modal

**Navigation Targets:**
- `ExerciseSwap` (replace exercise)
- `ExerciseDetail` (view exercise info)
- `WorkoutSummary` (after completing)

**Key Interactions:**
- **Log Set**: Optimistic update → API call → reconcile/rollback
- **Delete Set**: Swipe to delete → optimistic removal → rollback on error
- **Rest Timer**: Auto-start after set, dismiss when done
- **Complete Workout**: Modal with notes/ratings → POST → navigate to summary

**Performance:**
- Sets list: FlatList with `React.memo`
- Exercise carousel: `react-native-pager-view` (native performance)
- Timer: `useEffect` with `setInterval`, cleanup on unmount

---

#### 📊 **WorkoutDetailScreen**

**File:** `src/screens/workout/WorkoutDetailScreen.tsx`  
**Navigator:** WorkoutNavigator  
**Route:** `WorkoutDetail`  
**Params:** `{ workoutId: number }`

**State Dependencies:**
```typescript
// React Query
const { data: workout, isLoading } = useWorkout(workoutId);
```

**API Calls:**
```typescript
GET /workouts/:id
Response: {
  data: {
    id, name, startTime, endTime, status,
    exercises: [{ exercise, sets: [...] }],
    totalVolume, totalSets, duration
  }
}
```

**UI Sections:**
1. **Header**
   - Workout name
   - Date + duration
   - Edit button (if status === 'completed')

2. **Summary Stats**
   - Total volume (kg lifted)
   - Total sets
   - Duration
   - Exercises count

3. **Exercises List**
   - For each exercise:
     - Exercise name + muscle group
     - Sets table (set #, weight, reps, RPE)
     - Total volume for this exercise

4. **Notes Section**
   - Workout notes (if any)
   - Energy/sleep/stress ratings (if logged)

5. **Actions**
   - "Share Workout" → `ShareWorkout`
   - "Repeat Workout" → Create new from this template
   - "Delete Workout" (destructive, confirmation)

**Navigation Targets:**
- `ExerciseDetail` (tap exercise name)
- `SessionInsights` (view analytics)
- `ShareWorkout` (social sharing)

---

#### 📜 **WorkoutHistoryScreen**

**File:** `src/screens/workout/WorkoutHistoryScreen.tsx`  
**Navigator:** WorkoutNavigator  
**Route:** `WorkoutHistory`  
**Params:** `undefined`

**State Dependencies:**
```typescript
const [filters, setFilters] = useState<{ status?: string; startDate?: string; endDate?: string }>({});
const { data, isLoading, fetchNextPage, hasNextPage } = useWorkouts({
  ...filters,
  limit: 20,
});
```

**API Calls:**
```typescript
GET /workouts?page=1&limit=20&status=completed
Response: {
  data: Workout[],
  pagination: { total, page, pages }
}
```

**UI Components:**
- **Filter Bar**
  - Status filter (All, Completed, Cancelled)
  - Date range picker
  - Clear filters button

- **Workout List** (Infinite scroll)
  - FlatList with pagination
  - `onEndReached` → `fetchNextPage()`
  - Each item: WorkoutCard component

- **Empty State**
  - "No workouts yet" message
  - "Start your first workout" button → `WorkoutHub`

**Performance:**
- FlatList optimizations (memoized renderItem, keyExtractor)
- React Query pagination with `useInfiniteQuery`

---

### 2.3 Profile Screens (6 screens)
 
 #### 👤 **ProfileHubScreen**
 
 **File:** `src/screens/profile/ProfileHubScreen.tsx`  
 **Navigator:** ProfileNavigator  
 **Route:** `ProfileHub`  
 **Params:** `undefined`
 
 **State Dependencies:**
 ```typescript
 const user = authStore((state) => state.user);
 const { data: stats } = useQuery({
   queryKey: ['stats', 'overview'],
   queryFn: () => statsApi.getOverview(),
 });
 ```
 
 **API Calls:**
 ```typescript
 GET /stats/overview
 Response: {
   data: {
     totalWorkouts, currentStreak, xp, level,
     weeklyVolume, prsThisMonth
   }
 }
 ```
 
 **UI Sections:**
 1. **Profile Header**
    - Avatar (tappable → `EditProfile`)
    - Name, bio
    - XP bar + level badge
    - Edit profile button
 
 2. **Stats Grid**
    - Total workouts
    - Current streak (🔥)
    - PRs this month
    - Each tappable → `MainDrawer.Analytics`
 
 3. **Navigation Cards**
    - **Stats & Analytics** → `MainDrawer.Analytics`
    - **AI Coach** → `MainDrawer.Coach`
    - **Body Tracking** → `MainDrawer.BodyTracking`
    - **Settings** → `MainDrawer.SettingsNavigator`
 
 4. **Achievements Carousel**
    - Recent badges earned
    - Progress to next achievement
    - "View All" → `Achievements`
 
 **Navigation Targets:**
 - `EditProfile`
 - `Achievements`
 - `MainDrawer` (Analytics, Coach, BodyTracking, Settings)
 
 ---
 
 ### 2.3a Analytics Screens (9 screens)
 
 #### 📈 **AnalyticsHubScreen**
 
 **File:** `src/screens/analytics/AnalyticsHubScreen.tsx`  
 **Navigator:** AnalyticsNavigator  
 **Route:** `AnalyticsHub`  
 **Params:** `undefined`
 
 **State Dependencies:**
 ```typescript
 const { data: prs } = usePersonalRecords();
 const { data: volumeData } = useVolumeAnalytics({ period: '30d' });
 const { data: strengthData } = useStrengthProgression({ exerciseId: mainLifts });
 ```
 
 **API Calls:**
 ```typescript
 GET /stats/personal-records
 Response: { data: { exercise: string, weight: number, date: string }[] }
 
 GET /stats/volume?period=30d
 Response: { data: { date: string, volume: number }[] }
 
 GET /stats/strength-progression?exerciseIds=1,2,3
 Response: { data: { exerciseId, dataPoints: [...] } }
 ```
 
 **UI Sections:**
 1. **Navigation Cards**
    - Personal Records → `PersonalRecordsScreen`
    - Strength Progression → `StrengthProgressionScreen`
    - Volume Analytics → `VolumeAnalyticsScreen`
    - Muscle Distribution → `MuscleDistributionScreen`
    - Muscle Heatmap → `MuscleHeatmapScreen`
 
 2. **Quick Stats**
    - Total PRs
    - Volume this month
    - Top muscle group trained
 
 3. **Recent PRs Preview** (Top 3)
    - Exercise name
    - Weight + date
    - Percentage increase
 
 **Navigation Targets:** 5 sub-screens (PRs, Strength, Volume, Distribution, Heatmap)
 
 ---
 
 ### 2.3b Coach Screens (4 screens)
 
 #### 🤖 **CoachHubScreen**
 
 **File:** `src/screens/coach/CoachHubScreen.tsx`
 **Navigator:** CoachNavigator
 **Route:** `CoachHub`
 
 **UI Sections:**
 1. **Start Chat** → `CoachChat`
 2. **Analyze Form** → `FormAnalysis`
 3. **Coach Tips** → `CoachPrompts`
 
 ---
 
 ### 2.3c Body Tracking Screens (5 screens)
 
 #### 📸 **BodyTrackingHubScreen**
 
 **File:** `src/screens/body/BodyTrackingHubScreen.tsx`
 **Navigator:** BodyTrackingNavigator
 **Route:** `BodyTrackingHub`
 
 **UI Sections:**
 1. **Log Weight** → `WeightLog`
 2. **Measurements** → `Measurements`
 3. **Progress Photos** → `ProgressPhotos`
 
 ---
 
 ### 2.3d Settings Screens (8 screens)
 
 #### ⚙️ **SettingsScreen**
 
 **File:** `src/screens/settings/SettingsScreen.tsx`
 **Navigator:** SettingsNavigator
 
 **Sections:**
 - Notification Preferences
 - Privacy Settings
 - Unit Preferences
 - Account Security
 - Help & Support
 - About


### 2.4 Social Screens (12 screens) - **Selected Examples**

#### 👥 **SocialHomeScreen**

**File:** `src/screens/social/SocialHomeScreen.tsx`  
**Navigator:** SocialNavigator  
**Route:** `SocialHome`  
**Params:** `undefined`

**State Dependencies:**
```typescript
const { data, fetchNextPage, hasNextPage } = useFeed({ page: 1, limit: 20 });
```

**API Calls:**
```typescript
GET /feed?page=1&limit=20
Response: {
  data: Post[] // { id, userId, user{...}, content, workoutId, likeCount, commentCount, createdAt }
}
```

**UI Sections:**
1. **Header**
   - App logo/title
   - Search button → `SearchUsers`
   - Notifications icon → `Activity`

2. **Create Post Button**
   - Floating action button
   - → `CreatePost`

3. **Feed List** (Infinite scroll)
   - FlatList with pagination
   - Each post:
     - User avatar + name (→ `UserProfile`)
     - Post content/workout share
     - Like/comment/share buttons
     - Tap → `PostDetail`

4. **Bottom Tabs** (Nested Tabs)
   - Feed (current)
   - Challenges → `ChallengesList`
   - Leaderboard → `Leaderboard`

**Navigation Targets:**
- `CreatePost`
- `PostDetail`
- `UserProfile`
- `SearchUsers`
- `Activity` (notifications)
- `ChallengesList`
- `Leaderboard`

---

### 2.5 Explore Screens (6 screens)

#### 🧭 **ExploreHubScreen**

**File:** `src/screens/explore/ExploreHubScreen.tsx`  
**Navigator:** ExploreNavigator  
**Route:** `ExploreHub`  
**Params:** `undefined`

**Content:**
- Search bar (→ `ExerciseLibrary` with query)
- **Exercise Library** card → `ExerciseLibrary`
- **Public Routines** card → `PublicRoutines`
- **Create Custom Exercise** card → `ExerciseCreator`
- **My Custom Exercises** card → `MyCustomExercises` (⚠️ NOT IMPLEMENTED)

---

### 2.6 Home Screens (4 screens)

#### 🏠 **HomeDashboardScreen**

**File:** `src/screens/home/HomeDashboardScreen.tsx`  
**Navigator:** HomeStack (via MainTabs → HomeTab)  
**Route:** `HomeDashboard`  
**Params:** `undefined`

**State Dependencies:**
```typescript
const user = authStore((state) => state.user);
const { data: stats } = useDashboardStats();
const { activeWorkoutId } = useWorkoutStore();
```

**API Calls:**
```typescript
GET /stats/dashboard
Response: {
  data: {
    todayWorkout: boolean,
    currentStreak, xp, level,
    weekProgress: { goal: 4, completed: 2 },
    recentWorkouts: Workout[]
  }
}
```

**UI Sections:**
1. **Header**
   - Greeting ("Good morning, {name}")
   - Notifications icon → `HomeNotifications`
   - Level badge → `XPLevelDetail`

2. **Active Workout Player** (if `activeWorkoutId`)
   - Floating bar at top
   - → `ActiveWorkout` on tap

3. **Today's Summary Card**
   - "✅ Workout completed" or "🎯 No workout yet"
   - Current streak: 🔥 5 days
   - XP progress bar

4. **Weekly Progress**
   - 4-day goal: 2/4 completed
   - Mini calendar dots
   - Full calendar → `FullStreakCalendar`

5. **Quick Actions**
   - "Start Workout" → `WorkoutHub`
   - "View Routines" → `RoutineList`
   - "AI Generate" → `AIGenerator`

6. **Recent Activity**
   - Last 2 workouts (preview)
   - "View All" → `WorkoutHistory`

**Navigation Targets:**
- `HomeNotifications`
- `XPLevelDetail`
- `FullStreakCalendar`
- `WorkoutHub`
- WorkoutNavigator screens

---

## 3. State Management Specifications

### 3.1 Zustand Stores

#### **authStore** (`src/store/authStore.ts`)

**State Shape:**
```typescript
interface AuthState {
  user: User | null; // { id, email, name, level, xp, onboardingCompleted, ...}
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  updatedUser: Partial<User> | null; // Staging updates during onboarding
}
```

**Actions:**
```typescript
login: (tokens: { accessToken, refreshToken }, user: User) => Promise<void>
  → Saves tokens to AsyncStorage (via storage util)
  → Sets user, isAuthenticated=true
  → Used by: LoginScreen, VerifyEmailScreen

logout: () => Promise<void>
  → Clears AsyncStorage
  → Resets state to null/false
  → Used by: Settings, Profile menu

updateUser: (userData: Partial<User>) => void
  → Merges userData with current user
  → Saves to AsyncStorage
  → Used by: EditProfileScreen, Onboarding screens

setOnboardingCompleted: (completed: boolean) => void
  → Merges staged updates from updatedUser
  → Sets onboardingCompleted
  → Used by: OnboardingCompleteScreen

hydrate: () => Promise<void>
  → Loads user/tokens from AsyncStorage on app start
  → Sets isLoading=false
  → Used by: App.tsx root component
```

**Usage Pattern:**
```typescript
// ✅ Selective subscription (efficient)
const user = authStore((state) => state.user);
const isAuthenticated = authStore((state) => state.isAuthenticated);

// ✅ Actions via getState() (in callbacks)
const handleLogout = () => authStore.getState().logout();

// ❌ DON'T: Subscribe to entire store
const { user, logout, login, updateUser } = authStore(); // Re-renders on ANY change!
```

---

#### **workoutStore** (`src/store/workoutStore.ts`)

**State Shape:**
```typescript
interface WorkoutState {
  // Session Metadata
  activeWorkoutId: number | null;
  workoutName: string | null;
  startTime: string | null; // ISO date
  status: 'idle' | 'in_progress' | 'paused';
  
  // Normalized Data (for performance)
  exercises: Record<number, WorkoutExercise>;
  sets: Record<string, WorkoutSet>; // Key: setId (string for temp IDs)
  
  // UI State
  isLoading: boolean;
  error: string | null;
  minimized: boolean;
  elapsedSeconds: number;
}
```

**Persistence:**
```typescript
// Zustand persist middleware
partialize: (state) => ({
  activeWorkoutId: state.activeWorkoutId,
  workoutName: state.workoutName,
  startTime: state.startTime,
  status: state.status,
  exercises: state.exercises,
  sets: state.sets,
  elapsedSeconds: state.elapsedSeconds,
  // Note: isLoading, error, minimized NOT persisted
}),
storage: AsyncStorage ('workout-storage' key)
```

**Actions:**
```typescript
startWorkout: async (input: StartWorkoutInput) => Promise<void>
  → POST /workouts
  → Normalizes exercises and sets into state
  → Sets status='in_progress', startTime=now
  → Used by: WorkoutHubScreen, RoutineDetailScreen

logSet: async (exerciseId, input: LogSetInput) => Promise<void>
  → Optimistic: Add temp set immediately
  → POST /workouts/:id/exercises/:exerciseId/sets
  → Reconcile: Replace temp ID with real ID
  → Rollback on error
  → Used by: ActiveWorkoutScreen

deleteSet: async (exerciseId, setId) => Promise<void>
  → Optimistic: Remove set immediately
  → DELETE /workouts/:id/sets/:setId
  → Rollback on error
  → Used by: ActiveWorkoutScreen (swipe to delete)

completeWorkout: async (input: CompleteWorkoutInput) => Promise<void>
  → POST /workouts/:id/complete
  → Resets state to initialState
  → Used by: ActiveWorkoutScreen

cancelWorkout: async () => Promise<void>
  → DELETE /workouts/:id (or mark cancelled)
  → Resets state
  → Used by: ActiveWorkoutScreen menu

tick: () => void
  → Increments elapsedSeconds by 1
  → Used by: useInterval hook in ActiveWorkoutScreen
```

**Optimistic Update Pattern:**
```typescript
// logSet implementation
logSet: async (exerciseId, input) => {
  const tempId = `temp_${Date.now()}`;
  
  // 1. Optimistic: Show immediately
  set((state) => {
    state.sets[tempId] = { id: tempId, ...input };
  });
  
  try {
    // 2. API Call
    const response = await workoutApi.logSet(activeWorkoutId, exerciseId, input);
    
    // 3. Reconcile: Swap temp → real
    set((state) => {
      delete state.sets[tempId];
      state.sets[response.data.id] = response.data;
    });
  } catch (error) {
    // 4. Rollback on failure
    set((state) => {
      delete state.sets[tempId];
      state.error = error.message;
    });
  }
}
```

---

### 3.2 React Query Hook Specifications

#### **useWorkoutQueries** (`src/hooks/queries/useWorkoutQueries.ts`)

**Hooks Exported:**
```typescript
// Query: Get workouts list
useWorkouts(params?: GetWorkoutsQuery)
  → GET /workouts
  → Query Key: ['workouts', params]
  → Used by: WorkoutHistoryScreen, WorkoutHubScreen

// Query: Get single workout
useWorkout(id: number)
  → GET /workouts/:id
  → Query Key: ['workout', id]
  → Enabled only if id exists
  → Used by: WorkoutDetailScreen, SessionInsightsScreen

// Mutation: Create workout (not used, prefer workoutStore.startWorkout)
use CreateWorkout()
  → POST /workouts
  → Invalidates: ['workouts'], ['stats']

// Mutation: Update workout metadata
useUpdateWorkout()
  → PATCH /workouts/:id
  → Invalidates: ['workouts'], ['workout', id], ['stats']
  → Used by: WorkoutDetailScreen (edit name/notes)

// Mutation: Delete workout
useDeleteWorkout()
  → DELETE /workouts/:id
  → Invalidates: ['workouts'], ['stats']
  → Used by: WorkoutDetailScreen (delete button)
```

**Query Key Strategy:**
```typescript
['workouts'] → All workouts (default params)
['workouts', { page: 1, limit: 20 }] → Paginated
['workouts', { status: 'completed' }] → Filtered
['workout', 123] → Single workout by ID
```

---

#### **useRoutineQueries** (`src/hooks/queries/useRoutineQueries.ts`)

**Hooks:**
```typescript
useRoutines()
  → GET /routines
  → Query Key: ['routines']

useRoutine(id: number)
  → GET /routines/:id
  → Query Key: ['routine', id]

useCreateRoutine()
  → POST /routines
  → Invalidates: ['routines']

useUpdateRoutine()
  → PATCH /routines/:id
  → Invalidates: ['routines'], ['routine', id]

useAddExerciseToRoutine()
  → POST /routines/:id/exercises
  → Invalidates: ['routine', id]

useRemoveExerciseFromRoutine()
  → DELETE /routines/:id/exercises/:exerciseId
  → Invalidates: ['routine', id]
```

---

#### **useExerciseQueries** (`src/hooks/queries/useExerciseQueries.ts`)

**Hooks:**
```typescript
useExercises(params?: ExerciseQueryParams)
  → GET /exercises?muscleGroup=chest&difficulty=intermediate
  → Query Key: ['exercises', params]
  → Used by: ExerciseLibraryScreen, ExercisePickerScreen

useExercise(id: number)
  → GET /exercises/:id
  → Query Key: ['exercise', id]
  → Used by: ExerciseDetailScreen, ActiveWorkoutScreen

useCreateCustomExercise()
  → POST /exercises/custom
  → Invalidates: ['exercises']
  → Used by: ExerciseCreatorScreen
```

---

## 4. API Client Specifications

### 4.1 Base Client (`src/api/client.ts`)

**Configuration:**
```typescript
const API_BASE_URL = __DEV__ 
  ? `http://192.168.1.6:3000/api/v1` 
  : 'https://production-api.com/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});
```

**Request Interceptor:**
```typescript
apiClient.interceptors.request.use(async (config) => {
  const token = authStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Response Interceptor:**
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 1. Handle 401 → Token Refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Attempt refresh...
    }
    
    // 2. Standardize Error
    return Promise.reject({
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      code: error.response?.data?.code,
    });
  }
);
```

---

### 4.2 API Client Files

#### **workout.api.ts** (`src/api/workout.api.ts`)

```typescript
export const workoutApi = {
  // Get list of workouts
  getWorkouts: (params?: GetWorkoutsQuery) => 
    apiClient.get<ApiResponse<Workout[]>>('/workouts', { params }),
  
  // Get single workout
  getWorkoutById: (id: number) => 
    apiClient.get<ApiResponse<Workout>>(`/workouts/${id}`),
  
  // Start workout
  startWorkout: (input: StartWorkoutInput) => 
    apiClient.post<ApiResponse<Workout>>('/workouts', input),
  
  // Log set
  logSet: (workoutId: number, exerciseId: number, input: LogSetInput) =>
    apiClient.post<ApiResponse<WorkoutSet>>(
      `/workouts/${workoutId}/exercises/${exerciseId}/sets`,
      input
    ),
  
  // Delete set
  deleteSet: (workoutId: number, setId: string) =>
    apiClient.delete<ApiResponse<void>>(`/workouts/${workoutId}/sets/${setId}`),
  
  // Complete workout
  completeWorkout: (id: number, input: CompleteWorkoutInput) =>
    apiClient.post<ApiResponse<Workout>>(`/workouts/${id}/complete`, input),
  
  // Cancel workout
  cancelWorkout: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/workouts/${id}`),
  
  // Update workout metadata
  updateWorkout: (id: number, input: UpdateWorkoutInput) =>
    apiClient.patch<ApiResponse<Workout>>(`/workouts/${id}`, input),
};

// Generic API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
}
```

---

#### **routine.api.ts** (`src/api/routine.api.ts`)

```typescript
export const routineApi = {
  getRoutines: () => apiClient.get<ApiResponse<Routine[]>>('/routines'),
  
  getRoutineById: (id: number) =>
    apiClient.get<ApiResponse<Routine>>(`/routines/${id}`),
  
  createRoutine: (input: CreateRoutineInput) =>
    apiClient.post<ApiResponse<Routine>>('/routines', input),
  
  updateRoutine: (id: number, input: UpdateRoutineInput) =>
    apiClient.patch<ApiResponse<Routine>>(`/routines/${id}`, input),
  
  deleteRoutine: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/routines/${id}`),
  
  addExercise: (routineId: number, input: AddExerciseToRoutineInput) =>
    apiClient.post<ApiResponse<RoutineExercise>>(
      `/routines/${routineId}/exercises`,
      input
    ),
  
  removeExercise: (routineId: number, exerciseId: number) =>
    apiClient.delete<ApiResponse<void>>(
      `/routines/${routineId}/exercises/${exerciseId}`
    ),
};
```

---

## 5. Type Definitions

### 5.1 Navigation Types (`src/navigation/types.ts`)

See HLD Section 5.4 for complete `ParamList` definitions.

Key types:
- `RootStackParamList` (Auth, Onboarding, Main)
- `AuthStackParamList` (8 screens)
- `WorkoutStackParamList` (18 screens)
- `ProfileStackParamList` (33 screens)

---

### 5.2 Backend Contract Types (`src/types/backend.types.ts`)

**Request Types:**
```typescript
// Workout
interface StartWorkoutInput { name?: string; routineId?: number; notes?: string; }
interface LogSetInput { weight?: number; reps?: number; rpe?: number; rir?: number; setType?: 'warmup' | 'working' | 'drop' | 'failure' | 'amrap'; }
interface CompleteWorkoutInput { notes?: string; energyLevel?: number; sleepQuality?: number; stressLevel?: number; }

// Routine
interface CreateRoutineInput { name: string; description?: string; goal?: 'muscle_gain' | 'strength' | 'fat_loss'; /* ... */ }
interface AddExerciseToRoutineInput { exerciseId: number; targetSets?: number; targetRepsMin?: number; /* ... */ }

// Exercise
interface ExerciseQueryParams { muscleGroup?: string; difficulty?: 'beginner' | 'intermediate' | 'advanced'; /* ... */ }
```

**Response Types (Domain Models):**
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

interface WorkoutExercise {
  id: number;
  workoutId: number;
  exerciseId: number;
  exercise: Exercise; // Nested
  sets: WorkoutSet[];
  targetSets?: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
}

interface WorkoutSet {
  id: string; // Supports temp IDs
  workoutExerciseId: number;
  weight?: number;
  reps?: number;
  rpe?: number;
  rir?: number;
  setType: 'warmup' | 'working' | 'drop' | 'failure' | 'amrap';
}

interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
  equipment?: string;
  difficulty: string;
  instructions?: string;
  primaryMuscles?: string[];
}

interface Routine {
  id: number;
  name: string;
  description?: string;
  exercises?: RoutineExercise[];
  goal?: string;
  difficulty?: string;
  isPublic?: boolean;
}
```

---

## 6. Custom Hooks

### 6.1 useTimer Hook

**File:** `src/hooks/useTimer.ts`

```typescript
function useTimer(initialSeconds: number = 0) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRunning]);
  
  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => { setSeconds(0); setIsRunning(false); };
  
  return { seconds, isRunning, start, pause, reset };
}

// Usage: ActiveWorkoutScreen
const { seconds, start } = useTimer(workoutStore((state) => state.elapsedSeconds));
```

---

### 6.2 useKeyboard Hook

**File:** `src/hooks/useKeyboard.ts`

```typescript
function useKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsVisible(true);
    });
    
    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      setIsVisible(false);
    });
    
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);
  
  return { keyboardHeight, isVisible };
}

// Usage: Adjust padding when keyboard appears
const { keyboardHeight } = useKeyboard();
<View style={{ paddingBottom: keyboardHeight }}>...</View>
```

---

## 7. Utility Functions

### 7.1 Storage Utility (`src/utils/storage.ts`)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  // Auth tokens
  saveAccessToken: (token: string) => 
    AsyncStorage.setItem('@fitness_access_token', token),
  
  getAccessToken: () => 
    AsyncStorage.getItem('@fitness_access_token'),
  
  saveRefreshToken: (token: string) => 
    AsyncStorage.setItem('@fitness_refresh_token', token),
  
  getRefreshToken: () => 
    AsyncStorage.getItem('@fitness_refresh_token'),
  
  // User data
  saveUser: (user: User) => 
    AsyncStorage.setItem('@fitness_user', JSON.stringify(user)),
  
  getUser: async (): Promise<User | null> => {
    const data = await AsyncStorage.getItem('@fitness_user');
    return data ? JSON.parse(data) : null;
  },
  
  // Clear all auth data
  clearAuth: async () => {
    await AsyncStorage.multiRemove([
      '@fitness_access_token',
      '@fitness_refresh_token',
      '@fitness_user',
    ]);
  },
};
```

---

### 7.2 Formatters (`src/utils/formatters.ts`)

```typescript
// Format seconds to MM:SS
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Format date to "Feb 6, 2026"
export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format weight with unit
export const formatWeight = (kg: number, unit: 'kg' | 'lbs' = 'kg'): string => {
  const value = unit === 'lbs' ? kg * 2.20462 : kg;
  return `${value.toFixed(1)} ${unit}`;
};

// Format large numbers (1000 → 1k)
export const formatNumber = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toString();
};
```

---

## 8. Screen-API Mapping Summary Table

| Screen | API Calls | Query Hooks | Stores Used |
|--------|-----------|-------------|-------------|
| **LoginScreen** | POST /auth/login | useAuthQueries | authStore (login) |
| **WorkoutHubScreen** | GET /workouts | useWorkouts | workoutStore (activeWorkoutId) |
| **ActiveWorkoutScreen** | POST /workouts/:id/exercises/:exerciseId/sets | - | workoutStore (full state) |
| **WorkoutDetailScreen** | GET /workouts/:id | useWorkout | - |
| ** WorkoutHistoryScreen** | GET /workouts (paginated) | useWorkouts | - |
| **RoutineListScreen** | GET /routines | useRoutines | - |
| **RoutineDetailScreen** | GET /routines/:id | useRoutine | - |
| **RoutineEditorScreen** | POST/PATCH /routines, POST /routines/:id/exercises | useCreateRoutine, useUpdateRoutine | - |
| **ExerciseLibraryScreen** | GET /exercises | useExercises | - |
| **ExerciseDetailScreen** | GET /exercises/:id | useExercise | - |
| **ProfileHubScreen** | GET /stats/overview | useStatsQueries | authStore (user) |
| **StatsHubScreen** | GET /stats/personal-records, /stats/volume | usePersonalRecords, useVolumeAnalytics | - |
| **SocialHomeScreen** | GET /feed | useFeed | - |
| **PostDetailScreen** | GET /feed/posts/:id | usePost | - |
| **LeaderboardScreen** | GET /leaderboard | useLeaderboard | - |

**Complete table available in:** [API_CONTRACTS.md](./API_CONTRACTS.md) (see Phase 4)

---

## Appendix: Missing Screens API Requirements

| Missing Screen | Required APIs | Notes |
|----------------|---------------|-------|
| **EditProfileScreen** | GET /user/profile, PATCH /user/profile | ✅ Endpoints exist |
| **AchievementsScreen** | GET /gamification/achievements | ✅ Endpoint exists |
| **XPHistoryScreen** | GET /gamification/xp-history | ⚠️ **MISSING** - needs implementation |
| **ShareWorkoutScreen** | POST /social/share-workout | ⚠️ **MISSING** - needs implementation |
| **MyCustomExercisesScreen** | GET /exercises?custom=true | ✅ Endpoint exists (filtered) |
| **WorkoutFrequencyScreen** | GET /stats/workout-frequency | ⚠️ **MISSING** - needs implementation |
| **RecoveryStatusScreen** | GET /stats/recovery | ⚠️ **MISSING** - needs implementation |
| **TakeProgressPhotoScreen** | POST /body/photos | ✅ Endpoint exists |
| **CoachPromptsScreen** | GET /ai/coach/prompts | ✅ Endpoint exists |

---

**Document End** | **See also:** [FRONTEND_HLD.md](./FRONTEND_HLD.md), [API_CONTRACTS.md](./API_CONTRACTS.md)
