# 📱 **FitAI - Screens & Navigation Documentation**

**Last Updated:** February 6, 2026  
**Total Screens Planned:** 92  
**Currently Implemented:** 83 screens (77 registered in navigators + 6 unregistered files)  
**Missing/To Create:** 9 screens  
**Navigation Structure:** React Navigation with Stack & Tab Navigators

## 📊 **Implementation Status**
- ✅ **Implemented & Registered:** 77 screens
- 📁 **Implemented but Unregistered:** 6 screens (Auth stack)
- ❌ **Planned but Not Created:** 9 screens

*Note: See `MISSING_SCREENS_ANALYSIS.md` for detailed breakdown of missing screens*

---

## 📋 **Table of Contents**

1. [Overview](#overview)
2. [Navigation Architecture](#navigation-architecture)
3. [Screen Groups](#screen-groups)
   - [Authentication (8 screens)](#1-authentication-8-screens)
   - [Onboarding (11 screens)](#2-onboarding-11-screens)
   - [Home (4 screens)](#3-home-4-screens)
   - [Workout (18 screens)](#4-workout-18-screens)
   - [Explore (5 screens)](#5-explore-5-screens)
   - [Social (11 screens)](#6-social-11-screens)
   - [Profile (26 screens)](#7-profile-26-screens)
4. [Navigation Flows](#navigation-flows)
5. [Screen Inventory](#screen-inventory)

---

## 🏗️ **Overview**

The FitAI application is structured with a hierarchical navigation system using React Navigation. The app consists of 83 screens organized into 7 major navigation groups.

### **Navigation Hierarchy:**
```
RootNavigator
├── AuthStack (Unauthenticated)
├── OnboardingStack (First-time users)
└── MainTabs (Authenticated)
    ├── HomeTab
    ├── WorkoutTab
    ├── ExploreTab
    ├── SocialTab
    └── ProfileTab
```

---

## 🔀 **Navigation Architecture**

### **Root Level Navigation**

**File:** `src/navigation/RootNavigator.tsx`

The root navigator manages authentication state and conditionally renders:
- **AuthStack** - When user is not authenticated
- **MainTabs** - When user is authenticated
- **OnboardingStack** - When user needs onboarding (handled separately)

```typescript
RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
}
```

### **Main Application Structure**

**File:** `src/navigation/MainTabs.tsx`

The main tabs use a Bottom Tab Navigator with 5 primary sections:

| Tab | Icon | Navigator | Purpose |
|-----|------|-----------|---------|
| **HomeTab** | `home` | HomeStackNavigator | Dashboard, notifications, streaks |
| **WorkoutTab** | `barbell` | WorkoutNavigator | Workouts, routines, AI generation |
| **ExploreTab** | `compass` | ExploreNavigator | Exercise library, public routines |
| **SocialTab** | `people` | SocialNavigator | Social feed, challenges, leaderboards |
| **ProfileTab** | `person` | ProfileNavigator | Profile, stats, settings |

---

## 📱 **Screen Groups**

---

## **1. Authentication (8 screens)**

**Navigator:** `AuthStack.tsx`  
**Currently Registered:** 2/8 screens ⚠️  
**Screen Files Exist:** 8/8 screens ✅  
**Directory:** `src/screens/auth/`

### **Purpose:**
Handles user authentication, registration, and account recovery flows.

### **Implemented & Registered (2 screens):**

| # | Screen Name | File | Route | Status |
|---|------------|------|-------|--------|
| 1 | Welcome | `WelcomeScreen.tsx` | `Welcome` | ✅ **IN NAVIGATOR** |
| 2 | Login | `LoginScreen.tsx` | `Login` | ✅ **IN NAVIGATOR** |

### **Implemented but NOT Registered (6 screens):**
*These files exist but are not registered in `AuthStack.tsx`*

| # | Screen Name | File | Route | Status |
|---|------------|------|-------|--------|
| 3 | Register | `RegisterScreen.tsx` | `Register` | 📁 **File exists - needs registration** |
| 4 | Email Verification | `VerifyEmailScreen.tsx` | `EmailVerification` | 📁 **File exists - needs registration** |
| 5 | Forgot Password | `ForgotPasswordScreen.tsx` | `ForgotPassword` | 📁 **File exists - needs registration** |
| 6 | Reset Password | `ResetPasswordScreen.tsx` | `ResetPassword` | 📁 **File exists - needs registration** |
| 7 | Reset Verify | `ResetVerifyScreen.tsx` | `GoogleOAuth` (?) | 📁 **File exists - needs registration** |
| 8 | Account Locked | `AccountLockedScreen.tsx` | `AccountLocked` | 📁 **File exists - needs registration** |

**⚡ Quick Fix:** Add these 6 existing screens to `AuthStack.tsx` to make them functional.

### **Navigation Flow:**
```
Welcome
├─→ Login ──→ EmailVerification (when implemented)
└─→ Register (when implemented) ──→ EmailVerification ──→ [Onboarding or Main]

ForgotPassword ──→ ResetPassword ──→ Login
```

---

## **2. Onboarding (11 screens)**

**Navigator:** `OnboardingStack`  
**Directory:** `src/screens/onboarding/`

### **Purpose:**
First-time user experience to gather user preferences and goals.

### **Screens:**

| # | Screen Name | File | Route | Description |
|---|------------|------|-------|-------------|
| 9 | Goal Selection | `GoalSelectionScreen.tsx` | `OnboardingGoals` | Primary fitness goal selection |
| 10 | Secondary Goals | `SecondaryGoalsScreen.tsx` | - | Additional fitness objectives |
| 11 | Experience Level | `ExperienceLevelScreen.tsx` | `OnboardingExperience` | Fitness experience assessment |
| 12 | Physical Profile | `PhysicalProfileScreen.tsx` | `OnboardingBodyInfo` | Height, weight, age input |
| 13 | Equipment | `EquipmentScreen.tsx` | `OnboardingEquipment` | Available equipment selection |
| 14 | Workout Frequency | `WorkoutFrequencyScreen.tsx` | `OnboardingSchedule` | Weekly workout frequency |
| 15 | Workout Duration | `WorkoutDurationScreen.tsx` | `OnboardingDuration` | Preferred workout length |
| 16 | Workout Interests | `WorkoutInterestsScreen.tsx` | - | Exercise type preferences |
| 17 | Units | `UnitsScreen.tsx` | `OnboardingUnits` | Metric vs Imperial units |
| 18 | Notifications | `NotificationScreen.tsx` | `OnboardingNotifications` | Notification permissions |
| 19 | App Tour | `AppTourScreen.tsx` | `OnboardingTour` | Feature walkthrough |
| 20 | Final Success | `FinalSuccessScreen.tsx` | `OnboardingComplete` | Completion celebration |

### **Navigation Flow:**
```
Linear Flow (Sequential):
GoalSelection → Experience → BodyInfo → Equipment → Schedule → Duration 
→ Units → Notifications → Tour → Complete → [Main App]
```

---

## **3. Home (4 screens)**

**Navigator:** `HomeStackNavigator`  
**File:** `src/navigation/MainTabs.tsx` (HomeStack)  
**Directory:** `src/screens/home/`  
**Tab Icon:** `home` / `home-outline`

### **Purpose:**
Main dashboard, gamification features, and notifications.

### **Screens:**

| # | Screen Name | File | Route | Params | Description |
|---|------------|------|-------|--------|-------------|
| 21 | Home Dashboard | `HomeScreen.tsx` | `HomeDashboard` | `undefined` | Main dashboard with stats, streaks, XP |
| 22 | Notifications | `NotificationsScreen.tsx` | `HomeNotifications` | `undefined` | User notifications center |
| 23 | Streak Calendar | `StreakCalendarScreen.tsx` | `FullStreakCalendar` | `undefined` | Full calendar view of workout streaks |
| 24 | Level & XP Detail | `LevelXpModalScreen.tsx` | `XPLevelDetail` | `undefined` | Detailed XP progression (modal) |

**Note:** `HomeDashboardScreen.tsx` appears to be a duplicate/alternate file.

### **Navigation Flow:**
```
HomeDashboard (Tab Root)
├─→ HomeNotifications
├─→ FullStreakCalendar
└─→ XPLevelDetail (Modal)
```

---

## **4. Workout (18 screens)**

**Navigator:** `WorkoutNavigator`  
**File:** `src/navigation/WorkoutNavigator.tsx`  
**Directory:** `src/screens/workout/`  
**Tab Icon:** `barbell` / `barbell-outline`

### **Purpose:**
Complete workout management system including routines, active workouts, history, and AI generation.

### **Screens:**

#### **Phase 2A: Workout Hub (8 screens)**

| # | Screen Name | File | Route | Params | Description |
|---|------------|------|-------|--------|-------------|
| 25 | Workout Hub | `WorkoutHubScreen.tsx` | `WorkoutHub` | `undefined` | Main workout landing (Tab Root) |
| 26 | Routine List | `RoutineListScreen.tsx` | `RoutineList` | `undefined` | All user routines |
| 27 | Routine Detail | `RoutineDetailScreen.tsx` | `RoutineDetail` | `{ routineId: number }` | View routine details |
| 28 | Routine Editor | `RoutineEditorScreen.tsx` | `RoutineEditor` | `{ routineId?: number }` | Create/edit routines |
| 29 | Exercise Picker | `ExercisePickerScreen.tsx` | `ExercisePicker` | `{ onSelect?: (ids: number[]) => void }` | Select exercises for routine |
| 30 | Exercise Detail | `ExerciseDetailScreen.tsx` | `ExerciseDetail` | `{ exerciseId: number }` | Exercise information |
| 31 | Exercise Filter | `ExerciseFilterScreen.tsx` | `ExerciseFilter` | `undefined` | Filter exercises by criteria |
| 32 | Custom Exercise | `CustomExerciseScreen.tsx` | `CustomExercise` | `undefined` | Create custom exercise |

#### **Phase 2B: Active Workout (4 screens)**

| # | Screen Name | File | Route | Params | Description |
|---|------------|------|-------|--------|-------------|
| 33 | Active Workout | `ActiveWorkoutScreen.tsx` | `ActiveWorkout` | `{ routineId?: number; workoutId?: number }` | Live workout tracking |
| 34 | Exercise Swap | `ExerciseSwapScreen.tsx` | `ExerciseSwap` | `{ exerciseId: number; currentExerciseName: string }` | Replace exercise (modal) |
| 35 | Set Config | `SetConfigScreen.tsx` | `SetConfig` | `{ setId: number; exerciseId: number }` | Configure set parameters (modal) |
| 36 | Workout Summary | `WorkoutSummaryScreen.tsx` | `WorkoutSummary` | `{ workoutId: number }` | Post-workout summary |

#### **Phase 2C: History & AI (6 screens)**

| # | Screen Name | File | Route | Params | Description |
|---|------------|------|-------|--------|-------------|
| 37 | Workout History | `WorkoutHistoryScreen.tsx` | `WorkoutHistory` | `undefined` | Past workout log |
| 38 | Workout Detail | `WorkoutDetailScreen.tsx` | `WorkoutDetail` | `{ workoutId: number }` | Historical workout details |
| 39 | Session Insights | `SessionInsightsScreen.tsx` | `SessionInsights` | `{ workoutId: number }` | Analytics for session |
| 40 | AI Generator | `AIGeneratorScreen.tsx` | `AIGenerator` | `{ presetGoal?: string; presetDuration?: number; customPrompt?: string }` | AI workout generation |
| 41 | AI Preview | `AIPreviewScreen.tsx` | `AIPreview` | `{ workoutData: any }` | Preview AI-generated workout |
| 42 | AI Prompts | `AIPromptsScreen.tsx` | `AIPrompts` | `undefined` | AI prompt templates (modal) |

**Note:** `WorkoutScreen.tsx` appears to be an alternate/deprecated file.

### **Navigation Flow:**
```
WorkoutHub (Tab Root)
├─→ RoutineList
│   └─→ RoutineDetail ──→ ActiveWorkout
│       └─→ RoutineEditor
│           └─→ ExercisePicker
│               ├─→ ExerciseFilter
│               └─→ ExerciseDetail
├─→ ActiveWorkout
│   ├─→ ExerciseSwap (Modal)
│   ├─→ SetConfig (Modal)
│   └─→ WorkoutSummary
├─→ WorkoutHistory
│   └─→ WorkoutDetail
│       └─→ SessionInsights
└─→ AIGenerator
    ├─→ AIPrompts (Modal)
    └─→ AIPreview ──→ ActiveWorkout
```

---

## **5. Explore (6 screens)**

**Navigator:** `ExploreNavigator.tsx`  
**Currently Implemented:** 5/6 screens  
**Directory:** `src/screens/explore/`  
**Tab Icon:** `compass` / `compass-outline`

### **Purpose:**
Discover exercises, browse public routines, and create custom content.

### **Implemented Screens (5):**

| # | Screen Name | File | Route | Params | Status |
|---|------------|------|-------|--------|--------|
| 43 | Explore Hub | `ExploreHubScreen.tsx` | `ExploreHub` | `undefined` | ✅ **Implemented** |
| 44 | Exercise Library | `ExerciseLibraryScreen.tsx` | `ExerciseLibrary` | `undefined` | ✅ **Implemented** |
| 45 | Public Routines | `PublicRoutinesScreen.tsx` | `PublicRoutines` | `undefined` | ✅ **Implemented** |
| 46 | Routine Template | `RoutineTemplateScreen.tsx` | `RoutineTemplate` | `{ routineId: number }` | ✅ **Implemented** |
| 47 | Exercise Creator | `ExerciseCreatorScreen.tsx` | `ExerciseCreator` | `undefined` | ✅ **Implemented** |

### **Missing Screens (1):**

| # | Screen Name | File Expected | Route | Status |
|---|------------|--------------|-------|--------|
| 48 | My Custom Exercises | `MyCustomExercisesScreen.tsx` | `MyCustomExercises` | ❌ **NOT CREATED** |

**Note:** `ExploreScreen.tsx` appears to be an alternate/deprecated file.

### **Navigation Flow:**
```
ExploreHub (Tab Root)
├─→ ExerciseLibrary
│   └─→ [ExerciseDetail - from Workout Navigator]
├─→ PublicRoutines
│   └─→ RoutineTemplate
├─→ ExerciseCreator
└─→ MyCustomExercises (planned)
```

---

## **6. Social (12 screens)**

**Navigator:** `SocialNavigator.tsx`  
**Currently Implemented:** 11/12 screens  
**Directory:** `src/screens/social/`  
**Tab Icon:** `people` / `people-outline`

### **Purpose:**
Social features including feed, challenges, leaderboards, and user interactions.

### **Implemented Screens (11):**

| # | Screen Name | File | Route | Params | Status |
|---|------------|------|-------|--------|--------|
| 49 | Social Home | `SocialHomeScreen.tsx` | `SocialHome` | `undefined` | ✅ **Implemented** |
| 50 | Create Post | `CreatePostScreen.tsx` | `CreatePost` | `undefined` | ✅ **Implemented** |
| 51 | Post Detail | `PostDetailScreen.tsx` | `PostDetail` | `{ postId: number }` | ✅ **Implemented** |
| 52 | User Profile | `UserProfileScreen.tsx` | `UserProfile` | `{ userId: number }` | ✅ **Implemented** |
| 53 | Followers List | `FollowListScreens.tsx` | `Followers` | `{ userId: number }` | ✅ **Implemented** |
| 54 | Following List | `FollowListScreens.tsx` | `Following` | `{ userId: number }` | ✅ **Implemented** |
| 55 | Leaderboard | `LeaderboardScreen.tsx` | `Leaderboard` | `undefined` | ✅ **Implemented** |
| 56 | Challenges List | `ChallengesListScreen.tsx` | `ChallengesList` | `undefined` | ✅ **Implemented** |
| 57 | Challenge Detail | `ChallengeDetailScreen.tsx` | `ChallengeDetail` | `{ challengeId: number }` | ✅ **Implemented** |
| 58 | Search Users | `SearchUsersScreen.tsx` | `SearchUsers` | `undefined` | ✅ **Implemented** |
| 59 | Activity | `ActivityScreen.tsx` | `Activity` | `undefined` | ✅ **Implemented** |

### **Missing Screens (1):**

| # | Screen Name | File Expected | Route | Status |
|---|------------|--------------|-------|--------|
| 60 | Share Workout | `ShareWorkoutScreen.tsx` | `ShareWorkout` | ❌ **NOT CREATED** |

**Note:** `SocialScreen.tsx` appears to be an alternate/deprecated file.  
**Note:** `FollowListScreens.tsx` exports both `FollowersListScreen` and `FollowingListScreen`.

### **Navigation Flow:**
```
SocialHome (Tab Root)
├─→ CreatePost (Modal)
├─→ PostDetail
│   └─→ UserProfile
│       ├─→ Followers
│       └─→ Following
├─→ Leaderboard
├─→ ChallengesList
│   └─→ ChallengeDetail
├─→ SearchUsers
│   └─→ UserProfile
├─→ Activity
└─→ ShareWorkout (planned)
```

---

## **7. Profile (33 screens)**

**Navigator:** `ProfileNavigator.tsx`  
**Currently Implemented:** 26/33 screens  
**Directory:** `src/screens/profile/`  
**Tab Icon:** `person` / `person-outline`

### **Purpose:**
User profile, statistics, AI coach, body tracking, and settings.

### **Screens:**

#### **Main Profile (3 screens + 2 missing)**

| # | Screen Name | File | Route | Status |
|---|------------|------|-------|--------|
| 61 | Profile Hub | `ProfileHubScreen.tsx` | `ProfileHub` | ✅ **Implemented** |
| 62 | Edit Profile | `EditProfileScreen.tsx` | `EditProfile` | ❌ **NOT CREATED** |
| 63 | Achievements | `AchievementsScreen.tsx` | `Achievements` | ❌ **NOT CREATED** |
| 64 | My Followers | `MyFollowersScreen.tsx` | `MyFollowers` | ❌ **NOT CREATED** |
| 65 | My Following | `MyFollowingScreen.tsx` | `MyFollowing` | ❌ **NOT CREATED** |

#### **Stats & Analytics (9 screens: 6 implemented + 3 missing)**

**Implemented:**

| # | Screen Name | File | Route | Status |
|---|------------|------|-------|--------|
| 66 | Stats Hub | `StatsHubScreen.tsx` | `StatsHub` | ✅ **Implemented** |
| 67 | Personal Records | `PersonalRecordsScreen.tsx` | `PersonalRecords` | ✅ **Implemented** |
| 68 | Strength Progression | `StrengthProgressionScreen.tsx` | `StrengthProgression` | ✅ **Implemented** |
| 69 | Volume Analytics | `VolumeAnalyticsScreen.tsx` | `VolumeAnalytics` | ✅ **Implemented** |
| 70 | Muscle Distribution | `MuscleDistributionScreen.tsx` | `MuscleDistribution` | ✅ **Implemented** |
| 71 | Muscle Heatmap | `MuscleHeatmapScreen.tsx` | `MuscleHeatmap` | ✅ **Implemented** |

**Missing:**

| # | Screen Name | File Expected | Route | Status |
|---|------------|--------------|-------|--------|
| 72 | XP History | `XPHistoryScreen.tsx` | `XPHistory` | ❌ **NOT CREATED** |
| 73 | Workout Frequency | `WorkoutFrequencyScreen.tsx` | `WorkoutFrequency` | ❌ **NOT CREATED** |
| 74 | Recovery Status | `RecoveryStatusScreen.tsx` | `RecoveryStatus` | ❌ **NOT CREATED** |

#### **AI Coach (4 screens: 3 implemented + 1 missing)**

**Implemented:**

| # | Screen Name | File | Route | Status |
|---|------------|------|-------|--------|
| 75 | Coach Hub | `CoachHubScreen.tsx` | `CoachConversations` | ✅ **Implemented** |
| 76 | Coach Chat | `CoachChatScreen.tsx` | `CoachChat` | ✅ **Implemented** |
| 77 | Form Analysis | `FormAnalysisScreen.tsx` | `FormAnalysis` | ✅ **Implemented** |

**Missing:**

| # | Screen Name | File Expected | Route | Status |
|---|------------|--------------|-------|--------|
| 78 | Coach Prompts | `CoachPromptsScreen.tsx` | `CoachPrompts` | ❌ **NOT CREATED** |

#### **Body Tracking (5 screens: 4 implemented + 1 missing)**

**Implemented:**

| # | Screen Name | File | Route | Status |
|---|------------|------|-------|--------|
| 79 | Body Tracking Hub | `BodyTrackingHubScreen.tsx` | `BodyTrackingHub` | ✅ **Implemented** |
| 80 | Weight Log | `WeightLogScreen.tsx` | `LogWeight` | ✅ **Implemented** |
| 81 | Measurements | `MeasurementsScreen.tsx` | `LogMeasurements` | ✅ **Implemented** |
| 82 | Progress Photos | `ProgressPhotosScreen.tsx` | `ProgressPhotos` | ✅ **Implemented** |

**Missing:**

| # | Screen Name | File Expected | Route | Status |
|---|------------|--------------|-------|--------|
| 83 | Take Progress Photo | `TakeProgressPhotoScreen.tsx` | `TakeProgressPhoto` | ❌ **NOT CREATED** |

**Note:** `ProgressCameraScreen.tsx` exists but isn't registered - may be intended for `TakeProgressPhoto`.

#### **Settings (12 screens - all implemented)**

| # | Screen Name | File | Route | Status |
|---|------------|------|-------|--------|
| 84 | Settings | `SettingsScreen.tsx` | `Settings` | ✅ **Implemented** |
| 85 | Account Security | `AccountSecurityScreen.tsx` | `AccountSettings` | ✅ **Implemented** |
| 86 | Change Password | `ChangePasswordScreen.tsx` | `ChangePassword` | ✅ **Implemented** |
| 87 | Privacy Settings | `PrivacySettingsScreen.tsx` | `PrivacySettings` | ✅ **Implemented** |
| 88 | Notification Settings | `NotificationSettingsScreen.tsx` | `NotificationSettings` | ✅ **Implemented** |
| 89 | Units Preferences | `UnitsPreferencesScreen.tsx` | `UnitsPreferences` | ✅ **Implemented** |
| 90 | Help & Support | `HelpSupportScreen.tsx` | `HelpSupport` | ✅ **Implemented** |
| 91 | About | `AboutScreen.tsx` | `About` | ✅ **Implemented** |
| 92 | Theme Preferences | `ThemePreferencesScreen.tsx` | `ThemePreferences` | ✅ **Implemented** |

### **Profile Summary:**
- **Implemented:** 26/33 screens ✅
- **Missing:** 7 screens ❌

### **Navigation Flow:**
```
ProfileHub (Tab Root)
├─→ EditProfile (planned)
├─→ Achievements (planned)
├─→ MyFollowers (planned)
├─→ MyFollowing (planned)
├─→ StatsHub
│   ├─→ PersonalRecords
│   ├─→ StrengthProgression
│   ├─→ VolumeAnalytics
│   ├─→ MuscleDistribution
│   ├─→ MuscleHeatmap
│   ├─→ XPHistory (planned)
│   ├─→ WorkoutFrequency (planned)
│   └─→ RecoveryStatus (planned)
├─→ CoachHub
│   ├─→ CoachChat
│   ├─→ FormAnalysis
│   └─→ CoachPrompts (planned)
├─→ BodyTrackingHub
│   ├─→ WeightLog
│   ├─→ Measurements
│   ├─→ ProgressPhotos
│   └─→ TakeProgressPhoto (planned)
└─→ Settings
    ├─→ AccountSecurity
    │   └─→ ChangePassword
    ├─→ PrivacySettings
    ├─→ NotificationSettings
    ├─→ UnitsPreferences
    ├─→ ThemePreferences
    ├─→ HelpSupport
    └─→ About
```

---

## 🔄 **Navigation Flows**

### **Complete User Journey**

```
┌─────────────────────────────────────────────────────────────┐
│                      APP LAUNCH                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
              ┌─────────────┴─────────────┐
              │                           │
         Authenticated              Unauthenticated
              │                           │
              ↓                           ↓
      ┌──────────────┐            ┌──────────────┐
      │  Main Tabs   │            │  Auth Stack  │
      └──────────────┘            └──────────────┘
              │                           │
              │                           ↓
              │                   Login / Register
              │                           │
              │                           ↓
              │                   ┌──────────────┐
              │                   │  Onboarding  │
              │                   └──────────────┘
              │                           │
              └───────────────────────────┘
                            ↓
              ┌─────────────────────────┐
              │      Main Tabs (5)      │
              ├─────────────────────────┤
              │  Home   │  Workout      │
              │  Explore│  Social       │
              │  Profile                │
              └─────────────────────────┘
```

### **Cross-Navigator Navigation**

Some screens are shared or referenced across navigators:

| From Navigator | To Navigator | Screen | Use Case |
|---------------|--------------|--------|----------|
| Explore | Workout | ExerciseDetail | View exercise from library |
| Social | Profile | UserProfile | View other user's profile |
| Workout | Social | ShareWorkout | Share completed workout |
| Home | Workout | ActiveWorkout | Quick start workout |

---

## 📊 **Screen Inventory**

### **Summary by Navigation Group**

| Group | Planned | Implemented | Missing | Navigator File | Status |
|-------|---------|-------------|---------|---------------|--------|
| **Authentication** | 8 | 8 files ✅ | 6 not in navigator | `AuthStack.tsx` | ⚠️ **2/8 registered** |
| **Onboarding** | 11 | 11 ✅ | 0 | Not created yet | ⚠️ **Navigator missing** |
| **Home** | 4 | 4 ✅ | 0 | `MainTabs.tsx` | ✅ **Complete** |
| **Workout** | 18 | 18 ✅ | 0 | `WorkoutNavigator.tsx` | ✅ **Complete** |
| **Explore** | 6 | 5 ✅ | 1 | `ExploreNavigator.tsx` | ⚠️ **5/6 (83%)** |
| **Social** | 12 | 11 ✅ | 1 | `SocialNavigator.tsx` | ⚠️ **11/12 (92%)** |
| **Profile** | 33 | 26 ✅ | 7 | `ProfileNavigator.tsx` | ⚠️ **26/33 (79%)** |
| **TOTAL** | **92** | **83** | **9** | - | **90% Complete** |

### **Implementation Status Details**

**✅ Fully Implemented Navigators:**
- Home Stack: 4/4 screens (100%)
- Workout Navigator: 18/18 screens (100%)

**⚠️ Nearly Complete (90%+):**
- Social Navigator: 11/12 screens (92%) - Missing `ShareWorkout`

**⚠️ Partially Implemented (80-89%):**
- Explore Navigator: 5/6 screens (83%) - Missing `MyCustomExercises`

**⚠️ Significantly Incomplete (<80%):**
- Profile Navigator: 26/33 screens (79%) - Missing 7 screens
- Auth Stack: 8/8 files exist but only 2/8 registered (25% in navigator)
- Onboarding: 11/11 files exist but no navigator (0% registered)

### **Missing Screens Breakdown (9 total):**

**High Priority (Essential Features):**
1. ✅ `EditProfileScreen.tsx` - Profile editing
2. ✅ `AchievementsScreen.tsx` - Gamification
3. ✅ `XPHistoryScreen.tsx` - XP progression

**Medium Priority (Enhanced Analytics):**
4. `WorkoutFrequencyScreen.tsx` - Frequency analytics
5. `RecoveryStatusScreen.tsx` - Recovery tracking
6. `ShareWorkoutScreen.tsx` - Social sharing

**Lower Priority (Nice to Have):**
7. `MyCustomExercisesScreen.tsx` - Custom exercise management
8. `TakeProgressPhotoScreen.tsx` - Camera integration
9. `CoachPromptsScreen.tsx` - AI coach templates

### **File Discrepancies**

The following screen files exist but are not registered in navigators:

**Auth Stack:**
- `RegisterScreen.tsx`
- `VerifyEmailScreen.tsx`
- `ForgotPasswordScreen.tsx`
- `ResetPasswordScreen.tsx`
- `ResetVerifyScreen.tsx`
- `AccountLockedScreen.tsx`

**Profile Stack:**
- `ProfileScreen.tsx` (duplicate of ProfileHub?)
- `EditProfile` (not found)
- `Achievements` (not found)
- `MyFollowers` (not found)
- `MyFollowing` (not found)
- `XPHistory` (not found)
- `WorkoutFrequency` (not found)
- `RecoveryStatus` (not found)
- `StrengthMetrics` (not found)
- `TakeProgressPhoto` (not found)
- `CoachPrompts` (not found)

**Alternate/Deprecated Files:**
- `WorkoutScreen.tsx` (use `WorkoutHubScreen.tsx`)
- `SocialScreen.tsx` (use `SocialHomeScreen.tsx`)
- `ExploreScreen.tsx` (use `ExploreHubScreen.tsx`)
- `HomeDashboardScreen.tsx` (duplicate of `HomeScreen.tsx`?)

---

## 🎯 **Recommendations**

### **✅ Quick Win: Register Auth Screens (30 minutes)**
**Impact:** 83 → 89 screens (+6)

Add remaining auth screens to `AuthStack.tsx`:
```typescript
<Stack.Screen name="Register" component={RegisterScreen} />
<Stack.Screen name="EmailVerification" component={VerifyEmailScreen} />
<Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
<Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
<Stack.Screen name="AccountLocked" component={AccountLockedScreen} />
<Stack.Screen name="GoogleOAuth" component={ResetVerifyScreen} /> // Or create GoogleOAuthScreen
```

**Current Status:** 2/8 registered → **Target:** 8/8 registered ✅

---

### **🏗️ Short Term: Create Essential Screens (6-8 hours)**
**Impact:** 89 → 92 screens (+3)

Create these high-value profile screens:

1. **`EditProfileScreen.tsx`** (2-3 hours)
   - Edit name, bio, profile picture
   - Update fitness goals and preferences
   - Essential for user profile management

2. **`AchievementsScreen.tsx`** (2-3 hours)
   - Display earned badges and milestones
   - Show achievement progress
   - Gamification feature

3. **`XPHistoryScreen.tsx`** (2 hours)
   - XP progression graph over time
   - Daily/weekly/monthly views
   - Breakdown by activity type

**Target:** **92 screens** ✅ (100% of plan)

---

### **🚀 Medium Term: Complete All Missing Screens (2-3 weeks)**
**Impact:** 92 → 92 screens (100% complete)

Implement remaining 6 screens:

**Analytics Screens (6-8 hours each):**
4. `WorkoutFrequencyScreen.tsx` - Weekly workout patterns
5. `RecoveryStatusScreen.tsx` - Muscle group recovery tracking

**Feature Screens (3-4 hours each):**
6. `ShareWorkoutScreen.tsx` - Social media sharing
7. `MyCustomExercisesScreen.tsx` - Custom exercise library
8. `TakeProgressPhotoScreen.tsx` - Camera + photo capture
9. `CoachPromptsScreen.tsx` - AI prompt templates

---

### **📋 Additional Tasks**

#### **1. Create Onboarding Navigator**
**Priority:** High  
**Effort:** 1 hour

Create `src/navigation/OnboardingStack.tsx` to register all 11 onboarding screens.

**Current Status:** 11 screen files exist but no navigator  
**Action:** Create navigator file and map all routes

---

#### **2. Clean Up Duplicate/Deprecated Files**
**Priority:** Medium  
**Effort:** 30 minutes

Remove or clarify purpose of:
- `HomeDashboardScreen.tsx` vs `HomeScreen.tsx`
- `WorkoutScreen.tsx`, `SocialScreen.tsx`, `ExploreScreen.tsx` (deprecated)
- `ProfileScreen.tsx` vs `ProfileHubScreen.tsx`
- `ProgressCameraScreen.tsx` (might be for `TakeProgressPhoto`)

---

#### **3. Update Type Definitions**
**Priority:** Medium  
**Effort:** 1 hour

Ensure `src/navigation/types.ts` matches actual implemented screens:
- Remove unused route definitions, or
- Create screens for all defined routes

**Current Mismatches:**
- `MyFollowers` / `MyFollowing` (types exist, screen files missing)
- `StrengthMetrics` (in types, not implemented)

---

### **📊 Complete Roadmap to 92 Screens**

| Phase | Action | Screens Added | Total | Time Estimate |
|-------|--------|---------------|-------|---------------|
| **Current** | - | - | 83 | - |
| **Phase 1** | Register 6 auth screens | +6 | 89 | 30 min |
| **Phase 2** | Create 3 essential screens | +3 | **92** | 6-8 hours |
| **Phase 3** | Create 6 additional screens | +0 (nice-to-have) | 98 | 2-3 weeks |
| **Phase 4** | Create onboarding navigator | +0 (registration)  | 98 | 1 hour |
| **Phase 5** | Clean up & documentation | +0 (cleanup) | 98 | 2 hours |

**Total Time to 92 Screens:** 7-9 hours  
**Total Time to 100% Complete (98 screens):** 2-4 weeks

---

### **🎉 Success Criteria**

**Minimum Viable (92 screens):**
- ✅ All auth screens registered
- ✅ EditProfile, Achievements, XPHistory created
- ✅ All navigators functional
- ✅ Type safety maintained

**Fully Complete (98 screens):**
- ✅ All 9 missing screens created
- ✅ Onboarding navigator implemented
- ✅ All deprecated files cleaned up
- ✅ Complete type definition alignment

---

*See `MISSING_SCREENS_ANALYSIS.md` for detailed breakdown of missing screens*

---

## 📝 **Type Definitions Reference**

**Location:** `src/navigation/types.ts`

This file defines TypeScript types for all navigators and their param lists. Key exports:

```typescript
// Stack Param Lists
- RootStackParamList
- AuthStackParamList
- OnboardingStackParamList
- MainTabParamList
- HomeStackParamList
- WorkoutStackParamList
- ExploreStackParamList
- SocialStackParamList
- ProfileStackParamList

// Screen Props Types
- HomeStackScreenProps<T>
- WorkoutStackScreenProps<T>
- ExploreStackScreenProps<T>
- SocialStackScreenProps<T>
- ProfileStackScreenProps<T>
- AuthStackScreenProps<T>
- OnboardingStackScreenProps<T>
- MainTabScreenProps<T>
```

---

## 📚 **Quick Reference**

### **Navigator Files**
```
src/navigation/
├── RootNavigator.tsx      # Root navigation logic
├── AuthStack.tsx          # Authentication flow
├── MainTabs.tsx           # Bottom tab navigator + Home stack
├── WorkoutNavigator.tsx   # Workout-related screens
├── ExploreNavigator.tsx   # Explore-related screens
├── SocialNavigator.tsx    # Social-related screens
├── ProfileNavigator.tsx   # Profile-related screens
└── types.ts               # TypeScript type definitions
```

### **Screen Directories**
```
src/screens/
├── auth/                  # 8 screens
├── onboarding/            # 11 screens  
├── home/                  # 4 screens
├── workout/               # 18 screens
├── explore/               # 5 screens
├── social/                # 11 screens
└── profile/               # 26 screens
```

---

**Document Version:** 1.0  
**Generated:** February 6, 2026  
**Maintained by:** Development Team
