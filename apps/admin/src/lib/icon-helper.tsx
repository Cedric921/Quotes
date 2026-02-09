import * as icons from "lucide-react";
import { LucideProps } from "lucide-react";
import React from "react";

/**
 * Récupère un composant d'icône Lucide par son nom
 * @param iconName - Le nom de l'icône (ex: "Flame", "Trophy", "Heart")
 * @param props - Les props à passer au composant d'icône
 * @returns Le composant d'icône ou Tag par défaut
 */
export function getLucideIcon(
  iconName?: string,
  props?: LucideProps
): React.ReactElement {
  const Tag = icons.Tag;
  
  if (!iconName) {
    return React.createElement(Tag, props || {});
  }

  // Récupérer le composant d'icône dynamiquement
  const iconsMap = icons as unknown as Record<string, typeof Tag>;
  const IconComponent = iconsMap[iconName];

  if (!IconComponent) {
    // Si l'icône n'existe pas, utiliser Tag par défaut
    return React.createElement(Tag, props || {});
  }

  return React.createElement(IconComponent, props || {});
}

/**
 * Vérifie si un nom d'icône existe dans Lucide
 * @param iconName - Le nom de l'icône à vérifier
 * @returns true si l'icône existe, false sinon
 */
export function isValidLucideIcon(iconName: string): boolean {
  const iconsMap = icons as unknown as Record<string, unknown>;
  return !!iconsMap[iconName];
}
