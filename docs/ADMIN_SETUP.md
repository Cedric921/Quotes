# 🔐 Admin Dashboard Setup Guide

## ⚠️ Erreur 401 "Forbidden" dans l'Admin Dashboard

Si vous recevez une erreur **401 Unauthorized** ou **403 Forbidden** lors de l'utilisation de fonctionnalités admin (Promo Codes, Attribution de Souscription, etc.), cela signifie que l'utilisateur connecté **n'est pas marqué comme admin** dans la base de données.

---

## ✅ Solution : Créer ou Promouvoir un Utilisateur Admin

### Option 1 : Utiliser le Script de Seed Admin (Recommandé)

Le projet contient un script pour créer automatiquement un utilisateur admin.

```bash
cd apps/api
npm run db:seed:admin
```

**Ce script va :**
1. Vérifier si un admin existe déjà
2. Créer un nouvel admin avec :
   - **Email** : admin@focus.com
   - **Mot de passe** : admin123
   - **isAdmin** : true

**⚠️ Important** : Changez ce mot de passe immédiatement après la première connexion !

---

### Option 2 : Promouvoir un Utilisateur Existant via SQL

Si vous avez déjà un compte et voulez le rendre admin :

#### Avec Supabase :
1. Allez dans **Supabase Dashboard** → **SQL Editor**
2. Exécutez cette requête :

```sql
UPDATE "user" 
SET "isAdmin" = true 
WHERE email = 'votre-email@example.com';
```

#### Avec psql (local ou distant) :
```bash
psql postgresql://postgres:PASSWORD@HOST:PORT/DATABASE
```

Puis exécutez :
```sql
UPDATE "user" 
SET "isAdmin" = true 
WHERE email = 'votre-email@example.com';
```

---

### Option 3 : Créer Manuellement un Admin via SQL

```sql
INSERT INTO "user" (
  "id",
  "email",
  "password",
  "name",
  "isAdmin",
  "createdAt",
  "updatedAt"
) VALUES (
  uuid_generate_v4(),
  'admin@focus.com',
  '$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', -- hash bcrypt
  'Admin User',
  true,
  NOW(),
  NOW()
);
```

**⚠️ Note** : Le mot de passe doit être hashé avec bcrypt (10 rounds). Utilisez plutôt l'Option 1 ou 2.

---

## 🔍 Vérifier le Statut Admin

### Via SQL
```sql
SELECT id, email, "isAdmin", "createdAt" 
FROM "user" 
WHERE email = 'votre-email@example.com';
```

### Via l'API (après connexion)
Endpoint : `GET /auth/me`

La réponse devrait contenir :
```json
{
  "id": "uuid",
  "email": "admin@focus.com",
  "isAdmin": true,
  ...
}
```

---

## 🚀 Tester les Fonctionnalités Admin

Une fois l'utilisateur promu admin, reconnectez-vous et testez :

### 1. Promo Codes
- **URL** : `/dashboard/promo-codes`
- **Actions** :
  - ✅ Créer un nouveau code promo
  - ✅ Voir la liste des codes
  - ✅ Voir les utilisateurs ayant utilisé un code
  - ✅ Supprimer un code

### 2. Attribution Manuelle de Souscription
- **URL** : `/dashboard/users/[userId]`
- **Action** : Bouton "Assign Subscription"
- **Prérequis** : 
  - Être admin (`isAdmin: true`)
  - Connaître votre mot de passe admin (pour confirmation)

---

## 🔑 Endpoints Protégés Admin

Les endpoints suivants nécessitent `isAdmin: true` dans le JWT :

### Promo Codes
- `POST /subscriptions/promo-codes` - Créer
- `GET /subscriptions/promo-codes` - Lister tous
- `GET /subscriptions/promo-codes/:id` - Voir un code
- `GET /subscriptions/promo-codes/:code/users` - Utilisateurs
- `PUT /subscriptions/promo-codes/:id` - Modifier
- `DELETE /subscriptions/promo-codes/:id` - Supprimer

### Attribution de Souscription
- `POST /subscriptions/users/:userId/assign-subscription`
  - **Body** : `{ planId, adminPassword }`
  - **Vérification** : Le mot de passe admin est vérifié pour sécurité

---

## 🛠️ Dépannage

### Erreur : "Only admins can view promo codes"
✅ **Solution** : L'utilisateur n'est pas admin. Suivez les étapes ci-dessus pour promouvoir l'utilisateur.

### Erreur : "Invalid admin password"
✅ **Solution** : Le mot de passe fourni pour l'attribution de souscription est incorrect.

### Le menu "Promo Codes" n'apparaît pas
✅ **Solution** : 
1. Vérifiez que vous avez la dernière version du code
2. Redémarrez l'admin dashboard : `npm run dev` (dans `apps/admin`)
3. Videz le cache du navigateur (Ctrl+Shift+R)

---

## 📚 Ressources

- **Script Admin Seed** : `apps/api/src/seeds/seed-admin.ts`
- **Documentation Promo Codes** : `docs/PROMO_CODES.md`
- **Page Admin Promo Codes** : `apps/admin/src/app/dashboard/promo-codes/page.tsx`
- **Backend Controller** : `apps/api/src/subscriptions/subscriptions.controller.ts`

---

## ✨ Compte Admin par Défaut

Après avoir exécuté `npm run db:seed:admin` :

- **Email** : admin@focus.com
- **Mot de passe** : admin123
- **isAdmin** : true

**⚠️ SÉCURITÉ** : Changez immédiatement ce mot de passe après la première connexion !

