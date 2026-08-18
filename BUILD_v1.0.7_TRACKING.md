# 📱 Build Tracking - Version 1.0.7

**Date**: August 18, 2026  
**Branch**: `feat/v1_0_7`  
**Commit**: `06da1dd`

---

## 🎯 Version Information

- **Version**: 1.0.7
- **iOS Build Number**: 33
- **Android Version Code**: 11

## 📋 Changes in this Version

### ✨ Features

#### 1. Password Reset Actually Delivers ✅

The flow existed end to end — screens, endpoints, hashed codes — but had no way
out. SMTP was never configured, and Render blocks ports 25, 465 and 587 on free
instances anyway: the symptom is not an error but a two-minute connection
timeout per message. The code was written to the logs and the app answered
"success".

- Mail now goes over Brevo's HTTP API on port 443, which no host blocks
- SMTP kept as the fallback wherever the ports are open, ignored when
  `BREVO_API_KEY` is set
- Three retries with a widening delay; no crash when nothing is configured
- `GET /health` reports `services.mail.provider` (`brevo` / `smtp` / `none`)
- Files: `apps/api/src/mail/mail.service.ts`, `apps/api/src/mail/templates.ts`

**Requires on Render**: `BREVO_API_KEY` and `MAIL_FROM` (a sender **verified**
in Brevo, otherwise the API answers `sender not valid`).

#### 2. Reset Emails and Screens Are Localized ✅
- The reset code is rendered in the language the app is running in (10 locales,
  RTL for Arabic)
- 8 of the 10 locales were missing every string on the forgot/reset screens and
  displayed raw keys (`auth.forgotPasswordTitle`) — completed
- Files: `apps/api/src/mail/templates.ts`, `apps/mobile/src/i18n/locales/*.json`

#### 3. Reset Hardening ✅
- Codes come from `crypto.randomInt`, not `Math.random`
- Three requests per address per 15 minutes (`429` beyond)
- File: `apps/api/src/auth/auth.service.ts`

### ⚡ Performance

The queries that grew with the data:

| Before | After |
|---|---|
| Profile loaded **every** liked quote to take `.length` | a `COUNT` |
| Feed loaded a user's whole like history to tick 10 rows | one query bounded to the 10 ids |
| Liking rewrote the entire collection | a single-row `INSERT` |
| Notification cron: one premium query **per user, every minute** (~1.4M/day at 1000 users) + one `ORDER BY RANDOM()` per recipient | batched |
| Client refetched **every** loaded page on returning to the feed, and again after each like | dropped; the optimistic update covers it |
| Token read from AsyncStorage and decoded per request; translation cache re-read and rewritten from disk per call (concurrent writes lost each other) | held in memory |

- Missing indexes added on `quote(topicId)` and `quote(createdAt)`
- `FlatList` window cut to 3 mounted cards instead of ~20 full-screen ones
- Files: `apps/api/src/{users,quotes,notifications}/*.service.ts`,
  `apps/api/src/migrations/1719000000000-AddQueryIndexes.ts`,
  `apps/mobile/src/api/hooks/*`, `apps/mobile/src/services/*`

## 🚀 Build Information

### iOS Build

- **Build ID**: `882a41a5-3e7b-4d66-bcec-44d777c9bd56`
- **Build Number**: 33
- **Profile**: production
- **Link**: https://expo.dev/accounts/focus-application/projects/focus-quotes-app/builds/882a41a5-3e7b-4d66-bcec-44d777c9bd56

### Android Build

- **Build ID**: `2360bebc-e388-4eea-b622-e3aa3a4da82c`
- **Version Code**: 11
- **Profile**: production
- **Link**: https://expo.dev/accounts/focus-application/projects/focus-quotes-app/builds/2360bebc-e388-4eea-b622-e3aa3a4da82c

### ⚠️ Auto-Submit Did Not Run

`eas build --auto-submit` stopped before queueing either submission:
`eas.json` points Android submission at `./google-service-account.json`, which
is not present in `apps/mobile/` (it is gitignored). Both **builds** were
already queued on EAS and were unaffected.

To submit once the builds finish:

```bash
# Android — after placing google-service-account.json in apps/mobile/
eas submit -p android --latest

# iOS
eas submit -p ios --latest
```

## ✅ Test Cases

### Test 1: Password Reset, End to End
1. Set `BREVO_API_KEY` and `MAIL_FROM` on the API service
2. `GET /health` → `services.mail.provider` should read `brevo`
3. Login screen → "Forgot password?" → enter a registered email
4. ✅ A 6-digit code arrives within seconds
5. Enter the code and a new password
6. ✅ Login succeeds with the new password

### Test 2: Reset in Another Language
1. Switch the app language to Spanish, German, Arabic…
2. Request a reset code
3. ✅ Both screens read in that language (no `auth.` keys visible)
4. ✅ The email itself is in that language

### Test 3: Reset Rate Limit
1. Request a code four times in a row for the same address
2. ✅ The fourth answers "too many requests" rather than sending

### Test 4: Feed Performance
1. Open the app, scroll through several pages of quotes
2. Leave to Topics or Profile, come back
3. ✅ The feed does not reload from scratch
4. Like a quote
5. ✅ The heart fills instantly and the list does not reload

### Test 5: Favorites Stay Consistent
1. Like several quotes on the home feed
2. Open Favorites
3. ✅ They are all there, newest first
4. Unlike one from Favorites, return to the feed
5. ✅ The card reflects it

## 📝 Next Steps

1. ⏳ Wait for builds to complete (~20-30 minutes)
2. 🔑 Set `BREVO_API_KEY` / `MAIL_FROM` on Render — without them the reset code
   is only logged
3. 📤 Run the two `eas submit` commands above
4. 📲 Test on TestFlight (iOS) and Play Store Internal Track (Android)
