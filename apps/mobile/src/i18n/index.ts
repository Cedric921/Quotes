import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";

import en from "./locales/en.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import ar from "./locales/ar.json";
import de from "./locales/de.json";
import it from "./locales/it.json";
import zh from "./locales/zh.json";
import nl from "./locales/nl.json";
import ru from "./locales/ru.json";
import tr from "./locales/tr.json";

const LANGUAGE_STORAGE_KEY = "@focus_language";

// Langues supportées
export const supportedLanguages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "ar", name: "Arabic", nativeName: "العربية", rtl: true },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
];

const supportedLanguageCodes = supportedLanguages.map((l) => l.code);

// Langue par défaut: Français
const DEFAULT_LANGUAGE = "fr";

// Initialiser i18n de manière synchrone d'abord
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    es: { translation: es },
    ar: { translation: ar },
    de: { translation: de },
    it: { translation: it },
    zh: { translation: zh },
    nl: { translation: nl },
    ru: { translation: ru },
    tr: { translation: tr },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: "fr",
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
  return i18n.language || "fr";
};

// Fonction pour vérifier si la langue est RTL
export const isRTL = (): boolean => {
  const currentLang = supportedLanguages.find((l) => l.code === i18n.language);
  return currentLang?.rtl === true;
};

export default i18n;
