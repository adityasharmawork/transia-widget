/**
 * Text-direction helper — pure (no React, no DOM), safe under SSR and easy to
 * unit-test. Given a BCP-47 locale tag, decides whether that language is written
 * left-to-right or right-to-left so the widget can mirror its chrome.
 *
 * Precedence:
 *   1. `Intl.Locale(tag).textInfo.direction` when the runtime provides the Intl
 *      Locale-Info API — authoritative and script-aware (e.g. `az-Arab` → rtl).
 *   2. A static fallback for older runtimes: an explicit RTL *script* subtag wins,
 *      otherwise the base language is checked against a curated RTL set.
 *
 * Both paths agree for the common tags, so behavior is deterministic even where
 * the Intl Locale-Info API is unavailable (older Node / jsdom).
 */

export type Direction = "ltr" | "rtl";

/**
 * Base languages that are always RTL regardless of region. Deliberately excludes
 * tags that are commonly written in Latin today (`ha` Hausa, bare `ku`
 * Kurmanji-Kurdish, bare `uz` Uzbek); those are only RTL with an explicit
 * `-Arab` script subtag, which the script check below handles.
 */
const RTL_BASE_LANGS = new Set([
  "ar", // Arabic
  "arc", // Aramaic
  "ckb", // Central Kurdish (Sorani)
  "dv", // Divehi / Maldivian
  "fa", // Persian / Farsi
  "he", // Hebrew
  "khw", // Khowar
  "ks", // Kashmiri
  "nqo", // N'Ko
  "prs", // Dari
  "ps", // Pashto
  "sd", // Sindhi
  "syr", // Syriac
  "ug", // Uyghur
  "ur", // Urdu
  "yi", // Yiddish
]);

/** ISO 15924 script subtags written right-to-left (lowercased for comparison). */
const RTL_SCRIPTS = new Set([
  "arab",
  "hebr",
  "syrc",
  "thaa",
  "nkoo",
  "samr",
  "mand",
  "mend",
  "adlm",
  "rohg",
  "yezi",
]);

export function localeDirection(locale: string): Direction {
  if (!locale || typeof locale !== "string") return "ltr";

  // 1) Authoritative: Intl Locale-Info (handles script subtags like az-Arab).
  try {
    const loc = new Intl.Locale(locale) as Intl.Locale & {
      textInfo?: { direction?: string };
      getTextInfo?: () => { direction?: string };
    };
    const info =
      loc.textInfo ?? (typeof loc.getTextInfo === "function" ? loc.getTextInfo() : undefined);
    if (info?.direction === "rtl" || info?.direction === "ltr") return info.direction;
  } catch {
    // Invalid tag or Intl Locale-Info unavailable — fall through to the static path.
  }

  // 2) Static fallback: explicit RTL script subtag wins, else base language.
  const parts = locale.toLowerCase().split(/[-_]/);
  const script = parts.find((p) => p.length === 4);
  if (script && RTL_SCRIPTS.has(script)) return "rtl";
  if (RTL_BASE_LANGS.has(parts[0])) return "rtl";
  return "ltr";
}
