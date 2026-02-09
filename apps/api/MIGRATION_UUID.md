# Migration vers UUID

## ⚠️ IMPORTANT

Cette migration convertit tous les IDs de `number` vers `UUID` (string). 

**Cette migration supprimera toutes les données existantes !**

## Changements

### Entités modifiées

- ✅ **Topic** : `id: number` → `id: string` (UUID)
- ✅ **Quote** : `id: number` → `id: string` (UUID)
- ✅ **User** : `id: number` → `id: string` (UUID)

### Nouveaux champs Topic

- ✅ `title` : Titre d'affichage (optionnel)
- ✅ `icon` : Nom de l'icône Ionicons (optionnel)
- ✅ `color` : Couleur du gradient (optionnel)
- ✅ `isPremium` : Statut premium (boolean)

## Comment migrer

### Option 1 : Reset complet (recommandé pour développement)

```bash
cd apps/api
npm run db:reset
npm run dev
```

Cela va :
1. Supprimer l'ancienne base de données
2. Créer une nouvelle base avec UUID
3. Démarrer le serveur

### Option 2 : Reset manuel

```bash
cd apps/api
rm database.sqlite
npm run dev
```

### Après la migration

1. **Réimporter les données** : Utilisez les scripts de seed pour réimporter vos topics et quotes
2. **Recréer les utilisateurs** : Les utilisateurs devront se réinscrire
3. **Vérifier l'admin** : Connectez-vous à l'admin panel pour vérifier que tout fonctionne

## Nouveaux types

### TypeScript (Mobile & Admin)

```typescript
interface Topic {
  id: string;  // ← UUID au lieu de number
  name: string;
  title?: string;
  icon?: string;
  color?: string;
  isPremium?: boolean;
}

interface Quote {
  id: string;  // ← UUID au lieu de number
  text: string;
  author: string;
  topic?: Topic;
}
```

### API

Les endpoints restent les mêmes, mais acceptent maintenant des UUID :

```
GET    /topics/:id          → id est un UUID
GET    /quotes/:id          → id est un UUID
PATCH  /topics/:id          → id est un UUID
DELETE /quotes/:id          → id est un UUID
```

## Admin Panel

Le formulaire d'édition des topics inclut maintenant :

- **Title** : Titre d'affichage (par défaut = name)
- **Icon** : Nom de l'icône Ionicons (ex: flame, trophy, heart)
- **Color** : Sélecteur de couleur pour le gradient
- **Premium** : Toggle pour marquer le topic comme premium

## Vérifications

Après la migration, vérifiez :

- [ ] L'API démarre sans erreur
- [ ] Les topics peuvent être créés/modifiés
- [ ] Les quotes peuvent être créées/modifiées
- [ ] L'admin panel affiche correctement les topics avec leurs couleurs/icônes
- [ ] L'app mobile affiche correctement les topics
- [ ] Les topics premium sont verrouillés pour les utilisateurs non-premium

## Rollback

⚠️ **Il n'y a pas de rollback possible** car cette migration supprime toutes les données.

Si vous devez revenir en arrière :
1. Restaurez une sauvegarde de votre base de données
2. Revertez les changements de code avec git

