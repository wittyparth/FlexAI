# 🔍 **Missing Screens Analysis**

**Current Count:** 83 screens implemented  
**Your Planned Count:** 92+ screens  
**Missing:** 9+ screens

---

## 📊 **Comparison: Types.ts vs Actual Files**

Based on analyzing your `types.ts` navigation definitions and comparing with actual screen files, here are the **MISSING SCREENS**:

---

## ❌ **Missing Screens (Not Implemented)**

### **1. Authentication Stack - Missing Screens**

From `types.ts` AuthStackParamList, these are defined but **NOT IMPLEMENTED** in actual files or navigator:

| # | Route Name | Type Definition | File Expected | Status |
|---|------------|----------------|---------------|--------|
| - | `GoogleOAuth` | `undefined` | `GoogleOAuthScreen.tsx` | ❌ **NOT IMPLEMENTED** |

**Note:** `ResetVerifyScreen.tsx` exists but is mapped to `GoogleOAuth` route (incorrect mapping)

---

### **2. Profile Stack - Missing Screens (8 screens)**

From `types.ts` ProfileStackParamList, these routes are defined but **NO SCREEN FILES EXIST**:

| # | Route Name | Type Definition | File Expected | Status |
|---|----------|-----------------|---------------|--------|
| 81 | `EditProfile` | `undefined` | `EditProfileScreen.tsx` | ❌ **NOT FOUND** |
| 82 | `Achievements` | `undefined` | `AchievementsScreen.tsx` | ❌ **NOT FOUND** |
| 83 | `MyFollowers` | `undefined` | `MyFollowersScreen.tsx` | ❌ **NOT FOUND** |
| 84 | `MyFollowing` | `undefined` | `MyFollowingScreen.tsx` | ❌ **NOT FOUND** |
| 85 | `XPHistory` | `undefined` | `XPHistoryScreen.tsx` | ❌ **NOT FOUND** |
| 86 | `WorkoutFrequency` | `undefined` | `WorkoutFrequencyScreen.tsx` | ❌ **NOT FOUND** |
| 87 | `RecoveryStatus` | `undefined` | `RecoveryStatusScreen.tsx` | ❌ **NOT FOUND** |
| 88 | `StrengthMetrics` | `undefined` | `StrengthMetricsScreen.tsx` | ❌ **NOT FOUND** |

---

### **3. Profile Stack - Additional Missing (3 screens)**

These screens are mentioned in types but no files exist:

| # | Route Name | Type Definition | File Expected | Status |
|---|----------|-----------------|---------------|--------|
| 89 | `TakeProgressPhoto` | `undefined` | `TakeProgressPhotoScreen.tsx` | ❌ **NOT FOUND** |
| 90 | `CoachPrompts` | `undefined` | `CoachPromptsScreen.tsx` | ❌ **NOT FOUND** |

**Note:** `ProgressCameraScreen.tsx` might be intended for `TakeProgressPhoto` but isn't registered in navigator.

---

### **4. Social Stack - Missing Screen**

From types but not in actual implementation:

| # | Route Name | Type Definition | File Expected | Status |
|---|----------|-----------------|---------------|--------|
| 91 | `ShareWorkout` | `{ workoutId: number }` | `ShareWorkoutScreen.tsx` | ❌ **NOT FOUND** |

---

### **5. Explore Stack - Potential Missing**

These screens might be planned based on your feature docs:

| # | Screen Name | File Expected | Status |
|---|------------|---------------|--------|
| 92 | My Custom Exercises | `MyCustomExercisesScreen.tsx` | ❌ **NOT FOUND** |

**Note:** `ExploreNavigator.tsx` shows a route `MyCustomExercises` in types but not implemented.

---

## ✅ **Screens DEFINED in Types but NOT in Navigator (9 screens)**

These are in your `types.ts` file but not registered in the actual navigator implementations:

### **Auth Stack (6 screens not registered)**
1. `Register` → `RegisterScreen.tsx` ✅ (file exists)
2. `EmailVerification` → `VerifyEmailScreen.tsx` ✅ (file exists)
3. `ForgotPassword` → `ForgotPasswordScreen.tsx` ✅ (file exists)
4. `ResetPassword` → `ResetPasswordScreen.tsx` ✅ (file exists)
5. `GoogleOAuth` → No file (should be `GoogleOAuthScreen.tsx`) ❌
6. `AccountLocked` → `AccountLockedScreen.tsx` ✅ (file exists)

### **Profile Stack (3 screens exist but not in navigator)**
7. `EditProfile` - No file ❌
8. `Achievements` - No file ❌
9. `XPHistory` - No file ❌

---

## 📋 **COMPLETE MISSING SCREENS BREAKDOWN**

### **Category 1: Files Exist + Not in Navigator (6 screens)**
These screen files EXIST but are NOT registered in navigators:

1. `RegisterScreen.tsx` - Auth
2. `VerifyEmailScreen.tsx` - Auth
3. `ForgotPasswordScreen.tsx` - Auth
4. `ResetPasswordScreen.tsx` - Auth
5. `ResetVerifyScreen.tsx` - Auth
6. `AccountLockedScreen.tsx` - Auth

---

### **Category 2: Defined in Types + No Files (11 screens)**
These are in `types.ts` but NO screen files exist:

7. `GoogleOAuthScreen.tsx` - Auth
8. `EditProfileScreen.tsx` - Profile
9. `AchievementsScreen.tsx` - Profile
10. `MyFollowersScreen.tsx` - Profile
11. `MyFollowingScreen.tsx` - Profile
12. `XPHistoryScreen.tsx` - Profile
13. `WorkoutFrequencyScreen.tsx` - Profile (Stats category)
14. `RecoveryStatusScreen.tsx` - Profile (Stats category)
15. `StrengthMetricsScreen.tsx` - Profile (Stats category)
16. `TakeProgressPhotoScreen.tsx` - Profile (Body Tracking)
17. `CoachPromptsScreen.tsx` - Profile (AI Coach)
18. `ShareWorkoutScreen.tsx` - Social
19. `MyCustomExercisesScreen.tsx` - Explore

---

## 🎯 **TO REACH 92+ SCREENS**

**Current:** 83 screens  
**Missing to implement:** 9-11 screens minimum

### **Quick Win: Register Auth Screens (6 screens)**
Add these **existing files** to `AuthStack.tsx`:
```typescript
<Stack.Screen name="Register" component={RegisterScreen} />
<Stack.Screen name="EmailVerification" component={VerifyEmailScreen} />
<Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
<Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
<Stack.Screen name="AccountLocked" component={AccountLockedScreen} />
```

**New Count:** 83 + 6 = **89 screens**

---

### **To Reach 92: Create 3 More Screens**

**Option A: High-Value Profile Screens**
1. **`EditProfileScreen.tsx`** - Essential for user profile management
2. **`AchievementsScreen.tsx`** - Gamification feature (badges, milestones)
3. **`XPHistoryScreen.tsx`** - Show XP progression over time

**New Count:** 89 + 3 = **92 screens** ✅

---

**Option B: Analytics-Heavy Approach**
1. **`WorkoutFrequencyScreen.tsx`** - Workout frequency analytics
2. **`RecoveryStatusScreen.tsx`** - Recovery tracking dashboard
3. **`StrengthMetricsScreen.tsx`** - Advanced strength analytics

**New Count:** 89 + 3 = **92 screens** ✅

---

**Option C: Social + Sharing Focus**
1. **`ShareWorkoutScreen.tsx`** - Share workout to social media
2. **`MyFollowersScreen.tsx`** - Manage followers (alternative to `FollowersListScreen`)
3. **`MyFollowingScreen.tsx`** - Manage following (alternative to `FollowingListScreen`)

**New Count:** 89 + 3 = **92 screens** ✅

---

## 📍 **Most Likely Original Plan (Based on Feature Docs)**

Looking at your `fitness-complete-features.md` and planning documents, you likely planned:

### **Authentication (8 screens)** ✅
1-8. All defined (but only 2 registered)

### **Onboarding (11 screens)** ✅  
9-20. All files exist

### **Home (4 screens)** ✅
21-24. All implemented

### **Workout (18 screens)** ✅
25-42. All implemented

### **Explore (6 screens)** - **Missing 1**
43-47. Currently 5, should be:
- ExploreHub, ExerciseLibrary, PublicRoutines, RoutineTemplate, ExerciseCreator
- **Missing:** `MyCustomExercises` detailed view

### **Social (12 screens)** - **Missing 1**
48-58. Currently 11, should include:
- **Missing:** `ShareWorkout`

### **Profile (33 screens)** - **Missing 7**
59-91. Currently 26, missing:
- EditProfile
- Achievements  
- MyFollowers (or using `FollowersListScreen` from Social?)
- MyFollowing (or using `FollowingListScreen` from Social?)
- XPHistory
- WorkoutFrequency
- RecoveryStatus
- StrengthMetrics
- TakeProgressPhoto
- CoachPrompts

---

## 🏗️ **RECOMMENDED IMPLEMENTATION ORDER**

### **Phase 1: Register Existing Auth Screens (6 screens)**
**Effort:** 30 minutes  
**Impact:** Functional auth flow
- Add 6 screens to `AuthStack.tsx`

### **Phase 2: Create Essential Profile Screens (3 screens)**
**Effort:** 4-6 hours  
**Impact:** Complete profile management
1. `EditProfileScreen.tsx` - Edit user profile
2. `AchievementsScreen.tsx` - Badges and gamification
3. `XPHistoryScreen.tsx` - XP progression graph

### **Phase 3: Advanced Analytics (3 screens)** (Optional)
**Effort:** 6-8 hours  
**Impact:** Enhanced analytics
1. `WorkoutFrequencyScreen.tsx`
2. `RecoveryStatusScreen.tsx`
3. `StrengthMetricsScreen.tsx`

---

## 🎉 **TOTAL COUNT AFTER ALL IMPLEMENTATIONS**

| Category | Currently Implemented | After Quick Win | After Phase 2 | After Phase 3 |
|----------|----------------------|-----------------|---------------|---------------|
| Auth | 2/8 | 8/8 ✅ | 8/8 | 8/8 |
| Onboarding | 11/11 | 11/11 ✅ | 11/11 | 11/11 |
| Home | 4/4 | 4/4 ✅ | 4/4 | 4/4 |
| Workout | 18/18 | 18/18 ✅ | 18/18 | 18/18 |
| Explore | 5/6 | 5/6 | 5/6 | 6/6 ✅ |
| Social | 11/12 | 11/12 | 11/12 | 12/12 ✅ |
| Profile | 26/33 | 26/33 | 29/33 | 32/33 ✅ |
| **TOTAL** | **77/92** | **83/92** | **86/92** | **91/92** |

---

## 📝 **ACTION ITEMS**

✅ **Quick Wins (30 min):**
1. Add 6 existing auth screens to `AuthStack.tsx`
2. Update `SCREENS_AND_NAVIGATION.md` with correct count

🔨 **Short Term (1 week):**
1. Create `EditProfileScreen.tsx`
2. Create `AchievementsScreen.tsx`  
3. Create `XPHistoryScreen.tsx`

🚀 **Medium Term (2-3 weeks):**
1. Create remaining analytics screens
2. Create `ShareWorkoutScreen.tsx`
3. Create `MyCustomExercisesScreen.tsx`

---

**Last Updated:** February 6, 2026  
**Analysis By:** Navigation Structure Audit
