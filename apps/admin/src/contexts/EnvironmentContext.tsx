"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type EnvironmentMode = "all" | "PRODUCTION" | "SANDBOX";

interface EnvironmentContextType {
  environment: EnvironmentMode;
  setEnvironment: (mode: EnvironmentMode) => void;
  // When undefined the API call must not include the ?environment param,
  // which means "return everything across both environments".
  queryValue: "PRODUCTION" | "SANDBOX" | undefined;
}

const STORAGE_KEY = "focus_admin_environment";
const DEFAULT_MODE: EnvironmentMode = "PRODUCTION";

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(
  undefined,
);

export function EnvironmentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [environment, setEnvironmentState] =
    useState<EnvironmentMode>(DEFAULT_MODE);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "all" || saved === "PRODUCTION" || saved === "SANDBOX") {
      setEnvironmentState(saved);
    }
  }, []);

  const setEnvironment = (mode: EnvironmentMode) => {
    setEnvironmentState(mode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, mode);
    }
  };

  const queryValue =
    environment === "all" ? undefined : (environment as "PRODUCTION" | "SANDBOX");

  return (
    <EnvironmentContext.Provider
      value={{ environment, setEnvironment, queryValue }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error(
      "useEnvironment must be used within an EnvironmentProvider",
    );
  }
  return context;
}
