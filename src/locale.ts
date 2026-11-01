/**
 * Locale helpers — pure (no React, no DOM), so they are safe under SSR and
 * easy to unit-test. The widget previously used a narrow regex
 * `^[a-z]{2}(-[A-Z]{2})?$` that silently dropped valid BCP-47 tags such as
 * zh-Hans, es-419, fil and sr-Latn; these helpers accept any well-formed tag.
 */

/** Canonicalize a BCP-47 tag ("EN-us" -> "en-US"); returns the input if invalid. */
export function normalizeTag(tag: string): string {
  try {
    const [canon] = Intl.getCanonicalLocales(tag);
    return canon ?? tag;
  } catch {
    return tag;
  }
}

/** True for any well-formed BCP-47 tag. */
export function isValidLocale(tag: unknown): tag is string {
  if (typeof tag !== "string" || tag.trim() === "") return false;
  try {
    return Intl.getCanonicalLocales(tag).length === 1;
  } catch {
    return false;
  }
}

/** Keep only valid, de-duplicated tags, preserving the caller's order. */
export function sanitizeLocales(input: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const l of input) {
    if (!isValidLocale(l)) continue;
    const key = normalizeTag(l).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(l);
  }
  return out;
}

/**
 * Resolve which tag in `locales` should be active given an external `current`
 * (possibly undefined, a regional variant like "en-US" when the list has "en",
 * or absent from the list). Precedence: exact -> canonical case-insensitive ->
 * base language -> first locale.
 */
export function resolveActiveLocale(
  locales: string[],
  current?: string,
): string | undefined {
  if (locales.length === 0) return undefined;
  if (current && locales.includes(current)) return current;
  if (current) {
    const c = normalizeTag(current).toLowerCase();
    const exactCi = locales.find((l) => normalizeTag(l).toLowerCase() === c);
    if (exactCi) return exactCi;
    const base = c.split("-")[0];
    const byBase = locales.find(
      (l) => normalizeTag(l).toLowerCase().split("-")[0] === base,
    );
    if (byBase) return byBase;
  }
  return locales[0];
}
