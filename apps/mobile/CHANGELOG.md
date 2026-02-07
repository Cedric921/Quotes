# Changelog

## [2.0.0] - 2026-02-07

### 🎉 Refactoring majeur

#### Added
- ✅ Hook personnalisé `useQuotes` pour la gestion des citations
- ✅ Composant `LoadingScreen` pour l'état de chargement
- ✅ Composant `ErrorMessage` avec bouton retry
- ✅ Service API amélioré avec intercepteurs
- ✅ Configuration centralisée dans `constants/config.ts`
- ✅ Exports centralisés pour tous les modules
- ✅ Documentation complète (README.md, REFACTORING.md)
- ✅ Types TypeScript centralisés
- ✅ API pour les topics (`topicsApi`)
- ✅ Logging des requêtes API
- ✅ Gestion avancée des erreurs

#### Changed
- 🔄 `App.tsx` simplifié (123 → 19 lignes)
- 🔄 Logique métier extraite dans `useQuotes` hook
- 🔄 UI extraite dans `HomeScreen`
- 🔄 Props des composants en `readonly`
- 🔄 Amélioration de la gestion d'erreurs
- 🔄 Configuration API centralisée

#### Improved
- ⚡ Performance avec `useCallback` et memoization
- ⚡ Optimisation FlatList avec `getItemLayout`
- 📝 Documentation JSDoc pour toutes les méthodes API
- 🎨 Architecture modulaire et scalable
- 🧪 Code plus testable
- 🔧 Meilleure maintenabilité

#### Fixed
- 🐛 Erreurs TypeScript corrigées
- 🐛 Import inutilisé de `Text` supprimé
- 🐛 Import de `React` supprimé (non nécessaire)
- 🐛 Gestion des erreurs réseau améliorée

### 📁 Structure

```
src/
├── components/      # Composants UI réutilisables
├── screens/         # Écrans de l'application
├── hooks/           # Hooks personnalisés
├── services/        # Services API
├── types/           # Types TypeScript
└── constants/       # Configuration
```

### 🔧 Configuration

- API URL configurée via `API_CONFIG.LOCAL_IP`
- Timeout API : 10 secondes
- Pagination : 10 quotes par page
- Threshold : 0.5 pour infinite scroll

---

## [1.0.0] - 2026-02-06

### Initial Release
- Liste de citations avec pagination
- Pull-to-refresh
- Affichage des topics
- Bouton like
