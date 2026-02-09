import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";

import en from "./locales/en.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import ar from "./locales/ar.json";

const LANGUAGE_STORAGE_KEY = "@focus_language";

// Détection de la langue du système
const getDeviceLanguage = (): string => {
  try {
    const locales = Localization.getLocales();
    const locale =
      locales && locales.length > 0 ? locales[0].languageCode || "en" : "en";

    // Vérifier si la langue est supportée
    const supportedLanguages = ["en", "fr", "es", "ar"];
    return supportedLanguages.includes(locale) ? locale : "en";
  } catch (error) {
    console.error("Error detecting device language:", error);
    return "en";
  }
};

// Initialiser i18n de manière synchrone d'abord
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    es: { translation: es },
    ar: { translation: ar },
  },
  lng: getDeviceLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// Charger la langue sauvegardée de manière asynchrone
const loadSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage) {
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.error("Error loading saved language:", error);
  }
};

// Charger la langue sauvegardée au démarrage
loadSavedLanguage();

// Fonction pour changer la langue
export const changeLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error("Error changing language:", error);
  }
};

// Fonction pour obtenir la langue actuelle
export const getCurrentLanguage = (): string => {
  return i18n.language || "en";
};

// Fonction pour vérifier si la langue est RTL
export const isRTL = (): boolean => {
  return i18n.language === "ar";
};

export default i18n;
