# 📊 FitAI Navigation Diagram (Mermaid)

## Complete Navigation Architecture

```mermaid
graph TD
    %% Root Level
    Start([App Launch]) --> Auth{Authenticated?}
    Auth -->|No| AuthStack[Auth Stack<br/>8 screens]
    Auth -->|Yes, First Time| OnboardingStack[Onboarding Stack<br/>11 screens]
    Auth -->|Yes| MainTabs[Main Tabs<br/>5 tabs]
    
    OnboardingStack --> MainTabs
    
    %% Auth Stack
    AuthStack --> Welcome[Welcome]
    AuthStack --> Login[Login]
    AuthStack --> Register[Register]
    AuthStack --> VerifyEmail[Email Verification]
    AuthStack --> ForgotPassword[Forgot Password]
    AuthStack --> ResetPassword[Reset Password]
    AuthStack --> AccountLocked[Account Locked]
    
    %% Main Tabs
    MainTabs --> HomeTab[🏠 Home Tab]
    MainTabs --> WorkoutTab[💪 Workout Tab]
    MainTabs --> ExploreTab[🧭 Explore Tab]
    MainTabs --> SocialTab[👥 Social Tab]
    MainTabs --> ProfileTab[👤 Profile Tab]
    
    %% Home Tab
    HomeTab --> HomeDashboard[Home Dashboard]
    HomeTab --> Notifications[Notifications]
    HomeTab --> StreakCalendar[Streak Calendar]
    HomeTab --> XPLevel[Level & XP Modal]
    
    %% Workout Tab
    WorkoutTab --> WorkoutHub[Workout Hub]
    WorkoutHub --> RoutineList[Routine List]
    WorkoutHub --> ActiveWorkout[Active Workout]
    WorkoutHub --> WorkoutHistory[Workout History]
    WorkoutHub --> AIGenerator[AI Generator]
    
    RoutineList --> RoutineDetail[Routine Detail]
    RoutineDetail --> RoutineEditor[Routine Editor]
    RoutineEditor --> ExercisePicker[Exercise Picker]
    ExercisePicker --> ExerciseDetail[Exercise Detail]
    
    ActiveWorkout --> ExerciseSwap[Exercise Swap]
    ActiveWorkout --> SetConfig[Set Config]
    ActiveWorkout --> WorkoutSummary[Workout Summary]
    
    WorkoutHistory --> WorkoutDetail[Workout Detail]
    WorkoutDetail --> SessionInsights[Session Insights]
    
    AIGenerator --> AIPreview[AI Preview]
    AIGenerator --> AIPrompts[AI Prompts]
    
    %% Explore Tab
    ExploreTab --> ExploreHub[Explore Hub]
    ExploreHub --> ExerciseLibrary[Exercise Library]
    ExploreHub --> PublicRoutines[Public Routines]
    ExploreHub --> ExerciseCreator[Exercise Creator]
    
    PublicRoutines --> RoutineTemplate[Routine Template]
    
    %% Social Tab
    SocialTab --> SocialHome[Social Home]
    SocialHome --> CreatePost[Create Post]
    SocialHome --> PostDetail[Post Detail]
    SocialHome --> Leaderboard[Leaderboard]
    SocialHome --> ChallengesList[Challenges List]
    SocialHome --> SearchUsers[Search Users]
    SocialHome --> Activity[Activity]
    
    PostDetail --> UserProfile[User Profile]
    SearchUsers --> UserProfile
    UserProfile --> FollowersList[Followers]
    UserProfile --> FollowingList[Following]
    
    ChallengesList --> ChallengeDetail[Challenge Detail]
    
    %% Profile Tab
    ProfileTab --> ProfileHub[Profile Hub]
    ProfileHub --> StatsHub[Stats Hub]
    ProfileHub --> CoachHub[AI Coach Hub]
    ProfileHub --> BodyTrackingHub[Body Tracking Hub]
    ProfileHub --> Settings[Settings]
    
    StatsHub --> PersonalRecords[Personal Records]
    StatsHub --> StrengthProgression[Strength Progression]
    StatsHub --> VolumeAnalytics[Volume Analytics]
    StatsHub --> MuscleDistribution[Muscle Distribution]
    StatsHub --> MuscleHeatmap[Muscle Heatmap]
    
    CoachHub --> CoachChat[Coach Chat]
    CoachHub --> FormAnalysis[Form Analysis]
    
    BodyTrackingHub --> WeightLog[Weight Log]
    BodyTrackingHub --> Measurements[Measurements]
    BodyTrackingHub --> ProgressPhotos[Progress Photos]
    
    Settings --> AccountSecurity[Account Security]
    Settings --> PrivacySettings[Privacy Settings]
    Settings --> NotificationSettings[Notification Settings]
    Settings --> UnitsPreferences[Units Preferences]
    Settings --> HelpSupport[Help & Support]
    Settings --> About[About]
    
    AccountSecurity --> ChangePassword[Change Password]
    
    %% Styling
    classDef authClass fill:#FF6B6B,stroke:#C92A2A,color:#fff
    classDef onboardingClass fill:#FAB005,stroke:#F59F00,color:#000
    classDef homeClass fill:#51CF66,stroke:#2F9E44,color:#fff
    classDef workoutClass fill:#4C6EF5,stroke:#364FC7,color:#fff
    classDef exploreClass fill:#845EF7,stroke:#5F3DC4,color:#fff
    classDef socialClass fill:#FF6B9D,stroke:#C2255C,color:#fff
    classDef profileClass fill:#20C997,stroke:#099268,color:#fff
    
    class Welcome,Login,Register,VerifyEmail,ForgotPassword,ResetPassword,AccountLocked authClass
    class OnboardingStack onboardingClass
    class HomeDashboard,Notifications,StreakCalendar,XPLevel homeClass
    class WorkoutHub,RoutineList,RoutineDetail,RoutineEditor,ExercisePicker,ExerciseDetail,ActiveWorkout,ExerciseSwap,SetConfig,WorkoutSummary,WorkoutHistory,WorkoutDetail,SessionInsights,AIGenerator,AIPreview,AIPrompts workoutClass
    class ExploreHub,ExerciseLibrary,PublicRoutines,RoutineTemplate,ExerciseCreator exploreClass
    class SocialHome,CreatePost,PostDetail,UserProfile,FollowersList,FollowingList,Leaderboard,ChallengesList,ChallengeDetail,SearchUsers,Activity socialClass
    class ProfileHub,StatsHub,PersonalRecords,StrengthProgression,VolumeAnalytics,MuscleDistribution,MuscleHeatmap,CoachHub,CoachChat,FormAnalysis,BodyTrackingHub,WeightLog,Measurements,ProgressPhotos,Settings,AccountSecurity,ChangePassword,PrivacySettings,NotificationSettings,UnitsPreferences,HelpSupport,About profileClass
```

## Onboarding Flow (Sequential)

```mermaid
graph LR
    Start([New User]) --> Goal[Goal Selection]
    Goal --> Experience[Experience Level]
    Experience --> Body[Physical Profile]
    Body --> Equipment[Equipment]
    Equipment --> Frequency[Workout Frequency]
    Frequency --> Duration[Workout Duration]
    Duration --> Units[Units Preference]
    Units --> Notifications[Notifications]
    Notifications --> Tour[App Tour]
    Tour --> Success[Final Success]
    Success --> Complete([Main App])
    
    classDef onboardingClass fill:#FAB005,stroke:#F59F00,color:#000
    class Goal,Experience,Body,Equipment,Frequency,Duration,Units,Notifications,Tour,Success onboardingClass
```

## Screen Count by Category

**Total Planned:** 92 screens  
**Currently Implemented:** 83 screens (90%)  
**Missing:** 9 screens (10%)

```mermaid
pie title Screen Distribution (92 Planned)
    "Profile" : 33
    "Workout" : 18
    "Social" : 12
    "Onboarding" : 11
    "Auth" : 8
    "Explore" : 6
    "Home" : 4
```

### Implementation Progress

| Category | Planned | Implemented | Missing | % Complete |
|----------|---------|-------------|---------|------------|
| **Home** | 4 | 4 | 0 | 100% ✅ |
| **Workout** | 18 | 18 | 0 | 100% ✅ |
| **Social** | 12 | 11 | 1 | 92% ⚠️ |
| **Explore** | 6 | 5 | 1 | 83% ⚠️ |
| **Profile** | 33 | 26 | 7 | 79% ⚠️ |
| **Auth** | 8 | 8 files (2 in nav) | 6 not registered | 25% ❌ |
| **Onboarding** | 11 | 11 files | No navigator | 0% ❌ |
| **TOTAL** | **92** | **83** | **9** | **90%** |

## Tab Navigator Structure

```mermaid
graph TB
    MainTabs["Main Tab Navigator<br/>(Bottom Tabs)"]
    
    MainTabs -->|Tab 1| Home["🏠 Home<br/>4/4 screens ✅"]
    MainTabs -->|Tab 2| Workout["💪 Workout<br/>18/18 screens ✅"]
    MainTabs -->|Tab 3| Explore["🧭 Explore<br/>5/6 screens ⚠️"]
    MainTabs -->|Tab 4| Social["👥 Social<br/>11/12 screens ⚠️"]
    MainTabs -->|Tab 5| Profile["👤 Profile<br/>26/33 screens ⚠️"]
    
    classDef tabClass fill:#228be6,stroke:#1971c2,color:#fff
    class MainTabs tabClass
```

## Workout Navigator Deep Dive

```mermaid
graph TD
    WorkoutTab[💪 Workout Tab]
    
    WorkoutTab --> Hub[Workout Hub<br/>Main Landing]
    
    %% Phase 2A
    Hub --> Phase2A[Phase 2A: Workout Hub]
    Phase2A --> RoutineList[Routine List]
    Phase2A --> RoutineDetail[Routine Detail]
    Phase2A --> RoutineEditor[Routine Editor]
    Phase2A --> ExercisePicker[Exercise Picker]
    Phase2A --> ExerciseDetail[Exercise Detail]
    Phase2A --> ExerciseFilter[Exercise Filter]
    Phase2A --> CustomExercise[Custom Exercise]
    
    %% Phase 2B
    Hub --> Phase2B[Phase 2B: Active Workout]
    Phase2B --> ActiveWorkout[Active Workout]
    Phase2B --> ExerciseSwap[Exercise Swap]
    Phase2B --> SetConfig[Set Config]
    Phase2B --> WorkoutSummary[Workout Summary]
    
    %% Phase 2C
    Hub --> Phase2C[Phase 2C: History & AI]
    Phase2C --> WorkoutHistory[Workout History]
    Phase2C --> WorkoutDetail[Workout Detail]
    Phase2C --> SessionInsights[Session Insights]
    Phase2C --> AIGenerator[AI Generator]
    Phase2C --> AIPreview[AI Preview]
    Phase2C --> AIPrompts[AI Prompts]
    
    classDef hubClass fill:#4C6EF5,stroke:#364FC7,color:#fff
    classDef phaseClass fill:#748FFC,stroke:#4C6EF5,color:#fff
    
    class Hub hubClass
    class Phase2A,Phase2B,Phase2C phaseClass
```

## Profile Navigator Deep Dive

```mermaid
graph TD
    ProfileTab[👤 Profile Tab]
    
    ProfileTab --> Hub[Profile Hub<br/>Main Landing]
    
    %% Stats
    Hub --> Stats[Stats Hub]
    Stats --> PR[Personal Records]
    Stats --> Strength[Strength Progression]
    Stats --> Volume[Volume Analytics]
    Stats --> Muscle[Muscle Distribution]
    Stats --> Heatmap[Muscle Heatmap]
    
    %% AI Coach
    Hub --> Coach[AI Coach Hub]
    Coach --> Chat[Coach Chat]
    Coach --> FormAnalysis[Form Analysis]
    
    %% Body Tracking
    Hub --> Body[Body Tracking Hub]
    Body --> Weight[Weight Log]
    Body --> Measurements[Measurements]
    Body --> Photos[Progress Photos]
    
    %% Settings
    Hub --> Settings[Settings]
    Settings --> Account[Account Security]
    Settings --> Privacy[Privacy Settings]
    Settings --> Notifications[Notification Settings]
    Settings --> Units[Units Preferences]
    Settings --> Help[Help & Support]
    Settings --> About[About]
    
    Account --> Password[Change Password]
    
    classDef hubClass fill:#20C997,stroke:#099268,color:#fff
    classDef categoryClass fill:#63E6BE,stroke:#20C997,color:#000
    
    class Hub hubClass
    class Stats,Coach,Body,Settings categoryClass
```

## Navigation File Structure

```mermaid
graph LR
    Root[src/navigation/]
    
    Root --> Types[types.ts<br/>Type Definitions]
    Root --> RootNav[RootNavigator.tsx<br/>Root Logic]
    Root --> AuthNav[AuthStack.tsx<br/>8 screens]
    Root --> MainNav[MainTabs.tsx<br/>Bottom Tabs + Home]
    Root --> WorkoutNav[WorkoutNavigator.tsx<br/>18 screens]
    Root --> ExploreNav[ExploreNavigator.tsx<br/>5 screens]
    Root --> SocialNav[SocialNavigator.tsx<br/>11 screens]
    Root --> ProfileNav[ProfileNavigator.tsx<br/>26/33 screens ⚠️]
    Root --> OnboardingNav[❌ OnboardingStack.tsx<br/>0/11 - MISSING]
    
    classDef typeFile fill:#228be6,stroke:#1971c2,color:#fff
    classDef navFile fill:#51CF66,stroke:#2F9E44,color:#fff
    classDef missingFile fill:#FA5252,stroke:#C92A2A,color:#fff
    
    class Types typeFile
    class RootNav,AuthNav,MainNav,WorkoutNav,ExploreNav,SocialNav,ProfileNav navFile
    class OnboardingNav missingFile
```

## Screen Implementation Status (92 Planned)

```mermaid
graph TD
    Total["Total Planned: 92 Screens<br/>Implemented: 83 (90%)"]
    
    Total --> Fully[Fully Implemented<br/>64 screens]
    Total --> Files[Files Exist<br/>Not Registered: 19]
    Total --> Missing[Missing Files<br/>9 screens]
    
    Fully --> HomeImpl[Home: 4/4 ✅]
    Fully --> WorkoutImpl[Workout: 18/18 ✅]
    
    Files --> AuthFiles[Auth: 6 screens<br/>Files exist, not in nav]
    Files --> OnboardingFiles[Onboarding: 11 screens<br/>No navigator]
    Files --> ProfilePartial[Profile: 2 screens<br/>Files exist, not registered]
    
    Missing --> ProfileMissing[Profile: 7 screens ❌<br/>EditProfile, Achievements, etc.]
    Missing --> SocialMissing[Social: 1 screen ❌<br/>ShareWorkout]
    Missing --> ExploreMissing[Explore: 1 screen ❌<br/>MyCustomExercises]
    
    classDef successClass fill:#51CF66,stroke:#2F9E44,color:#fff
    classDef warningClass fill:#FAB005,stroke:#F59F00,color:#000
    classDef errorClass fill:#FA5252,stroke:#C92A2A,color:#fff
    
    class HomeImpl,WorkoutImpl,Fully successClass
    class AuthFiles,OnboardingFiles,ProfilePartial,Files warningClass
    class ProfileMissing,SocialMissing,ExploreMissing,Missing errorClass
```

---

**To view these diagrams:**
1. Copy the mermaid code blocks
2. Paste into [Mermaid Live Editor](https://mermaid.live/)
3. Or use a Mermaid-compatible Markdown viewer

**Alternatively:**
- GitHub natively renders Mermaid diagrams in markdown files
- VS Code with Mermaid extensions can preview these diagrams

---

## 🎯 Path to 92 Screens

### Current Status
- **Implemented & Working:** 64 screens (70%)
- **Files Exist, Not Registered:** 19 screens (21%)
- **Need to Create:** 9 screens (9%)

### Quick Wins (30 min → 89 screens)
1. Register 6 auth screens in `AuthStack.tsx`
2. Create `OnboardingStack.tsx` navigator (11 screens already exist)
3. **Result:** 83 → 89 screens (+6)

### Essential Screens (6-8 hours → 92 screens) 
1. `EditProfileScreen.tsx`
2. `AchievementsScreen.tsx`
3. `XPHistoryScreen.tsx`
4. **Result:** 89 → **92 screens (+3)** ✅

### Full Completion (2-3 weeks → 98 screens)
Implement remaining 6 screens for 100% feature parity.

---

**See `SCREENS_AND_NAVIGATION.md` for complete documentation**  
**See `MISSING_SCREENS_ANALYSIS.md` for detailed missing screen breakdown**
