# Configuration des Variables d'Environnement

## 📋 Vue d'ensemble

L'application mobile utilise des variables d'environnement pour configurer l'API et les paramètres de l'application. Cela permet de changer facilement la configuration sans modifier le code source.

## 🔧 Configuration

### Méthode 1 : Fichier `app.json` (Recommandé pour Expo)

Les variables d'environnement sont configurées dans le fichier `app.json` sous la clé `extra` :

```json
{
  "expo": {
    "extra": {
      "API_URL": "http://192.168.1.66:3001",
      "API_TIMEOUT": "30000",
      "QUOTES_PER_PAGE": "10",
      "PAGINATION_THRESHOLD": "0.5"
    }
  }
}
```

### Méthode 2 : Fichier `.env` (Optionnel)

Vous pouvez également créer un fichier `.env` à la racine du projet mobile :

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Modifier les valeurs selon votre configuration
nano .env
```

## 📝 Variables Disponibles

### API Configuration

| Variable      | Description                               | Valeur par défaut          | Exemple                                                |
| ------------- | ----------------------------------------- | -------------------------- | ------------------------------------------------------ |
| `API_URL`     | URL complète de l'API backend             | `http://192.168.1.66:3001` | `http://192.168.1.100:3000` ou `https://api.focus.com` |
| `API_TIMEOUT` | Timeout des requêtes API en millisecondes | `30000`                    | `60000`                                                |

### App Configuration

| Variable               | Description                                         | Valeur par défaut | Exemple |
| ---------------------- | --------------------------------------------------- | ----------------- | ------- |
| `QUOTES_PER_PAGE`      | Nombre de citations à charger par page              | `10`              | `20`    |
| `PAGINATION_THRESHOLD` | Seuil de défilement pour le chargement infini (0-1) | `0.5`             | `0.8`   |

## 🚀 Comment Changer la Configuration

### Pour changer l'URL de l'API :

1. **Trouver l'adresse IP de votre ordinateur** (pour développement local) :
   - **macOS/Linux** : `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - **Windows** : `ipconfig`

2. **Modifier `app.json`** :

   ```json
   "extra": {
     "API_URL": "http://VOTRE_IP:PORT"
   }
   ```

   **Exemples** :
   - Développement local : `"API_URL": "http://192.168.1.66:3001"`
   - Production : `"API_URL": "https://api.focus.com"`
   - Localhost (web/émulateur) : `"API_URL": "http://localhost:3001"`

3. **Redémarrer l'application** :
   ```bash
   npm start
   ```

## 🔍 Vérification

Pour vérifier que les variables sont correctement chargées, vous pouvez ajouter un log temporaire dans `src/constants/config.ts` :

```typescript
console.log("API Config:", {
  BASE_URL: API_CONFIG.BASE_URL,
  TIMEOUT: API_CONFIG.TIMEOUT,
});
```

## ⚠️ Notes Importantes

1. **Ne jamais commiter le fichier `.env`** s'il contient des informations sensibles
2. **Toujours mettre à jour `.env.example`** avec les nouvelles variables (sans valeurs sensibles)
3. **Redémarrer l'application** après avoir modifié les variables d'environnement dans `app.json`
4. **Pour les appareils physiques**, assurez-vous que votre téléphone et votre ordinateur sont sur le même réseau WiFi
5. **Une seule variable `API_URL`** suffit - pas besoin de gérer IP et PORT séparément

## 🛠️ Dépannage

### L'application ne se connecte pas à l'API

1. Vérifiez que l'API est démarrée : `cd apps/api && npm run start:dev`
2. Vérifiez que `API_URL` dans `app.json` correspond à l'URL de votre API
3. Testez l'URL dans votre navigateur : `http://VOTRE_IP:3001` devrait afficher quelque chose
4. Vérifiez que votre téléphone et ordinateur sont sur le même réseau WiFi
5. Utilisez `ifconfig` (macOS/Linux) ou `ipconfig` (Windows) pour vérifier votre IP actuelle

### Les changements ne sont pas pris en compte

1. Arrêtez complètement l'application (Ctrl+C)
2. Supprimez le cache : `npx expo start -c`
3. Redémarrez l'application

## 📚 Ressources

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [React Native Config](https://github.com/luggit/react-native-config)
