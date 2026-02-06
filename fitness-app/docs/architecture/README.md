# 📚 FitAI Frontend Architecture Documentation

**Last Updated:** February 6, 2026  
**Version:** 1.0

Welcome to the FitAI frontend architecture documentation. This directory contains comprehensive technical specifications for the React Native mobile application.

---

## 📋 Document Index

### 1. [FRONTEND_HLD.md](./FRONTEND_HLD.md) - High-Level Design
**Purpose:** System architecture overview and strategic design decisions

**Contents:**
- System context and architecture diagrams
- 3-layer architecture (Presentation, Business Logic, Data)
- State management strategy (Zustand vs React Query decision matrix)
- Navigation hierarchy (92 screens across 7 navigators)
- Backend integration patterns
- Authentication & authorization flow
- Error handling strategy
- Performance optimization approach
- Offline & caching strategy
- Architecture Decision Records (ADRs)

**Target Audience:** Architects, senior developers, new team members

---

### 2. [FRONTEND_LLD.md](./FRONTEND_LLD.md) - Low-Level Design
**Purpose:** Implementation-level specifications for development

**Contents:**
- Component architecture (atoms, molecules, organisms)
- Detailed screen specifications (all 92 screens)
  - State dependencies
  - API calls
  - UI components
  - Navigation targets
- Zustand store specifications (`authStore`, `workoutStore`)
- React Query hook specifications (11 query files)
- API client implementations (14 API files)
- TypeScript type definitions
- Custom hooks documentation
- Utility functions

**Target Audience:** Frontend developers, QA engineers

---

### 3. [API_CONTRACTS.md](./API_CONTRACTS.md) - Frontend-Backend Contracts
**Purpose:** Ensure frontend-backend synchronization

**Contents:**
- Complete API endpoint inventory (81 endpoints)
- Screen-to-API mapping (which screen calls which API)
- Type contract validation (request/response alignment)
- Missing API analysis (11 missing endpoints)
- Missing screen analysis (9 unimplemented screens)
- Priority matrix for implementation
- Request/Response examples

**Target Audience:** Full-stack developers, API designers, product managers

---

## 🎯 Quick Start

### For New Developers
1. **Start here:** Read [FRONTEND_HLD.md](./FRONTEND_HLD.md) to understand the architecture
2. **Understand patterns:** Review state management strategy (Section 4)
3. **Explore screens:** Use [FRONTEND_LLD.md](./FRONTEND_LLD.md) Section 2 as reference
4. **API integration:** Check [API_CONTRACTS.md](./API_CONTRACTS.md) for endpoint details

### For Implementing Missing Screens
1. **Check requirements:** [API_CONTRACTS.md](./API_CONTRACTS.md) Section 4.2
2. **Follow patterns:** [FRONTEND_LLD.md](./FRONTEND_LLD.md) Section 2 (screen specs)
3. **Use templates:** Copy structure from similar existing screens

### For Backend Developers
1. **API contracts:** [API_CONTRACTS.md](./API_CONTRACTS.md) Section 1 (endpoint inventory)
2. **Missing endpoints:** Section 4.1 (11 missing APIs with priorities)
3. **Type validation:** Section 3 (ensure alignment)

---

## 📊 Current Status

### Implementation Progress

| Category | Planned | Implemented | Missing | Completion |
|----------|---------|-------------|---------|------------|
| **Home** | 4 | 4 | 0 | 100% ✅ |
| **Workout** | 18 | 18 | 0 | 100% ✅ |
| **Onboarding** | 11 | 11 files (no navigator) | 0 | 100%* |
| **Auth** | 8 | 8 files (2 in nav) | 6 not registered | 25% ⚠️ |
| **Explore** | 6 | 5 | 1 | 83% |
| **Social** | 12 | 11 | 1 | 92% |
| **Profile** | 33 | 26 | 7 | 79% |
| **TOTAL** | **92** | **83** | **9** | **90%** |

*Onboarding files exist but navigator not registered

### Missing Components

**9 Missing Screens:** (See [API_CONTRACTS.md](./API_CONTRACTS.md) Section 4.2)
1. `EditProfileScreen` (High priority)
2. `AchievementsScreen` (High priority)
3. `XPHistoryScreen` (Medium priority)
4. `WorkoutFrequencyScreen` (Medium priority)
5. `RecoveryStatusScreen` (Medium priority)
6. `ShareWorkoutScreen` (Medium priority)
7. `MyCustomExercisesScreen` (Low priority)
8. `TakeProgressPhotoScreen` (Low priority)
9. `CoachPromptsScreen` (Low priority)

**11 Missing Backend APIs:** (See [API_CONTRACTS.md](./API_CONTRACTS.md) Section 4.1)
- High: Avatar upload, Account deletion
- Medium: XP history, User search, Challenge endpoints
- Low: Notification preferences, Coach prompts

---

## 🏗️ Architecture Principles

### 1. **Mobile-First Design**
- Touch targets ≥44px for accessibility
- Thumb-zone optimization for CTAs
- Gesture-aware navigation (iOS swipe, Android back)

### 2. **Offline-Capable**
- Zustand persistence for workout sessions
- React Query caching for server data
- Optimistic updates (sets, likes, follows)

### 3. **Type-Safe**
- TypeScript throughout
- Strict null checks
- Navigation with typed `ParamList`

### 4. **Performance-Optimized**
- FlatList memoization
- React Query smart caching
- Native driver animations

### 5. **Platform-Respectful**
- Adaptive UI (iOS vs Android)
- Platform-specific icons
- Native navigation patterns

---

## 🔑 Key Patterns

### State Management Decision

**Use Zustand when:**
- ✅ Session/workflow state (active workout, minimized UI)
- ✅ Needs persistence (AsyncStorage)
- ✅ Synchronous access required

**Use React Query when:**
- ✅ CRUD operations
- ✅ Server data caching
- ✅ Background refresh
- ✅ Optimistic updates for server mutations

### Navigation Pattern
```typescript
// Type-safe navigation
navigation.navigate('WorkoutDetail', { workoutId: 123 });

// Nested tab navigation
navigation.navigate('WorkoutTab', { screen: 'ActiveWorkout' });
```

### API Call Pattern
```typescript
// Query (read)
const { data, isLoading } = useWorkouts();

// Mutation (write)
const { mutate } = useCreateWorkout();
mutate({ name: 'Push Day' }, {
  onSuccess: (data) => console.log('Created:', data.id),
  onError: (error) => Alert.alert('Error', error.message),
});
```

---

## 📖 Related Documentation

- **Navigation Diagrams:** `../NAVIGATION_DIAGRAMS.md`
- **Screen Inventory:** `../SCREENS_AND_NAVIGATION.md`
- **Missing Screens Analysis:** `../MISSING_SCREENS_ANALYSIS.md`
- **Backend API Routes:** `../../fitness-backend/src/routes/`
- **Backend Types:** `src/types/backend.types.ts`

---

## 🔄 Document Maintenance

**Update Frequency:** These documents should be updated when:
- New screens are added
- APIs are modified or added
- State management patterns change
- Architectural decisions are made

**Responsibility:**
- **HLD:** Senior architects (monthly review)
- **LLD:** Frontend lead (bi-weekly as screens evolve)
- **API Contracts:** Full-stack lead (weekly during active development)

---

## 📝 Contributing

When adding new features:
1. Update **LLD** with screen specifications
2. Update **API Contracts** if new endpoints are created
3. Update **HLD** only if architectural patterns change
4. Keep this README status section in sync

---

## 🎓 Learning Resources

**For Understanding FitAI Architecture:**
- Zustand Docs: https://zustand-demo.pmnd.rs/
- React Query Docs: https://tanstack.com/query/latest
- React Navigation Docs: https://reactnavigation.org/

**For Mobile Design:**
- Mobile Design Skill: `.agent/skills/mobile-design/SKILL.md`
- React Native Performance: https://reactnative.dev/docs/performance

---

**Questions?** Refer to ADRs in [FRONTEND_HLD.md](./FRONTEND_HLD.md) Appendix A for architectural decisions.
