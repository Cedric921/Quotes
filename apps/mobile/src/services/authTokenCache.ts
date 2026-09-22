import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@focus_auth_token";

/**
 * Le jeton d'authentification, et l'identifiant qu'il contient, gardes en
 * memoire.
 *
 * Chaque appel API lisait AsyncStorage - un aller-retour sur le pont natif -
 * puis decodait le JWT en base64 et le parsait. Sur le flux d'accueil cela se
 * produisait deux fois par page chargee, pour une valeur qui ne change qu'a la
 * connexion ou a la deconnexion.
 *
 * Ce module ne depend de rien d'autre que du stockage : il est importe aussi
 * bien par le client HTTP que par le store Redux, et une dependance croisee
 * entre les deux laisserait l'un des deux vide a l'initialisation.
 */
let cachedToken: string | null | undefined;
let cachedUserId: string | null = null;

/** A appeler des que le jeton stocke change - connexion, deconnexion, purge. */
export const clearAuthTokenCache = (): void => {
  cachedToken = undefined;
  cachedUserId = null;
};

export const getAuthToken = async (): Promise<string | null> => {
  if (cachedToken !== undefined) return cachedToken;

  const token = await AsyncStorage.getItem(TOKEN_KEY);
  cachedToken = token;
  cachedUserId = token ? decodeUserId(token) : null;
  return token;
};

export const getAuthUserId = async (): Promise<string | null> => {
  await getAuthToken();
  return cachedUserId;
};

const decodeUserId = (token: string): string | null => {
  try {
    // Decodage simple de la charge utile, sans verification de signature :
    // c'est le serveur qui valide, on ne fait que lire l'identifiant.
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.userId || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
