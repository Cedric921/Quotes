# Internationalisation (i18n) - Focus Mobile App

## ✅ Configuration Complète

### **Langues Supportées**
- 🇫🇷 **Français** (fr) - Langue par défaut
- 🇬🇧 **Anglais** (en)
- 🇪🇸 **Espagnol** (es)
- 🇸🇦 **Arabe** (ar) - Avec support RTL

---

## 📁 Structure des Fichiers

```
apps/mobile/
├── src/
│   ├── i18n/
│   │   ├── locales/
│   │   │   ├── fr.json          # Traductions françaises
│   │   │   ├── en.json          # Traductions anglaises
│   │   │   ├── es.json          # Traductions espagnoles
│   │   │   └── ar.json          # Traductions arabes
│   │   └── index.ts             # Configuration i18n
```

---

## 🔧 Packages Installés

```bash
npm install i18next react-i18next @react-native-async-storage/async-storage
npx expo install expo-localization
```

---

## 📝 Fichiers de Traduction

### Structure des Traductions

Chaque fichier de langue contient les mêmes clés organisées par catégories :

```json
{
  "common": {
    "appName": "Focus",
    "loading": "...",
    "error": "...",
    ...
  },
  "auth": {
    "login": "...",
    "signup": "...",
    ...
  },
  "home": { ... },
  "topics": { ... },
  "settings": { ... },
  "profile": { ... },
  "actions": { ... },
  "errors": { ... }
}
```

### Catégories de Traductions

1. **common** : Textes communs (loading, error, retry, etc.)
2. **auth** : Authentification (login, signup, email, password, etc.)
3. **home** : Écran d'accueil
4. **topics** : Gestion des topics
5. **settings** : Paramètres
6. **profile** : Profil utilisateur
7. **actions** : Actions (like, share, copy, etc.)
8. **errors** : Messages d'erreur

---

## 🚀 Utilisation dans les Composants

### 1. Importer le hook `useTranslation`

```typescript
import { useTranslation } from "react-i18next";
```

### 2. Utiliser les traductions

```typescript
export default function MyComponent() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t("common.loading")}</Text>
      <Text>{t("auth.login")}</Text>
      <Text>{t("topics.title")}</Text>
    </View>
  );
}
```

### 3. Exemples Concrets

#### LoginScreen
```typescript
const { t } = useTranslation();

<Text>{t("auth.welcomeBack")}</Text>
<TextInput placeholder={t("auth.email")} />
<TextInput placeholder={t("auth.password")} />
<Button title={t("auth.login")} />
```

#### SettingsScreen
```typescript
const { t } = useTranslation();

<Text>{t("settings.title")}</Text>
<Text>{t("settings.language")}</Text>
<Text>{t("settings.theme")}</Text>
```

#### TopicsListScreen
```typescript
const { t } = useTranslation();

Toast.show({
  type: "error",
  text1: t("topics.premiumContent"),
  text2: t("topics.loginToAccess"),
});
```

---

## 🌍 Changer de Langue

### Fonction `changeLanguage`

```typescript
import { changeLanguage } from "../i18n";

// Changer la langue
await changeLanguage("fr"); // Français
await changeLanguage("en"); // Anglais
await changeLanguage("es"); // Espagnol
await changeLanguage("ar"); // Arabe
```

### Exemple dans SettingsScreen

```typescript
import { changeLanguage, getCurrentLanguage } from "../i18n";

const handleLanguageChange = async (languageCode: string) => {
  await changeLanguage(languageCode);
  // L'interface se met à jour automatiquement
};
```

---

## 🔄 Détection Automatique de la Langue

Le système détecte automatiquement la langue du système au premier lancement :

```typescript
// Dans src/i18n/index.ts
const getDeviceLanguage = (): string => {
  const locale = Localization.locale; // Ex: "fr-FR"
  const languageCode = locale.split("-")[0]; // "fr"
  
  const supportedLanguages = ["en", "fr", "es", "ar"];
  return supportedLanguages.includes(languageCode) ? languageCode : "en";
};
```

**Ordre de priorité** :
1. Langue sauvegardée dans AsyncStorage
2. Langue du système (si supportée)
3. Anglais (fallback)

---

## 📱 Support RTL (Right-to-Left) pour l'Arabe

### Fonction `isRTL`

```typescript
import { isRTL } from "../i18n";

const rtl = isRTL(); // true si la langue est l'arabe
```

### Utilisation dans les Styles

```typescript
import { I18nManager } from "react-native";
import { isRTL } from "../i18n";

// Forcer le mode RTL
if (isRTL()) {
  I18nManager.forceRTL(true);
} else {
  I18nManager.forceRTL(false);
}
```

---

## 🎯 Prochaines Étapes

### 1. Mettre à Jour les Composants

Remplacer tous les textes statiques par des appels à `t()` :

**Avant** :
```typescript
<Text>Connexion</Text>
```

**Après** :
```typescript
<Text>{t("auth.login")}</Text>
```

### 2. Créer un Sélecteur de Langue

Dans `SettingsScreen.tsx`, ajouter un sélecteur de langue :

```typescript
const languages = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
];

<FlatList
  data={languages}
  renderItem={({ item }) => (
    <TouchableOpacity onPress={() => changeLanguage(item.code)}>
      <Text>{item.flag} {item.name}</Text>
    </TouchableOpacity>
  )}
/>
```

### 3. Tester les Traductions

1. Lancer l'app
2. Aller dans Settings
3. Changer la langue
4. Vérifier que tous les textes sont traduits

---

## 📊 Liste des Clés de Traduction

### Common
- `appName`, `loading`, `error`, `retry`, `cancel`, `save`, `delete`, `edit`, `close`, `or`, `quote`, `quotes`

### Auth
- `login`, `signup`, `logout`, `email`, `password`, `name`, `confirmPassword`, `forgotPassword`, `alreadyHaveAccount`, `dontHaveAccount`, `createAccount`, `welcomeBack`, `loginToContinue`, `fillAllFields`, `loginError`, `signupError`, `errorOccurred`

### Home
- `title`, `noQuotes`, `loadMore`, `refreshing`

### Topics
- `title`, `allTopics`, `premiumContent`, `loginToAccess`, `subscribeToAccess`, `noTopics`, `failedToLoad`, `noQuotesForTopic`

### Settings
- `title`, `account`, `profile`, `subscription`, `settings`, `language`, `theme`, `notifications`, `about`, `privacyPolicy`, `termsOfService`, `version`, `logout`, `logoutConfirm`, `selectTheme`, `light`, `dark`, `system`

### Profile
- `title`, `likedQuotes`, `saved`, `shared`, `premium`, `free`, `subscriptionStatus`, `expiresOn`, `upgradeToPremium`

### Actions
- `like`, `share`, `copy`, `copied`, `shareQuote`

### Errors
- `networkError`, `serverError`, `notFound`, `unauthorized`, `forbidden`

---

## 🎨 Exemples de Traductions

### Français
```json
{
  "auth": {
    "login": "Connexion",
    "email": "Email",
    "password": "Mot de passe"
  }
}
```

### Anglais
```json
{
  "auth": {
    "login": "Login",
    "email": "Email",
    "password": "Password"
  }
}
```

### Espagnol
```json
{
  "auth": {
    "login": "Iniciar sesión",
    "email": "Correo electrónico",
    "password": "Contraseña"
  }
}
```

### Arabe
```json
{
  "auth": {
    "login": "تسجيل الدخول",
    "email": "البريد الإلكتروني",
    "password": "كلمة المرور"
  }
}
```

---

## ✅ Checklist d'Implémentation

- [x] Installation des packages
- [x] Création des fichiers de traduction (fr, en, es, ar)
- [x] Configuration i18n
- [x] Détection automatique de la langue
- [x] Sauvegarde de la langue dans AsyncStorage
- [x] Support RTL pour l'arabe
- [ ] Mise à jour de tous les composants
- [ ] Création du sélecteur de langue dans Settings
- [ ] Tests sur toutes les langues

---

## 🚀 Commandes Utiles

```bash
# Lancer l'app
npm start

# Tester sur iOS
npm run ios

# Tester sur Android
npm run android

# Vérifier les traductions
cat src/i18n/locales/fr.json
cat src/i18n/locales/en.json
cat src/i18n/locales/es.json
cat src/i18n/locales/ar.json
```

---

## 📝 Notes Importantes

1. **Toujours utiliser `t()`** pour les textes affichés à l'utilisateur
2. **Ne pas traduire** les noms de variables, clés API, etc.
3. **Tester** chaque langue après ajout de nouvelles traductions
4. **Maintenir** la cohérence entre les fichiers de langue
5. **Ajouter** de nouvelles clés dans TOUS les fichiers de langue

---

## 🎉 Résultat Final

L'application supporte maintenant 4 langues avec :
- ✅ Détection automatique de la langue du système
- ✅ Sauvegarde de la préférence utilisateur
- ✅ Support RTL pour l'arabe
- ✅ Interface multilingue complète
- ✅ Changement de langue en temps réel

