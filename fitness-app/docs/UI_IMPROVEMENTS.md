# UI Production Improvements

Date: February 22, 2026

---

## Packages Installed

- `expo-haptics` — tactile feedback on interactions
- `expo-image` — high-performance image rendering with built-in caching
- `@gorhom/bottom-sheet` — gesture-driven native bottom sheet

---

## Changes Made

### 1. Shimmer Skeleton
**File:** `src/components/common/SkeletonLoader.tsx`

- Replaced the old opacity-pulse animation with a proper shimmer sweep
- A bright gradient band moves left-to-right across the placeholder using `react-native-reanimated` + `expo-linear-gradient`
- Dark-mode aware: different base and shimmer colors depending on theme
- Looks identical to Instagram/Netflix loading states

---

### 2. Haptic Feedback on Every Button Press
**File:** `src/components/ui/Button.tsx`

- Every button tap fires `Haptics.ImpactFeedbackStyle.Light` via `expo-haptics`
- Optional `noHaptic` prop to suppress feedback for silent/background actions

---

### 3. Gradient Primary Button
**File:** `src/components/ui/Button.tsx`

- Replaced the flat `#0052FF` fill with a `LinearGradient` (`#0052FF → #4D7CFF`) for primary buttons
- Destructive buttons get a red gradient (`#EF4444 → #F87171`)
- Gradient clips cleanly to the button's border radius using `overflow: hidden`

---

### 4. Reanimated Press-Scale Animation
**Files:** `src/components/ui/Button.tsx`, `src/components/ui/Card.tsx`

- Replaced `TouchableOpacity` with `Animated.createAnimatedComponent(Pressable)` + `useSharedValue` + `withSpring`
- Buttons and cards scale down to `0.96` on press and spring back to `1.0` on release
- Feels native — no opacity flicker like the old `activeOpacity` approach
- `Card` gains an optional `onPress` prop that activates the same spring-scale behavior

---

### 5. Toast / Snackbar Notification System
**Files:**
- `src/components/ui/Toast.tsx` ← animated toast component
- `src/contexts/ToastContext.tsx` ← `useToast()` hook + `ToastProvider`
- `App.tsx` ← `ToastProvider` wired into root

**Usage anywhere in the app:**
```ts
const { showToast } = useToast();
showToast({ message: 'Workout saved!', type: 'success' });
```

**Types:** `success` (green) | `error` (red) | `warning` (amber) | `info` (blue)

**Features:**
- Slides in from the top with a spring animation
- Each type fires the matching `Haptics.NotificationFeedback` pattern
- Auto-dismisses after 3 seconds
- Slides back out before calling dismiss

---

### 6. expo-image Swap (Performance Upgrade)
**Files updated:**
- `src/screens/workout/CustomExerciseScreen.tsx`
- `src/screens/social/FollowListScreens.tsx`
- `src/screens/social/ChallengesListScreen.tsx`
- `src/screens/social/ChallengeDetailScreen.tsx`
- `src/screens/onboarding/AppTourScreen.tsx`
- `src/screens/social/SocialHomeScreen.tsx`
- `src/screens/body/ProgressPhotosScreen.tsx`

**Changes per file:**
- Replaced `Image` from `react-native` with `Image` from `expo-image`
- Fixed `resizeMode="cover"` → `contentFit="cover"` (expo-image API)
- Fixed `resizeMode="contain"` → `contentFit="contain"`

**Benefits:** Built-in memory + disk cache, crossfade transitions, better performance on lists

---

### 7. Stat Count-Up Animation
**File:** `src/components/ui/StatCard.tsx`

- When a `StatCard` mounts with a **numeric** value, it counts up from `0` to the target over 800 ms with an ease-out cubic curve
- String values (e.g., `"12 kg"`) render instantly with no animation
- `StatCard` now accepts an optional `onPress` prop that triggers the card's spring-scale animation

---

### 8. Empty State Component
**File:** `src/components/common/EmptyState.tsx`

- Reusable `EmptyState` component with 5 built-in SVG presets — no image assets required
- All illustrations drawn with `react-native-svg`

**Presets:**

| Preset | Screen |
|--------|--------|
| `workout` | Workout Hub, Routine List |
| `history` | Workout History |
| `routines` | Routine List, Template List |
| `social` | Social Feed, Follow List |
| `generic` | Any fallback / error |

**Usage:**
```tsx
<EmptyState preset="workout" onAction={() => navigation.navigate('WorkoutHub')} />
```

---

### 9. Production Bottom Sheet
**File:** `src/components/ui/AppBottomSheet.tsx`

- New `AppBottomSheet` component wrapping `@gorhom/bottom-sheet`
- Replaces any `Modal`-based bottom sheets

**Features:**
- Native gesture-driven drag to dismiss
- Configurable snap points (`['40%', '75%']` or pixel values)
- Dimmed backdrop that taps to close
- Brand-styled handle pill + indicator
- Keyboard-aware (moves up when keyboard opens on iOS)
- Dark-mode aware background color
- Controlled via `ref` — `ref.current.open()` / `ref.current.close()`

**Usage:**
```tsx
const sheetRef = useRef<BottomSheetRef>(null);

<AppBottomSheet ref={sheetRef} snapPoints={['50%']} title="Filter">
  <YourContent />
</AppBottomSheet>
```

---

### 10. Centralized Icon System
**File:** `src/components/ui/AppIcon.tsx`

- Single source-of-truth for all icons in the app
- Primary family: `MaterialCommunityIcons` (best fitness-specific icons)
- **65+ semantic aliases** — use a domain name, not an icon library name

**Size tokens:**

| Token | Size |
|-------|------|
| `xs` | 16 px |
| `sm` | 20 px |
| `md` | 24 px |
| `lg` | 28 px |
| `xl` | 32 px |
| `2xl` | 40 px |

**Usage:**
```tsx
<AppIcon name="dumbbell" size="md" color={colors.primary.main} />
<AppIcon name="streak" size="lg" />         // → fire icon
<AppIcon name="pr" badge />                 // → trophy + red dot
<AppIcon name="mci:arm-flex" size="xl" />   // raw icon name escape hatch
```

**Selected semantic aliases:**

| Name | Icon |
|------|------|
| `streak` | fire |
| `pr` | trophy |
| `level` | lightning-bolt |
| `calories` | fire |
| `ai` | robot-excited |
| `coach` | robot-excited |
| `cardio` | run |
| `leaderboard` | podium |
| `challenge` | flag-checkered |
| `magic` | auto-fix |

To swap icon families globally, only `AppIcon.tsx` needs to change — no screen files touched.

---

## Files Created

| File | Purpose |
|------|---------|
| `src/components/ui/AppIcon.tsx` | Centralized icon system |
| `src/components/ui/AppBottomSheet.tsx` | Production bottom sheet wrapper |
| `src/components/ui/Toast.tsx` | Animated toast component |
| `src/components/common/EmptyState.tsx` | Empty state with SVG presets |
| `src/contexts/ToastContext.tsx` | `useToast()` hook + `ToastProvider` |

## Files Modified

| File | What Changed |
|------|-------------|
| `src/components/common/SkeletonLoader.tsx` | Shimmer sweep animation |
| `src/components/ui/Button.tsx` | Haptics + gradient + spring scale |
| `src/components/ui/Card.tsx` | Optional onPress + spring scale |
| `src/components/ui/StatCard.tsx` | Count-up animation + onPress |
| `src/components/ui/index.ts` | New exports added |
| `src/contexts/index.ts` | `ToastProvider` exported |
| `App.tsx` | `ToastProvider` wrapped in root |
| `src/screens/workout/CustomExerciseScreen.tsx` | expo-image |
| `src/screens/social/FollowListScreens.tsx` | expo-image |
| `src/screens/social/ChallengesListScreen.tsx` | expo-image |
| `src/screens/social/ChallengeDetailScreen.tsx` | expo-image |
| `src/screens/onboarding/AppTourScreen.tsx` | expo-image |
| `src/screens/social/SocialHomeScreen.tsx` | expo-image |
| `src/screens/body/ProgressPhotosScreen.tsx` | expo-image |
