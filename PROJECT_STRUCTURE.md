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
│   │   │   │   ├── 📂 [locale]/          # Routes i18n
│   │   │   │   │   ├── 📂 dashboard/     # Dashboard
│   │   │   │   │   ├── 📂 topics/        # Gestion topics
│   │   │   │   │   ├── 📂 quotes/        # Gestion quotes
│   │   │   │   │   └── 📂 users/         # Gestion users
│   │   │   │   └── 📄 layout.tsx
│   │   │   ├── 📂 components/            # Composants React
│   │   │   │   ├── 📂 ui/                # Composants UI (shadcn)
│   │   │   │   ├── 📄 TopicForm.tsx
│   │   │   │   ├── 📄 QuoteForm.tsx
│   │   │   │   └── 📄 IconPicker.tsx
│   │   │   ├── 📂 contexts/              # Contextes React
│   │   │   │   └── 📄 AuthContext.tsx
│   │   │   ├── 📂 lib/                   # Utilitaires
│   │   │   │   ├── 📄 api.ts             # Client API
│   │   │   │   └── 📄 utils.ts
│   │   │   └── 📂 i18n/                  # Internationalisation
│   │   ├── 📂 messages/                  # Traductions
│   │   │   ├── 📄 en.json
│   │   │   └── 📄 fr.json
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
│   │   │   └── 📄 main.ts
│   │   ├── 📄 MIGRATION_UUID.md          # Doc migration UUIDs
│   │   ├── 📄 database.sqlite            # Base de données
│   │   ├── 📄 seed-topics.js             # Script de seed
│   │   └── 📄 package.json
│   │
│   └── 📂 mobile/                        # App mobile (React Native + Expo)
│       ├── 📂 src/
│       │   ├── 📂 store/                 # Redux Store ⭐ NOUVEAU
│       │   │   ├── 📄 index.ts           # Configuration store
│       │   │   ├── 📄 hooks.ts           # Hooks typés
│       │   │   └── 📂 slices/
│       │   │       ├── 📄 authSlice.ts   # State auth
│       │   │       └── 📄 themeSlice.ts  # State theme
│       │   ├── 📂 api/                   # React Query ⭐ NOUVEAU
│       │   │   ├── 📄 queryClient.ts     # Config React Query
│       │   │   └── 📂 hooks/
│       │   │       ├── 📄 useQuotes.ts   # Hooks quotes
│       │   │       ├── 📄 useTopics.ts   # Hooks topics
│       │   │       └── 📄 index.ts
│       │   ├── 📂 screens/               # Écrans
│       │   │   ├── 📄 HomeScreen.tsx
│       │   │   ├── 📄 TopicsListScreen.tsx
│       │   │   ├── 📄 TopicScreen.tsx
│       │   │   ├── 📄 ProfileScreen.tsx
│       │   │   ├── 📄 SettingsScreen.tsx
│       │   │   ├── 📄 LoginScreen.tsx
│       │   │   └── 📄 SignupScreen.tsx
│       │   ├── 📂 components/            # Composants
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

### ⭐ Nouveautés Récentes

1. **BaseEntity Pattern** (API)
   - Tous les modèles héritent de `BaseEntity`
   - Champs communs : `id`, `createdAt`, `updatedAt`, `deletedAt`

2. **Redux Toolkit + React Query** (Mobile)
   - State management moderne
   - Cache automatique
   - Hooks typés

3. **Documentation Complète**
   - README principal mis à jour
   - Guides de migration
   - Documentation architecture

### 🔄 À Migrer

- [ ] Composants mobile vers Redux/React Query
- [ ] Suppression des anciens contextes
- [ ] Tests unitaires et e2e


