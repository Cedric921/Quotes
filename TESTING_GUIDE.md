# Guide de Test - Migration UUID et Admin Topics

## 🎯 Objectif

Tester les deux modifications majeures :
1. ✅ Admin Panel - Gestion complète des topics (title, icon, color, isPremium)
2. ✅ Conversion des IDs en UUID

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :
- Node.js installé
- Les dépendances installées dans tous les projets

---

## 🚀 Étape 1 : Reset de la Base de Données

La base de données doit être recréée avec les UUID.

```bash
# Dans le terminal
cd apps/api
npm run db:reset
```

**Résultat attendu** :
```
✅ Database reset! Start the server to create a new database with UUID.
```

---

## 🔧 Étape 2 : Démarrer l'API

```bash
# Dans apps/api
npm run dev
```

**Résultat attendu** :
- L'API démarre sur `http://localhost:3000`
- TypeORM crée automatiquement les tables avec UUID
- Aucune erreur dans la console

**Vérifications** :
- ✅ Pas d'erreur TypeORM
- ✅ Message "Application is running on: http://localhost:3000"

---

## 🎨 Étape 3 : Démarrer l'Admin Panel

```bash
# Dans un nouveau terminal
cd apps/admin
npm run dev
```

**Résultat attendu** :
- L'admin démarre sur `http://localhost:3001`
- Aucune erreur de compilation

---

## 🧪 Étape 4 : Tester la Création de Topics

### 4.1 Créer un Topic Simple

1. Ouvrir `http://localhost:3001/dashboard/topics`
2. Cliquer sur **"Add New Topic"**
3. Remplir le formulaire :
   - **Name** : `Motivation`
   - **Description** : `Citations motivantes pour vous inspirer`
   - **Title** : `Motivation` (ou laisser vide pour utiliser le name)
   - **Icon** : `flame` (nom d'icône Ionicons)
   - **Color** : Choisir une couleur (ex: `#f093fb`)
   - **Premium** : Laisser désactivé
4. Cliquer sur **"Save Topic"**

**Résultat attendu** :
- ✅ Toast de succès "Topic created successfully"
- ✅ Le topic apparaît dans la liste
- ✅ Le gradient utilise la couleur choisie
- ✅ L'icône "flame" s'affiche (emoji 🔥)
- ✅ Pas de badge premium

### 4.2 Créer un Topic Premium

1. Cliquer sur **"Add New Topic"**
2. Remplir le formulaire :
   - **Name** : `Success`
   - **Description** : `Citations sur le succès`
   - **Title** : `Réussite`
   - **Icon** : `trophy`
   - **Color** : `#ffecd2`
   - **Premium** : ✅ **Activer le toggle**
3. Cliquer sur **"Save Topic"**

**Résultat attendu** :
- ✅ Toast de succès
- ✅ Le topic apparaît avec un badge couronne dorée (👑)
- ✅ Le gradient utilise la couleur `#ffecd2`
- ✅ L'icône trophy s'affiche

---

## 🔍 Étape 5 : Vérifier les UUID

### 5.1 Inspecter la Réponse API

1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet **Network**
3. Rafraîchir la page des topics
4. Cliquer sur la requête `GET /topics`
5. Regarder la réponse JSON

**Résultat attendu** :
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",  // ← UUID, pas un number
    "name": "Motivation",
    "title": "Motivation",
    "description": "Citations motivantes...",
    "icon": "flame",
    "color": "#f093fb",
    "isPremium": false,
    "deletedAt": null
  }
]
```

### 5.2 Vérifier la Base de Données

```bash
# Dans apps/api
sqlite3 database.sqlite

# Dans SQLite
.schema topic
```

**Résultat attendu** :
```sql
CREATE TABLE "topic" (
  "id" varchar PRIMARY KEY NOT NULL,  -- ← varchar, pas integer
  "name" varchar NOT NULL,
  "title" varchar,
  "description" varchar,
  "icon" varchar,
  "color" varchar,
  "isPremium" boolean NOT NULL DEFAULT (0),
  "deletedAt" datetime
);
```

---

## ✏️ Étape 6 : Tester l'Édition

1. Cliquer sur **"Edit"** sur un topic
2. Modifier les champs :
   - Changer la couleur
   - Changer l'icône
   - Activer/désactiver Premium
3. Cliquer sur **"Save Topic"**

**Résultat attendu** :
- ✅ Toast de succès "Topic updated successfully"
- ✅ Les changements sont visibles immédiatement
- ✅ Le gradient et l'icône sont mis à jour

---

## 🗑️ Étape 7 : Tester la Suppression

1. Cliquer sur **"Delete"** sur un topic
2. Confirmer la suppression dans le dialog

**Résultat attendu** :
- ✅ Toast de succès "Topic deleted successfully"
- ✅ Le topic disparaît de la liste

---

## 📱 Étape 8 : Tester l'App Mobile (Optionnel)

```bash
# Dans apps/mobile
npm start
```

1. Scanner le QR code avec Expo Go
2. Vérifier que les topics s'affichent avec les couleurs et icônes
3. Vérifier que les topics premium ont un badge

**Résultat attendu** :
- ✅ Les topics s'affichent avec les bonnes couleurs
- ✅ Les icônes sont visibles
- ✅ Les topics premium sont verrouillés (si non authentifié)

---

## 🎯 Checklist Finale

### Admin Panel
- [ ] Formulaire de création affiche tous les champs
- [ ] Sélecteur de couleur fonctionne
- [ ] Toggle Premium fonctionne
- [ ] Les topics s'affichent avec les bonnes couleurs
- [ ] Les icônes s'affichent correctement
- [ ] Le badge premium apparaît sur les topics premium
- [ ] L'édition fonctionne
- [ ] La suppression fonctionne

### API
- [ ] L'API démarre sans erreur
- [ ] Les tables sont créées avec UUID
- [ ] Les endpoints retournent des UUID (string)
- [ ] Les relations fonctionnent (quotes → topics)

### Types
- [ ] Aucune erreur TypeScript dans l'admin
- [ ] Aucune erreur TypeScript dans l'API
- [ ] Aucune erreur TypeScript dans le mobile

### Base de Données
- [ ] Les colonnes `id` sont de type `varchar`
- [ ] Les UUID sont générés automatiquement
- [ ] Les foreign keys fonctionnent

---

## 🐛 Problèmes Courants

### Erreur : "Module not found: @radix-ui/react-switch"
**Solution** :
```bash
cd apps/admin
npm install @radix-ui/react-switch
```

### Erreur : "Column 'id' is not a valid UUID"
**Solution** : Reset la base de données
```bash
cd apps/api
npm run db:reset
npm run dev
```

### Les topics ne s'affichent pas
**Solution** : Vérifier que l'API est démarrée et accessible sur `http://localhost:3000`

---

## 🎉 Succès !

Si tous les tests passent, la migration est réussie ! 🚀

Vous pouvez maintenant :
- Créer des topics avec des couleurs et icônes personnalisées
- Marquer des topics comme premium
- Utiliser des UUID partout dans l'application

