# Guide de Configuration des Souscriptions Focus

Ce guide explique comment configurer et gérer le système de souscriptions de l'application Focus avec Stripe.

## Table des matières

1. [Prérequis](#prérequis)
2. [Configuration Stripe](#configuration-stripe)
3. [Configuration de l'API](#configuration-de-lapi)
4. [Configuration des Plans d'Abonnement](#configuration-des-plans-dabonnement)
5. [Configuration des Webhooks](#configuration-des-webhooks)
6. [Fonctionnement Utilisateur](#fonctionnement-utilisateur)
7. [Administration](#administration)
8. [Dépannage](#dépannage)

---

## Prérequis

- Un compte Stripe (https://dashboard.stripe.com)
- L'API Focus déployée et accessible
- L'application mobile Focus configurée

---

## Configuration Stripe

### 1. Créer un compte Stripe

1. Rendez-vous sur https://dashboard.stripe.com/register
2. Créez votre compte et vérifiez votre email
3. Complétez les informations de votre entreprise

### 2. Récupérer les clés API

1. Allez dans **Developers > API keys** (https://dashboard.stripe.com/apikeys)
2. Notez les clés suivantes :
   - **Publishable key** : `pk_test_...` (pour le mobile)
   - **Secret key** : `sk_test_...` (pour l'API)

> ⚠️ **Important** : En mode test, utilisez les clés `pk_test_` et `sk_test_`. En production, utilisez `pk_live_` et `sk_live_`.

### 3. Créer les Produits et Prix

1. Allez dans **Products** (https://dashboard.stripe.com/products)
2. Cliquez sur **+ Add product**

#### Produit Mensuel

- **Name** : Focus Premium Mensuel
- **Description** : Accès illimité à toutes les citations et fonctionnalités premium
- **Pricing** :
  - Prix : 4.99 EUR
  - Récurrence : Mensuel

3. Après création, notez le **Price ID** (ex: `price_1ABC123...`)

#### Produit Annuel

- **Name** : Focus Premium Annuel
- **Description** : Accès illimité pendant 1 an - Économisez 17%
- **Pricing** :
  - Prix : 49.99 EUR
  - Récurrence : Annuel

3. Notez le **Price ID**

---

## Configuration de l'API

### Variables d'environnement

Créez ou modifiez le fichier `apps/api/.env` :

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook

# Price IDs (créés dans Stripe Dashboard)
STRIPE_MONTHLY_PRICE_ID=price_votre_id_mensuel
STRIPE_YEARLY_PRICE_ID=price_votre_id_annuel

# URLs
APP_URL=https://votre-domaine.com
API_URL=https://api.votre-domaine.com
```

### Configuration Mobile

Modifiez `apps/mobile/.env` :

```env
# Stripe (clé publique uniquement !)
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique

# API
API_URL=https://api.votre-domaine.com
```

---

## Configuration des Plans d'Abonnement

### Via l'API (recommandé)

Créez les plans via les endpoints API :

```bash
# Créer le plan mensuel
curl -X POST https://api.votre-domaine.com/subscriptions/plans \
  -H "Authorization: Bearer VOTRE_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Mensuel",
    "description": "Accès illimité pendant 1 mois",
    "type": "MONTHLY",
    "price": 4.99,
    "discountPercentage": 0,
    "stripePriceId": "price_votre_id_mensuel",
    "isActive": true,
    "durationMonths": 1
  }'

# Créer le plan annuel
curl -X POST https://api.votre-domaine.com/subscriptions/plans \
  -H "Authorization: Bearer VOTRE_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Annuel",
    "description": "Accès illimité pendant 1 an - Économisez 17%",
    "type": "YEARLY",
    "price": 49.99,
    "discountPercentage": 17,
    "stripePriceId": "price_votre_id_annuel",
    "isActive": true,
    "durationMonths": 12
  }'
```

### Configuration Globale

Configurez les paramètres globaux :

```bash
curl -X PUT https://api.votre-domaine.com/subscriptions/config \
  -H "Authorization: Bearer VOTRE_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "freemium_duration_days": "30",
    "monthly_price": "4.99",
    "yearly_price": "49.99",
    "yearly_discount_percentage": "17"
  }'
```

---

## Configuration des Webhooks

Les webhooks permettent à Stripe de notifier votre API des événements de paiement.

### 1. Créer le Webhook dans Stripe

1. Allez dans **Developers > Webhooks** (https://dashboard.stripe.com/webhooks)
2. Cliquez sur **+ Add endpoint**
3. Configurez :
   - **Endpoint URL** : `https://api.votre-domaine.com/subscriptions/webhook`
   - **Events to send** :
     - `checkout.session.completed`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`

4. Après création, cliquez sur **Reveal** pour voir le **Signing secret**
5. Copiez ce secret dans votre `.env` : `STRIPE_WEBHOOK_SECRET=whsec_...`

### 2. Test en local (développement)

Pour tester les webhooks en local, utilisez Stripe CLI :

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter les webhooks et les rediriger vers votre API locale
stripe listen --forward-to localhost:3001/subscriptions/webhook
```

Le CLI affichera un webhook secret temporaire à utiliser.

---

## Fonctionnement Utilisateur

### Parcours de souscription

1. **Période d'essai gratuite**
   - Chaque nouvel utilisateur bénéficie de 30 jours d'essai gratuit (configurable)
   - Pendant cette période, l'utilisateur a accès à toutes les fonctionnalités premium

2. **Écran de souscription**
   - L'utilisateur accède à l'écran de souscription depuis les paramètres
   - Il voit les deux offres : Mensuel et Annuel
   - L'économie sur l'offre annuelle est clairement affichée

3. **Processus de paiement**
   - L'utilisateur sélectionne un plan
   - Il est redirigé vers Stripe Checkout (page de paiement sécurisée)
   - Après paiement, il est redirigé vers l'application
   - Son statut premium est automatiquement activé

4. **Gestion de l'abonnement**
   - L'utilisateur peut voir son statut dans son profil
   - Il peut annuler son abonnement à tout moment
   - L'accès premium reste actif jusqu'à la fin de la période payée

### Statuts de souscription

| Statut      | Description                              |
| ----------- | ---------------------------------------- |
| `TRIAL`     | Période d'essai gratuite                 |
| `ACTIVE`    | Abonnement actif et payé                 |
| `PAST_DUE`  | Paiement en retard (tentatives en cours) |
| `CANCELLED` | Annulé par l'utilisateur                 |
| `EXPIRED`   | Abonnement expiré                        |

---

## Administration

### Dashboard Admin

Le dashboard admin affiche :

- **Revenus totaux** : Somme de tous les paiements réussis
- **Revenus mensuels** : Revenus du mois en cours
- **Utilisateurs Premium** : Nombre d'utilisateurs avec abonnement actif
- **Utilisateurs Gratuits** : Utilisateurs sans abonnement
- **Transactions récentes** : Les 10 dernières transactions

### Endpoints API Admin

#### Statistiques

```

GET /subscriptions/stats

```

Retourne les statistiques de souscription (admin uniquement).

#### Plans

```

GET /subscriptions/plans # Liste tous les plans
POST /subscriptions/plans # Créer un plan (admin)
PUT /subscriptions/plans/:id # Modifier un plan (admin)
DELETE /subscriptions/plans/:id # Supprimer un plan (admin)

```

#### Configuration

```

GET /subscriptions/config # Récupérer la config
PUT /subscriptions/config # Modifier la config (admin)

```

#### Paiements

```

GET /subscriptions/payments # Liste des paiements (admin)
GET /subscriptions/my/payments # Paiements de l'utilisateur connecté

```

---

## Dépannage

### Problèmes courants

#### 1. "Stripe webhook secret not configured"

- Vérifiez que `STRIPE_WEBHOOK_SECRET` est défini dans `.env`
- Redémarrez l'API après modification

#### 2. "Webhook signature verification failed"

- Le secret webhook ne correspond pas
- Vérifiez que vous utilisez le bon secret (celui du webhook, pas la clé API)
- En local, utilisez le secret fourni par `stripe listen`

#### 3. Paiement réussi mais statut non mis à jour

- Vérifiez les logs de l'API pour les erreurs webhook
- Vérifiez que l'URL du webhook est accessible depuis Internet
- Testez avec `stripe trigger checkout.session.completed`

#### 4. "Plan not found" lors du checkout

- Vérifiez que le plan existe dans la base de données
- Vérifiez que `stripePriceId` correspond à un prix Stripe valide

### Logs utiles

```bash
# Voir les événements webhook dans Stripe
stripe events list --limit 10

# Voir les logs de l'API
tail -f apps/api/logs/combined.log

# Tester un webhook manuellement
stripe trigger checkout.session.completed
```

### Mode Test vs Production

| Élément       | Test                | Production             |
| ------------- | ------------------- | ---------------------- |
| Clé API       | `sk_test_...`       | `sk_live_...`          |
| Clé publique  | `pk_test_...`       | `pk_live_...`          |
| Carte de test | 4242 4242 4242 4242 | Vraies cartes          |
| Webhook       | Endpoint de test    | Endpoint de production |

#### Cartes de test Stripe

| Numéro              | Résultat           |
| ------------------- | ------------------ |
| 4242 4242 4242 4242 | Paiement réussi    |
| 4000 0000 0000 0002 | Carte refusée      |
| 4000 0000 0000 9995 | Fonds insuffisants |

---

## Checklist de mise en production

- [ ] Créer un compte Stripe en mode live
- [ ] Créer les produits et prix en mode live
- [ ] Mettre à jour les clés API (sk*live*, pk*live*)
- [ ] Créer le webhook de production
- [ ] Mettre à jour STRIPE_WEBHOOK_SECRET
- [ ] Mettre à jour les Price IDs dans la config
- [ ] Tester un paiement réel avec une petite somme
- [ ] Vérifier que les webhooks fonctionnent
- [ ] Configurer les emails de notification Stripe

---

## Support

Pour toute question :

- Documentation Stripe : https://stripe.com/docs
- Support ODERA : contact@oderaformations.com
