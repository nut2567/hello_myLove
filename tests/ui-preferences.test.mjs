import { describe, expect, test } from "bun:test";
import { createTranslator } from "next-intl";
import {
  defaultUiPreferences,
  parseUiPreferences,
} from "../src/lib/ui-preferences.ts";
import { messages } from "../src/i18n/messages.ts";

describe("UI preferences", () => {
  test("restores supported choices and rejects corrupted stored fields independently", () => {
    expect(
      parseUiPreferences({
        locale: "en",
        fontSize: "xlarge",
        colorTheme: "sharp2",
      }),
    ).toEqual({ locale: "en", fontSize: "xlarge", colorTheme: "sharp2" });
    expect(
      parseUiPreferences({
        locale: "en",
        fontSize: "huge",
        colorTheme: "unknown",
      }),
    ).toEqual({ ...defaultUiPreferences, locale: "en" });
    for (const value of [
      null,
      [],
      false,
      "en",
      { locale: "fr", fontSize: 2 },
    ]) {
      expect(parseUiPreferences(value)).toEqual(defaultUiPreferences);
    }
  });
});

function flattenMessages(catalog, prefix = "") {
  return Object.entries(catalog).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string"
      ? [[path, value]]
      : flattenMessages(value, path);
  });
}

describe("next-intl messages", () => {
  test("both locales contain the same message keys", () => {
    expect(
      flattenMessages(messages.th)
        .map(([key]) => key)
        .sort(),
    ).toEqual(
      flattenMessages(messages.en)
        .map(([key]) => key)
        .sort(),
    );
  });

  test("every message formats without missing values or unintended rich-text tags", () => {
    for (const locale of ["th", "en"]) {
      const t = createTranslator({
        locale,
        messages: messages[locale],
        onError: (error) => {
          throw error;
        },
      });
      for (const [key] of flattenMessages(messages[locale])) {
        expect(t(key).trim().length).toBeGreaterThan(0);
      }
    }
  });

  test("formats translated labels and keeps code notation literal", () => {
    const th = createTranslator({ locale: "th", messages: messages.th });
    const en = createTranslator({ locale: "en", messages: messages.en });
    expect(th("Common.continue")).toBe("ดำเนินการต่อ");
    expect(en("Admin.title")).toBe("Manage users");
    expect(th("PathAccess.unlockPathPrefix")).toBe("ปลดล็อก /");
    const codeKey = flattenMessages(messages.th).find(
      ([, value]) => value.includes("useFrame") && value.includes("Canvas"),
    )[0];
    expect(th(codeKey)).toContain("<Canvas>");
    expect(en(codeKey)).toContain("<Canvas>");
  });
});
