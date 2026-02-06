# Mobile App - Quotes Application

Application mobile React Native/Expo pour parcourir des citations inspirantes avec un infinite scroll en plein écran.

## Fonctionnalités

- ✅ **Infinite Scroll** : Défilement vertical infini avec pagination automatique
- ✅ **Cartes plein écran** : Chaque citation occupe tout l'écran
- ✅ **Pull to Refresh** : Rafraîchir la liste en tirant vers le bas
- ✅ **Like/Unlike** : Bouton pour aimer les citations (à implémenter)
- ✅ **Topics** : Affichage du topic associé à chaque citation

## Prérequis

1. **API Backend** : L'API doit être en cours d'exécution sur le port 3001
2. **Node.js** : Version 18 ou supérieure
3. **Expo CLI** : Installé globalement ou via npx

## Installation

```bash
# Depuis la racine du projet
npm install

# Ou depuis le dossier mobile
cd apps/mobile
npm install
```

## Configuration de l'API

L'application se connecte automatiquement à l'API selon la plateforme :

- **iOS Simulator** : `http://localhost:3001`
- **Android Emulator** : `http://10.0.2.2:3001`
- **Appareil physique** : Vous devrez modifier `apps/mobile/src/services/api.ts` pour utiliser l'adresse IP de votre ordinateur (ex: `http://192.168.1.x:3001`)

Pour trouver votre adresse IP locale :
- **macOS/Linux** : `ifconfig | grep "inet "`
- **Windows** : `ipconfig`

## Démarrage

### 1. Démarrer l'API Backend

```bash
# Depuis la racine du projet
npm run dev:api
```

### 2. Seed la base de données (si nécessaire)

Allez sur l'admin panel à `http://localhost:3000` et utilisez la fonction de seed pour créer des données de test.

### 3. Démarrer l'application mobile

```bash
# Depuis la racine du projet
npm run dev:mobile

# Ou depuis le dossier mobile
cd apps/mobile
npm run dev
```

### 4. Ouvrir l'application

- **iOS** : Appuyez sur `i` dans le terminal ou scannez le QR code avec l'app Expo Go
- **Android** : Appuyez sur `a` dans le terminal ou scannez le QR code avec l'app Expo Go
- **Web** : Appuyez sur `w` dans le terminal

## Structure du projet

```
apps/mobile/
├── src/
│   ├── components/
│   │   └── QuoteCard.tsx      # Composant carte de citation
│   ├── screens/
│   │   └── HomeScreen.tsx     # Écran principal avec infinite scroll
│   ├── services/
│   │   └── api.ts             # Client API avec axios
│   └── types/
│       └── index.ts           # Types TypeScript
├── App.tsx                     # Point d'entrée de l'app
└── package.json
```

## Fonctionnement de l'Infinite Scroll

L'écran d'accueil utilise un `FlatList` avec les propriétés suivantes :

- **`pagingEnabled`** : Active le défilement page par page
- **`snapToInterval`** : Chaque carte prend la hauteur de l'écran
- **`onEndReached`** : Charge plus de citations quand on atteint la fin
- **`onEndReachedThreshold={0.5}`** : Déclenche le chargement à 50% de la fin

## Personnalisation

### Modifier le nombre de citations par page

Dans `apps/mobile/src/screens/HomeScreen.tsx`, ligne 33 :

```typescript
const newQuotes = await quotesApi.getQuotes(pageNum, 10); // Changer 10 à la valeur souhaitée
```

### Modifier le style des cartes

Éditez `apps/mobile/src/components/QuoteCard.tsx` pour personnaliser l'apparence des citations.

## Dépannage

### L'application ne se connecte pas à l'API

1. Vérifiez que l'API est bien démarrée sur le port 3001
2. Vérifiez l'URL dans `apps/mobile/src/services/api.ts`
3. Pour un appareil physique, utilisez l'adresse IP locale de votre ordinateur

### Erreur "Network request failed"

- Assurez-vous que votre appareil/émulateur et votre ordinateur sont sur le même réseau
- Vérifiez que le CORS est activé dans l'API (déjà configuré)

### Les citations ne s'affichent pas

1. Vérifiez que la base de données contient des citations (utilisez l'admin panel pour seed)
2. Vérifiez la console pour les erreurs réseau
3. Testez l'API directement : `curl http://localhost:3001/quotes`

## Prochaines étapes

- [ ] Implémenter la fonctionnalité de like/unlike
- [ ] Ajouter l'authentification utilisateur
- [ ] Ajouter un filtre par topic
- [ ] Ajouter des animations de transition
- [ ] Implémenter le partage de citations

