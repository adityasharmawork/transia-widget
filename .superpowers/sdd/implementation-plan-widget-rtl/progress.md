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
- (pending) R1 — localeDirection helper + tests.
- (pending) R2 — thread direction through TransiaWidget/FloatingButton/LanguagePanel + tests.
- (pending) R3 — export localeDirection, add `test` script, README RTL note.
- (pending) Review — fresh Opus subagent, high effort.
