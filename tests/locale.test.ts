import { describe, it, expect } from "vitest";
import { normalizeTag, isValidLocale, sanitizeLocales, resolveActiveLocale } from "../src/locale";

describe("isValidLocale", () => {
  it("accepts well-formed tags the old regex dropped", () => {
    for (const t of ["en", "es", "zh-Hans", "zh-Hant-HK", "es-419", "fil", "sr-Latn", "en-US", "pt-BR"])
      expect(isValidLocale(t)).toBe(true);
  });
  it("rejects junk", () => {
    for (const t of ["", "  ", "!!", "123", 5 as unknown, null as unknown, undefined as unknown])
      expect(isValidLocale(t)).toBe(false);
  });
});

describe("normalizeTag", () => {
  it("canonicalizes case", () => {
    expect(normalizeTag("EN-us")).toBe("en-US");
    expect(normalizeTag("ZH-hans")).toBe("zh-Hans");
  });
});

describe("sanitizeLocales", () => {
  it("keeps valid tags, drops junk, de-dupes case-insensitively, preserves order", () => {
    expect(sanitizeLocales(["en", "EN", "es-419", "!!bad", "", "zh-Hans"]))
      .toEqual(["en", "es-419", "zh-Hans"]);
  });
});

describe("resolveActiveLocale", () => {
  it("prefers an exact match", () => expect(resolveActiveLocale(["en", "es"], "es")).toBe("es"));
  it("maps a regional variant to its base (en-US -> en)", () =>
    expect(resolveActiveLocale(["en", "es"], "en-US")).toBe("en"));
  it("is case-insensitive (zh-hans -> zh-Hans)", () =>
    expect(resolveActiveLocale(["zh-Hans", "en"], "zh-hans")).toBe("zh-Hans"));
  it("falls back to the first locale when unmatched or absent", () => {
    expect(resolveActiveLocale(["en", "es"], "fr")).toBe("en");
    expect(resolveActiveLocale(["en", "es"], undefined)).toBe("en");
  });
  it("returns undefined only for an empty list", () =>
    expect(resolveActiveLocale([], "en")).toBeUndefined());
});
