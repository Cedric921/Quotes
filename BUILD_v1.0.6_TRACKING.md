# 📱 Build Tracking - Version 1.0.6

**Date**: 27 juin 2026  
**Branch**: `feat/v1_0_4`  
**Commits**: `c5ea806`, `07e27e5`

---

## 🎯 Changements de cette Version

### 🐛 Bug Fixes Critiques

#### 1. **Session Persistence Fix** ✅
**Problème** : Les utilisateurs étaient déconnectés lorsqu'ils killaient l'application dans les processus.  
**Impact** : Les utilisateurs ne recevaient plus de notifications après un kill de l'app.

**Solution** :
- Amélioration de `loadStoredAuth()` avec gestion d'erreurs robuste
- Ajout de logs détaillés pour débugger AsyncStorage
- Nettoyage automatique des données corrompues si le parsing JSON échoue
- Meilleure gestion des cas d'erreur

**Fichier** : `apps/mobile/src/store/slices/authSlice.ts`

```javascript
export const loadStoredAuth = () => async (dispatch: any) => {
  try {
    console.log("[Auth] Loading stored auth from AsyncStorage...");
    const token = await AsyncStorage.getItem("@focus_auth_token");
    const userStr = await AsyncStorage.getItem("@focus_user_data");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log("[Auth] Successfully parsed user data for:", user.email);
        dispatch(setCredentials({ user, token }));
      } catch (parseError) {
        console.error("[Auth] Failed to parse user data, clearing storage:", parseError);
        // Clear corrupted data
        await AsyncStorage.removeItem("@focus_auth_token");
        await AsyncStorage.removeItem("@focus_user_data");
        dispatch(setLoading(false));
      }
    }
  } catch (error) {
    console.error("[Auth] Error loading stored auth:", error);
    dispatch(setLoading(false));
  }
};
```

---

#### 2. **Welcome Bottom Sheet Logic Fix** ✅
**Problème** : Le bottom sheet de bienvenue s'affichait pour les utilisateurs **connectés** au lieu des utilisateurs **non connectés**.  
**Impact** : UX inversée - les invités ne voyaient pas le welcome, mais les users connectés oui.

**Solution** :
- Inversion de la logique : `if (!isAuthenticated)` au lieu de `if (isAuthenticated)`
- Suppression de la vérification de souscription (les invités n'ont pas de souscription)
- Simplification de la logique

**Fichier** : `apps/mobile/src/screens/HomeScreen.tsx`

**Avant** :
```javascript
// Don't show if user is not authenticated
if (!isAuthenticated) {
  return;
}
// Don't show if user is subscribed or admin
if (isSubscribed || isAdmin) {
  return;
}
```

**Après** :
```javascript
// ONLY show if user is NOT authenticated (guest users)
if (isAuthenticated) {
  return;
}
```

---

## 📦 Builds Lancés

### iOS Production + Auto-Submit ✅

- **Build ID** : `8b18109c-485e-404c-bbf6-3bf0087f4bc7`
- **Submission ID** : `00643e56-eb5d-4a5d-86a7-254452466b7b`
- **Version** : 1.0.6
- **Build Number** : 31 (incrémenté automatiquement de 30 → 31)
- **Bundle ID** : `com.mindset.focus` + `com.mindset.focus.widget`
- **Auto-Submit** : ✅ Activé
- 🔗 **Build** : https://expo.dev/accounts/focus-application/projects/focus-quotes-app/builds/8b18109c-485e-404c-bbf6-3bf0087f4bc7
- 🔗 **Submission** : https://expo.dev/accounts/focus-application/projects/focus-quotes-app/submissions/00643e56-eb5d-4a5d-86a7-254452466b7b

---

### Android Production ✅

- **Build ID** : `9fbf4389-6107-490c-82f0-28f023ba79f4`
- **Version** : 1.0.6
- **Version Code** : 9 (incrémenté automatiquement de 8 → 9)
- **Package** : `com.mindset.focus`
- 🔗 **Build** : https://expo.dev/accounts/focus-application/projects/focus-quotes-app/builds/9fbf4389-6107-490c-82f0-28f023ba79f4

---

### Android Development ❌ ÉCHEC

**Erreur** : `Generating a new Keystore is not supported in --non-interactive mode`

**Raison** : Le profil `development` n'a pas de keystore configuré et ne peut pas être généré en mode non-interactif.

**Action** : Relancer en mode interactif si nécessaire, ou utiliser uniquement Production pour Android.

---

## 📊 Résumé Git

### Commits

1. **c5ea806** - `fix: resolve session persistence and welcome sheet bugs`
   - Fix auth logout on app kill
   - Add robust error handling
   - Fix welcome sheet logic (inverted condition)

2. **07e27e5** - `chore: bump version to 1.0.6`
   - Increment version for new build
   - Update `app.config.js`

### Push

✅ Pushé sur **`origin`** (Cedric921)  
✅ Pushé sur **`origin2`** (AnthonyOmnes)  
Branch : **`feat/v1_0_4`**

---

## 🧪 Tests à Effectuer

### 1. **Test de Persistence**
- [ ] Ouvrir l'app et se connecter
- [ ] Killer l'app depuis les processus système
- [ ] Rouvrir l'app
- [ ] ✅ Vérifier que l'utilisateur est toujours connecté

### 2. **Test des Notifications**
- [ ] Se connecter et activer les notifications
- [ ] Killer l'app
- [ ] Rouvrir l'app
- [ ] ✅ Vérifier que les notifications arrivent toujours

### 3. **Test du Welcome Sheet**
- [ ] Ouvrir l'app **sans être connecté** (guest)
- [ ] ✅ Le welcome sheet doit apparaître après 1 seconde
- [ ] Se connecter
- [ ] ✅ Le welcome sheet ne doit **pas** apparaître

---

## 🚀 Prochaines Étapes

1. ✅ Builds lancés (iOS + Android Production)
2. ⏳ Attendre la fin des builds (~20-30 min)
3. 📲 Tester sur TestFlight (iOS) et Play Store Internal Track (Android)
4. ✅ Valider les fixes
5. 🎉 Publier sur les stores

---

## 📚 Documentation

- **Admin Setup** : `docs/ADMIN_SETUP.md`
- **Promo Codes** : `docs/PROMO_CODES.md`
- **Subscriptions** : `docs/SUBSCRIPTIONS_SETUP.md`
- **Project Structure** : `PROJECT_STRUCTURE.md`

