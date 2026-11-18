# SDD ledger — plan: /Users/adityasharma/Documents/projects/transia/audit/design/implementation-plan-widget-rtl.md

## Setup
- Executor: inline (executing-plans), native in-session TDD, Opus tier.
- Repo: transia-widget, branch `audit/widget-rtl` from `origin/main` @ ff04031 (widget PR #1 merged).
- Context: ROADMAP item 3 (DX polish & trust), slice 3 = Widget RTL (W-19). User picked
  "Both, RTL first" via AskUserQuestion (then Offline-grace, slice 2, as a second PR).
  CLI slices: trust & clarity shipped (PR #11).
- Baseline: 21/21 tests green (via `npx vitest run`; no `test` script existed).

## Rulings
- Two direction levels: container dir = active locale (panel/listbox/trigger mirroring via
  flexbox inline base direction, no DOM reorder); per-label dir = each option's own locale
  (so mixed-script endonyms each render correctly in one list).
- `position` prop is NOT auto-mirrored — explicit dev corner choice stays physical.
- Direction source: `Intl.Locale(tag).textInfo.direction` when present, else static fallback
  (RTL script subtag, else curated RTL base set). Deterministic for tested tags either way.
- Curated RTL base set excludes ambiguous Latin-today tags (ha, bare ku, bare uz); those
  need an explicit -Arab script subtag to be RTL.
- Deferred: W-21 flags-as-icons rethink; widget chrome string localization; landscape maxHeight.

## Progress
- R1: complete (4e1de23) — src/direction.ts localeDirection(); 7 unit tests (base RTL set,
  LTR langs, region subtag, script subtag az-Arab/pa-Arab, no-false-positive ha/ku/uz,
  case-insensitive, empty/garbage→ltr).
- R2: complete (3a25230) — TransiaWidget computes direction from activeLocale, threads to
  FloatingButton (dir on button) + LanguagePanel (dir on panel root + listbox; per-option
  label span dir = own locale). 6 RTL integration tests incl. selection-under-RTL regression.
- R3: complete (1662bca) — index.ts exports localeDirection + Direction; package.json adds
  "test": "vitest run"; README RTL section. Build: localeDirection present in dist/index.d.ts.
- Full suite 34/34 (21 baseline + 7 + 6), tsc clean, tsup build OK, `npm test` works.
  3 commits on origin/main@ff04031.
- Review: fresh Opus subagent (high effort). VERDICT: Sound — RTL model, flexbox mirroring
  (no physical leak), container-vs-label dir separation, a11y (arrows don't flip under RTL,
  correct for a vertical listbox), position-not-mirrored, and SSR crash-safety all VERIFIED
  SOUND. Found 1 Important + 1 Nit, both fixed (26549c7):
  - IMPORTANT (Finding 1): static fallback's script check was asymmetric — RTL script
    short-circuited to rtl, but a non-RTL script was ignored and fell through to the
    base-RTL set, mis-marking ur-Latn/ug-Latn/ks-Deva as rtl (disagrees with ICU; SSR
    hydration-mismatch vector; localeDirection is public API). Masked in tests because
    Node 24 has Intl.Locale.textInfo so the fallback was never exercised. Fix: explicit
    script is authoritative in the fallback (RTL script -> rtl, else ltr) before the base
    set. Extracted directionFromTagStatic + tested it directly. +4 tests.
  - NIT (Finding 2): parts.find(length===4) could match a 4-char numeric variant (de-1901);
    benign before but live once Finding 1 lands. Guarded to /^[a-z]{4}$/.
  - Noted inaccuracy in the design rationale (direction changes on selection, not hover) —
    conclusion holds; left as-is.
- Final: suite 38/38 (34 + 4 fallback), tsc clean, build OK. 4 commits on origin/main@ff04031.
