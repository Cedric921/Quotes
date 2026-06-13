# 📱 Focus v1.0.4 - Production Builds Tracking

Date de lancement : **13 juin 2026, 13:43** (Relance après correction)

## ⚠️ Note Importante
Les premiers builds (Android versionCode 7, iOS buildNumber 28) ont échoué à cause d'une erreur d'import dans `usePromoCode.ts`.
**Correction appliquée** : Import path corrigé de `../config` vers `../../services/api`
**Nouveaux builds** lancés avec le code corrigé.

---

## 🚀 Builds Actifs (Corrigés)

### ✅ Android Production Build

**Version** : 1.0.4
**Version Code** : **8** (incrémenté de 7 → 8)
**Type** : App Bundle (AAB)
**Build ID** : `3b16ff8e-c0dc-40c5-97e8-73ed3e5fef44`

#### 🔗 Lien de Tracking Android
```
https://expo.dev/accounts/focus-application/projects/focus-quotes-app/builds/3b16ff8e-c0dc-40c5-97e8-73ed3e5fef44
```

**Statut** : ⏳ En cours de build...

---

### ✅ iOS Production Build + Auto-Submit

**Version** : 1.0.4
**Build Number** : **29** (incrémenté de 28 → 29)
**Type** : Archive (IPA)
**Build ID** : `f2b02a4a-c1f3-42cf-8fd2-b43b9c9cac0b`
**Submission ID** : `d463ec61-c5b0-47dd-ab21-5135ae301537`

#### 🔗 Lien de Tracking iOS Build
```
https://expo.dev/accounts/focus-application/projects/focus-quotes-app/builds/f2b02a4a-c1f3-42cf-8fd2-b43b9c9cac0b
```

#### 🔗 Lien de Tracking iOS Submission
```
https://expo.dev/accounts/focus-application/projects/focus-quotes-app/submissions/d463ec61-c5b0-47dd-ab21-5135ae301537
```

**Statut Build** : ⏳ En cours de build...
**Statut Submission** : ⏳ En attente du build (auto-submit après build réussi)

---

## ❌ Builds Échoués (Historique)

### Android Build Initial
- **Build ID** : `6e6bf8bc-636b-42b1-9b67-3e2f6ebf27c5`
- **Version Code** : 7
- **Statut** : ❌ Échec
- **Raison** : Erreur d'import dans `usePromoCode.ts` - Unable to resolve module `../config`

### iOS Build Initial
- **Build ID** : `f79409b2-ceba-4dba-919e-1e09fe9346e4`
- **Build Number** : 28
- **Submission ID** : `ffcf3478-0de0-42b1-b731-f1f5a471675e`
- **Statut** : ❌ Échec
- **Raison** : Erreur d'import dans `usePromoCode.ts` - Unable to resolve module `../config`

### Correction Appliquée
- **Commit** : `3b6da4d`
- **Message** : "fix: correct import path in usePromoCode hook"
- **Changements** :
  - Remplacer `import { API_CONFIG } from "../config"` par `import apiClient from "../../services/api"`
  - Utiliser `apiClient.post()` au lieu de `fetch()`
  - Simplifier la signature du hook

---

## 📦 Configuration des Builds

### Informations Communes
- **Bundle ID (iOS)** : `com.mindset.focus`
- **Package (Android)** : `com.focus.quotes`
- **Apple Team ID** : `XA9AGYDNGM`
- **Apple ID** : `focusmindsetapp@gmail.com`
- **ASC App ID** : `6761561417`

### Targets iOS
1. **Focus** (App principale)
   - Bundle ID : `com.mindset.focus`
   - Provisioning Profile : `RBZKK86SPW`

2. **FocusWidget** (Widget iOS)
   - Bundle ID : `com.mindset.focus.widget`
   - Provisioning Profile : `JATG2B2Z3T`

### Credentials
- **Distribution Certificate** : `203B3552A7021CE3DE5717559374AAC`
- **Expiration** : 3 avril 2027

---

## ✨ Nouveautés v1.0.4

### 🎯 Fonctionnalités Implémentées

#### 1. Attribution Manuelle de Souscription (Admin)
- Admin peut attribuer une souscription à un utilisateur
- Vérification par mot de passe admin
- Interface dans le profil utilisateur

#### 2. Système de Promo Codes
**Backend:**
- Entité PromoCode (code, expiration, durée, utilisation)
- Validation et application automatique
- Incrémentation du compteur d'utilisation

**Admin:**
- Page de gestion des promo codes
- Création avec durée personnalisée
- Liste des utilisateurs par code
- Statistiques d'utilisation

**Mobile:**
- Champ optionnel lors de l'inscription
- Application automatique après création de compte
- Messages de succès/erreur

#### 3. Intégration RevenueCat
- Gestion des abonnements iOS/Android
- Webhook pour synchronisation
- Hook `usePurchases` pour achats in-app

#### 4. Améliorations
- Synchronisation automatique des abonnements
- Invalidation des queries après achat
- UI/UX améliorée pour les souscriptions

---

## 📊 Suivi Post-Build

### Android
Une fois le build terminé :
1. ✅ Télécharger l'AAB depuis EAS
2. ✅ Uploader sur Google Play Console
3. ✅ Créer une release sur la track "Internal" ou "Production"
4. ✅ Soumettre pour review

### iOS
Une fois le build et la soumission terminés :
1. ✅ Le build sera automatiquement soumis à App Store Connect
2. ✅ Vérifier la soumission dans App Store Connect
3. ✅ Compléter les informations de release si nécessaire
4. ✅ Soumettre pour review Apple

---

## 🔍 Commandes de Vérification

### Vérifier le statut des builds
```bash
# Statut Android (Build corrigé)
eas build:view 3b16ff8e-c0dc-40c5-97e8-73ed3e5fef44

# Statut iOS (Build corrigé)
eas build:view f2b02a4a-c1f3-42cf-8fd2-b43b9c9cac0b
```

### Vérifier la soumission iOS
```bash
eas submission:view d463ec61-c5b0-47dd-ab21-5135ae301537
```

### Liste de tous les builds
```bash
cd apps/mobile
eas build:list
```

---

## 📝 Notes Importantes

- **Auto-increment** activé : Les versions sont automatiquement incrémentées à chaque build
- **Auto-submit iOS** : La soumission iOS se fera automatiquement après le succès du build
- **Credentials** : Gérés par EAS (Expo servers)
- **API URL** : `https://focus-app-1.onrender.com`

---

## ✅ Checklist Post-Déploiement

### Backend
- [ ] Vérifier que l'API est à jour sur Render
- [ ] Exécuter les migrations de base de données (PromoCode, User.usedPromoCode)
- [ ] Vérifier les webhooks RevenueCat
- [ ] Tester les endpoints promo codes

### Mobile
- [ ] Tester l'inscription avec promo code
- [ ] Vérifier la synchronisation RevenueCat
- [ ] Tester les achats in-app
- [ ] Vérifier les notifications

### Admin
- [ ] Tester la création de promo codes
- [ ] Vérifier l'attribution manuelle de souscription
- [ ] Consulter l'historique des paiements
- [ ] Tester la page de gestion des promo codes

---

## 🆘 Support

En cas de problème avec les builds :
- Consulter les logs sur les pages de tracking EAS
- Vérifier les credentials dans Expo
- Consulter la documentation : https://docs.expo.dev/build/introduction/
