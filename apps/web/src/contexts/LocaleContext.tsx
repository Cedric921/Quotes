"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import type { Locale } from "@/lib/i18n";
import { getMessages, defaultLocale } from "@/lib/i18n";

type Messages = typeof import("../../messages/fr.json");

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState<Messages>(getMessages(defaultLocale));

  useEffect(() => {
    // Load locale from cookie on mount
    const savedLocale = Cookies.get("NEXT_LOCALE") as Locale | undefined;
    if (savedLocale && (savedLocale === "fr" || savedLocale === "en")) {
      setLocaleState(savedLocale);
      setMessages(getMessages(savedLocale));
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setMessages(getMessages(newLocale));
    Cookies.set("NEXT_LOCALE", newLocale, { expires: 365 });
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: messages }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}

