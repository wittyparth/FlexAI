# FlexAI — Production-Grade UI Upgrade Plan

> **Philosophy:** Upgrade in layers — tokens → primitives → composed components → screens.  
> Never rewrite entire files. Every change is a targeted, surgical edit.  
> Every component uses theme tokens. Zero hardcoded hex values in screens.

---

## Status Legend
- `[ ]` Not started  
- `[~]` In progress  
- `[x]` Complete  

---

## Layer 0 — Foundation (Single Source of Truth)

These changes ensure all design tokens live in one place and every component consumes them correctly.

| # | File | Change | Priority |
|---|------|--------|----------|
| 0.1 | `src/constants/colors.ts` | Add `inputBackground`, `surfaceHover`, `overlayLight`, `overlayDark`, `divider` tokens to both LIGHT and DARK palettes | 🔴 Critical |
| 0.2 | `src/constants/shadows.ts` | Add `colored` (primary-tinted), `float` (bottom-sheet lift), `none` presets. Ensure `SHADOWS_LIGHT` & `SHADOWS_DARK` are complete | 🔴 Critical |
| 0.3 | `src/constants/layout.ts` | Add `borderRadius.xs = 4`, `borderRadius.sm = 8`, `borderRadius['2xl'] = 24`, `borderRadius['3xl'] = 32` for premium rounding | 🔴 Critical |
| 0.4 | `src/constants/typography.ts` | Add `label`, `caption`, `overline`, `code` presets; ensure all presets are exported | 🟡 High |
| 0.5 | `src/constants/index.ts` | Audit exports — ensure `inputBackground`, new borderRadius, all shadow presets are exported | 🟡 High |
| 0.6 | `src/theme/index.ts` | Verify it re-exports everything from `src/constants/` (no drift). This is the **only** import path for theme tokens in screens | 🟡 High |

---

## Layer 1 — Primitive Component Upgrades

Upgrade existing components. **Do not add new files yet — edit existing ones.**

### 1.1 Button (`src/components/ui/Button.tsx`)

| Sub-task | Change |
|----------|--------|
| 1.1a | Add `textStyle?: TextStyle` prop for custom text overrides |
| 1.1b | Accept `leftElement?: ReactNode` and `rightElement?: ReactNode` (rename from `icon`/`iconPosition` — keep backward compat via deprecation alias) |
| 1.1c | Add `rounded?: boolean` prop → `borderRadius.full` when true (pill shape) |
| 1.1d | Add `outlined` variant alias for `secondary` (many screens use the term) |
| 1.1e | Gradient: upgrade destructive gradient to `['#FF3B30', '#FF6B6B']` (more premium red) |
| 1.1f | Add `accentLarge` shadow to primary variant (blue glow on press) via animated shadow interpolation |
| 1.1g | Disabled state: show `0.4` opacity wrapper instead of just text color change |
| 1.1h | Add `subtitle?: string` prop for split-info buttons ("Start Workout / 6 exercises") with two-line layout |

### 1.2 Card (`src/components/ui/Card.tsx`)

| Sub-task | Change |
|----------|--------|
| 1.2a | Add `gradient?: [string, string]` prop → renders `LinearGradient` as background |
| 1.2b | Add `bordered?: boolean` prop → thin `1px` border using `colors.border` |
| 1.2c | Add `accentLeft?: string` prop → colored left-border stripe (4px wide, full height) for status callouts |
| 1.2d | `glass` variant: add `expo-blur BlurView` as the background layer instead of plain rgba — true frosted glass |
| 1.2e | Press animation: improve spring config `(damping: 20, stiffness: 350)` — snappier |
| 1.2f | Add `shimmer?: boolean` prop → shows `SkeletonLoader` placeholder while true (loading state built into Card) |

### 1.3 Input (`src/components/ui/Input.tsx`)

| Sub-task | Change |
|----------|--------|
| 1.3a | Add `variant?: 'default' | 'filled' | 'underline'` — `filled` uses `colors.muted` bg with no border; `underline` has bottom border only |
| 1.3b | Animate border color transition on focus — use `Animated.Value` interpolating border color |
| 1.3c | Add animated floating label — label shrinks and floats above input on focus |
| 1.3d | Add `characterCount?: boolean` prop — shows `"12 / 100"` helper when `maxLength` is set |
| 1.3e | Add `leftElement?: ReactNode` and `rightElement?: ReactNode` for custom adornments (not just Ionicons) |
| 1.3f | Error state: add shake animation on error appearance (Reanimated) |
| 1.3g | Size variants: `size?: 'sm' | 'md' | 'lg'` for varying input heights |

### 1.4 Badge (`src/components/ui/Badge.tsx`)

| Sub-task | Change |
|----------|--------|
| 1.4a | Add `size?: 'xs' | 'sm' | 'md'` — `xs` is pure numberical notification badge (no text) |
| 1.4b | Add `icon?: keyof Ionicons.glyphMap` → shows icon left of text |
| 1.4c | Add `outline?: boolean` → border-only style (no fill, just colored border + text) |
| 1.4d | Add `pulse?: boolean` → Reanimated looping scale pulse for "live" / "active" badges |

### 1.5 ProgressBar (`src/components/ui/ProgressBar.tsx`)

| Sub-task | Change |
|----------|--------|
| 1.5a | **Migrate from `Animated` (legacy) to `react-native-reanimated`** — use `useSharedValue` + `withTiming` |
| 1.5b | Add `gradient?: [string, string]` prop → use `LinearGradient` as bar fill |
| 1.5c | Add `striped?: boolean` → animated diagonal stripe pattern for "active" progress |
| 1.5d | Add `label?: string` prop → shows percentage or custom text above bar |
| 1.5e | Extend height from 6px default to 8px; add `rounded` cap (already there) |
| 1.5f | Add `segments?: number` → segmented bar (like iOS battery) |

### 1.6 SelectableCard (`src/components/ui/SelectableCard.tsx`)

| Sub-task | Change |
|----------|--------|
| 1.6a | Replace `TouchableOpacity` → `AnimatedPressable` (Reanimated spring scale like Button) |
| 1.6b | Selected state: add `LinearGradient` tint behind selected card (very subtle ~4% opacity) |
| 1.6c | Add spring-animated checkmark icon that scales in when selected |
| 1.6d | Add `badge?: string` prop for "Popular" / "Recommended" label in corner |
| 1.6e | Add Haptic feedback on selection |

### 1.7 ScreenHeader (`src/components/ui/ScreenHeader.tsx`)

> This is the **onboarding wizard** header. A separate `NavigationBar` component will handle app screen headers.

| Sub-task | Change |
|----------|--------|
| 1.7a | Replace `TouchableOpacity` back button → `Pressable` with circular ripple bg and scale animation |
| 1.7b | Animate progress bar fill width using Reanimated on step change |
| 1.7c | Add `title?: string` prop for centered screen title |
| 1.7d | Back button: minimum touch target 44×44 per HIG |

### 1.8 StatCard (`src/components/ui/StatCard.tsx`)

| Sub-task | Change |
|----------|--------|
| 1.8a | Count-up: replace the `setInterval` hack with a proper Reanimated `useDerivedValue` + `useAnimatedProps` on an animated `Text` subclass |
| 1.8b | Add `sparkline?: number[]` prop — mini SVG line chart in bottom-right using `react-native-svg` |
| 1.8c | Add `compact?: boolean` prop — tighter layout for dashboard grids |
| 1.8d | Trend badge: animate in with slide-from-right |

### 1.9 Toast (`src/components/ui/Toast.tsx`)

| Sub-task | Change |
|----------|--------|
| 1.9a | Add swipe-to-dismiss gesture (GestureDetector pan) |
| 1.9b | Add `action?: { label: string; onPress: () => void }` for inline action button ("Undo") |
| 1.9c | Dark mode: ensure bg/border use theme tokens, not hardcoded light colors |
| 1.9d | Add progress-bar countdown (thin line at bottom of toast depleting over `duration`) |

---

## Layer 2 — New Components (Missing Primitives)

These are critical missing pieces that screens currently hack around.

### 2.1 `NavigationBar` — `src/components/ui/NavigationBar.tsx` 🔴 Critical

App-level top navigation header used by **all** main screens.

```
Props:
  title: string
  subtitle?: string
  onBack?: () => void
  rightActions?: Array<{ icon: string; onPress: () => void; badge?: number }>
  transparent?: boolean        → BlurView backdrop when over content
  largeTitle?: boolean         → iOS-style large title that collapses on scroll
  scrollY?: Animated.Value     → drives title collapse animation
```

### 2.2 `IconButton` — `src/components/ui/IconButton.tsx` 🔴 Critical

Standalone icon-only button. Currently screens use `TouchableOpacity` + manual styling.

```
Props:
  icon: keyof Ionicons.glyphMap
  onPress: () => void
  variant?: 'ghost' | 'filled' | 'outline' | 'tinted'
  size?: 'sm' | 'md' | 'lg'
  color?: string
  badge?: number               → notification dot
  disabled?: boolean
```

### 2.3 `Divider` — `src/components/ui/Divider.tsx` 🟡 High

Horizontal / vertical separator with optional center label.

```
Props:
  orientation?: 'horizontal' | 'vertical'
  label?: string               → "or" in centered text
  color?: string
  spacing?: 'sm' | 'md' | 'lg'
```

### 2.4 `Avatar` — `src/components/ui/Avatar.tsx` 🟡 High

User / exercise / gym avatar with fallback initials and online indicator.

```
Props:
  source?: { uri: string }
  name?: string                → for initials fallback
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  ring?: boolean               → colored ring border
  status?: 'online' | 'offline' | 'away'
  shape?: 'circle' | 'rounded'
```

### 2.5 `Chip` — `src/components/ui/Chip.tsx` 🟡 High

Compact tag/category pill. Used in exercise filters, muscle group tags, etc.

```
Props:
  label: string
  selected?: boolean
  onPress?: () => void
  closable?: boolean           → X button to remove
  icon?: keyof Ionicons.glyphMap
  variant?: 'filled' | 'outline' | 'ghost'
```

### 2.6 `ListItem` — `src/components/ui/ListItem.tsx` 🟡 High

Standardized list row. Replaces ad-hoc `TouchableOpacity` rows in settings, exercise lists.

```
Props:
  title: string
  subtitle?: string
  left?: ReactNode             → avatar, icon
  right?: ReactNode            → chevron, toggle, badge
  onPress?: () => void
  destructive?: boolean
  divider?: boolean
```

### 2.7 `EmptyState` upgrade — `src/components/common/EmptyState.tsx` 🟡 High

Upgrade existing stub to premium illustrated empty state.

```
Props (additions):
  illustration?: ReactNode     → Lottie or SVG
  gradient?: boolean           → gradient title
  primaryAction?: { label, onPress }
  secondaryAction?: { label, onPress }
```

### 2.8 `GradientText` — `src/components/ui/GradientText.tsx` 🟠 Medium

Masked gradient text (SVG-based for RN).

```
Props:
  children: string
  colors: string[]
  style?: TextStyle
```

### 2.9 `AnimatedCounter` — `src/components/ui/AnimatedCounter.tsx` 🟠 Medium

Proper Reanimated count-up/down extracted from StatCard into its own primitive.

### 2.10 `SwipeableRow` — `src/components/ui/SwipeableRow.tsx` 🟠 Medium

Swipe-left to reveal delete / edit actions. Used in workout history, template lists.

```
Props:
  children: ReactNode
  rightActions: Array<{ icon, label, color, onPress }>
```

### 2.11 `BottomSheet` upgrade — `src/components/ui/AppBottomSheet.tsx` 🟠 Medium

Already using `@gorhom/bottom-sheet` — add:
- `handleIndicator` custom styling
- Backdrop with blur
- Snap-aware content padding

---

## Layer 3 — Screen-by-Screen Upgrades

> **Rule:** Only change visual layer — no business logic changes, no API changes.

### Priority A — Entry & Auth

| Screen | Key Changes |
|--------|-------------|
| **WelcomeScreen** | Full-bleed gradient hero, animated logo, shimmer CTA buttons |
| **LoginScreen** | Replace manual `TextInput` containers with `Input` component, upgrade layout to use `NavigationBar`, add social login divider, glass card container |
| **RegisterScreen** | Same as Login — unify with `Input` component, step-based form animation |
| **ForgotPasswordScreen** | Centered card layout, illustration at top |

### Priority B — Dashboard & Home

| Screen | Key Changes |
|--------|-------------|
| **HomeDashboardScreen** | Replace raw `TouchableOpacity` cards → `Card` component, upgrade StatCards to use new `compact` prop, `NavigationBar` at top with large title, add greeting with time-of-day personalization, upgrade activity heatmap with polished colors |
| **HomeScreen** | Likely a redirect/wrapper — audit and clean up |
| **NotificationsScreen** | Use `ListItem` for each notification row, add swipe-to-dismiss |

### Priority C — Workout Hub & Flows

| Screen | Key Changes |
|--------|-------------|
| **WorkoutHubScreen** | Replace inline `TouchableOpacity` rows → `Card` + `ListItem`, add section headers with `Divider`, upgrade heatmap, proper `NavigationBar` |
| **RoutineListScreen** | `ListItem` rows, swipeable delete, empty state upgrade |
| **RoutineDetailScreen** | `Card` for exercise groups, `Chip` badges for muscle groups |
| **RoutineEditorScreen** | `Input` upgrade, `IconButton` for add/remove actions |
| **TemplateListScreen** | `Card` grid layout, `Badge` for difficulty, empty state |
| **TemplateEditorScreen** | Same as RoutineEditor — `Input`, `IconButton`, `Chip` |
| **WorkoutHistoryScreen** | `ListItem` rows, `DateRangePicker` polish, `EmptyState` upgrade |
| **WorkoutSummaryScreen** | Full-screen celebration layout, `StatCard` grid, gradient header |
| **ActiveWorkoutScreen** | `NavigationBar` with live timer, set completion with spring checkmark, rest timer upgrade |
| **SessionInsightsScreen** | `StatCard` grid, sparkline charts |
| **ExercisePickerScreen** | `Chip` for filter tags, `ListItem` rows, `NavigationBar` with search |
| **ExerciseDetailScreen** | Premium media header, `Badge` for muscles/equipment, `StatCard` for PRs |
| **ExerciseFilterScreen** | `Chip` multi-select, `Button` apply CTA |

### Priority D — AI Screens

| Screen | Key Changes |
|--------|-------------|
| **AIGeneratorScreen** | Clean card UI, progress indicator for generation, `Input` upgrade |
| **AIPreviewScreen** | Card preview layout, `Button` CTA upgrade |
| **AIPromptsScreen** | `SelectableCard` for prompt options |
| **AIRoutinePlannerScreen** | Wizard layout with `ScreenHeader`, step animation |

### Priority E — Profile & Settings

| Screen | Key Changes |
|--------|-------------|
| **Profile screens** | `Avatar` component, `ListItem` for settings rows, `Divider` sections |
| **Settings screens** | `ListItem` with toggle, `Divider` section headers, `NavigationBar` |

### Priority F — Onboarding

| Screen | Key Changes |
|--------|-------------|
| **All onboarding screens** | `SelectableCard` upgrade (spring animations), `ScreenHeader` upgrade, `Button` fullWidth CTA at bottom |

---

## Layer 4 — Global UX Patterns

These apply across the entire app as cross-cutting upgrades.

### 4.1 Loading States 🔴 Critical
- Replace all `ActivityIndicator` + `<Text>Loading...</Text>` patterns with `SkeletonLoader` placeholders
- Create screen-specific skeleton shapes (e.g., `DashboardSkeleton`, `WorkoutListSkeleton`)
- Loading state is built into `Card` via `shimmer` prop

### 4.2 Empty States 🟡 High
- Every list screen needs a proper `EmptyState` component (not just text)
- Empty states should have a relevant icon, title, description, and CTA button
- Audit all screens for missing empty states

### 4.3 Error States 🟡 High
- Create an `ErrorState` component for API error scenarios
- Inline field errors use `Input`'s error prop with shake animation
- Network errors show bottom `Toast` with retry action

### 4.4 Haptic Feedback Audit 🟠 Medium
- Every `Pressable` / interactive element should have appropriate haptic:
  - `Light` — regular taps
  - `Medium` — confirm actions, selections
  - `Success/Error` — outcome feedback
  - `Heavy` — destructive actions

### 4.5 Keyboard Avoidance 🟡 High
- Every form screen must use `KeyboardAvoidingView` + `ScrollView` with `keyboardShouldPersistTaps="handled"`
- Audit all auth and form screens

### 4.6 Pull-to-Refresh 🟠 Medium
- Standardize `RefreshControl` with `colors={[colors.primary.main]}` and `tintColor={colors.primary.main}` across all list screens

### 4.7 Scroll Performance 🟠 Medium
- Replace `ScrollView` with `FlatList` / `SectionList` where lists can be long (exercise list, workout history)
- Add `getItemLayout` for fixed-height list items

### 4.8 Safe Area 🔴 Critical
- Audit every screen — all use `useSafeAreaInsets` or `SafeAreaView` correctly
- Bottom tab bar spacing must be accounted for in scrollable content

---

## Layer 5 — Animation & Motion System

A consistent motion language across the app.

| Animation | Component/Screen | Spec |
|-----------|-----------------|------|
| **Press Scale** | All interactive elements | `scale: 0.96-0.97`, spring `(damping: 20, stiffness: 350)` |
| **Page Transition** | Navigation | Stack: `slide_from_right`; Modal: `slide_from_bottom` |
| **Stagger List** | Dashboard cards, exercise list | 50ms delay between items, `FadeInDown` |
| **Count-up** | StatCard, WorkoutSummary | 800ms `Easing.out(Easing.cubic)` |
| **Skeleton Shimmer** | All loading states | 1.5s loop, left-to-right |
| **Toast Slide** | Global toasts | Spring in from top, timing out |
| **Progress Fill** | ProgressBar, XP bar | 500ms `Easing.out(Easing.quad)` |
| **Checkmark** | Set completion, selection | Spring scale 0→1 with bounce |
| **Badge pulse** | Active/live badges | Looping scale 1→1.15→1, 1.5s |

---

## Layer 6 — Dark Mode Polish

| # | Check |
|---|-------|
| 6.1 | All screens use `useColors()` — zero hardcoded colors |
| 6.2 | Shadows in dark mode: reduce opacity (use `SHADOWS_DARK`) |
| 6.3 | `glass` Card variant: proper dark glass with `BlurView` |
| 6.4 | Status bar: `light-content` in dark mode, `dark-content` in light |
| 6.5 | Toast: dark bg tokens, not hardcoded `#ECFDF5` etc. |
| 6.6 | Input `filled` variant: correct muted bg in both modes |

---

## Implementation Order

```
Phase 1 (Foundation):     0.1 → 0.6
Phase 2 (Core Primitives): 1.1 → 1.9  (upgrade existing 9 components)
Phase 3 (New Components): 2.1 NavigationBar → 2.2 IconButton → 2.3 Divider → 2.4 Avatar → 2.5 Chip → 2.6 ListItem
Phase 4 (Patterns):       4.1 Skeletons → 4.2 EmptyStates → 4.5 Keyboard → 4.8 SafeArea
Phase 5 (Screens A→F):    Priority A → B → C → D → E → F
Phase 6 (Polish):         Layer 5 animation audit → Layer 6 dark mode audit
```

---

## Files That Will Be Touched

### Modified (surgical edits only)
- `src/constants/colors.ts` — new tokens
- `src/constants/shadows.ts` — new presets  
- `src/constants/layout.ts` — new radius values
- `src/constants/typography.ts` — new presets
- `src/components/ui/Button.tsx` — props + disabled state
- `src/components/ui/Card.tsx` — gradient + glass + shimmer
- `src/components/ui/Input.tsx` — floating label + variants
- `src/components/ui/Badge.tsx` — size + outline + pulse
- `src/components/ui/ProgressBar.tsx` — Reanimated migration + gradient
- `src/components/ui/SelectableCard.tsx` — Reanimated + spring check
- `src/components/ui/ScreenHeader.tsx` — better back button
- `src/components/ui/StatCard.tsx` — proper count-up + sparkline
- `src/components/ui/Toast.tsx` — dark mode + swipe + action
- `src/components/ui/index.ts` — export new components
- `src/components/common/EmptyState.tsx` — upgrade

### New Files
- `src/components/ui/NavigationBar.tsx`
- `src/components/ui/IconButton.tsx`
- `src/components/ui/Divider.tsx`
- `src/components/ui/Avatar.tsx`
- `src/components/ui/Chip.tsx`
- `src/components/ui/ListItem.tsx`
- `src/components/ui/GradientText.tsx`
- `src/components/ui/AnimatedCounter.tsx`
- `src/components/ui/SwipeableRow.tsx`
- `src/components/common/ErrorState.tsx`
- `src/components/common/DashboardSkeleton.tsx`
- `src/components/common/WorkoutListSkeleton.tsx`

### Screen Files (surgical edits)
- Every screen in `src/screens/` — replace inline stylings with component library, no logic changes

---

## Non-Goals (Out of Scope)
- ❌ Changing any API contracts or data fetching logic
- ❌ Changing navigation structure
- ❌ Adding new features / screens
- ❌ Touching `fitness-backend/`
- ❌ Rewriting entire screen files
