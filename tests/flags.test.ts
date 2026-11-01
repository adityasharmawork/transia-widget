import { describe, it, expect } from "vitest";
import { getLocaleInfo } from "../src/flags";

describe("getLocaleInfo", () => {
  it("returns endonyms (native names)", () => {
    expect(getLocaleInfo("es").nativeName).toBe("Español");
    expect(getLocaleInfo("de").nativeName).toBe("Deutsch");
    expect(getLocaleInfo("ja").nativeName).toBe("日本語");
    expect(getLocaleInfo("en").nativeName).toBe("English");
  });
  it("keeps the English name separately and always returns a flag", () => {
    const es = getLocaleInfo("es");
    expect(es.name).toBe("Spanish");
    expect(typeof es.flag).toBe("string");
  });
  it("falls back gracefully for unknown tags", () => {
    const x = getLocaleInfo("zz");
    expect(x.flag).toBe("\u{1F310}");
    expect(typeof x.nativeName).toBe("string");
  });
});
