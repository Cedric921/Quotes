# RevenueCat Setup Guide

Guide complet pour configurer RevenueCat avec Apple App Store et Google Play Store pour Focus App.

---

## 📋 Prérequis

- Compte [RevenueCat](https://app.revenuecat.com) (gratuit jusqu'à $2.5k MTR)
- Compte [App Store Connect](https://appstoreconnect.apple.com) (99$/an)
- Compte [Google Play Console](https://play.google.com/console) (25$ à vie)
- Bundle ID : `com.mindset.focus`

---

## 🎯 Vue d'ensemble

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Focus App      │────▶│  RevenueCat  │────▶│  App Store /    │
│  (SDK mobile)   │     │  (SaaS)      │     │  Google Play    │
└────────┬────────┘     └──────┬───────┘     └─────────────────┘
         │                     │
         │                     ▼ Webhook
         │              ┌──────────────┐
         └─────────────▶│  Focus API   │
           Sync user    │  (NestJS)    │
                        └──────────────┘
```

---

## 1️⃣ Configuration App Store Connect (iOS)

### 1.1 Créer le Subscription Group

1. [App Store Connect](https://appstoreconnect.apple.com) → **My Apps** → **Focus**
2. **Features** → **Subscriptions** → **+ Create Subscription Group**
3. Reference Name : `Focus Pro`

### 1.2 Créer les produits d'abonnement

Dans le groupe `Focus Pro`, créer 2 produits :

| Product ID | Reference Name | Duration | Prix |
|------------|---------------|----------|------|
| `focus_pro_monthly` | Focus Pro Monthly | 1 month | 4.99 € |
| `focus_pro_yearly` | Focus Pro Yearly | 1 year | 39.99 € |

Pour chaque produit, remplir :
- **Subscription Display Name** (visible par l'utilisateur)
- **Description** (EN, FR minimum)
- **Review Screenshot** ⚠️ obligatoire (capture de l'écran SubscriptionScreen)
- **Review Notes** : Expliquer ce que débloque l'abonnement

### 1.3 Créer la clé In-App Purchase

1. **Users and Access** → **Integrations** → **In-App Purchase Keys**
2. **Generate In-App Purchase Key**
3. Nom : `RevenueCat Integration`
4. Télécharger le fichier `.p8` (à conserver, téléchargeable **une seule fois**)
5. Noter le **Key ID** et **Issuer ID**

### 1.4 Récupérer le Shared Secret

1. **My Apps** → **Focus** → **App Information**
2. Section **App-Specific Shared Secret** → **Manage**
3. Générer et copier le secret

---

## 2️⃣ Configuration Google Play Console (Android)

### 2.1 Créer les abonnements

1. [Google Play Console](https://play.google.com/console) → **Focus**
2. **Monetize** → **Products** → **Subscriptions**
3. **Create subscription** pour chaque produit :

| Product ID | Billing period | Prix |
|------------|---------------|------|
| `focus_pro_monthly` | Monthly | 4.99 € |
| `focus_pro_yearly` | Yearly | 39.99 € |

### 2.2 Créer le Service Account

1. [Google Cloud Console](https://console.cloud.google.com) → **IAM & Admin** → **Service Accounts**
2. **Create Service Account**
   - Name : `revenuecat-integration`
3. Pas de rôles à ce stade
4. **Keys** → **Add Key** → **JSON** → Télécharger le fichier JSON

### 2.3 Lier le Service Account à Google Play

1. Google Play Console → **Setup** → **API access**
2. Chercher le service account créé → **Grant access**
3. Permissions : **View financial data**, **Manage orders and subscriptions**

---

## 3️⃣ Configuration RevenueCat Dashboard

### 3.1 Créer le projet

1. [RevenueCat Dashboard](https://app.revenuecat.com) → **+ New Project**
2. Nom : `Focus`

### 3.2 Ajouter les apps

**Project Settings** → **Apps & providers** → **+ Add app config**

#### 🍎 Apple App Store
- App Bundle ID : `com.mindset.focus`
- App Store Connect App-Specific Shared Secret : *(depuis section 1.4)*
- In-App Purchase Key (.p8) : *upload le fichier de la section 1.3*
- Key ID et Issuer ID : *depuis section 1.3*

#### 🤖 Google Play Store
- Package Name : `com.mindset.focus`
- Service Account Credentials JSON : *upload le fichier de la section 2.2*

### 3.3 Créer l'Entitlement

**Product Catalog** → **Entitlements** → **+ New**

```
Identifier : Focus Pro
Display Name : Focus Pro
Description : Access to all premium Focus features
```

⚠️ L'identifier doit être **exactement** `Focus Pro` (matches `ENTITLEMENT_ID` dans le code).

### 3.4 Importer les Products

**Product Catalog** → **Products** → **+ New Product**

Importer depuis chaque store :
- `focus_pro_monthly` (Apple App Store)
- `focus_pro_monthly` (Google Play Store)
- `focus_pro_yearly` (Apple App Store)
- `focus_pro_yearly` (Google Play Store)

Pour chaque produit, attacher l'entitlement **Focus Pro**.

### 3.5 Créer l'Offering

**Product Catalog** → **Offerings** → **+ New Offering**

```
Identifier : default
Description : Default offering
Mark as Current : ✅
```

Ajouter les Packages :

| Package Type | Identifier | Products |
|--------------|-----------|----------|
| Monthly | `$rc_monthly` | focus_pro_monthly (iOS + Android) |
| Annual | `$rc_annual` | focus_pro_yearly (iOS + Android) |

### 3.6 Configurer le Webhook

**Project Settings** → **Integrations** → **Webhooks** → **+ Add**

```
URL : https://focus-app-1.onrender.com/subscriptions/webhook/revenuecat
Authorization Header : Bearer <random-secret-token>
```

Générer un token sécurisé :
```bash
openssl rand -base64 32
```

### 3.7 Récupérer les API Keys

**Project Settings** → **API keys** → **App specific keys**

Copier :
- **Apple App Store** key (commence par `appl_`)
- **Google Play Store** key (commence par `goog_`)

---

## 4️⃣ Configuration des variables d'environnement

### 4.1 Mobile (`apps/mobile/.env`)

```bash
# API Configuration
API_URL=https://focus-app-1.onrender.com
API_TIMEOUT=30000

# App Behavior
QUOTES_PER_PAGE=10
PAGINATION_THRESHOLD=0.5

# Public URLs
EXPO_PUBLIC_TERMS_URL=http://focus-admin.vercel.app/terms
EXPO_PUBLIC_PRIVACY_URL=http://focus-admin.vercel.app/privacy

# RevenueCat Configuration
# Development (test store)
REVENUECAT_API_KEY_IOS=test_RYsvRKTIJlNHpUxlXPRCLbvjcKC
REVENUECAT_API_KEY_ANDROID=test_RYsvRKTIJlNHpUxlXPRCLbvjcKC

# Production (uncomment and replace for production builds)
# REVENUECAT_API_KEY_IOS=appl_xxxxxxxxxxxxx
# REVENUECAT_API_KEY_ANDROID=goog_xxxxxxxxxxxxx
```

### 4.2 Backend (`apps/api/.env`)

```bash
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-here

# Stripe (legacy - to remove after full migration)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# RevenueCat Webhook
REVENUECAT_WEBHOOK_SECRET=your-generated-secret-from-section-3.6
```

### 4.3 EAS Build (production)

Pour les builds production, ajouter les secrets dans EAS :

```bash
cd apps/mobile

# Production keys
eas secret:create --scope project --name REVENUECAT_API_KEY_IOS --value appl_xxxxx
eas secret:create --scope project --name REVENUECAT_API_KEY_ANDROID --value goog_xxxxx
```

### 4.4 Render (backend production)

Dashboard Render → **focus-api** → **Environment** → ajouter :

```
REVENUECAT_WEBHOOK_SECRET=<le-secret-généré>
```

---

## 5️⃣ Tests

### 5.1 Sandbox iOS

1. App Store Connect → **Users and Access** → **Sandbox Testers** → **+**
2. Créer un compte de test (email fictif suffit)
3. Sur iPhone réel (pas simulator) :
   - **Settings** → **App Store** → **Sandbox Account** → se connecter
4. Lancer l'app → essayer un achat → gratuit en sandbox

### 5.2 Test Android (License Tester)

1. Google Play Console → **Setup** → **License testing**
2. Ajouter ton email Google
3. Upload APK/AAB en **Internal Testing** track
4. Installer depuis le lien Play Store Internal Testing
5. Tester l'achat (gratuit pour les testeurs)

### 5.3 Test Store RevenueCat (sans store réel)

Pour tester sans configurer les stores :
- Utilise la clé `test_RYsvRKTIJlNHpUxlXPRCLbvjcKC`
- Les achats simulés fonctionnent dans n'importe quel environnement
- Les transactions apparaîtront dans **Transactions** du dashboard

---

## 6️⃣ Checklist de déploiement

### Avant soumission Apple

- [ ] Produits créés dans App Store Connect
- [ ] Screenshots de review uploadés
- [ ] Subscription Group configuré
- [ ] Review Notes remplies
- [ ] Build utilise clé `appl_xxx` (pas `test_xxx`)
- [ ] Testé en Sandbox avec compte de test

### Avant soumission Google

- [ ] Produits créés et activés dans Play Console
- [ ] Subscription Prices définis
- [ ] License Testers ajoutés
- [ ] Build utilise clé `goog_xxx`
- [ ] Testé avec Internal Testing

### RevenueCat

- [ ] Entitlement `Focus Pro` créé
- [ ] Products importés et attachés à l'entitlement
- [ ] Offering `default` marqué comme current
- [ ] Webhook configuré et testé
- [ ] Clés production dans EAS secrets

### Backend

- [ ] `REVENUECAT_WEBHOOK_SECRET` dans Render
- [ ] Endpoint `/subscriptions/webhook/revenuecat` accessible publiquement
- [ ] Endpoint `/subscriptions/sync-revenuecat` testé

---

## 🆘 Dépannage

### "No offerings available"
- Vérifier que l'Offering est marqué **Current** dans RevenueCat
- Vérifier que les produits sont **Approved** dans les stores
- Attendre jusqu'à 24h après création des produits

### "Product not found"
- Les Product IDs doivent matcher **exactement** entre :
  - App Store Connect
  - Google Play Console
  - RevenueCat Product Catalog

### Webhook ne reçoit rien
- Vérifier l'URL publique
- Vérifier le header `Authorization: Bearer <secret>`
- Tester avec RevenueCat **Webhook Tester** dans le dashboard

### Entitlement non actif après achat
- Vérifier que le produit est bien attaché à l'entitlement `Focus Pro`
- Identifier : respect de la casse et des espaces

---

## 📚 Ressources

- [RevenueCat Docs](https://docs.revenuecat.com)
- [React Native Purchases SDK](https://github.com/RevenueCat/react-native-purchases)
- [Apple IAP Guidelines](https://developer.apple.com/in-app-purchase/)
- [Google Play Billing](https://developer.android.com/google/play/billing)

---

## 🔐 Récapitulatif des secrets

| Variable | Emplacement | Valeur |
|----------|-------------|--------|
| `REVENUECAT_API_KEY_IOS` | `apps/mobile/.env` + EAS secrets | `appl_xxx` (prod) / `test_xxx` (dev) |
| `REVENUECAT_API_KEY_ANDROID` | `apps/mobile/.env` + EAS secrets | `goog_xxx` (prod) / `test_xxx` (dev) |
| `REVENUECAT_WEBHOOK_SECRET` | `apps/api/.env` + Render env | Token aléatoire (32 bytes) |
| App Store Shared Secret | RevenueCat dashboard uniquement | - |
| In-App Purchase Key (.p8) | RevenueCat dashboard uniquement | - |
| Service Account JSON | RevenueCat dashboard uniquement | - |

