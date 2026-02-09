# Système d'Icônes - Focus App

## 📋 Vue d'ensemble

Le système d'icônes utilise **Lucide Icons** comme source unique de vérité pour les noms d'icônes, avec un mapping automatique vers **Ionicons** pour React Native.

### Avantages

✅ **Un seul nom d'icône** sauvegardé en base de données (ex: `"Flame"`, `"Trophy"`)  
✅ **Sélecteur visuel** dans l'admin panel  
✅ **Compatibilité web et mobile** automatique  
✅ **80+ icônes populaires** disponibles  

---

## 🎨 Admin Panel (Web)

### Bibliothèque utilisée
- **lucide-react** (déjà installé)

### Composants

#### 1. IconPicker
**Fichier** : `apps/admin/src/components/ui/icon-picker.tsx`

Composant de sélection d'icône avec :
- Dialog popup avec grille d'icônes
- Barre de recherche
- Preview de l'icône sélectionnée
- 80+ icônes populaires

**Utilisation** :
```tsx
import { IconPicker } from "@/components/ui/icon-picker";

<IconPicker
  value={formData.icon}
  onChange={(iconName) => setFormData({ ...formData, icon: iconName })}
/>
```

#### 2. Icon Helper
**Fichier** : `apps/admin/src/lib/icon-helper.tsx`

Helper pour afficher les icônes dynamiquement :

```tsx
import { getLucideIcon } from "@/lib/icon-helper";

// Afficher une icône
{getLucideIcon(topic.icon, {
  className: "w-6 h-6 text-primary-foreground",
})}
```

---

## 📱 Mobile App (React Native)

### Bibliothèque utilisée
- **@expo/vector-icons** (Ionicons)

### Mapper

**Fichier** : `apps/mobile/src/utils/iconMapper.ts`

Convertit automatiquement les noms Lucide vers Ionicons :

```typescript
import { lucideToIonicons } from "../utils/iconMapper";

// Convertir le nom
const iconName = lucideToIonicons(topic.icon);

// Utiliser avec Ionicons
<Ionicons name={iconName} size={22} color="#fff" />
```

### Mapping des icônes

| Lucide | Ionicons | Description |
|--------|----------|-------------|
| `Flame` | `flame` | Feu |
| `Trophy` | `trophy` | Trophée |
| `Heart` | `heart` | Cœur |
| `Star` | `star` | Étoile |
| `Zap` | `flash` | Éclair |
| `Crown` | `diamond` | Couronne/Diamant |
| `Rocket` | `rocket` | Fusée |
| `Brain` | `bulb` | Cerveau/Ampoule |
| ... | ... | 80+ icônes |

---

## 🗄️ Base de Données

### Champ `icon`

**Type** : `varchar` (nullable)  
**Valeur** : Nom de l'icône Lucide (ex: `"Flame"`, `"Trophy"`)  
**Exemple** :

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Motivation",
  "icon": "Flame",
  "color": "#f093fb",
  "isPremium": false
}
```

---

## 🔧 Utilisation

### 1. Créer un Topic avec une icône (Admin)

1. Ouvrir l'admin panel : `http://localhost:3001/dashboard/topics`
2. Cliquer sur **"Add New Topic"**
3. Remplir les champs :
   - **Name** : `Motivation`
   - **Icon** : Cliquer sur le bouton → Sélectionner `Flame` dans le popup
   - **Color** : `#f093fb`
4. Sauvegarder

### 2. Afficher l'icône (Admin)

```tsx
import { getLucideIcon } from "@/lib/icon-helper";

{getLucideIcon(topic.icon, {
  className: "w-6 h-6",
})}
```

### 3. Afficher l'icône (Mobile)

```tsx
import { lucideToIonicons } from "../utils/iconMapper";
import { Ionicons } from "@expo/vector-icons";

const iconName = lucideToIonicons(topic.icon);

<Ionicons name={iconName} size={22} color="#fff" />
```

---

## 📚 Icônes Disponibles

### Catégories

**Motivation & Success** :
- Flame, Trophy, Award, Crown, Star, Sparkles, Rocket, Target

**Productivité** :
- Briefcase, Calendar, Clock, Bookmark, Flag, TrendingUp

**Créativité** :
- Palette, Feather, Lightbulb, Brain, Camera, Music

**Communication** :
- MessageCircle, Mail, Phone, Send, Share

**Technologie** :
- Cpu, Database, Monitor, Smartphone, Wifi

**Autres** :
- Heart, Coffee, Book, Gift, Globe, Home, User, Users

**Total** : 80+ icônes

---

## 🎯 Exemples

### Exemple 1 : Topic "Motivation"
```json
{
  "name": "Motivation",
  "icon": "Flame",
  "color": "#f093fb"
}
```
**Résultat** : 🔥 Icône flamme avec gradient rose

### Exemple 2 : Topic "Success"
```json
{
  "name": "Success",
  "icon": "Trophy",
  "color": "#ffecd2"
}
```
**Résultat** : 🏆 Icône trophée avec gradient doré

### Exemple 3 : Topic "Mindfulness"
```json
{
  "name": "Mindfulness",
  "icon": "Brain",
  "color": "#a8edea"
}
```
**Résultat** : 🧠 Icône cerveau avec gradient bleu

---

## 🔍 Fallback

Si une icône n'existe pas ou n'est pas spécifiée :

- **Admin** : Affiche l'icône `Tag` par défaut
- **Mobile** : Affiche l'icône `pricetag` (Ionicons) par défaut

---

## ✅ Checklist

- [x] IconPicker créé dans l'admin
- [x] Icon Helper créé pour l'admin
- [x] Icon Mapper créé pour le mobile
- [x] TopicsListScreen mis à jour
- [x] 80+ icônes disponibles
- [x] Fallback en place
- [x] Documentation complète

---

## 🚀 Prochaines Étapes

1. Tester la création d'un topic avec icône dans l'admin
2. Vérifier l'affichage dans l'app mobile
3. Ajouter plus d'icônes si nécessaire (modifier `POPULAR_ICONS` et `LUCIDE_TO_IONICONS_MAP`)

