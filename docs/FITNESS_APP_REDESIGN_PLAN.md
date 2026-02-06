# Fitness App Complete Redesign Plan

## Executive Summary

This document outlines the comprehensive redesign plan for the fitness application, focusing on creating a clear distinction between **Workouts** (actual exercise sessions) and **Templates** (previously called "routines"), improving UX/UI across all screens, and ensuring full functionality.

---

## 🎯 Core Terminology & Concepts

### Understanding the Hierarchy (CRITICAL - Like Strong/Hevy Apps)

**TEMPLATE (Backend: Routine)**
- A multi-day workout program/plan
- Contains multiple workouts across different days
- Think "PPL 6-Day Split", "Upper/Lower 4-Day", "Full Body 3-Day"
- Can be reused/followed week after week
- Can be user-created or from public library
- Contains: Name, description, goal, difficulty, schedule (which days to train)
- Examples: "nSuns 5/3/1 LP", "Reddit PPL", "Starting Strength"

**↓ Contains (organized by day)**

**WORKOUT (Single Day)**
- **THIS IS KEY:** A workout is ONE day's worth of exercises
- NOT a logged session - it's a plan/list of exercises for a single training day
- In backend: Part of a Routine with dayOfWeek (0-6)
- Examples: "Push Day", "Pull Day", "Leg Day", "Upper Body", "Full Body"
- Contains: List of exercises with target sets/reps/weight

**↓ Contains**

**EXERCISES IN WORKOUT**
- Individual exercises in that day's workout
- With target sets, reps, weights, rest periods
- Example: Bench Press 4×8-12, Incline DB Press 3×10-15, etc.
- Can have superset grouping

**↓ When you perform it**

**WORKOUT SESSION (Backend: Workout model)**
- An actual training session that the user is logging/has logged
- Status: in_progress, completed, or cancelled
- Can be created:
  - From a template workout (inherits exercises)
  - From scratch (empty session, add exercises as you go)
  - By repeating a previous session
- Contains: Actual logged sets, duration, volume, RPE, date/time
- Examples: "Push Day - Jan 22, 2026", "Leg Session - Morning"

**↓ Contains**

**LOGGED SETS**
- Individual sets logged during the session
- Records: Weight, reps, RPE, RIR, set type (warmup/working/drop)
- This is the actual performance data

### Visual Hierarchy:
```
TEMPLATE (Program)
├── Workout Day 1 (e.g., Push)
│   ├── Exercise 1: Bench Press (4×8-12)
│   ├── Exercise 2: OHP (3×10)
│   └── Exercise 3: Tricep Dips (3×12-15)
├── Workout Day 2 (e.g., Pull)
│   ├── Exercise 1: Deadlift (4×5)
│   └── Exercise 2: Pull-ups (3×AMRAP)
└── Workout Day 3 (e.g., Legs)
    ├── Exercise 1: Squat (5×5)
    └── Exercise 2: Leg Press (4×12)

When user performs "Push Day":
↓
WORKOUT SESSION (Jan 22, 2026 - 10:30 AM)
├── Bench Press
│   ├── Set 1: 135 lbs × 12 reps
│   ├── Set 2: 155 lbs × 10 reps
│   └── Set 3: 165 lbs × 8 reps (PR!)
└── OHP
    ├── Set 1: 95 lbs × 10 reps
    └── ...
```

---

## 📱 Screen-by-Screen Design Plan

### 1. 🏠 HOME/DASHBOARD SCREEN (Priority: CRITICAL)

#### Current Issues:
- Empty placeholder with no content
- Not utilizing backend dashboard endpoint

#### Backend Data Available:
```typescript
{
  streak: { current: number, best: number },
  weeklyVolume: number,
  recentWorkouts: Array<{
    id, name, date, volume, prCount
  }>,
  recoveryStatus: {...},
  // All from /api/v1/stats/dashboard
}
```

#### Redesigned Components:

1. **Hero Section** (Top)
   - Current Streak badge with fire emoji
   - Quick "Start Workout" button (large, prominent)
   - "Continue Workout" if there's an active session

2. **Stats Cards Row** (Horizontal scroll)
   - Weekly Volume: `52.4k kg ↑12%`
   - Total Workouts: `24 this month`
   - Best Streak: `18 days 🔥`
   - Recovery Score: Green/Yellow/Red indicator

3. **Recent Workouts Section**
   - Last 3-5 completed workouts
   - Each card shows:
     - Workout name + emoji
     - Date (relative: "2 days ago")
     - Duration + Volume
     - PR count badge if > 0
   - Tap to view details
   - "View All History" link

4. **Quick Actions Section**
   - "Browse Templates" → Navigate to template library
   - "My Templates" → User's saved templates
   - "Exercise Library" → Browse all exercises
   - "View Progress" → Stats screen

5. **Upcoming/Suggested Section** (Future Enhancement)
   - AI-suggested next workout based on history
   - Scheduled templates for the day

#### Navigation:
- From "Start Workout" → Start New Workout Modal
- From "Continue" → ActiveWorkoutScreen
- From Recent Workout card → WorkoutDetailScreen
- From Templates → TemplateListScreen

---

### 2. 💪 WORKOUT HUB SCREEN (Workout Tab Main Screen) - REDESIGNED

#### Purpose: Central hub with easy access to ALL workout/template features and stats

#### Layout:

1. **Active Session Banner** (If workout in progress)
   - Current session name
   - Running timer (MM:SS)
   - Exercise count (e.g., "3 of 6 exercises")
   - "Resume Workout" button (large, prominent)
   - Swipe gesture to cancel with confirmation

2. **Stats Overview Card** (From Backend)
   - Weekly stats from dashboard endpoint
   - Display: Total workouts this week, Weekly volume, Current streak
   - Quick visual (progress bars, numbers)
   - Tap to go to full Stats screen

3. **Quick Action Grid** (2×2 or 3 columns)
   - **"Start Empty Session"** - Start logging from scratch
   - **"Start from Template"** - Pick template → pick day → start session
   - **"Create Workout Plan"** - Build a single-day workout
   - **"Create Template"** - Build multi-day program
   - **"Exercise Library"** - Browse all exercises
   - **"Quick Stats"** - View progress/PRs

4. **Navigation Links Section** (List with icons)
   
   **My Library:**
   - → **Workout History** (All logged sessions)
   - → **My Templates** (Multi-day programs I created/saved)
   - → **My Workouts** (Single-day workout plans I created)
   
   **Discover:**
   - → **Public Templates** (Community multi-day programs)
   - → **Public Workouts** (Community single-day workouts)
   
   **Other:**
   - → **Exercise Library** (Browse all exercises)
   - → **Stats & Progress** (Detailed analytics)

5. **Recent Activity Section** (Below links)
   - Last 3-5 completed sessions
   - Each card shows:
     - Session name + template/workout badge (if from one)
     - Date (relative: "2 days ago")
     - Duration + Volume
     - Exercise count
     - PR badges (if any)
   - "View All History" button at bottom

6. **Suggested Templates** (If user has none or few)
   - Horizontal scroll of featured templates
   - "Check out these popular programs"
   - Direct link to public template library

#### Why This Design:
- **Easy Access**: Everything is 1-2 taps away
- **Backend Integration**: Shows data from dashboard endpoint
- **Clear Organization**: My stuff vs Public stuff
- **Quick Start**: Multiple ways to start working out
- **Discovery**: Encourages exploring templates/workouts

---

### 3. 🏋️ ACTIVE WORKOUT SCREEN - ⭐ HIGHLIGHT OF THE APP (Immersive Mode)

#### THIS IS THE MOST IMPORTANT SCREEN - Full-Screen Exercise Focus

#### Two Modes:

---

#### MODE 1: Overview Mode (Initial State)

When user first starts workout session:

1. **Header**
   - Session name (editable inline)
   - Running timer (MM:SS)
   - "Switch to Focus Mode" toggle
   - Menu (Finish, Cancel, Settings)

2. **Exercise List** (Collapsible Cards)
   - All exercises in workout shown as cards
   - Each card collapsed by default:
     - Exercise name
     - Target sets/reps
     - Checkmark when all sets complete
     - Progress indicator (e.g., "2/4 sets")
   
   - **Tap to expand current exercise:**
     - Shows all logged sets
     - Quick "Add Set" button
     - Weight/Reps inputs
     - RPE/RIR optional fields
     - Rest timer auto-starts after logging
     - Notes section
   
   - Reorder exercises (drag handle)
   - "Add Exercise" button at bottom

3. **Bottom Bar**
   - Total time elapsed
   - Total volume so far
   - "Finish Workout" button

---

#### MODE 2: Focus Mode 🎯 (HIGHLIGHT FEATURE - Full Screen Immersive)

**What makes this special:** ONE exercise occupies entire screen at a time

1. **Full-Screen Exercise Card**
   - **Header Section:**
     - Exercise name (large, bold)
     - Muscle group badges
     - Exercise # / Total (e.g., "3 of 6")
   
   - **Exercise Details Section:**
     - Target: "4 × 8-12 reps @ 75% 1RM"
     - Rest period: "90 seconds"
     - Tempo: "3-1-1" (if specified)
     - Notes/Instructions (if any)
     - Previous best (if available)
   
   - **Sets Display** (Center, Large):
     - All sets for current exercise
     - Grid or list layout
     - Each set shows:
       - Set number
       - Weight input (large, easy to tap)
       - Reps input (large, easy to tap)
       - RPE slider (optional, expandable)
       - Checkmark when logged
       - Edit/Delete options
     - Visual: Completed sets have ✓, Current set highlighted
   
   - **Quick Actions:**
     - "Add Set" (prominent button)
     - "Copy Last Set" (auto-fills weight/reps)
     - "Rest Timer" (auto-starts after logging, shows countdown)
   
   - **Navigation Bar** (Bottom):
     - **← Previous Exercise** (left side)
     - **Center Info:**
       - Current exercise indicator dots
       - Time elapsed
       - "Overview" button (exit focus mode)
     - **Next Exercise →** (right side)
     - **Skip Exercise** (swipe up gesture or button)
   
   - **Swipe Gestures:**
     - Swipe left/right: Navigate between exercises
     - Swipe up: Skip current exercise
     - Swipe down: Exit focus mode

2. **Rest Timer Overlay** (When active)
   - Fullscreen overlay with blur background
   - Large countdown timer
   - Next exercise preview
   - "Skip Rest" button
   - "Add 15s / 30s" buttons
   - Auto-dismisses when timer ends

3. **Finish Workout Modal** (When done)
   - Summary stats:
     - Duration
     - Total volume
     - Total sets/reps
     - PRs achieved (if any)
     - Exercises completed
   - "Add Notes" section
   - Energy/Sleep/Stress sliders (optional)
   - "Save Workout" button
   - "Discard" option

#### Why Focus Mode is Special:
- **Minimizes distractions**: Only current exercise visible
- **Large touch targets**: Easy to input weight/reps
- **Smooth navigation**: Swipe between exercises
- **Immersive**: Full-screen, no clutter
- **Motivating**: Clear progress, one exercise at a time
- **Efficient**: Quick set logging, auto-rest timer

#### Backend Data Used (From Workout Schema):
```typescript
// From WorkoutExercise:
- exercise.name
- exercise.muscleGroup
- exercise.instructions
- exercise.defaultSets
- exercise.defaultReps
- notes
- targetSets (if from template)
- targetReps (if from template)

// From WorkoutSet:
- weight
- reps
- rpe
- rir
- setType (warmup/working/drop/failure)
- tempoEccentric, tempoPause, tempoConcentric
- restTaken
- completed
```

---

### 4. 📝 WORKOUT SESSION DETAIL SCREEN (View Completed Session)

#### Purpose: Review a past logged workout session

#### Layout:

1. **Header Section**
   - Session name
   - Template/Workout badge (if created from one)
   - Date performed (formatted: "Jan 22, 2026 at 10:30 AM")
   - Duration
   - Total volume
   - PR count with celebration animation if > 0

2. **Stats Grid**
   - Total Sets
   - Total Reps  
   - Average RPE (if logged)
   - Energy Level (if logged)
   - Sleep Quality (if logged)
   - Stress Level (if logged)

3. **Exercise Breakdown**
   - Each exercise with:
     - Exercise name + muscle group
     - All sets with weight/reps
     - Volume per exercise
     - PR indicators on specific sets (🏆 badge)
     - Set type badges (warmup/working/drop)
     - Notes if any

4. **Session Notes**
   - User's workout notes
   - Editable after completion

5. **Actions**
   - "Repeat This Session" → Start new session with same exercises
   - "Share" → Export/share workout
   - Delete option (with confirmation)

---

### 5. 📋 WORKOUT PLAN SCREEN (Single-Day Workout)

#### Purpose: View a reusable single-day workout plan (not a logged session)

#### Layout:

1. **Header**
   - Workout name (e.g., "My Push Day", "Upper Body Power")
   - Created by (if public)
   - Tags: Goal, Difficulty, Duration estimate

2. **Stats**
   - Total exercises
   - Estimated duration
   - Times performed (usage count)
   - Last used date

3. **Exercise List**
   - Each exercise card:
     - Order number
     - Exercise name
     - Muscle group badge
     - Target: "4 × 8-12 reps"
     - Rest period: "90s"
     - Superset indicator (if applicable)
     - Notes/cues
   - Tap to view exercise details

4. **Bottom Actions**
   - **"Start Session"** (primary - creates workout session from this plan)
   - "Edit" (if user owns it)
   - "Duplicate" (if public)
   - "Delete" (if user owns it)
   - "Add to Template" (add this workout day to a template)

---

### 6. 🎯 MY WORKOUT PLANS SCREEN

#### Purpose: Browse user's saved single-day workout plans

#### Layout:

1. **Header**
   - "My Workout Plans" title
   - "+ Create New" button
   - Search icon

2. **View Toggle**
   - Grid (2 columns)
   - List (detailed)

3. **Filter Chips**
   - All
   - By Focus (Push/Pull/Legs/Upper/Lower/Full Body)
   - By Goal
   - By Duration
   - Favorites ⭐

4. **Workout Plan Cards**
   - Workout name
   - Focus badge (e.g., "Push", "Pull", "Legs")
   - Exercise count
   - Duration estimate
   - Times performed
   - Last used
   - Quick actions menu (Edit, Duplicate, Delete)

5. **Empty State**
   - "Create your first workout plan"
   - "Or start from template"

---

### 7. 🌍 PUBLIC WORKOUT PLANS LIBRARY

#### Purpose: Discover community single-day workouts

#### Can Reuse Components from Templates Library

#### Layout:

1. **Header**
   - "Discover Workout Plans"
   - Filter + Search

2. **Filters**
   - Focus (Push/Pull/Legs/Upper/Lower/Full Body/Other)
   - Goal (Strength/Hypertrophy/Endurance)
   - Difficulty
   - Duration (< 30min, 30-60min, > 60min)

3. **Workout Cards**
   - Workout name
   - Creator (username + avatar)
   - Focus badge
   - Exercise count + duration
   - Likes ❤️
   - Times copied
   - Preview: "Bench, OHP, Flyes +3 more"

4. **Actions**
   - Tap → View details
   - "Add to My Workouts" button
   - Like/Share

---ROUTINE DETAIL SCREEN (View Routine/Program)

#### Current Issues:
- Using mock images (unsplash URLs)
- Poor layout and confusing UX
- Not showing multi-day structure properly

#### Redesigned Layout:

1. **Header Section**
   - Routine name (bold, large)
   - Created by (username/avatar if public)
   - Tags: Difficulty, Goal, Split Type
   - Public/Private indicator

2. **Stats Row**
   - Days per week (e.g., "6-Day Split")
   - Total exercises
   - Estimated duration per session
   - Last used (if applicable)
   - Times completed (if user owns it)

3. **Day Selector / Week View**
   - Horizontal tabs or chips: Mon, Tue, Wed, Thu, Fri, Sat, Sun
   - Shows which days are active in the split
   - Visual indicators (e.g., "Push", "Pull", "Legs", "Rest")
   - Tap a day to view that day's exercises

4. **Exercise List (For Selected Day)**
   - Each exercise card shows:
     - Order number (1, 2, 3...)
     - Exercise name
     - Muscle group badge
     - Target: "4 × 8-12 reps" or "3 × 10 reps @ 70% 1RM"
     - Rest period (e.g., "90s rest")
     - Superset indicator if grouped
     - Notes/instructions (if any)
     - **NO IMAGES** (use muscle group icons instead)
   - Tap to view exercise details
   - Reorder ability if user owns routine

5. **Bottom Action Bar**
   - **"Start [Day Name] Workout"** (primary action - creates workout from selected day)
   - "Edit Routine" (if user owns it)
   - "Duplicate to My Routines" (if public routine)
   - "DeleROUTINE BUILDER/EDITOR SCREEN

#### Purpose: Create or edit a workout routine (program)

#### Features:

1. **Header**
   - Routine name input (large, prominent)
   - "Save" button (always visible)
   - Back with unsaved changes warning

2. **Routine Settings Section** (Top, can collapse after filling)
   - Description (text area)
   - Goal (picker: muscle_gain, strength, fat_loss, etc.)
   - Difficulty (segmented: beginner/intermediate/advanced)
   - Split type (picker: PPL, Upper/Lower, Full Body, Bro Split, Custom)
   - Days per week (number: 1-7)
   - Schedule (checkboxes: M T W T F S S)
   - Estimated duration per session (number input)
   - Public/Private toggle

3. **Day Selector Tabs**
   - Shows tabs for selected training days
   - Example: If 6-day PPL → Mon, Tue, Wed, Thu, Fri, Sat
   - Can assign labels: "Push", "Pull", "Legs", "Upper", "Lower", etc.
   - Currently editing day highlighted

4. **Exercise List (For Selected Day)**
   - Empty state: "Add exercises to [Day Name]"
   - "+ Add Exercise" button (prominent, floating)
   - Each added exercise shows:
     - Drag handle for reordering
     - Exercise name + muscle group badge
     - Target sets input (number)
     - Target reps input (min-max or single value)
     - Optional: Target weight, RPE
     - Rest period input (seconds)
     - Superset group (dropdown: None, A, B, C...)
     - Notes field (collapsible)
     - Delete button

5. **Exercise Picker Modal** (Opens when adding)
   - Search bar (real-time)
   - Filter chips: Muscle Group, Equipment, Difficulty
   - Recently used section
   - Favorites section
   - All exercises (paginated list)
   - "+ Create Custom Exercise" at bottom

6. **Save & Validation**
   - Validation: Name required, at least 1 day with exercises
   - Auto-save draft option
   - Success confirmation with options:
     - "Start a Workout"
     - "View Routine"
     - "Back to Routines
5. **Save Logic**
   - Validation: Name required, at least 1 exercise
   - Auto-save draft
   - Success confirmation with options:
     - "Start Workout Now"
     - "View Template"
     - "Create Another"

---

### 7. 📚 EXERCISE LIBRARY SCREEN

#### Purpose: Browse all available exercises

#### Layout:

1. **Search Bar** (Persistent at top)
   - Real-time search by name

2. **Filter Bar** (Horizontal scroll chips)
   - Muscle Group (Chest, Back, Legs, etc.)
   - Equipment (Barbell, Dumbbell, Bodyweight, etc.)
   - Difficulty
   - Exercise Type (Compound/Isolation)

3. **Exercise Grid/List**
   - Each exercise card:
     - Exercise name
     - Muscle group badge
     - Equipment icons
     - Difficulty indicator
     - Favorite star (toggleable)
     - Has video/gif indicator
   - Tap to view details

4. **Exercise Detail Modal** (Opens on tap)
   - Exercise name
   - Primary/secondary muscle groups
   - Equipment needed
   - Instructions (step-by-step)
   - Video/GIF demonstration (if available)
   - Common mistakes section
   - Alternative exercises
   - "Add to Workout" button (if workout in progress)
   - "Add to Template" option

5. **Floating Action Button**
   - "+ Create Custom Exercise"

---

### 13. 📊 WORKOUT HISTORY SCREEN

#### Purpose: Browse all logged workout sessions

#### Current Status: Has mock data, needs API integration

#### Features:

1. **Header Stats** (Summary cards from backend)
   - Total sessions this week/month
   - Total volume this week
   - Current streak
   - Average duration

2. **Filters & Search**
   - Date range picker
   - Search by session name
   - Filter by status (completed/cancelled)
   - Filter by template/workout source
   - Sort by date/volume/duration

3. **Session List**
   - Grouped by month/week with section headers
   - Section headers show month totals
   - Each session card:
     - Session name
     - Template/Workout badge (if from one)
     - Date + time
     - Duration + volume
     - Exercise preview (top 2-3 exercises)
     - PR badge count (if any)
     - Quick actions menu (View, Repeat, Delete)
   - Infinite scroll/pagination
   - Pull to refresh

4. **Empty State**
   - Encouraging message
   - "Start Your First Session" CTA

---

### 14. 📚 EXERCISE LIBRARY SCREEN

#### Purpose: Browse all available exercises

#### Layout:

1. **Search Bar** (Persistent at top)
   - Real-time search by exercise name

2. **Filter Bar** (Horizontal scroll chips)
   - Muscle Group (Chest, Back, Legs, Shoulders, Arms, Core, etc.)
   - Equipment (Barbell, Dumbbell, Bodyweight, Cables, Machines, etc.)
   - Difficulty (Beginner/Intermediate/Advanced)
   - Exercise Type (Compound/Isolation)

3. **Exercise Grid/List**
   - Each exercise card:
     - Exercise name
     - Muscle group badge
     - Equipment icons
     - Difficulty indicator
     - Favorite star (toggleable)
     - Has video/gif indicator
   - Tap to view details

4. **Exercise Detail Modal** (Opens on tap)
   - Exercise name
   - Primary/secondary muscle groups
   - Equipment needed
   - Instructions (step-by-step)
   - Video/GIF demonstration (if available)
   - Common mistakes section
   - Alternative exercises
   - "Add to Current Session" button (if session in progress)
   - "Add to Workout Plan" option
   - "Add to Template" option

5. **Floating Action Button**
   - "+ Create Custom Exercise"

---

#### Current Issues:
- Mock data with hardcoded images
- Limited functionality
- Poor search/filter
- Confusing terminology

#### Redesigned Features:

1. **Header**
   - "My Routines" title
   - "+ Create New Routine" button
   - Search icon

2. **View Toggle**
   - Grid view (2 columns)
   - List view (detailed)

3. **Filter Chips** (Horizontal scroll)
   - All
   - By Goal (Strength, Hypertrophy, Fat Loss, etc.)
   - By Split Type (PPL, Upper/Lower, Full Body, etc.)
   - By Difficulty (Beginner/Intermediate/Advanced)
   - By Days (3-day, 4-day, 5-day, 6-day)
   - Favorites ⭐

4. **Routine Grid/List**
   - Each routine card:
     - Routine name
     - Split type badge (e.g., "PPL", "Upper/Lower")
     - Days per week (e.g., "6 Days/Week")
     - Goal + difficulty badges
     - Total exercises across all days
     - Last used (relative date)
     - Times completed (workout count from this routine)
     - Favorite star toggle
     - 3-dot menu (Edit, Duplicate, Delete, Share)
   - Long press for bulk actions

5. **Empty State**
   - Illustration
   - "Create your first routine"
   - "Or browse Discover tab for ready-made programs"

6. **Actions**
   - Tap card → Routine Detail Screen
   - Quick DISCOVER ROUTINES SCREEN (Public Library)

#### Purpose: Discover community-created workout programs

#### Layout:

1. **Header**
   - "Discover Routines" title
   - Filter icon (opens filter modal)
   - Search icon

2. **Featured Section** (Top carousel/horizontal scroll)
   - Editor's picks
   - Trending routines
   - Popular programs
   - Auto-scroll or swipeable cards

3. **Quick Filters** (Chips below search)
   - All
   - Beginner Friendly
   - PPL Programs
   - 3-Day Split
   - 5-Day Split
   - Strength Focus
   - Hypertrophy Focus

4. **Advanced Filter Modal** (Opens from filter icon)
   - Goal (multi-select: muscle_gain, strength, fat_loss, endurance, athletic)
   - Difficulty (checkboxes: beginner, intermediate, advanced)
   - Split type (checkboxes: PPL, Upper/Lower, Full Body, Bro Split, Custom)
   - Days per week (slider: 1-7)
   - Sort by (dropdown: Popular, Recent, Most Copied, Highest Rated)

5. **Routine Grid/List**
   - Each public routine card:
     - Routine name
     - Creator info (username + verified badge if trainer)
     - Profile avatar (small)
     - Split type badge
     - Days per week badge
     - Goal + difficulty badges
     - Like count ❤️ (e.g., "1.2k")
     - Copied count 📋 (e.g., "453 users")
     - Total exercises
     - Preview: "Bench, Squat, Deadlift +9 more"
   - Tap to view full routine details

6. **Routine Detail Actions** (In detail view)
   - **"Add to My Routines"** → Duplicate/copy to user's routines
   - "Preview Schedule" → View all days without saving
   - "Like" toggle ❤️
   - "Share" → Share link
   - "Report" option (if inappropriate)ctor
   - Split type selector
   - Days per week filter
   - Sort by: Popular, Recent, Most Used

4. **Template Grid**
   - Each public template card:
     - Template name
     - Creator info (username/avatar)
     - Goal + difficulty badges
     - Like count ❤️
     - Copied count (how many users)
     - Exercise count + duration
     - Preview of exercises
   - Tap to view details

5. **Template Detail Actions**
   - "Use This Template" → Duplicate to My Templates
   - "Preview" → View without saving
   - "Like" toggle
   - "Report" option

---

## 🎨 UI/UX Best Practices Implementation

### Design System Consistency

1. **Colors**
   - Primary action: Brand primary color
   - Destructive: Red for delete/cancel
   - Success: Green for completed/PRs
   - Warning: Yellow/orange for alerts
   - Neutral: Grays for secondary info

2. **Typography**
   - Display font: Hero sections, workout names
   - Body font: Content, descriptions
   - Mono font: Numbers (weight, reps, volume)
   - Clear hierarchy: H1 → H2 → Body → Caption

3. **Spacing**
   - Consistent padding: 16px, 24px, 32px
   - Card margins: 12px
   - Section spacing: 24px
   - Comfortable touch targets: Minia Routine

```
Home Screen
  → Tap "Start Workout"
    → Modal: "Empty Workout" or "From Routine"
      → Select "From Routine"
        → Routine Picker Modal (shows user's routines)
          → Tap Routine Card
            → If multi-day routine: "Select Day" modal (Push/Pull/Legs/etc.)
            → Tap day (e.g., "Push Day")
              → Active Workout Screen 
                (pre-loaded with that day's exercises from routine)
```

### Flow 2: Creating a Custom Routine and Using It

```
Workout Tab
  → My Routines Tab
    → "+ Create New Routine"
      → Routine Builder Screen
        → Fill in: Name, Goal, Split Type, Days per Week
        → Select training days (e.g., Mon, Wed, Fri, Sat)
        → Tap "Monday" tab
          → Tap "+ Add Exercise"
            → Exercise Picker Modal
              → Search/Filter
              → Select Exercise (e.g., "Bench Press")
            → Exercise added to Monday
          → Configure: 4 sets, 8-12 reps, 90s rest
          → Add more exercises to Monday
        → Tap "Wednesday" tab
          → Add exercises for Wednesday
        → (Repeat for all days)
        → Tap "Save"
      → Success: "Routine saved!"
        → Options: "Start a Workout", "View Routine", "Back"
          → Select "Start a Workout"
            → Day picker: "Which day? Mon/Wed/Fri/Sat"
              → Select "Monday"
                → Active Workout Screen (Monday's exercises loaded)

## 🔄 Key User Flows

### Flow 1: Starting a Session from a Template

```
Workout Hub Screen
  → Tap "Start from Template"
    → Template Picker Modal (shows user's templates)
      → Tap Template (e.g., "PPL 6-Day")
        → Day Picker: "Which day?" (Push/Pull/Legs/Rest options shown)
          → Select "Push Day"
            → Active Workout Screen - Overview Mode
              (Pre-loaded with Push Day exercises from template)
              → User can switch to Focus Mode toggle
                → Full-screen immersive exercise-by-exercise experience
              → Log sets for each exercise
              → Navigate Next/Previous with swipes
              → Finish workout
                → Workout Summary + Save
```

### Flow 2: Creating a Template from Scratch

```
Workout Hub
  → Tap "Create Template"
    → Template Builder Screen
      → Enter: Name ("My PPL Program"), Goal, Difficulty, Split Type (PPL), Days: 6
      → Select training days: Mon/Tue/Wed/Thu/Fri/Sat
      → Tap "Monday" tab (labeled "Push")
        → Tap "+ Add Exercise"
          → Exercise Picker Modal
            → Search/Filter: "Bench"
            → Select "Barbell Bench Press"
          → Exercise added to Monday
          → Set targets: 4 sets, 8-12 reps, 90s rest
        → Add more exercises (OHP, Tricep Dips, etc.)
      → Tap "Tuesday" tab (labeled "Pull")
        → Add Pull exercises (Deadlift, Rows, etc.)
      → Tap "Wednesday" tab (labeled "Legs")
        → Add Leg exercises
      → (Continue for Thu/Fri/Sat)
      → Tap "Save"
    → Success: "Template Created!"
      → Options: "Start a Session Now", "View Template", "Done"
```

### Flow 3: Creating a Single-Day Workout Plan

```
Workout Hub
  → Tap "Create Workout Plan"
    → Workout Plan Builder
      → Enter: Name ("Quick Upper Body"), Focus (Upper), Goal, Duration estimate
      → Tap "+ Add Exercise"
        → Exercise Picker
          → Select exercises (Bench, Rows, OHP, etc.)
      → Configure sets/reps for each
      → Tap "Save"
    → Saved to "My Workout Plans"
      → Can be used independently or added to a template
```

### Flow 4: Starting an Empty Session (Freestyle)

```
Workout Hub
  → Tap "Start Empty Session"
    → Active Workout Screen - Empty state
      → "Add Exercise" prominent button
      → Tap → Exercise Picker
        → Select first exercise
      → Log sets
      → Tap "Add Exercise" again
      → Continue adding/logging as you go
      → Switch to Focus Mode for immersive experience
      → Finish when done
```

### Flow 5: Immersive Focus Mode Experience (HIGHLIGHT)

```
Active Workout Screen - Overview Mode
  → User has added 6 exercises (Bench, OHP, Dips, Flyes, Lateral Raises, Tricep Extensions)
  → Toggle "Focus Mode" ON
    → Screen transitions to full-screen
    → Exercise 1 (Bench Press) occupies entire screen
      → Large exercise name at top
      → Target: "4 × 8-12 reps"
      → Previous best shown
      → Sets interface (big weight/reps inputs)
        → User logs Set 1: 135 lbs × 12 reps → Tap checkmark
        → Rest timer auto-starts (90s countdown overlay)
        → After rest: Back to exercise
        → Log Set 2: 155 lbs × 10 reps
        → Log Set 3: 165 lbs × 8 reps
        → Log Set 4: 165 lbs × 8 reps
      → Swipe left OR tap "Next Exercise →"
    → Exercise 2 (OHP) now fills screen
      → Same pattern: Log sets, rest timer, navigate
    → Continue through all exercises
    → After last exercise:
      → "Finish Workout" button prominent
      → Tap → Workout Summary Screen
        → Shows all stats, PRs achieved
        → Add notes
        → Save
```

### Flow 6: Discovering and Using a Public Template

```
Workout Hub
  → Tap "Discover Templates"
    → Public Templates Library
      → Browse featured/trending
      → Filter: "PPL", "Intermediate", "6 Days"
      → Tap "Reddit PPL 6-Day Linear Progression"
        → Template Detail Screen
          → View all 6 days (Push/Pull/Legs×2)
          → View exercises for each day
          → See: 1.2k likes, 453 users
        → Tap "Add to My Templates"
      → Copied to user's templates
    → Back to Workout Hub → My Templates
      → Template now appears
      → Tap → Template Detail
        → Tap "Start Push Day Session"
          → Active Workout with Push exercises loaded
```

---
        → Tap "+ Add Exercise"
          → Exercise Picker Modal
            → Search/Filter
            → Select Exercise
          → Back to Builder (exercise added)
        → Configure sets/reps
        → Tap "Save"
      → Template saved confirmation
        → Option: "Start Workout Now"
          → Active Workout Screen
```
✅ Start workout with/without routineId
- ✅ Add exercises, log sets, complete workout
- ⚠️ Partially implemented in WorkoutHubScreen
- **TODO**: Complete integration with all workout screens

### Routines (/api/v1/routines)
- ✅ Full CRUD endpoints exist
- ✅ Public library endpoint (`/routines/library`)
- ✅ Multi-day support via `dayOfWeek` field
- ✅ Duplicate routine endpoint
- ❌ Not properly implemented in frontend
- **TODO**: Implement routine builder with day-based organization, routine detail view, public library

### Exercises (/api/v1/exercises)
- ✅ Full browse/search/filter endpoints exist
- ✅ Muscle group, equipment, difficulty filters
- ✅ Search endpoin
        → (Optional) Set RPE/RIR
        → Tap "Log Set" ✓
      → Set saved, rest timer starts
    → Rest Timer Modal
      → Countdown
      → Tap "Skip" or wait
    → Ready for next set
```

### Flow 4: Viewing Workout History
 from backend
3. Create My Routines screen with proper multi-day display
4. Fix Routine Detail screen (remove fake images, show day-based structure)

### Phase 2: Core Workout Features & Immersive Experience (Week 2)
5. **Implement Focus Mode for Active Workout** (⭐ HIGHLIGHT - Full-screen exercise experience)
6. Implement Exercise Library screen with filters
7. Create Exercise Picker modal (reusable component)
8. Create Workout Session Detail Screen (view completed)
9. Implement Workout Plan Builder (single-day workouts)
10. Improve Active Workout Overview Mode

### Phase 3: Template System & Libraries (Week 3)
11. Implement Template Builder with multi-day support
12. Create My Templates screen
13. Create My Workout Plans screen
14. Implement Discover Templates (public library)
15. Implement Discover Workouts (public single-day workouts)
16. Add template/workout duplication functionality

### Phase 4: Polish & Integration (Week 4)
17. Implement all search/filter functionality across screens
18. Connect all Workout Hub navigation links
19. Performance optimization (list virtualization, smooth transitions)
20. Comprehensive error handling & loading states
21. Swipe gestures in Focus Mode
22. Rest timer with auto-start
23. Empty states for all screens
24. Pull-to-refresh on data screens
25. User testing & refinements based on feedback)
- ✅ Full CRUD endpoints exist
- ⚠️ Partially implemented in WorkoutHubScreen
- **TODO**: Complete integration with all workout screens

### Templates (/api/v1/routines)
- ✅ Full CRUD endpoints exist
- ✅ Public library endpoint exists
- ❌ Not properly implemented in frontend
- **TODO**: Rename "routines" to "templates" in UI, implement all features

### Exercises (/api/v1/exercises)
- ✅ Full browse/search/filter endpoints exist
- ❌ Not implemented in frontend
- **TODO**: Create exercise library screen, exercise picker modal

### Stats (/api/v1/stRoutine" (Backend) = "Routine/Program" (Frontend)
**Decision**: Keep "Routine" terminology, emphasize it's a program with multiple workout days
**Rationale**: 
- Backend uses "Routine" model - matches Strong, Hevy, JEFIT
- Routines contain exercises organized by dayOfWeek
- A workout session references a routine via routineId
- Clear hierarchy: Routine → Workout Session → Exercises → Sets
- Matches user mental model from other fitness apps

### 2. Multi-Day Routine Organization
**Decision**: Organize routine exercises by day of week (0-6)
**Rationale**:
- Backend supports `dayOfWeek` field on RoutineExercise
- Enables proper split programs (PPL, Upper/Lower, etc.)
- Users can assign specific exercises to specific days
- When starting workout from routine, user picks which day

### 3. No Random Images on Routines
**Decision**: Remove hardcoded Unsplash images
**Rationale**:
- Images don't match actual routine content
- Misleading to users
- Use split type badges, day indicators, and icons instead
- More professional and scalable

### 4. Separate Workout History from Routine Library
**Decision**: Different tabs with different purposes
**Rationale**:
- Workouts = completed training sessions (historical data)
- Routines = workout programs you follow (reusable plans)
- Mixing them causes confusion
- Industry standard (Strong, Hevy separate "Workouts" from "Routines")

### 5. Exercise Picker as Modal
**Decision**: Modal instead of full screen
**Rationale**:
- Faster interaction
- Context remains visible (can see which day you're adding to)
- Common pattern in fitness apps
- Easier to dismiss

### 6. Dashboard as Primary Landing
**Decision**: Home screen shows dashboard with actual data
**Rationale**:
- Motivational (streak, progress)
- Quick access to recent activity
- Industry standard (Strava, Strong, Hevy all do this)
- Backend already provides dashboard endpoint
- Encourages daily
## 📝 Key Decisions & Rationale

### 1. Terminology: "Template" vs "Routine"
**Decision**: Use "Template" in UI
**Rationale**: 
- Clearer distinction from actual workouts
- "Routine" implies a schedule, "Template" implies a reusable plan
- Better aligns with user mental model

### 2. No Random Images on Templates
**Decision**: Remove hardcoded Unsplash images
**Rationale**:
- Images don't match actual exercises
- Misleading to users
- Use icons, illustrations, or muscle group diagrams instead
- More professional and scalable

### 3. Separate Workout History from Template List
**Decision**: Different screens with different purposes
**Rationale**:
- Workouts = past events (historical data)
- Templates = future plans (reusable blueprints)
- Mixing them causes confusion

### 4. Exercise Picker as Modal
**Decision**: Modal instead of full screen
**Rationale**:
- Faster interaction
- Context remains visible
- Common pattern in fitness apps
- Easier to dismiss

### 5. Dashboard as Primary Landing
**Decision**: Home screen shows dashboard with actual data
**Rationale**:
- Motivational (streak, progress)
- Quick access to recent activity
- Industry standard (Strava, Strong, Hevy all do this)
- Encourages engagement

---

## 🎯 Success Metrics

1. **Usability**
   - All buttons functional
   - Clear distinction between workouts and templates
   - Intuitive navigation (max 3 taps to any feature)

2. **Performance**
   - < 2s load time for all screens
   - Smooth 60fps animations
   - Offline-first architecture

3. **User Engagement**
   - Dashboard shows personalized, motivating data
   - Easy workout logging (< 30s per set)
   - Template creation in < 5 minutes

---

## 📚 References

- Strong App (iOS) - Workout logging UX
- Hevy (iOS/Android) - Template management
- Fitbod (iOS) - Exercise library
- JEFIT - Workout tracking
- Google Fit - Dashboard design

---

## Next Steps

1. Review this plan and provide feedback
2. Begin implementation with Phase 1 (Dashboard)
3. Create reusable components (ExercisePicker, TemplateCard, etc.)
4. Set up proper API hooks and state management
5. Implement screen by screen following the priority order

---

*Last Updated: January 22, 2026*
