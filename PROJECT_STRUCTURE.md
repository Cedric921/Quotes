# 📁 Structure du Projet Focus

## 🌳 Arborescence Complète

```
Focus_project/
│
├── 📄 README.md                          # Documentation principale ⭐
├── 📄 SUMMARY.md                         # Résumé des améliorations
├── 📄 ARCHITECTURE_IMPROVEMENTS.md       # Détails architecture
├── 📄 ICONS_SYSTEM.md                    # Système d'icônes
├── 📄 TESTING_GUIDE.md                   # Guide de tests
├── 📄 package.json                       # Dépendances racine
├── 📄 turbo.json                         # Configuration Turborepo
│
├── 📂 apps/                              # Applications
│   │
│   ├── 📂 admin/                         # Panel d'administration (Next.js 15)
│   │   ├── 📂 src/
│   │   │   ├── 📂 app/                   # App Router Next.js
│   │   │   │   ├── 📂 dashboard/         # Dashboard
│   │   │   │   │   ├── 📂 topics/        # Gestion topics
│   │   │   │   │   ├── 📂 quotes/        # Gestion quotes
│   │   │   │   │   ├── 📂 users/         # Gestion users et souscriptions
│   │   │   │   │   ├── 📂 promo-codes/   # Gestion promo codes ⭐ NOUVEAU
│   │   │   │   │   └── 📂 payments/      # Historique paiements
│   │   │   │   └── 📄 layout.tsx
│   │   │   ├── 📂 components/            # Composants React
│   │   │   │   ├── 📂 ui/                # Composants UI (shadcn)
│   │   │   │   ├── 📄 TopicForm.tsx
│   │   │   │   ├── 📄 QuoteForm.tsx
│   │   │   │   └── 📄 IconPicker.tsx
│   │   │   ├── 📂 api/                   # API et hooks ⭐ NOUVEAU
│   │   │   │   ├── 📂 hooks/
│   │   │   │   │   ├── 📄 useSubscriptions.ts
│   │   │   │   │   └── 📄 usePromoCodes.ts
│   │   │   │   └── 📂 services/
│   │   │   │       └── 📄 api.ts         # Client API Axios
│   │   │   ├── 📂 lib/                   # Utilitaires
│   │   │   │   └── 📄 utils.ts
│   │   └── 📄 package.json
│   │
│   ├── 📂 api/                           # API REST (NestJS)
│   │   ├── 📂 src/
│   │   │   ├── 📂 common/                # Module commun ⭐ NOUVEAU
│   │   │   │   └── 📂 entities/
│   │   │   │       └── 📄 base.entity.ts # BaseEntity
│   │   │   ├── 📂 auth/                  # Module authentification
│   │   │   │   ├── 📄 auth.controller.ts
│   │   │   │   ├── 📄 auth.service.ts
│   │   │   │   └── 📄 jwt.strategy.ts
│   │   │   ├── 📂 topics/                # Module topics
│   │   │   │   ├── 📂 entities/
│   │   │   │   │   └── 📄 topic.entity.ts # extends BaseEntity ⭐
│   │   │   │   ├── 📄 topics.controller.ts
│   │   │   │   └── 📄 topics.service.ts
│   │   │   ├── 📂 quotes/                # Module quotes
│   │   │   │   ├── 📂 entities/
│   │   │   │   │   └── 📄 quote.entity.ts # extends BaseEntity ⭐
│   │   │   │   ├── 📄 quotes.controller.ts
│   │   │   │   └── 📄 quotes.service.ts
│   │   │   ├── 📂 users/                 # Module users
│   │   │   │   ├── 📂 entities/
│   │   │   │   │   └── 📄 user.entity.ts  # extends BaseEntity ⭐
│   │   │   │   ├── 📄 users.controller.ts
│   │   │   │   └── 📄 users.service.ts
│   │   │   ├── 📂 subscriptions/         # Module abonnements ⭐ NOUVEAU
│   │   │   │   ├── 📂 entities/
│   │   │   │   │   ├── 📄 subscription.entity.ts
│   │   │   │   │   ├── 📄 subscription-plan.entity.ts
│   │   │   │   │   └── 📄 promo-code.entity.ts
│   │   │   │   ├── 📂 dto/
│   │   │   │   │   └── 📄 promo-code.dto.ts
│   │   │   │   ├── 📄 subscriptions.controller.ts
│   │   │   │   ├── 📄 subscriptions.service.ts
│   │   │   │   ├── 📄 promo-code.service.ts
│   │   │   │   └── 📄 subscription-cron.service.ts
│   │   │   └── 📄 main.ts
│   │   ├── 📄 MIGRATION_UUID.md          # Doc migration UUIDs
│   │   ├── 📄 database.sqlite            # Base de données
│   │   ├── 📄 seed-topics.js             # Script de seed
│   │   └── 📄 package.json
│   │
│   └── 📂 mobile/                        # App mobile (React Native + Expo)
│       ├── 📂 src/
│       │   ├── 📂 store/                 # Redux Store ⭐
│       │   │   ├── 📄 index.ts           # Configuration store
│       │   │   ├── 📄 hooks.ts           # Hooks typés
│       │   │   └── 📂 slices/
│       │   │       ├── 📄 authSlice.ts   # State auth
│       │   │       ├── 📄 themeSlice.ts  # State theme
│       │   │       └── 📄 subscriptionSlice.ts
│       │   ├── 📂 api/                   # React Query ⭐
│       │   │   ├── 📄 queryClient.ts     # Config React Query
│       │   │   ├── 📄 config.ts          # Configuration API
│       │   │   └── 📂 hooks/
│       │   │       ├── 📄 useQuotes.ts   # Hooks quotes
│       │   │       ├── 📄 useTopics.ts   # Hooks topics
│       │   │       ├── 📄 usePurchases.ts # Hooks RevenueCat ⭐ NOUVEAU
│       │   │       ├── 📄 usePromoCode.ts # Hooks promo codes ⭐ NOUVEAU
│       │   │       └── 📄 index.ts
│       │   ├── 📂 screens/               # Écrans
│       │   │   ├── 📄 HomeScreen.tsx
│       │   │   ├── 📄 TopicsListScreen.tsx
│       │   │   ├── 📄 SubscriptionScreen.tsx
│       │   │   ├── 📄 TopicScreen.tsx
│       │   │   ├── 📄 ProfileScreen.tsx
│       │   │   ├── 📄 SettingsScreen.tsx
│       │   │   ├── 📄 PaymentHistoryScreen.tsx
│       │   │   ├── 📄 LoginScreen.tsx
│       │   │   └── 📄 SignupScreen.tsx
│       │   ├── 📂 components/            # Composants
│       │   │   ├── 📂 onboarding/
│       │   │   │   ├── 📄 SubscriptionBottomSheet.tsx
│       │   │   │   └── 📄 ProfileCompletionModal.tsx
│       │   │   ├── 📄 QuoteCard.tsx
│       │   │   ├── 📄 LoadingScreen.tsx
│       │   │   └── 📄 ErrorMessage.tsx
│       │   ├── 📂 navigation/            # Navigation
│       │   │   └── 📄 AppNavigator.tsx
│       │   ├── 📂 i18n/                  # Internationalisation
│       │   │   ├── 📄 index.ts
│       │   │   └── 📂 locales/
│       │   │       ├── 📄 fr.json        # 🇫🇷 Français
│       │   │       ├── 📄 en.json        # 🇬🇧 English
│       │   │       ├── 📄 es.json        # 🇪🇸 Español
│       │   │       └── 📄 ar.json        # 🇸🇦 العربية
│       │   ├── 📂 services/              # Services
│       │   │   └── 📄 api.ts             # Client API Axios
│       │   ├── 📂 types/                 # Types TypeScript
│       │   │   └── 📄 index.ts           # BaseModel, Topic, Quote, User
│       │   ├── 📂 constants/             # Constantes
│       │   │   └── 📄 config.ts
│       │   └── 📂 utils/                 # Utilitaires
│       ├── 📄 MIGRATION_GUIDE.md         # Guide migration Redux
│       ├── 📄 I18N_IMPLEMENTATION.md     # Doc i18n
│       ├── 📄 App.tsx                    # Point d'entrée
│       └── 📄 package.json
│
└── 📂 packages/                          # Packages partagés
    ├── 📂 eslint-config/                 # Config ESLint
    ├── 📂 typescript-config/             # Config TypeScript
    └── 📂 ui/                            # Composants UI partagés
```

## 📊 Statistiques du Projet

### Applications
- **Admin Panel** : ~50 fichiers TypeScript/React
- **API** : ~30 fichiers TypeScript/NestJS
- **Mobile** : ~40 fichiers TypeScript/React Native

### Lignes de Code (approximatif)
- **Admin** : ~5,000 lignes
- **API** : ~3,000 lignes
- **Mobile** : ~4,000 lignes
- **Total** : ~12,000 lignes

### Technologies
- **Langages** : TypeScript (100%)
- **Frameworks** : Next.js, NestJS, React Native
- **Base de données** : SQLite
- **State Management** : Redux Toolkit, React Query
- **i18n** : 4 langues (FR, EN, ES, AR)

## 🎯 Points Clés

### ⭐ Nouveautés Récentes (v1.0.4)

1. **Système de Promo Codes**
   - Backend : Entité PromoCode, validation, application
   - Admin : Page de gestion complète avec statistiques
   - Mobile : Champ optionnel lors de l'inscription

2. **Attribution Manuelle de Souscription**
   - Admin peut attribuer une souscription à un utilisateur
   - Vérification par mot de passe pour sécurité
   - Interface dans le détail utilisateur

3. **Intégration RevenueCat**
   - Gestion des abonnements iOS/Android
   - Webhook pour synchronisation automatique
   - Hook `usePurchases` pour achats in-app

4. **BaseEntity Pattern** (API)
   - Tous les modèles héritent de `BaseEntity`
   - Champs communs : `id`, `createdAt`, `updatedAt`, `deletedAt`

5. **Redux Toolkit + React Query** (Mobile)
   - State management moderne
   - Cache automatique
   - Hooks typés

6. **Documentation Complète**
   - README principal mis à jour
   - Guides de migration
   - Documentation subscriptions


