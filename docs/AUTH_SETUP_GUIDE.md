# 🔐 Authentication & Setup Guide

## ✅ What Was Fixed

### 1. **Authentication Flow** 
- ✅ Removed dev bypass in App.tsx - proper auth is now active
- ✅ Fixed `onboardingCompleted` → `isOnboardingCompleted` property name
- ✅ Proper navigation flow:
  - Not logged in → Login/Register screen
  - Logged in + not onboarded → Onboarding screens
  - Logged in + onboarded → Home Dashboard

### 2. **JWT Token Integration**
- ✅ JWT automatically attached to all API requests via interceptor
- ✅ Token refresh on 401 errors
- ✅ Automatic logout on refresh failure
- ✅ Tokens stored in AsyncStorage and hydrated on app start

### 3. **Dashboard Loading Issue**
- ✅ Replaced spinner with beautiful skeleton loader
- ✅ Added detailed logging to debug API calls
- ✅ Added retry logic (2 retries with 1s delay)
- ✅ Better error messages

### 4. **Skeleton Loader**
- ✅ Created `DashboardSkeleton` component with animated placeholders
- ✅ Matches actual dashboard layout
- ✅ Smooth fade animation

---

## 🚀 Setup for Physical Device

### Step 1: Find Your Machine's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your network adapter (e.g., `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
```
Look for `inet` address (e.g., `192.168.1.100`)

### Step 2: Update API Client

Open `fitness-app/src/api/client.ts` and update line 7:

```typescript
const DEV_MACHINE_IP = '192.168.1.100'; // ⚠️ UPDATE THIS TO YOUR MACHINE'S IP
```

### Step 3: Ensure Backend is Running

```bash
cd fitness-backend
npm run dev
```

Backend should be running on `http://localhost:3000`

### Step 4: Ensure Phone & Computer on Same WiFi

Both your development machine and physical device must be on the **same local network**.

### Step 5: Run the App

```bash
cd fitness-app
npx expo start
```

Scan the QR code with Expo Go app on your phone.

---

## 🔍 Debugging Dashboard Loading

If dashboard is stuck on loading skeleton:

### Check Console Logs

Look for these messages in Metro bundler terminal:
- ✅ `📊 Fetching dashboard stats...` - Request sent
- ✅ `✅ Dashboard stats received:` - Success
- ❌ `❌ Dashboard stats error:` - Failed (see error details)

### Common Issues & Fixes

#### 1. **Network Error / Connection Refused**
```
❌ Dashboard stats error: Network Error
```
**Fix:** 
- Verify backend is running (`npm run dev` in fitness-backend)
- Check IP address in `client.ts` matches your machine
- Ensure phone and computer on same WiFi

#### 2. **401 Unauthorized**
```
❌ Dashboard stats error: Request failed with status code 401
```
**Fix:**
- You're not logged in or token expired
- Backend `/stats/dashboard` requires authentication
- Try logging in first or check if user has valid token

#### 3. **Empty Data / New User**
If API succeeds but returns empty data, the user might not have any workouts yet. The dashboard will show the "empty state" with a welcome message.

---

## 📱 Testing the Full Flow

### Test 1: New User Registration
1. Open app → Should see Welcome screen
2. Tap "Get Started" → Register screen
3. Fill details and register
4. Verify email with OTP
5. Complete onboarding screens
6. Should land on Dashboard

### Test 2: Existing User Login
1. Open app → Should see Welcome screen
2. Tap "Login" → Login screen
3. Enter credentials
4. Should land on Dashboard (if onboarded) or Onboarding (if not)

### Test 3: Logout
1. Go to Profile tab
2. Tap Logout
3. Should return to Welcome screen

### Test 4: App Restart (Token Persistence)
1. Close app completely
2. Reopen app
3. Should go directly to Dashboard (no login needed)
4. This tests AsyncStorage token hydration

---

## 🎨 Skeleton Loader Features

The new dashboard skeleton loader:
- ✨ Animated shimmer effect (fades 0.3 → 0.7 opacity)
- 📦 Matches exact dashboard layout:
  - Header with greeting
  - Streak card
  - Start workout button
  - 2-column stats grid
  - Today's workout card
  - 4-card quick actions grid
- 🌙 Respects light/dark mode
- ⚡ Smooth 1-second animation loop

---

## 🔐 How Authentication Works

### Request Flow

```
1. User logs in → Backend returns { accessToken, refreshToken, user }
2. App stores tokens in AsyncStorage + Zustand store
3. API interceptor attaches Bearer token to all requests
4. Dashboard calls /api/v1/stats/dashboard with token
5. Backend validates token → Returns dashboard data
```

### Token Refresh Flow

```
1. API request fails with 401
2. Interceptor catches error
3. Calls /api/v1/auth/refresh with refreshToken
4. Gets new accessToken
5. Retries original request with new token
6. If refresh fails → Logout user
```

### App Hydration (Cold Start)

```
1. App starts → Shows loading spinner
2. authStore.hydrate() reads from AsyncStorage
3. If tokens exist → Set isAuthenticated = true
4. Navigate to Main tabs
5. If no tokens → Navigate to Auth stack
```

---

## 🐛 Backend Development Notes

The `/stats/dashboard` endpoint requires:
1. ✅ User must be authenticated (Bearer token)
2. ✅ Endpoint: `GET /api/v1/stats/dashboard`
3. ✅ Returns: `{ success: true, data: DashboardStatsResponse }`

If user has no data, backend should return:
```typescript
{
  success: true,
  data: {
    quickStats: {
      streakDays: 0,
      totalVolume: 0,
      activeMinutesAvg: 0,
      // ...
    },
    todaysWorkout: null,
    // ...
  }
}
```

The frontend will show empty state UI for new users.

---

## ✅ Verification Checklist

- [ ] Updated `DEV_MACHINE_IP` in `client.ts`
- [ ] Backend running on port 3000
- [ ] Phone and computer on same WiFi
- [ ] Console shows `📊 Fetching dashboard stats...`
- [ ] No network errors in console
- [ ] User can register/login
- [ ] Dashboard loads (skeleton → data or empty state)
- [ ] Logout works and returns to Welcome screen
- [ ] Reopening app skips login (token persists)

---

## 🎯 Next Steps

Once authentication is working:
1. Test with real user account
2. Create some workout data via backend
3. Verify dashboard shows real stats
4. Continue with Workout Hub implementation
5. Build Focus Mode (the highlight feature!)

---

**Need help?** Check console logs and refer to the debugging section above.
