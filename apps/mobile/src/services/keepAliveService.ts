/**
 * Service de Keep-Alive pour maintenir l'API éveillée
 * Fait des requêtes légères en background toutes les minutes
 */

import apiClient from "./api";

const PING_INTERVAL = 60 * 1000; // 1 minute
let pingIntervalId: NodeJS.Timeout | null = null;

/**
 * Ping l'API avec une requête légère (health check)
 * Ne fait rien avec les données - juste pour garder l'API alive
 */
export const pingApi = async (): Promise<void> => {
  try {
    // Utiliser le endpoint health qui est très léger
    await apiClient.get("/health");
    console.log("[KeepAlive] ✅ API ping successful");
  } catch (error) {
    // Ne pas logger en erreur, c'est normal si l'API est down temporairement
    console.log("[KeepAlive] ⚠️ API ping failed (API might be sleeping)");
  }
};

/**
 * Démarre le polling keep-alive (chaque minute)
 */
export const startKeepAlive = (): void => {
  if (pingIntervalId) {
    console.log("[KeepAlive] Already running");
    return;
  }

  console.log("[KeepAlive] Starting (ping every 60s)");

  // Premier ping immédiat
  pingApi();

  // Puis toutes les minutes
  pingIntervalId = setInterval(() => {
    pingApi();
  }, PING_INTERVAL);
};

/**
 * Arrête le polling keep-alive
 */
export const stopKeepAlive = (): void => {
  if (pingIntervalId) {
    console.log("[KeepAlive] Stopping");
    clearInterval(pingIntervalId);
    pingIntervalId = null;
  }
};

/**
 * Redémarre le keep-alive
 */
export const restartKeepAlive = (): void => {
  stopKeepAlive();
  startKeepAlive();
};
