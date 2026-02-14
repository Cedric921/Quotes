import frMessages from "../../messages/fr.json";
import enMessages from "../../messages/en.json";

export type Locale = "fr" | "en";

export const messages = {
  fr: frMessages,
  en: enMessages,
};

export const defaultLocale: Locale = "fr";

export function getMessages(locale: Locale) {
  return messages[locale] || messages[defaultLocale];
}

