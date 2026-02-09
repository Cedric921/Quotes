# Architecture Improvements - Focus App

## ✅ Améliorations Implémentées

### 1. API - Module Common avec BaseEntity

#### 📁 Structure
```
apps/api/src/
├── common/
│   └── entities/
│       ├── base.entity.ts    # BaseEntity avec champs communs
│       └── index.ts
```

#### 🔧 BaseEntity
Toutes les entités héritent maintenant de `BaseEntity` qui fournit :
- `id` (UUID)
- `createdAt` (Date)
- `updatedAt` (Date)
- `deletedAt` (Date) - Soft delete

**Avant** :
```typescript
@Entity()
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column()
  name: string;
  // ...
}
```

**Après** :
```typescript
@Entity()
export class Topic extends BaseEntity {
  @Column()
  name: string;
  // ... autres champs spécifiques
}
```

#### ✅ Entités Mises à Jour
- ✅ `Topic` extends `BaseEntity`
- ✅ `Quote` extends `BaseEntity`
- ✅ `User` extends `BaseEntity`

#### 📊 Avantages
- **DRY** : Pas de répétition des champs communs
- **Cohérence** : Tous les modèles ont les mêmes champs de base
- **Traçabilité** : `createdAt` et `updatedAt` automatiques
- **Soft Delete** : `deletedAt` pour tous les modèles
- **Maintenabilité** : Modifications centralisées dans BaseEntity

---

### 2. Mobile - Redux Toolkit + React Query

#### 📁 Structure
```
apps/mobile/src/
├── store/
│   ├── index.ts              # Configuration du store
│   ├── hooks.ts              # Hooks typés (useAppDispatch, useAppSelector)
│   └── slices/
│       ├── authSlice.ts      # State d'authentification
│       └── themeSlice.ts     # State du thème
├── api/
│   ├── queryClient.ts        # Configuration React Query
│   └── hooks/
│       ├── useQuotes.ts      # Hooks pour les quotes
│       ├── useTopics.ts      # Hooks pour les topics
│       └── index.ts
```

#### 🔧 Redux Toolkit - State Management

**Store Configuration** (`store/index.ts`) :
```typescript
export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
  },
});
```

**Auth Slice** (`store/slices/authSlice.ts`) :
- State : `user`, `token`, `isAuthenticated`, `isLoading`
- Actions : `setCredentials`, `setUser`, `logout`, `setLoading`
- Thunks : `loginThunk`, `logoutThunk`, `loadStoredAuth`

**Theme Slice** (`store/slices/themeSlice.ts`) :
- State : `mode` ('light' | 'dark' | 'system'), `isDark`
- Actions : `setThemeMode`, `setIsDark`
- Thunks : `loadStoredTheme`, `changeTheme`

#### 🔧 React Query - Server State

**Query Client** (`api/queryClient.ts`) :
```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,  // 5 minutes
      gcTime: 10 * 60 * 1000,     // 10 minutes
    },
  },
});
```

**Hooks pour Quotes** (`api/hooks/useQuotes.ts`) :
- `useQuotes()` - Infinite query avec pagination
- `useQuotesByTopic(topicId)` - Quotes par topic
- `useQuote(id)` - Quote unique
- `useLikeQuote()` - Mutation pour liker
- `useCreateQuote()` - Mutation pour créer
- `useUpdateQuote()` - Mutation pour modifier
- `useDeleteQuote()` - Mutation pour supprimer

**Hooks pour Topics** (`api/hooks/useTopics.ts`) :
- `useTopics()` - Tous les topics
- `useTopic(id)` - Topic unique
- `useCreateTopic()` - Mutation pour créer
- `useUpdateTopic()` - Mutation pour modifier
- `useDeleteTopic()` - Mutation pour supprimer

---

## 📊 Comparaison Avant/Après

### Avant (Context API)

**Problèmes** :
- ❌ Re-renders excessifs
- ❌ Pas de cache
- ❌ Pas de gestion d'erreurs standardisée
- ❌ Pas de retry automatique
- ❌ Code dupliqué pour chaque contexte
- ❌ Difficile à tester

**Code** :
```typescript
// AuthContext.tsx - 150+ lignes
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Beaucoup de code...
};
```

### Après (Redux Toolkit + React Query)

**Avantages** :
- ✅ Performance optimisée
- ✅ Cache automatique
- ✅ Gestion d'erreurs intégrée
- ✅ Retry automatique
- ✅ Code modulaire et réutilisable
- ✅ DevTools pour debugging
- ✅ TypeScript first-class support
- ✅ Facile à tester

**Code** :
```typescript
// Dans un composant
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { useQuotes } from '../api/hooks';

function MyComponent() {
  // State global
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Server state avec cache
  const { data, isLoading, error, fetchNextPage } = useQuotes(10);

  // ...
}
```

---

## 🚀 Utilisation

### Redux Toolkit (Client State)

#### 1. Utiliser le State
```typescript
import { useAppSelector } from '../store/hooks';

const { user, isAuthenticated } = useAppSelector((state) => state.auth);
const { mode, isDark } = useAppSelector((state) => state.theme);
```

#### 2. Dispatcher des Actions
```typescript
import { useAppDispatch } from '../store/hooks';
import { loginThunk, logoutThunk } from '../store/slices/authSlice';
import { changeTheme } from '../store/slices/themeSlice';

const dispatch = useAppDispatch();

// Login
await dispatch(loginThunk(email, password));

// Logout
await dispatch(logoutThunk());

// Change theme
await dispatch(changeTheme('dark'));
```

### React Query (Server State)

#### 1. Fetch Data
```typescript
import { useQuotes, useTopics } from '../api/hooks';

// Infinite scroll
const { data, isLoading, error, fetchNextPage, hasNextPage } = useQuotes(10);

// Simple query
const { data: topics, isLoading } = useTopics();
```

#### 2. Mutations
```typescript
import { useLikeQuote, useCreateQuote } from '../api/hooks';

const likeMutation = useLikeQuote();
const createMutation = useCreateQuote();

// Like a quote
likeMutation.mutate(quoteId);

// Create a quote
createMutation.mutate({
  text: "Quote text",
  author: "Author name",
  topicId: "topic-uuid"
});
```

---

## 📝 Prochaines Étapes

### 1. Migrer les Contextes Existants

- [ ] Remplacer `AuthContext` par Redux `authSlice`
- [ ] Remplacer `ThemeContext` par Redux `themeSlice`
- [ ] Migrer `useQuotes` hook vers React Query
- [ ] Supprimer les anciens contextes

### 2. Mettre à Jour les Composants

- [ ] HomeScreen - Utiliser `useQuotes()` de React Query
- [ ] TopicsListScreen - Utiliser `useTopics()`
- [ ] TopicScreen - Utiliser `useQuotesByTopic()`
- [ ] ProfileScreen - Utiliser Redux auth state
- [ ] SettingsScreen - Utiliser Redux theme state

### 3. Tests

- [ ] Tester le store Redux
- [ ] Tester les slices
- [ ] Tester les hooks React Query
- [ ] Tester l'intégration complète

---

## 🎯 Résultat Final

### API
- ✅ BaseEntity avec champs communs (id, createdAt, updatedAt, deletedAt)
- ✅ Toutes les entités héritent de BaseEntity
- ✅ Code DRY et maintenable

### Mobile
- ✅ Redux Toolkit pour le state global (auth, theme)
- ✅ React Query pour le server state (quotes, topics)
- ✅ Hooks typés et réutilisables
- ✅ Cache automatique et optimisations
- ✅ Architecture scalable et testable


