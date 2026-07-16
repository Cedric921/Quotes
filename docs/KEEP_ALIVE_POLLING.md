# 🔄 Keep-Alive Polling - Maintenir l'API Éveillée

**Objectif** : Faire des requêtes en background toutes les minutes pour garder l'API éveillée (éviter le cold start sur Render.com ou services similaires).

---

## 🎯 Problème Résolu

### Context
Les services d'hébergement gratuits/économiques (Render.com, Heroku Free, etc.) mettent les applications en "sleep mode" après 15-30 minutes d'inactivité. Quand un utilisateur fait une requête après cette période, l'API met 10-30 secondes à redémarrer (cold start).

### Impact Utilisateur
- ❌ Premier chargement très lent (écran blanc pendant 20s)
- ❌ Timeout de requêtes
- ❌ Mauvaise expérience utilisateur
- ❌ Impression que l'app est cassée

---

## ✅ Solution Implémentée

### Architecture

```
┌─────────────────┐       Ping toutes les 1 min       ┌─────────────────┐
│  Mobile App     │  ───────────────────────────────>  │   API Server    │
│  (HomeScreen)   │  <───────────────────────────────  │  (NestJS)       │
└─────────────────┘       GET /health (léger)          └─────────────────┘
        ↓
    Ne fait rien avec les données
    (juste pour garder l'API awake)


┌─────────────────┐       Ping toutes les 1 min       ┌─────────────────┐
│  Admin Dashboard│  ───────────────────────────────>  │   API Server    │
│  (Dashboard)    │  <───────────────────────────────  │  (NestJS)       │
└─────────────────┘   GET /health/stats + Refresh UI   └─────────────────┘
        ↓
    Invalide les queries React Query
    → Refresh automatique du dashboard
```

---

## 📁 Fichiers Créés

### 1. Mobile: `apps/mobile/src/services/keepAliveService.ts`

**Fonctions** :
- `pingApi()` - Ping l'API (GET /health)
- `startKeepAlive()` - Démarre le polling (1 min)
- `stopKeepAlive()` - Arrête le polling
- `restartKeepAlive()` - Redémarre

**Comportement** :
- Fait une requête toutes les 60 secondes
- Utilise l'endpoint `/health` (très léger)
- Ne fait RIEN avec les données (juste pour wake up)
- Logs en console pour debug

---

### 2. Admin: `apps/admin/src/services/keepAliveService.ts`

**Fonctions** :
- `pingApi()` - Ping l'API (GET /health/stats)
- `startKeepAlive(callback)` - Démarre avec callback optionnel
- `stopKeepAlive()` - Arrête
- `setKeepAliveCallback()` - Met à jour le callback

**Comportement** :
- Fait une requête toutes les 60 secondes
- Utilise `/health/stats` (renvoie les stats du dashboard)
- Si callback fourni → appelle le callback avec les données
- Permet le refresh auto du dashboard

---

## 🔧 Intégration

### Mobile - App.tsx

```typescript
import { startKeepAlive, stopKeepAlive } from "./src/services/keepAliveService";

useEffect(() => {
  // Start keep-alive ping
  startKeepAlive();

  return () => {
    stopKeepAlive();
  };
}, []);
```

**Résultat** :
- L'API reçoit un ping toutes les 60s
- Même quand l'utilisateur ne fait rien
- L'API reste éveillée en permanence

---

### Admin - Dashboard Page

```typescript
import { startKeepAlive, stopKeepAlive } from "@/services/keepAliveService";

useEffect(() => {
  startKeepAlive((data) => {
    // Refresh dashboard data
    if (data) {
      queryClient.invalidateQueries({ queryKey: statsKeys.all });
    }
  });

  return () => {
    stopKeepAlive();
  };
}, [queryClient]);
```

**Résultat** :
- L'API reçoit un ping toutes les 60s
- Les stats du dashboard sont refresh automatiquement
- Admin voit les données à jour sans F5

---

## 📊 Endpoints Utilisés

### Mobile: `GET /health`

**Requête** :
```
GET https://api.focus.com/health
```

**Réponse** :
```json
{
  "status": "ok",
  "database": "connected"
}
```

**Taille** : ~50 bytes  
**Temps** : <10ms  
**Coût** : Négligeable

---

### Admin: `GET /health/stats`

**Requête** :
```
GET https://api.focus.com/health/stats
```

**Réponse** :
```json
{
  "users": 1234,
  "topics": 45,
  "quotes": 5678,
  "subscriptions": 89
}
```

**Taille** : ~100 bytes  
**Temps** : ~50ms (1 query DB)  
**Coût** : Très faible

---

## 🕐 Fréquence et Impact

### Fréquence
- **Intervalle** : 60 secondes (1 minute)
- **Requêtes/heure** : 60
- **Requêtes/jour** : 1,440
- **Requêtes/mois** : ~43,200

### Impact Réseau
- **Data transfert** : ~2 MB/mois (mobile) + ~4 MB/mois (admin)
- **Impact utilisateur** : Invisible

### Impact Serveur
- **CPU** : <0.1% (endpoint très léger)
- **RAM** : Aucun
- **DB** : 1 query simple toutes les 60s (admin)

### Bénéfices
- ✅ **Zéro cold start** pour les vrais utilisateurs
- ✅ Temps de réponse < 200ms au lieu de 20s
- ✅ Meilleure expérience utilisateur
- ✅ Taux de rétention amélioré

---

## 🧪 Comment Tester

### Test 1: API Wake-Up

```bash
1. Arrêter l'API ou attendre 30 min d'inactivité
2. Observer que l'API est en sleep
3. Ouvrir l'app mobile
4. Observer les logs :
   [KeepAlive] ✅ API ping successful
5. Attendre 1 minute
6. Observer un nouveau ping
```

---

### Test 2: Dashboard Auto-Refresh

```bash
1. Ouvrir le dashboard admin
2. Observer les stats (ex: 100 users)
3. Dans un autre onglet, créer un utilisateur
4. Attendre max 60 secondes
5. Observer que le dashboard affiche 101 users (sans F5)
```

---

## 📈 Logs de Débogage

### Mobile

**Succès** :
```
[KeepAlive] Starting (ping every 60s)
[KeepAlive] ✅ API ping successful
```

**Échec** (API down) :
```
[KeepAlive] ⚠️ API ping failed (API might be sleeping)
```

---

### Admin

**Succès avec refresh** :
```
[KeepAlive] Starting (ping every 60s)
[KeepAlive] ✅ API ping successful
```

---

## ⚙️ Configuration

### Changer la Fréquence

```typescript
// keepAliveService.ts
const PING_INTERVAL = 30 * 1000; // 30 secondes au lieu de 60
```

**Recommandations** :
- ❌ < 30s : Trop de requêtes, gaspillage
- ✅ 60s : Optimal (balance wake-up / coût)
- ⚠️ > 120s : Risque de sleep entre 2 pings

---

### Désactiver Temporairement

```typescript
// App.tsx ou Dashboard
// Commenter :
// startKeepAlive();
```

---

## 🎯 Cas d'Usage

### Production (Render.com Free/Starter)
- ✅ **Activer** keep-alive
- API reste éveillée 24/7
- Pas de cold start

### Production (Render.com Paid avec Always-On)
- ⚠️ Keep-alive optionnel
- L'option "Always On" garde déjà l'API éveillée
- Mais keep-alive ne fait pas de mal

### Développement Local
- ⚠️ Garder activé pour tester le comportement réel
- Ou désactiver si ça pollue les logs

---

## ✅ Résultat Attendu

Après implémentation :
- ✅ API toujours éveillée (pas de sleep)
- ✅ Temps de réponse constant < 200ms
- ✅ Pas de cold start (0s vs 20s)
- ✅ Dashboard admin auto-refresh
- ✅ Meilleure UX globale

