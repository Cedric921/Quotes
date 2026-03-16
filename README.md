# 🎯 Focus - Quotes Application

Application full-stack de gestion et consultation de citations inspirantes avec panel d'administration, API REST et application mobile.

## 📋 Table des Matières

- [Vue d'Ensemble](#-vue-densemble)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Démarrage Rapide](#-démarrage-rapide)
- [Applications](#-applications)
- [Documentation](#-documentation)
- [Scripts Disponibles](#-scripts-disponibles)

---

## 🌟 Vue d'Ensemble

**Focus** est une plateforme complète de citations inspirantes comprenant :

- 🖥️ **Panel Admin** - Interface web pour gérer les citations, topics et utilisateurs
- 🔌 **API REST** - Backend NestJS avec authentification JWT et base de données PostgreSQL (Supabase)
- 📱 **App Mobile** - Application React Native/Expo avec infinite scroll et i18n (10 langues)

### Fonctionnalités Principales

- ✅ CRUD complet pour citations et topics
- ✅ Authentification JWT avec rôles (admin/user)
- ✅ Internationalisation (FR, EN, ES, AR, DE, IT, ZH, NL, RU, TR avec support RTL)
- ✅ **Traduction automatique** des citations et topics (DeepL / MyMemory)
- ✅ Système d'icônes cross-platform (Lucide + Ionicons)
- ✅ Gestion d'état avec Redux Toolkit + React Query
- ✅ Architecture modulaire avec BaseEntity (UUIDs)
- ✅ Infinite scroll et pagination
- ✅ Thème clair/sombre/système
- ✅ **Thèmes visuels personnalisés** avec polices
- ✅ Like/Unlike de citations
- ✅ Filtrage par topics
- ✅ **Système d'abonnement** (Stripe)
- ✅ **Notifications push** personnalisées
- ✅ **Widgets iOS/Android**
- ✅ **Partage de citations** en image

---

## 🏗️ Architecture

```
Focus_project/
├── apps/
│   ├── admin/          # Panel d'administration (Next.js 15)
│   ├── api/            # API REST (NestJS)
│   └── mobile/         # Application mobile (React Native + Expo)
├── packages/
│   ├── eslint-config/  # Configuration ESLint partagée
│   ├── typescript-config/ # Configuration TypeScript partagée
│   └── ui/             # Composants UI partagés
└── docs/               # Documentation
```

### Architecture API (BaseEntity Pattern)

Toutes les entités héritent de `BaseEntity` :

```typescript
abstract class BaseEntity {
  id: string; // UUID
  createdAt: Date; // Auto-généré
  updatedAt: Date; // Auto-mis à jour
  deletedAt: Date; // Soft delete
}
```

**Entités** : `Topic`, `Quote`, `User`

### Architecture Mobile (Redux + React Query)

- **Redux Toolkit** : State global (auth, theme)
- **React Query** : Server state avec cache automatique
- **i18next** : Internationalisation (FR, EN, ES, AR)

---

## 🛠️ Technologies

### Frontend (Admin Panel)

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Radix UI** (composants accessibles)
- **Lucide Icons**
- **i18n** (FR/EN)

### Backend (API)

- **NestJS 10**
- **TypeORM**
- **PostgreSQL** (Supabase)
- **Passport JWT**
- **bcrypt**
- **class-validator**
- **Stripe** (paiements)
- **DeepL / MyMemory** (traduction)
- **Cloudinary** (images)

### Mobile

- **React Native**
- **Expo SDK 54**
- **TypeScript**
- **Redux Toolkit**
- **React Query (TanStack)**
- **React Navigation**
- **i18next** (10 langues)
- **Ionicons**
- **Expo Notifications**
- **react-native-android-widget** / **@bacons/apple-targets** (widgets)

### DevOps

- **Turborepo** (monorepo)
- **ESLint**
- **Prettier**
- **Vercel** (déploiement admin)
- **EAS Build** (builds mobile)

---

## 📦 Installation

### Prérequis

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Git**

### Installation Globale

```bash
# Cloner le repository
git clone <repository-url>
cd Focus_project

# Installer toutes les dépendances
npm install
```

---

## 🚀 Démarrage Rapide

### 1. Démarrer l'API

```bash
# Depuis la racine
npm run dev:api

# Ou depuis apps/api
cd apps/api
npm run start:dev
```

L'API sera disponible sur `http://localhost:3001`

### 2. Initialiser la Base de Données

```bash
cd apps/api

# Réinitialiser la DB (optionnel)
./reset-database.sh

# Seed les topics
node seed-topics.js
```

### 3. Démarrer le Panel Admin

```bash
# Depuis la racine
npm run dev:admin

# Ou depuis apps/admin
cd apps/admin
npm run dev
```

Le panel sera disponible sur `http://localhost:3000`

**Compte admin par défaut** :

- Email: `admin@focus.com`
- Password: `admin123`

### 4. Démarrer l'App Mobile

```bash
# Depuis la racine
npm run dev:mobile

# Ou depuis apps/mobile
cd apps/mobile
npm start
```

Scannez le QR code avec **Expo Go** ou appuyez sur :

- `i` pour iOS Simulator
- `a` pour Android Emulator
- `w` pour Web

---

## 📱 Applications

### 🖥️ Admin Panel (`apps/admin`)

Interface web pour gérer le contenu.

**Fonctionnalités** :

- Dashboard avec statistiques
- CRUD Topics (nom, titre, description, icône, couleur, premium)
- CRUD Quotes (texte, auteur, topic)
- Gestion utilisateurs et abonnements
- Gestion des thèmes visuels et polices
- Gestion des plans d'abonnement
- Upload d'images (Cloudinary)
- Authentification JWT
- i18n (FR/EN)

**URL** : `http://localhost:3000`

### 🔌 API (`apps/api`)

Backend NestJS avec architecture modulaire.

**Endpoints principaux** :

- `POST /auth/login` - Authentification
- `POST /auth/register` - Inscription
- `GET /quotes` - Liste des citations (pagination)
- `GET /quotes/:id` - Citation par ID
- `POST /quotes/:id/like` - Liker une citation
- `GET /topics` - Liste des topics
- `GET /topics/:id` - Topic par ID
- `POST /subscriptions/checkout` - Créer une session Stripe
- `GET /subscriptions/plans` - Liste des plans
- `POST /translations/translate` - Traduire du texte

**URL** : `http://localhost:3001`
**Documentation** : Voir `apps/api/README.md`

### 📱 Mobile App (`apps/mobile`)

Application React Native avec Expo.

**Fonctionnalités** :

- Infinite scroll de citations
- Pull-to-refresh
- Like/Unlike et favoris
- Filtrage par topics
- Authentification
- Profil utilisateur avec statistiques
- Settings (langue, thème, mode)
- **Traduction automatique** des citations et topics
- **Thèmes visuels** personnalisés avec polices
- **Notifications push** configurables (heures, jours)
- **Widgets** iOS et Android
- **Partage** de citations en image
- **Abonnement premium** via Stripe
- i18n (FR, EN, ES, AR, DE, IT, ZH, NL, RU, TR)

**Technologies** :

- Redux Toolkit (state management)
- React Query (server state)
- React Navigation (navigation)
- i18next (internationalisation)
- Expo Notifications (push)
- Expo Sharing (partage)

---

## 📚 Documentation

### Documentation Principale

- **[ARCHITECTURE_IMPROVEMENTS.md](./ARCHITECTURE_IMPROVEMENTS.md)** - Améliorations architecturales (BaseEntity, Redux, React Query)
- **[ICONS_SYSTEM.md](./ICONS_SYSTEM.md)** - Système d'icônes cross-platform
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Guide de tests

### Documentation par App

- **[apps/mobile/MIGRATION_GUIDE.md](./apps/mobile/MIGRATION_GUIDE.md)** - Migration Context → Redux + React Query
- **[apps/mobile/I18N_IMPLEMENTATION.md](./apps/mobile/I18N_IMPLEMENTATION.md)** - Implémentation i18n
- **[apps/api/MIGRATION_UUID.md](./apps/api/MIGRATION_UUID.md)** - Migration vers UUIDs

---

## 🔧 Scripts Disponibles

### Scripts Globaux (depuis la racine)

```bash
# Développement
npm run dev              # Démarrer toutes les apps
npm run dev:admin        # Démarrer uniquement l'admin
npm run dev:api          # Démarrer uniquement l'API
npm run dev:mobile       # Démarrer uniquement le mobile

# Build
npm run build            # Build toutes les apps
npm run build:admin      # Build l'admin
npm run build:api        # Build l'API

# Linting
npm run lint             # Lint toutes les apps
```

### Scripts API (`apps/api`)

```bash
npm run start:dev        # Mode développement (watch)
npm run start:prod       # Mode production
npm run build            # Compiler TypeScript
npm test                 # Tests unitaires
npm run test:e2e         # Tests e2e
```

### Scripts Admin (`apps/admin`)

```bash
npm run dev              # Mode développement
npm run build            # Build production
npm run start            # Démarrer en production
npm run lint             # Linter le code
```

### Scripts Mobile (`apps/mobile`)

```bash
npm start                # Démarrer Expo
npm run android          # Ouvrir sur Android
npm run ios              # Ouvrir sur iOS
npm run web              # Ouvrir sur Web
```

---

## 🌍 Internationalisation

### Langues Supportées

- 🇫🇷 **Français** (fr) - Langue source
- 🇬🇧 **English** (en)
- 🇪🇸 **Español** (es)
- 🇸🇦 **العربية** (ar) - avec support RTL
- 🇩🇪 **Deutsch** (de)
- 🇮🇹 **Italiano** (it)
- 🇨🇳 **中文** (zh)
- 🇳🇱 **Nederlands** (nl)
- 🇷🇺 **Русский** (ru)
- 🇹🇷 **Türkçe** (tr)

### Traduction Automatique

L'application dispose d'une fonctionnalité de **traduction automatique** des citations et topics :

- Activable dans **Settings → Traduction automatique**
- Utilise **DeepL API** (principal) et **MyMemory** (fallback)
- Cache local pour éviter les appels API répétés
- Traduit automatiquement depuis le français vers la langue sélectionnée

### Changer la Langue

**Mobile** : Settings → Language → Sélectionner la langue
**Admin** : Sélecteur de langue dans le header

---

## 🎨 Thèmes et Personnalisation

### Mode d'affichage

L'application mobile supporte 3 modes :

- ☀️ **Light** - Thème clair
- 🌙 **Dark** - Thème sombre
- 🔄 **System** - Suit le thème du système

### Thèmes Visuels

L'application propose des **thèmes visuels personnalisés** :

- Fonds d'écran avec images
- Polices personnalisées par thème
- Gérables depuis le panel admin

---

## 🔐 Authentification

### Comptes par Défaut

**Admin** :

- Email: `admin@focus.com`
- Password: `admin123`

**User** :

- Email: `user@focus.com`
- Password: `user123`

### JWT

Les tokens JWT sont stockés dans :

- **Admin** : `localStorage`
- **Mobile** : `AsyncStorage`

Durée de validité : **7 jours**

---

## 💳 Système d'Abonnement

L'application intègre un système d'abonnement premium via **Stripe** :

### Plans disponibles

- Plans mensuels et annuels configurables depuis l'admin
- Période d'essai gratuite (freemium)

### Fonctionnalités Premium

- Accès aux topics premium
- Notifications push personnalisées
- Thèmes visuels exclusifs
- Traduction automatique illimitée

### Configuration Stripe

Variables d'environnement requises :

```env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 License

Ce projet est sous licence MIT.

---

## 👥 Auteurs

- **Cédric Karungu** - Développeur Principal

---

## 🙏 Remerciements

- [NestJS](https://nestjs.com/) - Framework backend
- [Next.js](https://nextjs.org/) - Framework React
- [Expo](https://expo.dev/) - Plateforme React Native
- [Radix UI](https://www.radix-ui.com/) - Composants accessibles
- [Turborepo](https://turbo.build/) - Monorepo tool
- [Stripe](https://stripe.com/) - Paiements
- [DeepL](https://www.deepl.com/) - Traduction automatique
- [Supabase](https://supabase.com/) - Base de données PostgreSQL
- [Cloudinary](https://cloudinary.com/) - Gestion d'images
