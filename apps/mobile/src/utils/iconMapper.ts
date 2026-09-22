import { Ionicons } from "@expo/vector-icons";

/**
 * Mappe les noms d'icônes Lucide vers Ionicons
 * Permet d'utiliser les mêmes noms d'icônes entre web et mobile
 */
const LUCIDE_TO_IONICONS_MAP: Record<
  string,
  keyof typeof Ionicons.glyphMap
> = {
  // Icônes populaires
  Flame: "flame",
  Trophy: "trophy",
  Heart: "heart",
  Star: "star",
  Zap: "flash",
  Target: "radio-button-on",
  Award: "ribbon",
  Crown: "diamond",
  Sparkles: "sparkles",
  Rocket: "rocket",
  Brain: "bulb",
  Lightbulb: "bulb",
  Coffee: "cafe",
  Book: "book",
  Bookmark: "bookmark",
  Briefcase: "briefcase",
  Calendar: "calendar",
  Camera: "camera",
  Clock: "time",
  Cloud: "cloud",
  Compass: "compass",
  Cpu: "hardware-chip",
  Database: "server",
  Feather: "create",
  Flag: "flag",
  Gift: "gift",
  Globe: "globe",
  Headphones: "headset",
  Home: "home",
  Image: "image",
  Inbox: "mail",
  Key: "key",
  Layers: "layers",
  Lock: "lock-closed",
  Mail: "mail",
  Map: "map",
  MessageCircle: "chatbubble",
  Mic: "mic",
  Monitor: "desktop",
  Moon: "moon",
  Music: "musical-notes",
  Package: "cube",
  Palette: "color-palette",
  Paperclip: "attach",
  Phone: "call",
  PieChart: "pie-chart",
  Play: "play",
  Plus: "add",
  Printer: "print",
  Radio: "radio",
  RefreshCw: "refresh",
  Save: "save",
  Search: "search",
  Send: "send",
  Settings: "settings",
  Share: "share-social",
  Shield: "shield",
  ShoppingCart: "cart",
  Smartphone: "phone-portrait",
  Smile: "happy",
  Speaker: "volume-high",
  Sun: "sunny",
  Tag: "pricetag",
  ThumbsUp: "thumbs-up",
  TrendingUp: "trending-up",
  Tv: "tv",
  Umbrella: "umbrella",
  Upload: "cloud-upload",
  User: "person",
  Users: "people",
  Video: "videocam",
  Volume: "volume-high",
  Watch: "watch",
  Wifi: "wifi",
  Wind: "leaf",
  X: "close",
  Youtube: "logo-youtube",
};

/**
 * Marques des réseaux sociaux.
 *
 * Le back-office stocke un nom d'icône libre ("Instagram", "TikTok"), et
 * certaines de ces marques n'existent pas dans Lucide : on accepte donc aussi
 * le nom du réseau lui-même. Sans cette table, chaque réseau servi par l'API
 * s'affichait avec l'icône par défaut (une étiquette).
 */
const SOCIAL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  instagram: "logo-instagram",
  facebook: "logo-facebook",
  twitter: "logo-twitter",
  x: "logo-twitter",
  tiktok: "logo-tiktok",
  pinterest: "logo-pinterest",
  youtube: "logo-youtube",
  linkedin: "logo-linkedin",
  snapchat: "logo-snapchat",
  whatsapp: "logo-whatsapp",
  discord: "logo-discord",
  reddit: "logo-reddit",
  threads: "at-circle-outline",
};

/**
 * Icône d'un réseau social, d'après le nom d'icône du back-office ou, à
 * défaut, le nom du réseau.
 */
export function socialIcon(
  iconName?: string,
  networkName?: string,
): keyof typeof Ionicons.glyphMap {
  for (const candidate of [iconName, networkName]) {
    if (!candidate) continue;
    const hit = SOCIAL_ICONS[candidate.trim().toLowerCase()];
    if (hit) return hit;
  }
  return lucideToIonicons(iconName);
}

/**
 * Convertit un nom d'icône Lucide en nom Ionicons
 * @param lucideName - Le nom de l'icône Lucide (ex: "Flame", "Trophy")
 * @returns Le nom de l'icône Ionicons correspondante
 */
export function lucideToIonicons(
  lucideName?: string
): keyof typeof Ionicons.glyphMap {
  if (!lucideName) {
    return "pricetag"; // Icône par défaut (Tag)
  }

  // Chercher dans le mapping
  const ioniconsName = LUCIDE_TO_IONICONS_MAP[lucideName];

  if (ioniconsName) {
    return ioniconsName;
  }

  // Si pas trouvé, retourner l'icône par défaut
  return "pricetag";
}

/**
 * Vérifie si un nom d'icône Lucide peut être mappé vers Ionicons
 * @param lucideName - Le nom de l'icône Lucide
 * @returns true si l'icône peut être mappée, false sinon
 */
export function isLucideIconMappable(lucideName: string): boolean {
  return !!LUCIDE_TO_IONICONS_MAP[lucideName];
}

