export const locales = ["th", "en"] as const;
export const fontSizes = ["small", "normal", "large", "xlarge"] as const;
export const colorThemes = ["normal", "sharp1", "sharp2"] as const;

export type Locale = (typeof locales)[number];
export type FontSize = (typeof fontSizes)[number];
export type ColorTheme = (typeof colorThemes)[number];
export type UiPreferences = {
  locale: Locale;
  fontSize: FontSize;
  colorTheme: ColorTheme;
};

export const UI_PREFERENCES_STORAGE_KEY = "hello-mylove:ui-preferences:v1";
export const defaultUiPreferences: UiPreferences = {
  locale: "th",
  fontSize: "normal",
  colorTheme: "normal",
};

export function parseUiPreferences(value: unknown): UiPreferences {
  const record =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  return {
    locale:
      locales.find((locale) => locale === record.locale) ??
      defaultUiPreferences.locale,
    fontSize:
      fontSizes.find((size) => size === record.fontSize) ??
      defaultUiPreferences.fontSize,
    colorTheme:
      colorThemes.find((theme) => theme === record.colorTheme) ??
      defaultUiPreferences.colorTheme,
  };
}
