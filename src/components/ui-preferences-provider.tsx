"use client";

import { NextIntlClientProvider } from "next-intl";
import { messages } from "@/i18n/messages";
import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  defaultUiPreferences,
  parseUiPreferences,
  UI_PREFERENCES_STORAGE_KEY,
  type ColorTheme,
  type FontSize,
  type Locale,
  type UiPreferences,
} from "@/lib/ui-preferences";

let snapshot = defaultUiPreferences;
let initialized = false;
const listeners = new Set<() => void>();

function readPreferences() {
  try {
    return parseUiPreferences(
      JSON.parse(
        window.localStorage.getItem(UI_PREFERENCES_STORAGE_KEY) ?? "null",
      ),
    );
  } catch {
    return defaultUiPreferences;
  }
}

function emit(next: UiPreferences) {
  if (
    next.locale === snapshot.locale &&
    next.fontSize === snapshot.fontSize &&
    next.colorTheme === snapshot.colorTheme
  )
    return;
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key === UI_PREFERENCES_STORAGE_KEY || event.key === null)
    emit(readPreferences());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  if (!initialized) {
    initialized = true;
    emit(readPreferences());
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}

function updatePreferences(next: Partial<UiPreferences>) {
  const value = parseUiPreferences({ ...snapshot, ...next });
  emit(value);
  try {
    window.localStorage.setItem(
      UI_PREFERENCES_STORAGE_KEY,
      JSON.stringify(value),
    );
  } catch {
    // Preferences still work for this visit when browser storage is unavailable.
  }
}

const setters = {
  setLocale: (locale: Locale) => updatePreferences({ locale }),
  setFontSize: (fontSize: FontSize) => updatePreferences({ fontSize }),
  setColorTheme: (colorTheme: ColorTheme) => updatePreferences({ colorTheme }),
  resetAppearance: () =>
    updatePreferences({ fontSize: "normal", colorTheme: "normal" }),
};

type UiPreferencesContextValue = UiPreferences & typeof setters;
const UiPreferencesContext = createContext<UiPreferencesContextValue | null>(
  null,
);

export function UiPreferencesProvider({ children }: { children: ReactNode }) {
  const preferences = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => defaultUiPreferences,
  );

  useEffect(() => {
    const root = document.documentElement;
    root.lang = preferences.locale;
    root.dataset.fontSize = preferences.fontSize;
    root.dataset.colorTheme = preferences.colorTheme;
  }, [preferences]);

  return (
    <UiPreferencesContext value={{ ...preferences, ...setters }}>
      <NextIntlClientProvider
        locale={preferences.locale}
        messages={messages[preferences.locale]}
        timeZone="Asia/Bangkok"
      >
        {children}
      </NextIntlClientProvider>
    </UiPreferencesContext>
  );
}

export function useUiPreferences() {
  const context = useContext(UiPreferencesContext);
  if (!context)
    throw new Error("useUiPreferences requires UiPreferencesProvider");
  return context;
}
