import * as icons from "lucide-react";
import { LucideProps } from "lucide-react";

/**
 * Récupère un composant d'icône Lucide par son nom
 * @param iconName - Le nom de l'icône (ex: "Flame", "Trophy", "Heart")
 * @param props - Les props à passer au composant d'icône
 * @returns Le composant d'icône ou Tag par défaut
 */
export function getLucideIcon(
  iconName?: string,
  props?: LucideProps
): JSX.Element {
  if (!iconName) {
    const Tag = icons.Tag;
    return <Tag {...props} />;
  }

  // Récupérer le composant d'icône dynamiquement
  const IconComponent = (icons as any)[iconName];

  if (!IconComponent) {
    // Si l'icône n'existe pas, utiliser Tag par défaut
    const Tag = icons.Tag;
    return <Tag {...props} />;
  }

  return <IconComponent {...props} />;
}

/**
 * Vérifie si un nom d'icône existe dans Lucide
 * @param iconName - Le nom de l'icône à vérifier
 * @returns true si l'icône existe, false sinon
 */
export function isValidLucideIcon(iconName: string): boolean {
  return !!(icons as any)[iconName];
}

