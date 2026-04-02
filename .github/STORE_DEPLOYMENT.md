# 🚀 Store Deployment - Configuration Guide

Ce guide explique comment configurer le déploiement automatique sur l'App Store et le Play Store.

## 📋 Prérequis

### 1. Compte Expo (EAS)
- Avoir un compte Expo avec EAS Build activé
- Générer un token d'accès : https://expo.dev/accounts/[account]/settings/access-tokens

### 2. Apple Developer (iOS)
- Compte Apple Developer ($99/an)
- App créée sur App Store Connect
- Certificats et profils de provisioning configurés sur EAS

### 3. Google Play Console (Android)
- Compte Google Play Developer ($25 one-time)
- App créée sur Google Play Console
- Service Account avec permissions

---

## 🔐 Secrets GitHub à configurer

Allez dans : **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Description | Comment l'obtenir |
|--------|-------------|-------------------|
| `EXPO_TOKEN` | Token d'accès Expo | [Expo Access Tokens](https://expo.dev/accounts/[account]/settings/access-tokens) |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Clé JSON du Service Account Google | Voir section ci-dessous |
| `APPLE_ID` | Email du compte Apple Developer | Votre email Apple |
| `APPLE_TEAM_ID` | ID de l'équipe Apple | App Store Connect → Membership |
| `ASC_APP_ID` | ID de l'app sur App Store Connect | App Store Connect → App → General → App ID |
| `ASC_API_KEY_ID` | ID de la clé API App Store | App Store Connect → Users → Keys |
| `ASC_API_KEY_ISSUER_ID` | Issuer ID de l'API | App Store Connect → Users → Keys |
| `ASC_API_KEY_BASE64` | Clé API encodée en base64 | `base64 -i AuthKey_XXXXX.p8` |

---

## 🤖 Configuration Google Play (Android)

### Étape 1 : Créer un Service Account

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez votre projet (ou créez-en un)
3. **IAM & Admin** → **Service Accounts** → **Create Service Account**
4. Nom : `play-store-deploy`
5. Rôle : Aucun (on le configure sur Play Console)
6. **Create Key** → JSON → Téléchargez le fichier

### Étape 2 : Lier à Google Play Console

1. Allez sur [Google Play Console](https://play.google.com/console/)
2. **Settings** → **API access**
3. **Link** votre projet Google Cloud
4. Trouvez votre Service Account → **Grant access**
5. Permissions : **Release to production, exclude devices, and use Play App Signing**

### Étape 3 : Ajouter le secret GitHub

```bash
# Copiez le contenu du fichier JSON téléchargé
cat service-account.json | pbcopy
```

Collez comme secret `GOOGLE_SERVICE_ACCOUNT_KEY`

---

## 🍎 Configuration App Store (iOS)

### Option A : App Store Connect API (Recommandé)

1. [App Store Connect](https://appstoreconnect.apple.com/) → **Users and Access** → **Keys**
2. **Generate API Key** avec rôle "App Manager"
3. Téléchargez le fichier `.p8`
4. Notez : Key ID, Issuer ID

```bash
# Encoder la clé en base64
base64 -i AuthKey_XXXXX.p8 | pbcopy
```

### Option B : Identifiants Apple (Plus simple mais moins sécurisé)

Mettez à jour `eas.json` avec vos vrais identifiants.

---

## 📝 Mise à jour de eas.json

Remplacez les placeholders dans `apps/mobile/eas.json` :

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "votre@email.com",
      "ascAppId": "1234567890",
      "appleTeamId": "ABCD1234"
    },
    "android": {
      "serviceAccountKeyPath": "./google-service-account.json",
      "track": "internal"
    }
  }
}
```

---

## 🎯 Workflow

Le workflow se déclenche automatiquement quand :
- Un PR est mergé dans `main`
- Des fichiers dans `apps/mobile/` sont modifiés

### Déclenchement manuel

1. Allez dans **Actions** → **EAS Build & Submit to Stores**
2. **Run workflow**
3. Choisissez la plateforme et si vous voulez soumettre aux stores

---

## 📊 Tracks Android

| Track | Description |
|-------|-------------|
| `internal` | Test interne (max 100 testeurs) |
| `alpha` | Closed testing |
| `beta` | Open testing |
| `production` | Release publique |

---

## ⚠️ Notes importantes

1. **Premier upload** : Le premier AAB doit être uploadé manuellement sur Play Console
2. **Version** : Assurez-vous que `versionCode` est incrémenté automatiquement
3. **Signing** : Les keystores sont gérés par EAS (pas besoin de les stocker)
4. **Review** : Les apps doivent passer la review avant publication

---

## 🐛 Troubleshooting

### Erreur "No builds found"
```bash
eas build:list --platform android --status finished
```

### Erreur Google Play API
- Vérifiez que le Service Account a les bonnes permissions
- Vérifiez que l'API est activée sur Google Cloud

### Erreur App Store Connect
- Vérifiez que les certificats sont valides
- Vérifiez que l'app existe sur App Store Connect

