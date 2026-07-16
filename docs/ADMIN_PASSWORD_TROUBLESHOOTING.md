# 🔧 Troubleshooting: Admin Password - Assign Subscription

## ❌ Erreur Rencontrée

```json
{
  "message": "Invalid admin password",
  "error": "Unauthorized",
  "statusCode": 401
}
```

Lors de l'assignation manuelle de souscription via le dashboard admin.

---

## 🔍 Cause du Problème

L'endpoint `/subscriptions/users/:userId/assign-subscription` vérifie le **mot de passe de l'administrateur** pour sécuriser cette action sensible.

**Processus de vérification** :
1. Admin entre son mot de passe dans le formulaire
2. Backend récupère le hash du mot de passe de cet admin dans la DB
3. Backend compare le mot de passe fourni avec le hash (bcrypt)
4. Si différent → Erreur 401

**Raisons possibles** :
- ✅ L'admin utilise le mauvais mot de passe
- ✅ L'admin a changé son mot de passe et ne s'en souvient plus
- ✅ Le compte admin a été créé avec un mot de passe temporaire

---

## ✅ Solution 1: Vérifier le Mot de Passe Admin

### Étape 1: Connexion Admin Dashboard

1. Allez sur le dashboard admin : http://localhost:3001/login
2. Essayez de vous connecter avec vos identifiants
3. **Si la connexion échoue** → Votre mot de passe n'est pas celui que vous pensez

---

### Étape 2: Réinitialiser le Mot de Passe (si connexion échoue)

#### Option A: Via SQL (Supabase Dashboard)

```sql
-- Remplacer 'NOUVEAU_MOT_DE_PASSE' par votre mot de passe souhaité
-- Ce script hashera automatiquement le mot de passe

-- 1. Installer bcrypt si pas disponible (pas nécessaire dans Supabase)
-- 2. Hasher le mot de passe
-- Pour un mot de passe "admin123", le hash est :
-- $2b$10$YourHashedPasswordHere

UPDATE "user"
SET password = '$2b$10$K8Y0ZQZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9'
WHERE email = 'votre-email-admin@example.com' AND "isAdmin" = true;
```

⚠️ **Attention** : Le hash ci-dessus est un exemple. Pour générer un vrai hash :

**Méthode 1: Node.js Console**
```bash
cd apps/api
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('VOTRE_NOUVEAU_MOT_DE_PASSE', 10, (err, hash) => console.log(hash));"
```

**Méthode 2: Online Bcrypt Generator**
- Allez sur https://bcrypt-generator.com/
- Entrez votre mot de passe
- Rounds: 10
- Copiez le hash généré

Puis :
```sql
UPDATE "user"
SET password = 'LE_HASH_GÉNÉRÉ'
WHERE email = 'votre-email-admin@example.com' AND "isAdmin" = true;
```

---

#### Option B: Via Script Seed Admin

Si vous avez créé l'admin via `npm run db:seed:admin`, le mot de passe par défaut est **`admin123`**.

**Vérifiez** :
1. Email : `admin@focus.com`
2. Password : `admin123`

**Si ce n'est pas ça**, recréez l'admin :

```bash
cd apps/api

# Supprimer l'ancien admin (optionnel)
# psql $DATABASE_URL -c "DELETE FROM \"user\" WHERE email = 'admin@focus.com';"

# Recréer l'admin avec le script
npm run db:seed:admin
```

**Nouvelles credentials** :
- Email : `admin@focus.com`
- Password : `admin123`

⚠️ **Changez ce mot de passe immédiatement après connexion !**

---

## ✅ Solution 2: Tester le Mot de Passe

### Test de Connexion Dashboard

1. Ouvrir http://localhost:3001/login
2. Entrer email + mot de passe
3. **Si connexion réussit** → Utilisez CE mot de passe pour l'assignation

---

### Test Direct avec l'API

```bash
# Remplacer EMAIL et PASSWORD par vos vraies credentials
curl -X POST http://localhost:3004/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@focus.com", "password": "admin123"}'
```

**Si succès** :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "admin@focus.com",
    "isAdmin": true
  }
}
```

**Si échec** :
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

→ Le mot de passe est incorrect

---

## ✅ Solution 3: Changer le Mot de Passe Admin

### Via Dashboard Admin (Recommandé)

**TODO** : Fonctionnalité à implémenter dans le dashboard
- Page "Profile" ou "Settings"
- Formulaire "Change Password"
- Champs : Old Password, New Password, Confirm New Password

### Via SQL Direct

```sql
-- Générer un hash d'abord (voir ci-dessus)
UPDATE "user"
SET password = '$2b$10$NOUVEAU_HASH_ICI'
WHERE email = 'votre-email-admin@example.com' AND "isAdmin" = true;
```

---

## 🎯 Procédure Complète

### Étape par Étape

**1. Identifier le problème**
```bash
# Tester la connexion admin dashboard
http://localhost:3001/login
```

**2. Si connexion échoue**
```bash
# Réinitialiser le mot de passe via seed
cd apps/api
npm run db:seed:admin
```

**3. Se reconnecter avec nouveau password**
```
Email: admin@focus.com
Password: admin123
```

**4. Essayer l'assignation de souscription**
```
Dashboard → Users → [Select User] → Assign Subscription
Plan: [Select Plan]
Admin Password: admin123
```

**5. ✅ Ça devrait marcher !**

---

## 🔐 Sécurité

### Bonnes Pratiques

1. ✅ **Ne JAMAIS** stocker de mots de passe en clair
2. ✅ **Toujours** hasher avec bcrypt (10 rounds minimum)
3. ✅ **Changer** le mot de passe par défaut immédiatement
4. ✅ **Utiliser** des mots de passe forts (min 12 caractères)

### Exemple de Mot de Passe Fort

❌ Faible : `admin123`  
✅ Fort : `Admin@2026!SecureFocus`

---

## 📝 Notes Techniques

### Comment fonctionne la vérification ?

**Backend** : `apps/api/src/auth/auth.service.ts`
```typescript
async verifyPassword(userId: string, password: string): Promise<boolean> {
  const user = await this.usersService.findOne(userId);
  if (!user || !user.password) {
    return false;
  }
  return bcrypt.compare(password, user.password);
}
```

**Processus** :
1. Récupère l'utilisateur par ID
2. Compare le `password` (clair) avec `user.password` (hash)
3. Bcrypt déchiffre et compare
4. Retourne `true` ou `false`

### Endpoint Assign Subscription

**Controller** : `apps/api/src/subscriptions/subscriptions.controller.ts`
```typescript
@Post('users/:userId/assign-subscription')
async assignSubscriptionToUser(
  @Request() req: AuthenticatedRequest,
  @Param('userId') userId: string,
  @Body('planId') planId: string,
  @Body('adminPassword') adminPassword: string,
) {
  if (!req.user.isAdmin) {
    throw new ForbiddenException('Only admins can assign subscriptions');
  }
  return this.subscriptionsService.assignSubscriptionToUser(
    userId,
    planId,
    req.user.userId,  // L'ID de l'admin connecté
    adminPassword,    // Le mot de passe fourni
  );
}
```

**Service** : `apps/api/src/subscriptions/subscriptions.service.ts`
```typescript
async assignSubscriptionToUser(
  userId: string,
  planId: string,
  adminId: string,
  adminPassword: string,
): Promise<Subscription> {
  const isValidPassword = await this.authService.verifyPassword(
    adminId,
    adminPassword,
  );
  if (!isValidPassword) {
    throw new UnauthorizedException('Invalid admin password');
  }
  // ... reste de la logique
}
```

---

## ✅ Checklist Finale

- [ ] Connexion au dashboard admin réussie
- [ ] Mot de passe admin connu et testé
- [ ] Assignation de souscription testée avec succès
- [ ] Mot de passe par défaut changé (si applicable)

