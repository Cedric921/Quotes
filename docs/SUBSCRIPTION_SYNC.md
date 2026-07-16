# 🔄 Synchronisation du Statut de Souscription - Mobile

**Problème Identifié** : Certains utilisateurs gardent le statut 'premium' même quand leur abonnement est expiré.

**Solution** : Vérification périodique du statut de souscription côté mobile (toutes les 5 minutes).

---

## 🐛 Problème

### Symptômes
- Utilisateur a `isSubscribed: true` dans l'app mobile
- Backend a `isSubscribed: false` (abonnement expiré)
- L'utilisateur continue à avoir accès au contenu premium
- Les notifications ne sont plus envoyées (car backend = free tier)

### Cause Racine
- L'app mobile stocke `isSubscribed` dans Redux + AsyncStorage
- Une fois connecté, ce statut n'est **jamais** re-synchronisé avec le backend
- Le backend a un **cron job quotidien** qui expire les abonnements à minuit
- Mais le mobile ne sait pas que le backend a changé le statut

---

## ✅ Solution Implémentée

### Architecture

```
[Mobile App Redux]
       ↓
  (Chaque 5 min)
       ↓
[GET /users/:id] → Backend vérifie DB → Renvoie isSubscribed actuel
       ↓
[Compare avec Redux]
       ↓
  Si différent → Mise à jour Redux
```

### Fichiers Modifiés

#### 1. **Nouveau Service** : `apps/mobile/src/services/subscriptionSyncService.ts`

**Fonctions principales** :
- `checkSubscriptionStatus()` - Vérifie le statut via API `/users/:id`
- `startSubscriptionSync()` - Démarre la vérification périodique (5 min)
- `stopSubscriptionSync()` - Arrête la vérification
- `restartSubscriptionSync()` - Redémarre (utile après login)

**Logique** :
```typescript
1. Récupérer userId depuis Redux
2. Appeler GET /users/:id
3. Comparer user.isSubscribed (Redux) vs updatedUser.isSubscribed (API)
4. Si différent :
   - Logger le changement
   - Dispatcher setUser() avec nouveau statut
5. Sinon : ne rien faire
```

---

#### 2. **Intégration** : `apps/mobile/App.tsx`

**Au démarrage de l'app** :
```typescript
useEffect(() => {
  // ... autres initialisations
  
  // Start subscription status sync (checks every 5 minutes)
  startSubscriptionSync();

  // Cleanup on unmount
  return () => {
    stopSubscriptionSync();
  };
}, []);
```

**Lors du retour en foreground** :
```typescript
AppState.addEventListener("change", (nextState) => {
  if (nextState === "active") {
    // Vérifier immédiatement le statut
    checkSubscriptionStatus();
  }
});
```

---

## 🕐 Fréquence de Vérification

### Vérification Périodique
- **Intervalle** : 5 minutes
- **Démarrage** : Au lancement de l'app
- **Arrêt** : Fermeture de l'app

### Vérification Immédiate
- Au lancement de l'app
- Lors du retour en foreground (app devient active)
- Après une connexion utilisateur (optionnel)

---

## 📊 Scénarios Couverts

### Scénario 1: Expiration Naturelle
```
1. Utilisateur a un abonnement de 7 jours
2. Jour 7 à 00:00 → Backend cron job expire l'abonnement
3. Mobile continue avec isSubscribed: true
4. 5 min plus tard → checkSubscriptionStatus() détecte l'expiration
5. Redux mis à jour → isSubscribed: false
6. Utilisateur perd accès au premium
```

---

### Scénario 2: Activation Manuelle par Admin
```
1. Admin assigne une souscription à l'utilisateur via dashboard
2. Backend met isSubscribed: true
3. Mobile a toujours isSubscribed: false
4. 5 min plus tard → checkSubscriptionStatus() détecte l'activation
5. Redux mis à jour → isSubscribed: true
6. Utilisateur gagne accès au premium
```

---

### Scénario 3: Retour en Foreground
```
1. Utilisateur ferme l'app à 08:00 (isSubscribed: true)
2. À 00:00 (pendant la nuit) → Backend expire l'abonnement
3. Utilisateur rouvre l'app à 09:00
4. AppState change → checkSubscriptionStatus() appelé immédiatement
5. Statut mis à jour en <1 seconde
6. Utilisateur voit le contenu free immédiatement
```

---

## 🔍 Logs de Débogage

### Cas Normal (pas de changement)
```
[SubscriptionSync] Starting periodic sync (every 5 minutes)
[SubscriptionSync] Subscription status unchanged: isSubscribed=true
```

### Cas Expiration
```
[SubscriptionSync] Subscription status changed: true → false
[SubscriptionSync] ⚠️ Subscription EXPIRED - User downgraded to free tier
```

### Cas Activation
```
[SubscriptionSync] Subscription status changed: false → true
[SubscriptionSync] ✅ Subscription ACTIVATED - User upgraded to premium
```

### Cas Erreur 401 (déconnecté)
```
[SubscriptionSync] User not authenticated (401)
```

---

## ⚡ Performance et Optimisation

### Impact Réseau
- **1 requête** toutes les 5 minutes
- **~1 KB** de données (endpoint `/users/:id`)
- **Négligeable** pour la batterie et data usage

### Impact CPU/Mémoire
- Tâche très légère (simple fetch + comparaison)
- Pas de re-render si pas de changement
- Aucun impact perceptible

---

## 🧪 Comment Tester

### Test 1: Expiration Automatique

1. Créer un abonnement de 1 jour pour un utilisateur
2. Se connecter sur mobile → Vérifier `isSubscribed: true`
3. Attendre 24h + 5 minutes (ou forcer l'expiration via cron job)
4. Observer les logs mobile :
   ```
   [SubscriptionSync] Subscription EXPIRED
   ```
5. Vérifier que le contenu premium est inaccessible

---

### Test 2: Attribution Manuelle

1. Utilisateur mobile avec `isSubscribed: false`
2. Admin dashboard → Assign Subscription à cet utilisateur
3. Attendre max 5 minutes
4. Observer les logs mobile :
   ```
   [SubscriptionSync] Subscription ACTIVATED
   ```
5. Vérifier que le contenu premium est accessible

---

### Test 3: Retour en Foreground

1. Utilisateur avec abonnement actif
2. Fermer l'app (background)
3. Utiliser admin pour **expirer manuellement** l'abonnement
   ```sql
   UPDATE subscription SET status = 'EXPIRED', "endDate" = NOW() WHERE "userId" = '...';
   UPDATE "user" SET "isSubscribed" = false WHERE id = '...';
   ```
4. Rouvrir l'app mobile
5. Statut doit être mis à jour en <1 seconde

---

## 🔧 Maintenance

### Ajuster la Fréquence

Pour changer l'intervalle (actuellement 5 min) :

```typescript
// apps/mobile/src/services/subscriptionSyncService.ts
const SYNC_INTERVAL = 3 * 60 * 1000; // 3 minutes au lieu de 5
```

**Recommandations** :
- ❌ **< 1 min** : Trop de requêtes, impact batterie
- ✅ **3-5 min** : Bon équilibre
- ⚠️ **> 10 min** : Délai trop long pour l'UX

---

### Désactiver la Synchronisation

Si besoin de désactiver temporairement :

```typescript
// App.tsx
// Commenter ces lignes :
// startSubscriptionSync();
```

---

## 📚 API Backend Utilisée

### Endpoint
```
GET /users/:id
```

### Response
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "isSubscribed": false,  // ← Champ vérifié
  "isAdmin": false,
  "subscriptionEndDate": null,
  "likedQuotesCount": 12
}
```

### Authentication
- Requiert header `Authorization: Bearer <token>`
- Gère automatiquement par axios interceptor

---

## ✅ Checklist Post-Implémentation

- [x] Service `subscriptionSyncService.ts` créé
- [x] Intégration dans `App.tsx` (démarrage)
- [x] Vérification sur retour foreground
- [x] Logs de débogage ajoutés
- [x] Gestion des erreurs (401, network)
- [x] Documentation complète

---

## 🎯 Résultat Attendu

Après cette implémentation :
- ✅ Les utilisateurs avec abonnement expiré perdront le premium en max 5 min
- ✅ Les activations admin seront reflétées en max 5 min
- ✅ Pas d'impact perceptible sur les performances
- ✅ Meilleure cohérence entre mobile et backend

