import { describe, it, expect } from "vitest";
import { localeDirection } from "../src/direction";

describe("localeDirection", () => {
  it("marks core RTL base languages as rtl", () => {
    for (const tag of ["ar", "he", "fa", "ur", "ps", "sd", "dv", "ug", "yi", "ckb", "prs", "syr"]) {
      expect(localeDirection(tag)).toBe("rtl");
    }
  });

  it("marks LTR languages as ltr", () => {
    for (const tag of ["en", "es", "fr", "de", "ja", "zh", "ru", "hi", "ko", "th"]) {
      expect(localeDirection(tag)).toBe("ltr");
    }
  });

  it("resolves RTL regardless of region subtag", () => {
    expect(localeDirection("ar-EG")).toBe("rtl");
    expect(localeDirection("he-IL")).toBe("rtl");
    expect(localeDirection("fa-AF")).toBe("rtl");
  });

  it("uses the script subtag: -Arab is rtl, -Latn is ltr", () => {
    expect(localeDirection("az-Arab")).toBe("rtl");
    expect(localeDirection("pa-Arab")).toBe("rtl");
    expect(localeDirection("az-Latn")).toBe("ltr");
    expect(localeDirection("sr-Latn")).toBe("ltr");
  });

  it("does NOT false-positive ambiguous Latin-today tags without a script subtag", () => {
    expect(localeDirection("ha")).toBe("ltr"); // Hausa (Latin today)
    expect(localeDirection("ku")).toBe("ltr"); // bare Kurdish (Kurmanji/Latin)
    expect(localeDirection("uz")).toBe("ltr"); // bare Uzbek (Latin)
  });

  it("is case-insensitive", () => {
    expect(localeDirection("AR")).toBe("rtl");
    expect(localeDirection("He-IL")).toBe("rtl");
    expect(localeDirection("EN")).toBe("ltr");
  });

  it("defaults to ltr for empty / malformed input", () => {
    expect(localeDirection("")).toBe("ltr");
    // @ts-expect-error — defensive against non-string input
    expect(localeDirection(undefined)).toBe("ltr");
    expect(localeDirection("!!not-a-locale!!")).toBe("ltr");
  });
});
