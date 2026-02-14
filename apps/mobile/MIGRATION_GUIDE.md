# Guide de Migration - Context API vers Redux Toolkit + React Query

## 📋 Vue d'Ensemble

Ce guide explique comment migrer de l'ancienne architecture (Context API) vers la nouvelle (Redux Toolkit + React Query).

---

## 1. Migration de l'Authentification

### ❌ Avant (AuthContext)

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View>
      {isAuthenticated && <Text>{user?.email}</Text>}
      <Button onPress={handleLogin} title="Login" />
    </View>
  );
}
```

### ✅ Après (Redux Toolkit)

```typescript
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { loginThunk, logoutThunk } from '../store/slices/authSlice';

function MyComponent() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    try {
      await dispatch(loginThunk(email, password)).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View>
      {isAuthenticated && <Text>{user?.email}</Text>}
      <Button onPress={handleLogin} title="Login" />
    </View>
  );
}
```

---

## 2. Migration du Thème

### ❌ Avant (ThemeContext)

```typescript
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Switch value={isDark} onValueChange={toggleTheme} />
    </View>
  );
}
```

### ✅ Après (Redux Toolkit)

```typescript
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { changeTheme } from '../store/slices/themeSlice';

function MyComponent() {
  const { isDark } = useAppSelector((state) => state.theme);
  const dispatch = useAppDispatch();

  const handleThemeChange = (value: boolean) => {
    dispatch(changeTheme(value ? 'dark' : 'light'));
  };

  return (
    <View>
      <Switch value={isDark} onValueChange={handleThemeChange} />
    </View>
  );
}
```

---

## 3. Migration des Quotes

### ❌ Avant (useQuotes hook custom)

```typescript
import { useQuotes } from '../hooks/useQuotes';

function HomeScreen() {
  const {
    quotes,
    loading,
    error,
    refresh,
    loadMore,
  } = useQuotes({ pageSize: 10 });

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <FlatList
      data={quotes}
      onEndReached={loadMore}
      refreshing={loading}
      onRefresh={refresh}
    />
  );
}
```

### ✅ Après (React Query)

```typescript
import { useQuotes } from '../api/hooks';

function HomeScreen() {
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = useQuotes(10);

  // Flatten pages
  const quotes = data?.pages.flat() ?? [];

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <FlatList
      data={quotes}
      onEndReached={() => hasNextPage && fetchNextPage()}
      refreshing={isLoading}
      onRefresh={refetch}
    />
  );
}
```

---

## 4. Migration des Topics

### ❌ Avant (API calls directs)

```typescript
import { topicsApi } from '../services/api';

function TopicsScreen() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await topicsApi.getAll();
        setTopics(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  return <FlatList data={topics} />;
}
```

### ✅ Après (React Query)

```typescript
import { useTopics } from '../api/hooks';

function TopicsScreen() {
  const { data: topics, isLoading, error } = useTopics();

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error.message} />;

  return <FlatList data={topics} />;
}
```

---

## 5. Mutations (Like, Create, Update, Delete)

### ❌ Avant

```typescript
const handleLike = async (quoteId: string) => {
  try {
    await quotesApi.like(quoteId);
    // Manually update state
    setQuotes(prev => prev.map(q =>
      q.id === quoteId ? { ...q, liked: true } : q
    ));
  } catch (error) {
    console.error(error);
  }
};
```

### ✅ Après (React Query Mutations)

```typescript
import { useLikeQuote } from '../api/hooks';

const likeMutation = useLikeQuote();

const handleLike = (quoteId: string) => {
  likeMutation.mutate(quoteId, {
    onSuccess: () => {
      // Cache automatically updated!
      Toast.show({ type: 'success', text1: 'Quote liked!' });
    },
    onError: (error) => {
      Toast.show({ type: 'error', text1: error.message });
    },
  });
};
```

---

## 📊 Checklist de Migration

### Étape 1 : Installation
- [x] Installer Redux Toolkit
- [x] Installer React Query
- [x] Configurer le store
- [x] Configurer Query Client

### Étape 2 : Créer les Slices
- [x] authSlice
- [x] themeSlice

### Étape 3 : Créer les Hooks React Query
- [x] useQuotes
- [x] useTopics

### Étape 4 : Mettre à Jour App.tsx
- [x] Ajouter Provider Redux
- [x] Ajouter QueryClientProvider

### Étape 5 : Migrer les Composants
- [ ] HomeScreen
- [ ] TopicsListScreen
- [ ] TopicScreen
- [ ] ProfileScreen
- [ ] SettingsScreen
- [ ] LoginScreen
- [ ] SignupScreen

### Étape 6 : Supprimer l'Ancien Code
- [ ] Supprimer AuthContext
- [ ] Supprimer ThemeContext
- [ ] Supprimer ancien useQuotes hook

---

## 🎯 Avantages de la Migration

### Performance
- ✅ Cache automatique (pas de re-fetch inutiles)
- ✅ Optimistic updates
- ✅ Background refetching
- ✅ Moins de re-renders

### Developer Experience
- ✅ DevTools Redux
- ✅ DevTools React Query
- ✅ TypeScript support complet
- ✅ Code plus lisible

### Maintenabilité
- ✅ Séparation claire client/server state
- ✅ Code modulaire
- ✅ Facile à tester
- ✅ Moins de boilerplate


