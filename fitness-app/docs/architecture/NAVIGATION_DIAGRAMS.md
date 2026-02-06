# Navigation Architecture Diagrams

## Overview
This document visualizes the implemented navigation architecture for FitAI. The system uses a "5 Tabs + Drawer" pattern to balance accessibility with feature depth.

---

## 1. High-Level Hierarchy

### Root Structure
The application uses a customized Drawer Navigator as the root for authenticated users.

```mermaid
graph TD
    Root[RootNavigator]
    
    Root -->|Not Authenticated| Auth[AuthStack]
    Root -->|Authenticated| MainDrawer[MainDrawerNavigator]
    
    subgraph Drawer Items
    MainDrawer -->|Default| MainTabs[MainTabsNavigator]
    MainDrawer --> Analytics[AnalyticsStack]
    MainDrawer --> Coach[CoachStack]
    MainDrawer --> BodyTracking[BodyTrackingStack]
    MainDrawer --> Settings[SettingsStack]
    end
    
    subgraph Bottom Tabs
    MainTabs --> Home[HomeStack]
    MainTabs --> Workout[WorkoutNavigator]
    MainTabs --> Explore[ExploreNavigator]
    MainTabs --> Social[SocialNavigator]
    MainTabs --> Profile[ProfileNavigator]
    end

    style Root fill:#f8f9fa,stroke:#333
    style MainDrawer fill:#22b8cf,stroke:#333
    style MainTabs fill:#20c997,stroke:#333
```

---

## 2. Domain Navigators

### 📊 Analytics Navigator
**Route:** `Analytics` (via Drawer)

```mermaid
graph TD
    AH[AnalyticsHub] --> PR[Personal Records]
    AH --> SP[Strength Progression]
    AH --> VA[Volume Analytics]
    AH --> MD[Muscle Distribution]
    AH --> MH[Muscle Heatmap]
    
    style AH fill:#4CAF50
```

### 🤖 Coach Navigator
**Route:** `Coach` (via Drawer)

```mermaid
graph TD
    CH[CoachHub] --> CC[Coach Chat]
    CH --> FA[Form Analysis]
    CH --> CP[Coach Prompts]
    CH --> AIG[AI Workout Generator]
    
    style CH fill:#2196F3
```

### 📸 Body Tracking Navigator
**Route:** `BodyTracking` (via Drawer)

```mermaid
graph TD
    BTH[BodyTrackingHub] --> WT[Weight Tracker]
    BTH --> MT[Measurement Tracker]
    BTH --> PP[Progress Photos]
    
    style BTH fill:#9C27B0
```

### ⚙️ Settings Navigator
**Route:** `SettingsNavigator` (via Drawer)

```mermaid
graph TD
    Sett[SettingsScreen] --> Notif[Notifications]
    Sett --> Priv[Privacy]
    Sett --> Unit[Units]
    Sett --> Help[Help & Support]
    Sett --> About[About]
    
    style Sett fill:#607D8B
```

---

## 3. Navigation Patterns

### 3.1 Hub-and-Spoke
Every domain navigator (Analytics, Coach, Body Tracking) starts with a **Hub Screen**.
- **Hub:** Dashboard with summary cards and quick actions.
- **Spokes:** Feature screens linked from the Hub.
- **Back Action:** Always returns to the Hub.

### 3.2 Drawer Access
- **Primary:** Swipe from right edge (or tap menu icon).
- **Secondary:** "Quick Links" from `ProfileHubScreen`.
  - Tapping "Analytics" card in Profile → Navigates to `Analytics` in Drawer.

### 3.3 Modal Actions
Actions that don't change the context are presented as modals:
- `CreatePostScreen`
- `LogWeightModal`
- `FilterSettings`

---

## 4. State Management
- **Navigation State:** Managed by React Navigation (persisted automatically).
- **Data State:** 
  - `Remote Data`: React Query (shared across navigators).
  - `UI State`: Local `useState` or Zustand stores (e.g., `workoutStore`).
  - `User Session`: `authStore` (global).
