# 📱 Build Tracking - Version 1.0.6

**Date**: July 16, 2026  
**Branch**: `feat/v1_0_4`  
**Commit**: `c1efa83`

---

## 🎯 Version Information

- **Version**: 1.0.6
- **iOS Build Number**: 32
- **Android Version Code**: 10

## 📋 Changes in this Version

### 🐛 Bug Fixes

#### 1. Session Persistence ✅
- Fixed logout on app kill
- Improved auth state rehydration from AsyncStorage
- Added robust error handling in `loadStoredAuth()`
- Users now stay logged in after process kill
- File: `apps/mobile/src/store/slices/authSlice.ts`

#### 2. Welcome Bottom Sheet ✅
- Fixed inverted logic
- Now shows for non-authenticated users only
- Hidden for logged-in users
- File: `apps/mobile/src/screens/HomeScreen.tsx`

### ✨ Improvements

#### 3. Keep-Alive Polling ✅
- Mobile: Ping `/health` every 60 seconds
- Admin: Ping `/health/stats` every 60 seconds + auto-refresh
- Prevents API cold starts on free hosting
- Auto-refresh dashboard statistics
- Files: `apps/mobile/src/services/keepAliveService.ts`, `apps/admin/src/services/keepAliveService.ts`

#### 4. Subscription Synchronization ✅
- Check subscription expiration every 5 minutes
- Immediate check on app foreground
- Automatic switch to free tier when expired
- Prevents premium abuse after expiration
- File: `apps/mobile/src/services/subscriptionSyncService.ts`

#### 5. Skeleton Loading Improvements ✅
- Opacity increased to 15% (+87% visibility)
- Enhanced pulse animation (50-90% vs 30-70%)
- Added shadows for depth
- Increased heights and spacing
- Fixed "white screen" perception
- File: `apps/mobile/src/components/LoadingSkeleton.tsx`

#### 6. Documentation ✅
- All docs translated to English
- Consolidated troubleshooting in README
- Comment cleanup (removed obvious/redundant comments)
- Professional code style

## 🚀 Build Information

### iOS Build (Latest)

- **Build ID**: `85b5f69b-c614-4493-9de3-a14e37280849`
- **Build Number**: 32
- **Profile**: production
- **Auto-Submit**: ✅ Yes
- **Status**: 🔄 In Progress
- **Link**: https://expo.dev/accounts/focus-application/projects/focus-quotes-app/builds/85b5f69b-c614-4493-9de3-a14e37280849
- **Submission**: https://expo.dev/accounts/focus-application/projects/focus-quotes-app/submissions/72949530-c2bf-4c81-a122-60a0e2b2d2ee

### Android Build (Latest)

- **Build ID**: `6cc7b741-a5d4-4c5d-b7a4-63aac32d70f1`
- **Version Code**: 10
- **Profile**: production
- **Status**: 🔄 In Progress
- **Link**: https://expo.dev/accounts/focus-application/projects/focus-quotes-app/builds/6cc7b741-a5d4-4c5d-b7a4-63aac32d70f1

## ✅ Test Cases

### Test 1: Session Persistence
1. Login to the app
2. Kill the app process (swipe away from recent apps)
3. Reopen the app
4. ✅ User should remain logged in
5. Check notification permissions still work

### Test 2: Welcome Bottom Sheet
1. Install fresh app
2. Open without logging in
3. ✅ Welcome sheet should appear
4. Login with credentials
5. Close and reopen app
6. ✅ Welcome sheet should NOT appear

### Test 3: Keep-Alive System
1. Open admin dashboard
2. Wait 60 seconds
3. ✅ Stats should auto-refresh
4. Check API response time (should be <1s, not 20s)

### Test 4: Subscription Sync
1. User with expired subscription
2. Open app
3. ✅ Should automatically switch to free tier within 5 minutes
4. Check premium features are disabled

### Test 5: Skeleton Visibility
1. Fresh app install
2. Open home screen
3. ✅ Skeleton should be clearly visible (not white screen)
4. Loading should be obvious to users

## 📝 Next Steps

1. ⏳ Wait for builds to complete (~20-30 minutes)
2. 📲 Test on TestFlight (iOS) and Play Store Internal Track (Android)
3. ✅ Validate all test cases above
4. 🔍 Check admin dashboard auto-refresh
5. 🚀 Submit for review if all tests pass

## 📊 Previous Builds (v1.0.6)

### First Build Attempt
- **iOS Build**: `bfad2e48-bbde-4ac6-9d0c-5a6e94f24f16` (Build 31)
- **Android Dev**: `57e36c43-cf79-4ff0-9a0a-63bc4c9e08f2` (Version Code 9)
- **Android Prod**: `9fbf4389-e0ff-4dd1-97dc-0a0cb9c0f80b` (Version Code 9)
- **Status**: ✅ Completed - Missing keep-alive and other improvements
