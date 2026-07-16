/**
 * Service de Keep-Alive pour maintenir l'API éveillée
 * Fait des requêtes légères en background toutes les minutes
 * Côté admin: on rafraîchit les données du dashboard si disponibles
 */

import { apiClient } from "./api";

const PING_INTERVAL = 60 * 1000; // 1 minute
let pingIntervalId: NodeJS.Timeout | null = null;
let onDataCallback: ((data: any) => void) | null = null;

/**
 * Ping l'API avec une requête légère
 * Côté admin, on peut utiliser les stats du dashboard
 */
export const pingApi = async (): Promise<void> => {
  try {
    // Pour l'admin, on récupère les stats du dashboard
    // C'est une requête légère qui garde l'API alive
    const response = await apiClient.get("/health/stats");
    console.log("[KeepAlive] ✅ API ping successful");
    
    // Si on a un callback et des données, on les envoie
    if (onDataCallback && response.data) {
      onDataCallback(response.data);
    }
  } catch (error) {
    console.log("[KeepAlive] ⚠️ API ping failed");
  }
};

/**
 * Démarre le polling keep-alive avec callback optionnel pour mise à jour
 */
export const startKeepAlive = (callback?: (data: any) => void): void => {
  if (pingIntervalId) {
    console.log("[KeepAlive] Already running");
    return;
  }

  console.log("[KeepAlive] Starting (ping every 60s)");
  onDataCallback = callback || null;

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
    onDataCallback = null;
  }
};

/**
 * Met à jour le callback
 */
export const setKeepAliveCallback = (callback: (data: any) => void): void => {
  onDataCallback = callback;
};
