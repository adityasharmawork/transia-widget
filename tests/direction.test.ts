import { describe, it, expect } from "vitest";
import { localeDirection, directionFromTagStatic } from "../src/direction";

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

// The static fallback runs only when the Intl Locale-Info API is absent (older
// runtimes). Modern Node has `textInfo`, so `localeDirection` never reaches it —
// testing it directly keeps the fallback covered and matching ICU.
describe("directionFromTagStatic (fallback path)", () => {
  it("treats an explicit RTL script subtag as rtl", () => {
    for (const tag of ["az-Arab", "pa-Arab", "ur-Arab", "ks-Arab", "sd-Arab"]) {
      expect(directionFromTagStatic(tag)).toBe("rtl");
    }
  });

  it("treats an explicit NON-RTL script as ltr even for a base-RTL language", () => {
    // Regression: the fallback used to ignore LTR scripts and fall through to the
    // base-RTL set, mis-marking these rtl (disagreeing with ICU + risking an SSR
    // hydration mismatch on `dir`).
    for (const tag of ["ur-Latn", "ug-Latn", "ug-Cyrl", "ks-Deva", "sd-Deva", "ckb-Latn", "fa-Latn"]) {
      expect(directionFromTagStatic(tag)).toBe("ltr");
    }
  });

  it("uses the base-language set when there is no script subtag", () => {
    expect(directionFromTagStatic("ar")).toBe("rtl");
    expect(directionFromTagStatic("ur")).toBe("rtl");
    expect(directionFromTagStatic("ar-EG")).toBe("rtl"); // region, not script
    expect(directionFromTagStatic("en")).toBe("ltr");
    expect(directionFromTagStatic("en-US")).toBe("ltr");
  });

  it("does not read a 4-char numeric variant as a script subtag", () => {
    // `de-1901` (orthographic variant): "1901" must NOT be treated as a script.
    expect(directionFromTagStatic("de-1901")).toBe("ltr");
    // `ks-1901`: no real script present, so the base-RTL language still decides.
    expect(directionFromTagStatic("ks-1901")).toBe("rtl");
  });
});
