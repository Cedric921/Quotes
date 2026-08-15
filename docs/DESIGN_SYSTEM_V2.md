# Focus — Spécification UI v2.0.0

> Refonte complète de l'interface mobile. Ce document est la source de vérité
> pour les tokens, les primitives, la navigation et le plan de migration.
> Il est versionné avec le code : toute divergence entre ce doc et
> `apps/mobile/src/theme/` est un bug du doc.

**Statut** : spec figée · **Cible** : `apps/mobile` · **Branche** : `feat/v2-design-system`

---

## 1. Principes

Trois règles non négociables, dont découle tout le reste.

1. **Aucune couleur littérale hors de `src/theme/`.** Pas de `#RRGGBB`, pas de
   `rgba()` dans un écran ou un composant. Une règle ESLint le fait respecter.
2. **Deux surfaces, pas un thème.** L'app dessine tantôt sur un fond uni
   (`base`), tantôt par-dessus une photo plein écran (`image`). Ce ne sont pas
   deux variantes de clair/sombre : les contrastes, les flous et la typographie
   diffèrent. Un composant déclare sur quelle surface il vit, jamais une couleur.
3. **Le dégradé est un accent, pas une identité.** Le violet→rose n'apparaît que
   sur une célébration (série), un appel à l'action de conversion, un contour de
   carte premium et les illustrations. Jamais comme fond d'écran, jamais comme
   fond de bouton ordinaire.

### Pourquoi une refonte et pas une retouche

L'audit de la v1 a relevé 3 374 lignes de `StyleSheet` pour 10 981 lignes de TSX,
224 couleurs hexadécimales et 111 `rgba()` codés en dur, trois patterns de
styling qui cohabitent, 14 fichiers qui ignorent complètement le thème (dont
tout le parcours d'authentification et `QuoteCard`), et aucune primitive
partagée. Repeindre par-dessus aurait reconduit la dette. La bonne nouvelle est
que la logique métier est déjà sortie des écrans (`api/hooks/`, `services/`,
`store/`) : la refonte est presque purement présentationnelle.

---

## 2. Tokens

### 2.1 Couleurs — surface `base`

La surface `base` est **blanc argenté** : un blanc froid, métallique, avec le
texte et le bouton principal en encre. (Elle a été encre sombre jusqu'à ce
que l'app soit demandée claire ; le changement a tenu dans ce tableau et dans
cinq primitives qui supposaient un fond sombre.)

| Token | Valeur | Usage |
|---|---|---|
| `bg.base` | `#EDF0F4` | fond de tous les écrans non-image |
| `bg.elevated` | `#FFFFFF` | fond de carte, champ de saisie, bouton rond |
| `surface.raised` | `#E2E7ED` | option sélectionnée, groupe de réglages |
| `surface.overlay` | `#3A4655` | toast et bulle posés sur une image — reste encre, texte blanc |
| `control` | `#C3CCD7` | piste de toggle au repos, jours vides de la série |
| `border.subtle` | `#D3DAE3` | contour d'option au repos (1 px) |
| `border.strong` | `#151C27` | contour d'option sélectionnée (1,5 px) |
| `text.primary` | `#151C27` | titres, label sélectionné |
| `text.secondary` | `#5A6579` | label au repos, sous-titres, « Ignorer » |
| `text.tertiary` | `#8A94A6` | compteurs, mentions légales |
| `cta.bg` | `#FFFFFF` | bouton principal (dégradé court vers `#F5F7FA`, liseré encre à 8 %) |
| `cta.fg` | `#151C27` | texte du bouton principal |
| `cta.disabledBg` | `#A0A6AE` | bouton principal désactivé, texte blanc |
| `badge.bg` | `#151C27` | pastille de sélection (ligne d'option, tuile), tuile d'icône de l'aperçu de notification |
| `badge.fg` | `#FFFFFF` | coche et logo posés sur `badge.bg` |
| `onAccent` | `#151C27` | texte posé sur le dégradé (CTA de conversion, bannière) |
| `glass` | `rgba(255,255,255,0.72)` | pied de sheet flottant, flou clair |
| `danger` | `#FF6B6B` | destructif (suppression de compte) |

La barre d'état suit la surface : sombre sur `base`, claire sur `image`.

Le fond n'est pas une couleur plate ni un dégradé d'un bord à l'autre, mais
une **feuille d'aluminium brossé** : plusieurs reflets clairs et des bandes
plus sombres mêlés, sous un grain diagonal fin. `ui/Ground` dessine
`assets/images/brushed-silver.png` sous chaque écran `base` et chaque sheet ;
`bg.base` est la couleur qui l'attend. Les surfaces posées dessus — cartes,
lignes (`Stepper`, `TimeRow`), options (`OptionRow`, `Chip`), groupes de
réglages, tuiles du profil — sont découpées dans la même feuille, en plus
clair : `ui/MetalFill` pose `assets/images/brushed-silver-card.png` en fond
de chacune, et `shadow.card` la soulève. Sur une photo, `OptionRow` et `Chip`
restent transparentes avec leur contour fin. Les deux textures sortent de
`scripts/brushed-metal.py`, déterministe ; on retouche le script, pas les PNG.
Les écrans de liste à sélection (questionnaire, sujets, choix de réglage,
thèmes, icônes) passent par `<Screen>` et héritent de tout cela sans rien
déclarer. Les surfaces posées dessus — cartes, tuiles, boutons ronds, groupes
de réglages — prennent l'ombre `shadow.card` / `shadow.button`, une seule
recette pour une seule hauteur.

### 2.2 Couleurs — surface `image`

Le chrome posé sur une photo n'utilise aucune surface opaque, sauf le toast de
série. Tout est translucide et flouté.

| Token | Valeur |
|---|---|
| `onImage.text` | `#FFFFFF` |
| `onImage.textDim` | `rgba(255,255,255,0.72)` |
| `onImage.chrome` | `rgba(255,255,255,0.15)` + `blur(20)` |
| `onImage.chromeBorder` | `rgba(255,255,255,0.22)` |
| `onImage.scrim` | `rgba(0,0,0,0.25)` (lisibilité du texte) |

### 2.3 Dégradé

```
accent.from  #8B7FE8   (violet)
accent.to    #F2A8B4   (rose)
```

Quatre emplois, et seulement ceux-là :

- **fond plein** : bannière « Tout débloquer », CTA de conversion ;
- **contour 1,5 px** : carte du plan personnalisé, carte du paywall, aperçu du widget ;
- **rail vertical** : chronologie de l'essai gratuit ;
- **piste de toggle** à l'état actif, et la flamme de série.

### 2.4 Espacement, rayons, durées

```
space   4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 56
radius  sm 12 · md 16 · lg 20 · xl 24 · pill 999
gutter  16 (marge latérale d'écran, constante partout)
motion  fast 140 · base 220 · slow 320 ms, easing out-cubic
```

### 2.5 Typographie

Deux familles, rôle strictement séparé.

| Rôle | Famille | Taille / graisse |
|---|---|---|
| `display` | sans géométrique | 30 / 700, centré, 1–3 lignes — titres de question |
| `title` | sans géométrique | 22 / 700 — titres de sheet |
| `body` | sans géométrique | 17 / 400 — labels d'option, listes |
| `label` | sans géométrique | 15 / 600 — boutons |
| `caption` | sans géométrique | 13 / 400 — compteurs, mentions |
| `quote` | **serif** | 28 / 400, centré — la citation, et elle seule |

La bascule serif est ce qui sépare l'app (produit) du contenu (citation). La
police de citation est servie par l'API (`fontSlice`) et surcharge `quote`.

---

## 3. Primitives

Vingt composants dans `src/ui/`. Tout écran doit être composable à partir d'eux ;
si un écran a besoin d'un style qui n'est pas ici, c'est la primitive qu'on
étend, pas l'écran qu'on décore.

| Primitive | Variantes |
|---|---|
| `Screen` | `base` \| `image` ; slots `header`, `footer` ; gère la safe area |
| `Sheet` | coins arrondis haut, X rond à gauche, action ronde à droite, titre large qui se compacte en header centré au scroll |
| `Text` | `display` \| `title` \| `body` \| `label` \| `caption` \| `quote` |
| `Button` | `primary` (blanc) \| `gradient` \| `disabled` ; pleine largeur, pill |
| `LinkButton` | texte secondaire, icône optionnelle (« Ignorer », « Obtenez le lot ») |
| `Input` | champ pill, fond `bg.elevated` |
| `TextArea` | multi-ligne + compteur `n/max` aligné à droite |
| `OptionRow` | `radio` \| `check` ; icône gauche optionnelle ; texte multi-ligne |
| `Chip` | pill à largeur auto, préfixe `+` au repos / `✓` sélectionné |
| `ChipWrap` | disposition en flux, retour à la ligne |
| `Toggle` | piste dégradée à l'état actif |
| `Stepper` | `−  valeur  +` |
| `TimeRow` | label + pill de valeur, ouvre le sélecteur natif |
| `Card` | surface arrondie |
| `GradientBorderCard` | carte à contour dégradé |
| `TileGrid` | 3 colonnes carrées (icônes d'app) ou ratio 3:4 (thèmes) ; badge de sélection, badge « animé » |
| `ListRow` | icône + label + chevron, séparateur indenté |
| `SettingsList` | sections à label capitales, groupes arrondis |
| `IconCircle` | bouton rond, surface `base` ou `image` |
| `Coachmark` | bulle + flèche vers la cible, assombrissement autour |

---

## 4. Navigation

L'app n'est pas une pile d'écrans à plat. C'est **un écran permanent
(le feed de citations) et une pile de sheets modales par-dessus**.

```
RootNavigator
├─ Onboarding (stack, si !onboardingDone)
│   └─ ~30 étapes, dont ~22 rendues par QuestionScreen
└─ App
    ├─ QuoteFeed                     ← écran permanent, plein écran, surface image
    └─ Modal (presentation: 'modal')
        ├─ Topics                    ← bouton grille, en bas à gauche
        ├─ ThemePicker               ← bouton pinceau, en bas à droite
        ├─ Profile                   ← bouton profil, en bas à droite
        │   └─ Settings
        │       ├─ Name · Gender · Age · Relationship · Beliefs
        │       ├─ ContentPreferences · MutedContent · Language · Sound
        │       ├─ StreakSettings
        │       └─ ManageSubscription
        ├─ Paywall                   ← couronne (sheet) ou fin d'onboarding (plein écran)
        └─ Share                     ← feuille de partage maison
```

Conséquence directe : `AppNavigator` v1 (20 écrans à plat en `native-stack`
avec `slide_from_right`) est remplacé. `ThemePicker` est appelé depuis trois
endroits — la nav flottante, le Profil, et l'action « Modifier thème » de la
feuille de partage : c'est un écran modal partagé, pas une page de réglages.

---

## 5. Le questionnaire

Vingt-deux des trente étapes d'onboarding sont le **même écran** avec des
données différentes. Elles sont décrites par un schéma, pas par du code.

```ts
type Question = {
  id: string;
  kind: 'single' | 'multi';
  titleKey: string;          // clé i18n
  skippable?: boolean;       // affiche « Ignorer »
  options: {
    id: string;
    labelKey: string;
    icon?: IconName;         // icône à gauche
  }[];
};
```

Les étapes qui ne rentrent pas dans ce moule ont leur écran dédié : intro
illustrée, manifeste (texte seul), saisie du prénom, objectifs en texte libre,
sujets en `ChipWrap`, sélecteur de thème, sélecteur d'icône d'app, réglage des
notifications, série, plan personnalisé, upsell de lot, citation personnalisée,
installation du widget, bienvenue.

Le schéma vit dans `features/onboarding/questions.ts`. **À trancher** : le
back-office sert déjà les thèmes et les polices ; servir aussi le questionnaire
permettrait de le faire évoluer sans publier une version. La v2 le garde en
local, avec un type prêt pour la bascule.

---

## 6. Mapping v1 → v2

| v1 | Lignes | v2 |
|---|---|---|
| `HomeScreen` | 589 | `features/quotes/QuoteFeedScreen` + 6 composants |
| `SettingsScreen` | 906 | `features/settings/SettingsScreen` + 11 sous-écrans |
| `ProfileScreen` | 562 | `features/profile/ProfileSheet` + 3 composants |
| `SubscriptionScreen` | 814 | `features/paywall/PaywallScreen` (2 présentations) |
| `NotificationsScreen` | 844 | `features/settings/screens/RemindersScreen` |
| `ThemeSelectionScreen` + `ThemeSelectionModal` | 554 | un seul `ThemePickerScreen` modal |
| `QuoteCard` | 457 | `QuoteSlide` + `QuoteActions` + `LikeBurst` |
| `LoginScreen` · `SignupScreen` · `ForgotPassword` · `ResetPassword` | 1 234 | conservés, re-stylés sur les primitives |
| `TranslatedTopicCard` · `TranslatedPlanCard` | 267 | `TileGrid` + `Card` |

Ce qui disparaît : les 14 `createStyles(colors)` non mémoïsés, les trois
patterns de styling, et les 224 couleurs en dur.

Ce qui reste intact : `api/hooks/` (14 hooks React Query), `services/`,
`store/slices/`, et les 10 fichiers de traduction — les clés `t()` sont le
contrat stable de la refonte.

---

## 7. Dette soldée en chemin

- `react-native-reanimated` 4.1 était installé et **jamais importé** : toutes les
  animations tournaient sur l'API `Animated` héritée. La v2 l'utilise.
- `@gorhom/bottom-sheet` installé et jamais importé : la v2 s'en sert pour les
  sheets.
- `lucide-react-native` installé et jamais importé côté mobile (le mapping passe
  par Ionicons) : dépendance retirée.
- **Zéro prop d'accessibilité** dans toute l'app v1. Chaque primitive v2 en porte.
- 10 écrans sur 19 seulement géraient la safe area ; `Screen` la gère pour tous.

---

## 8. Dépendances API à confirmer

Trois éléments du design n'ont pas d'équivalent côté back :

1. **Quota de likes** (`♡ 0/5`) — limite freemium affichée en permanence sur le
   feed. `useToggleLikeQuote` ne porte aucun quota aujourd'hui.
2. **Série quotidienne** — compteur, semaine glissante, réglage « Suivre la
   série ». Rien en base.
3. **Préférences de contenu / contenu en sourdine** — filtrage par sujet et mise
   en sourdine de thèmes sensibles.

En attendant, la v2 les implémente côté client (`streakSlice`, `likeQuotaSlice`,
persistés en `AsyncStorage`) derrière une interface qui pourra basculer sur
l'API sans toucher aux écrans.

---

## 9. Plan de livraison

| Phase | Contenu |
|---|---|
| 0 | tokens, `ThemeProvider`, `useStyles` |
| 1 | les 20 primitives |
| 2 | onboarding piloté par schéma |
| 3 | écran citation, partage, série |
| 4 | Profil, Paramètres, Paywall |
| 5 | navigation, i18n, câblage |

Garde-fous : règle ESLint contre les couleurs littérales dès la phase 0, clés
`t()` gelées, accessibilité ajoutée au moment de l'écriture — c'est le seul
moment où elle est gratuite.
