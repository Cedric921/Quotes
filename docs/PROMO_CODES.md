# 🎁 Système de Promo Codes - Documentation

## Vue d'ensemble

Le système de promo codes permet d'offrir un accès premium gratuit et temporaire aux utilisateurs via des codes promotionnels.

## Architecture

### Backend (NestJS)

#### Entités

**PromoCode** (`apps/api/src/subscriptions/entities/promo-code.entity.ts`)
```typescript
{
  id: string;              // UUID
  code: string;            // Code promo (unique)
  expirationDate: Date;    // Date d'expiration
  durationDays: number;    // Durée en jours du premium
  usageCount: number;      // Nombre d'utilisations
  isActive: boolean;       // Actif/Inactif
  description?: string;    // Description optionnelle
  createdAt: Date;        // Date de création
  updatedAt: Date;        // Date de mise à jour
}
```

**User** (champ ajouté)
```typescript
{
  // ... autres champs
  usedPromoCode?: string;  // Code promo utilisé (null si aucun)
}
```

#### Services

**PromoCodeService** (`apps/api/src/subscriptions/promo-code.service.ts`)

Méthodes principales :
- `create(dto)` - Créer un promo code
- `findAll()` - Liste tous les promo codes
- `findOne(id)` - Trouver un promo code par ID
- `findByCode(code)` - Trouver par code
- `update(id, dto)` - Mettre à jour
- `delete(id)` - Supprimer
- `getUsersByPromoCode(code)` - Utilisateurs ayant utilisé le code
- `validatePromoCode(code)` - Valider un code (expire, actif, etc.)
- `incrementUsageCount(code)` - Incrémenter le compteur

**SubscriptionsService** (méthode ajoutée)
- `applyPromoCode(userId, promoCode)` - Appliquer un code à un utilisateur

#### Endpoints

**Admin Only** (authentification + vérification isAdmin) :
- `POST /subscriptions/promo-codes` - Créer
- `GET /subscriptions/promo-codes` - Liste
- `GET /subscriptions/promo-codes/:id` - Détails
- `GET /subscriptions/promo-codes/:code/users` - Utilisateurs
- `PUT /subscriptions/promo-codes/:id` - Modifier
- `DELETE /subscriptions/promo-codes/:id` - Supprimer

**Authentifié** :
- `POST /subscriptions/apply-promo-code` - Appliquer un code

### Frontend Admin (Next.js)

#### Page Promo Codes (`apps/admin/src/app/dashboard/promo-codes/page.tsx`)

**Fonctionnalités** :
- Liste des promo codes avec :
  - Code (font monospace)
  - Date d'expiration
  - Durée en jours
  - Nombre d'utilisations
  - Statut (Actif/Inactif)
  - Actions (Voir détails, Supprimer)

- Formulaire de création :
  - Code (auto-uppercase)
  - Date d'expiration
  - Durée en jours
  - Description optionnelle

- Modal "View Details" :
  - Informations du code
  - Liste des utilisateurs ayant utilisé le code
  - Email, nom, date d'inscription
  - Statut premium actuel

#### Hooks (`apps/admin/src/api/hooks/usePromoCodes.ts`)

- `usePromoCodes()` - Fetch all
- `usePromoCode(id)` - Fetch one
- `usePromoCodeUsers(code)` - Fetch users
- `useCreatePromoCode()` - Mutation create
- `useUpdatePromoCode()` - Mutation update
- `useDeletePromoCode()` - Mutation delete

### Mobile (React Native)

#### Hook (`apps/mobile/src/api/hooks/usePromoCode.ts`)

- `useApplyPromoCode()` - Mutation pour appliquer un code

#### Intégration

**SignupScreen** (`apps/mobile/src/screens/SignupScreen.tsx`)
- Champ optionnel "Promo Code"
- Conversion automatique en majuscules
- Application automatique après inscription réussie

**ProfileCompletionModal** (`apps/mobile/src/components/onboarding/ProfileCompletionModal.tsx`)
- Même champ optionnel dans le flux onboarding
- Passe le code au parent pour traitement

## Flux d'utilisation

### 1. Création d'un Promo Code (Admin)

1. Admin se connecte au dashboard
2. Navigue vers `/dashboard/promo-codes`
3. Remplit le formulaire :
   - Code : `WELCOME30`
   - Expiration : `2024-12-31`
   - Durée : `30` jours
   - Description : `Code de bienvenue`
4. Clique sur "Create Promo Code"
5. Le code apparaît dans la liste

### 2. Utilisation par un Utilisateur (Mobile)

1. Utilisateur ouvre l'app Focus
2. Clique sur "Sign up"
3. Remplit les informations (nom, email, mot de passe)
4. Entre le promo code : `WELCOME30`
5. Clique sur "Sign up"
6. **Backend** :
   - Crée le compte utilisateur
   - Valide le promo code (existe, actif, non expiré)
   - Vérifie que l'utilisateur n'a pas déjà utilisé un code
   - Applique 30 jours de premium
   - Marque `user.usedPromoCode = "WELCOME30"`
   - Incrémente `promoCode.usageCount`
7. Utilisateur reçoit un message de succès
8. Premium activé immédiatement

### 3. Suivi (Admin)

1. Admin retourne sur `/dashboard/promo-codes`
2. Voit `WELCOME30` avec `usageCount: 5`
3. Clique sur "View Details" (icône œil)
4. Modal affiche :
   - Détails du code
   - Liste des 5 utilisateurs qui l'ont utilisé

## Règles de Validation

### Backend

✅ **Code valide si** :
- Existe dans la base de données
- `isActive === true`
- `expirationDate > maintenant`

❌ **Application refuse si** :
- Utilisateur a déjà utilisé un promo code (`user.usedPromoCode !== null`)
- Utilisateur a déjà une souscription active et valide
- Code expiré ou inactif

### Limitations

- **Un seul promo code par utilisateur** (à vie)
- **Pas cumulable avec abonnement existant**
- **Codes sensibles à la casse** (mais auto-uppercase dans l'UI)

## Exemples de Codes

```typescript
// Code de lancement
{
  code: "LAUNCH7",
  durationDays: 7,
  expirationDate: "2024-01-31",
  description: "Code de lancement - 7 jours gratuits"
}

// Code partenariat
{
  code: "PARTNER30",
  durationDays: 30,
  expirationDate: "2024-06-30",
  description: "Partenariat XYZ"
}

// Code événement
{
  code: "EVENT2024",
  durationDays: 14,
  expirationDate: "2024-03-15",
  description: "Code spécial événement 2024"
}
```

## Sécurité

- ✅ Endpoints admin protégés par JWT + vérification `isAdmin`
- ✅ Application de code nécessite authentification
- ✅ Validation côté serveur uniquement
- ✅ Prévention des abus (1 code par utilisateur)
- ✅ Codes uniques en base de données

## Monitoring

### Métriques à suivre

- Nombre total de promo codes créés
- Taux d'utilisation par code
- Codes les plus utilisés
- Codes expirés non utilisés
- Conversion promo code → abonnement payant
