/**
 * Service pour synchroniser le statut de souscription avec le backend
 * Vérifie régulièrement si l'abonnement utilisateur n'a pas expiré
 */

import { store } from "../store";
import { setUser } from "../store/slices/authSlice";
import apiClient from "./api";

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
let syncIntervalId: NodeJS.Timeout | null = null;

interface UserResponse {
  id: string;
  email: string;
  name?: string;
  isSubscribed: boolean;
  isAdmin: boolean;
  subscriptionEndDate?: string;
  likedQuotesCount?: number;
}

/**
 * Vérifie le statut de souscription de l'utilisateur auprès du backend
 * et met à jour le store Redux si nécessaire
 */
export const checkSubscriptionStatus = async (): Promise<void> => {
  try {
    const state = store.getState();
    const userId = state.auth.user?.id;
    const token = state.auth.token;

    // Ne rien faire si l'utilisateur n'est pas connecté
    if (!userId || !token) {
      console.log("[SubscriptionSync] User not authenticated, skipping check");
      return;
    }

    // Récupérer les données utilisateur à jour depuis le backend
    const response = await apiClient.get<UserResponse>(`/users/${userId}`);
    const updatedUser = response.data;

    // Comparer le statut actuel avec le statut du backend
    const currentUser = state.auth.user;
    if (!currentUser) return;

    const statusChanged = currentUser.isSubscribed !== updatedUser.isSubscribed;

    if (statusChanged) {
      console.log(
        `[SubscriptionSync] Subscription status changed: ${currentUser.isSubscribed} → ${updatedUser.isSubscribed}`
      );

      // Si la souscription a expiré
      if (currentUser.isSubscribed && !updatedUser.isSubscribed) {
        console.warn(
          "[SubscriptionSync] ⚠️ Subscription EXPIRED - User downgraded to free tier"
        );
      }

      // Si une nouvelle souscription est active
      if (!currentUser.isSubscribed && updatedUser.isSubscribed) {
        console.log(
          "[SubscriptionSync] ✅ Subscription ACTIVATED - User upgraded to premium"
        );
      }

      // Mettre à jour le store Redux avec les nouvelles données
      store.dispatch(
        setUser({
          ...currentUser,
          isSubscribed: updatedUser.isSubscribed,
          subscriptionEndDate: updatedUser.subscriptionEndDate,
        })
      );
    } else {
      console.log(
        `[SubscriptionSync] Subscription status unchanged: isSubscribed=${updatedUser.isSubscribed}`
      );
    }
  } catch (error: any) {
    // Ne pas logger en erreur si c'est juste un 401 (utilisateur déconnecté)
    if (error?.response?.status === 401) {
      console.log("[SubscriptionSync] User not authenticated (401)");
    } else {
      console.error("[SubscriptionSync] Error checking subscription status:", error);
    }
  }
};

/**
 * Démarre la vérification périodique du statut de souscription
 * Vérifie toutes les 5 minutes
 */
export const startSubscriptionSync = (): void => {
  // Ne rien faire si déjà démarré
  if (syncIntervalId) {
    console.log("[SubscriptionSync] Already running");
    return;
  }

  console.log(
    `[SubscriptionSync] Starting periodic sync (every ${SYNC_INTERVAL / 1000 / 60} minutes)`
  );

  // Vérifier immédiatement au démarrage
  checkSubscriptionStatus();

  // Puis vérifier toutes les 5 minutes
  syncIntervalId = setInterval(() => {
    checkSubscriptionStatus();
  }, SYNC_INTERVAL);
};

/**
 * Arrête la vérification périodique
 * Utile lors de la déconnexion de l'utilisateur
 */
export const stopSubscriptionSync = (): void => {
  if (syncIntervalId) {
    console.log("[SubscriptionSync] Stopping periodic sync");
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
};

/**
 * Réinitialise et redémarre la synchronisation
 * Utile après une connexion/reconnexion
 */
export const restartSubscriptionSync = (): void => {
  stopSubscriptionSync();
  startSubscriptionSync();
};
