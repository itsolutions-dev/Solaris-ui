# Solaris Theme Proposals A/B (colours, type, shape, icons) + Roadmap — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make "Proposta A" (CRM) the library's default theme and ship "Proposta B" (siti Databeasy/InXpire) as a second preset, switchable on the docs site's theming page. Each proposal carries its own colours, type scale, radii **and icon set** (A: MaterialCommunityIcons, B: Eva Icons outline). Then continue the MUI-API program (G1–G8).

**Architecture:** `createTheme` is extended so a theme can fix what the Material 3 derivation cannot guess (per-step typography, shape radii, a real `tertiary`, exact role overrides, an icon-set name). A is expressed in `theme.json`. B is a `createTheme(...)` call in the playground only, picked by a small persisted context that feeds `ThemeProvider`'s existing `theme` prop, so the whole site re-themes with no component edits. `Icon` becomes the single place that turns a glyph name into pixels: it reads `theme.icons` and draws either an MDI glyph or an Eva glyph (SVG path data, rendered with `react-native-svg`, already a peer dependency).

**Tech Stack:** TypeScript, React Native + react-native-web (Expo), jest-expo, `polished`, `react-native-svg`, AsyncStorage (already used by `site/usePersistentState.ts`), `eva-icons` (new **devDependency**, used only by a generator script; MIT).

**Spec:** none written. The design is the "drafted design" in `HANDOFF.md` (2026-10-13), now approved by Alice for typography, radii and the rest ("va bene"), plus this plan's icon section. Source of values: `docs/design/solaris-ui-themes.pdf`, `docs/design/solaris-themes.json`. Parent specs: `docs/superpowers/specs/2026-10-12-solaris-program-design.md`, `2026-10-12-solaris-mui-api-design.md`.

## State found when this plan was written (2026-10-13)

- Branch `dev`, at `cff3a16` (G0 committed). `npm ci --ignore-scripts` done; `build`, `type-check`, `docgen`/`variants` (no diff), `export:web` and all tests (704 + 125) pass on this commit.
- `docs/design/` now holds `solaris-ui.pdf`, `solaris-ui-themes.pdf`, `solaris-themes.json` (copied from `Desktop/InXpire/Solaris UI`). Untracked.
- `solaris-themes.json` has two themes, `crm` (A) and `siti` (B), each with `light`/`dark` and 35 Material 3 role values. It has **no** `info`/`warning`/`success`: those come from the PDF (below). I computed the contrast of the main/on and surface/on pairs in the JSON: none under 4.5:1.
- `createTheme` (`packages/ui/src/providers/createTheme.ts`) accepts only `colorSchemes.<mode>.palette` and `typography.fontFamily`. Tertiary is derived from primary's hue and is not on `theme.palette`.
- `theme.json` still holds the org theme (blue/green) and the G0 MUI type scale (h1 96 … `button` uppercase).
- **36 library files import `@expo/vector-icons/MaterialCommunityIcons` directly** (Button, Chip, Select, Input, NavigationBar, Tabs, …). `Icon.tsx` already resolves glyph names but most chrome bypasses it. `react-native-eva-icons` is unusable (last release 2022, peer `react-native-svg@^9`); `eva-icons@1.1.3` (SVG sources, MIT) is fine as a generator input.
- `apps/playground/app/_layout.tsx` mounts `<ThemeProvider>` with no `theme` prop; `site/usePersistentState.ts` persists reader preferences.

## Global Constraints

- Component behaviour must not change for the colour/type/shape work: components read `theme.colors` / `theme.typography` / `theme.shape` only. The only component sweep is icons (Task 6).
- MUI variant names stay (`h1`…`overline`); only sizes/weights/transform change. `button` is Sentence case (`textTransform: "none"` in both proposals).
- **Proposta A colours:** exactly the `crm` entry of `docs/design/solaris-themes.json`, per scheme (35 roles). Status colours (PDF p.1): light success `#2F7A1B`, warning `#A94E08`, info `#0A6C94`, error `#B00020`; dark success `#61B340`, warning `#FCA600`, info `#7CC4E6`, error `#F2B8B5`. Tertiary `#61B340`. `secondary` is slate (`#556579` light, `#94A3B8` dark): **the green is no longer secondary**.
- **Proposta B colours:** exactly the `siti` entry of the JSON. Status colours (PDF p.1, "700" shades, both schemes): info `#0072F5` (blue-700), warning `#FFB224` (amber-700), success `#45A557` (green-700), error `#E5484D` (red-700). Primary is black/white (`#171717` / `#EDEDED`). `secondary` is the brand blue `#1D5B9C`, tertiary the brand green `#62B241`.
- **Proposta A type scale** (Roboto; size / weight / line height): h1–h4 32/700/40 (**h1–h3 not on the sheet**: copied from h4), h5 24/700/32, h6 22/500/28, subtitle1 16/500/24, subtitle2 14/500/20, body1 16/400/24, body2 14/400/20, button 14/500/20, caption 12/400/16 (**not on the sheet**), overline 11/500/16 uppercase. Letter spacing 0 except overline 0.5.
- **Proposta B type scale** (Geist on web; native keeps the system font): h1 56/500/67, h2 40/500/48 (both from the sheet; presentation sizes, rarely used in app screens), h3 32/600/40 and h4 24/600/32 (**inferred**), h5 20/600/28 (= sheet H3), h6 18/600/24 (**inferred**), subtitle1 16/500/24, subtitle2 14/500/20 (**inferred**), body1 16/400/24, body2 14/400/20 (= sheet "Small"), button 14/500/20, caption 12/400/16, overline 11/500/16 uppercase (**inferred**). Letter spacing −2% of the size (`-0.02 * fontSize`) on h1–h6, 0 elsewhere.
- **Radii:** A = the current scale (small 8, medium 12, large 16, extraLarge 24, full 9999: already matches the sheet). B = 12 for fields/small/medium, 24 for large/extraLarge, pill: `small 12, medium 12, large 24, extraLarge 24, full 9999`.
- **Spacing:** both sheets use a 4 px base; `theme.spacing(n)` = 8·n already gives 4 (n=0.5), 12 (1.5) and B's 48/64 (6/8). No change.
- **Icons:** A = MaterialCommunityIcons (today's set, MDI names are the canonical glyph names). B = Eva Icons, **outline** variant. The glyph name a caller writes never changes; the theme picks the drawing. A glyph with no Eva counterpart falls back to MDI and warns once in development.
- **Out of scope (deferred):** MUI breakpoints (xs 0, sm 600, md 900, lg 1300, xl 1536), the 12-column grid, B's containers (≈964/1126 px, gutter 24): they belong to G1 (Grid/Box). Montserrat title alternative, the brand/pastel gradients (decorative, sub-project 3), and the mockups' own components (stat cards, icon tiles, status chips, initials avatars: sub-project 3).
- Generators: `npm run docgen` / `npm run variants` leave no diff; `lint`, `type-check`, `test`, `build`, `validate-package`, `export:web` pass (`CLAUDE.md`). Generated files are never hand-edited. JSX text with quotes/apostrophes is wrapped in `{"..."}`.
- Commits: Gabriele's sessions never commit. Ask Alice which policy applies before the first checkpoint; until answered, every task ends with `git status` and no commit.

## Open decisions (each has a default; the plan runs with the default)

1. **Inferred type rows** (marked above, A h1–h3/caption, B h3/h4/h6/subtitle2/overline): accepted until the designers supply them.
2. **Eva icons without a drawing** for a library glyph: MDI fallback + dev warning, list kept in `iconMap.ts` comments. Alternative (draw by hand) rejected.
3. **Eva in Expo Go / native:** SVG paths through `react-native-svg`, no font and no native module, so it works in Expo Go and on web.
4. **Commit policy** (see Global Constraints).

## Review Focus

- **`theme.palette` and `theme.colors` must agree** after role overrides (e.g. `palette.text.secondary === colors.onSurfaceVariant`, `palette.primary.main === colors.primary`, `palette.divider === colors.outlineVariant`). Test: Task 2.
- B's **achromatic primary** (`#171717` / `#EDEDED`): any role the JSON does not fix must still come out grey, not tinted (the ≥5-chroma guard). Test: Task 2.
- A **partial typography override** (`{ h4: { fontSize: 24 } }`) keeps the base step's other fields and the `fontFamily`. Test: Task 2.
- A **bad value in a role override** (`colors: { primaryContainer: "nope" }`) throws in `createTheme`, not later in a press handler. Test: Task 2.
- A **stored preset id the build doesn't know** (`"c"`) falls back to A. Test: Task 5.
- An **unmapped Eva glyph** renders the MDI drawing and warns once, never crashes or renders nothing. Test: Task 6.
- **Every demo in the catalogue under B** renders without an unmapped-glyph warning: this is the exhaustiveness check for the icon map. Test: Task 6.
- **First paint vs. persisted preset**: static export prerenders A and the stored B hydrates one frame later. Accepted; code comment, no test.

---

### Task 1: Put the token source in the repo and guard against drift

**Files:**
- Create (already copied, to be tracked): `docs/design/solaris-ui.pdf`, `docs/design/solaris-ui-themes.pdf`, `docs/design/solaris-themes.json`
- Test: none yet (the drift tests live with their consumers, Tasks 3 and 4)

- [ ] **Step 1:** Confirm the three files are in `docs/design/` and `solaris-themes.json` parses with two ids, `crm` and `siti`, 35 role keys per scheme. (Done once on 2026-10-13; re-run `node -e "const t=require('./docs/design/solaris-themes.json');console.log(t.map(x=>x.id+' '+Object.keys(x.light).length))"` → `crm 35`, `siti 35`.)
- [ ] **Step 2:** `git status` checkpoint. No code changed.

---

### Task 2: Extend `createTheme` (typography per step, shape, tertiary, role overrides, icon set)

**Files:**
- Modify: `packages/ui/src/providers/createTheme.ts` (option types, `build`, `deriveScheme`, `assertColors`)
- Modify: `packages/ui/src/providers/ThemeProvider.tsx` (`Palette.tertiary: PaletteColor`; `Theme.icons: IconSetName`)
- Test: `packages/ui/src/__tests__/createTheme.test.ts`

**Interfaces:**
- Produces (exported from the barrel through `createTheme.ts`):
  - `type IconSetName = "material" | "eva"`
  - `ThemeOptions.typography?: { fontFamily?: string } & Partial<Record<TypographyVariant, Partial<TextStyle>>>`
  - `ThemeOptions.shape?: Partial<ThemeShapeTokens>`
  - `ThemeOptions.icons?: IconSetName` (default `"material"`)
  - `PaletteOptions.tertiary?: PaletteColorOptions`
  - `ThemeOptions.colorSchemes[mode].colors?: Partial<ThemeColorTokens>` (exact roles, applied after derivation)
  - `Theme.icons: IconSetName`, `Palette.tertiary: PaletteColor`
- Behaviour: `palette` is built from the **final** roles (after `colors` overrides), so `palette.text.*`, `palette.divider`, `palette.background.*` and each colour's `main` match `theme.colors`. With no `tertiary` given, `palette.tertiary.main` equals the derived `colors.tertiary` (today's value).

- [ ] **Step 1: Write the failing tests** in `createTheme.test.ts`, one `it` each:
  - `"overrides single type steps and keeps the rest"`: `createTheme({ typography: { h4: { fontSize: 24 } } }).light.typography.h4` has `fontSize` 24, base `fontWeight`/`lineHeight` of h4 and the theme `fontFamily`; `h5` unchanged.
  - `"takes shape radii"`: `createTheme({ shape: { large: 20 } }).light.shape` → `large` 20, `small` still 8.
  - `"derives tertiary from a given colour and exposes it on the palette"`: `palette.tertiary.main = "#61B340"` → `colors.tertiary === "#61B340"` and `palette.tertiary.main === "#61B340"`; with no option, `palette.tertiary.main === colors.tertiary`.
  - `"applies exact role overrides after derivation"`: `colorSchemes.light.colors = { primaryContainer: "#E8F0FA" }` → that role changes, `onPrimary` untouched.
  - `"keeps palette and colors in agreement after overrides"`: override `onSurfaceVariant`, `outlineVariant`, `surface`, `primary` → `palette.text.secondary`, `palette.divider`, `palette.background.paper`, `palette.primary.main` equal them.
  - `"rejects a bad role override"`: `colors: { primaryContainer: "nope" }` throws.
  - `"keeps a black/white brand grey with partial overrides"`: primary `#171717` light / `#EDEDED` dark, no `colors` → `primaryContainer` and `surfaceContainerHighest` have channel spread ≤ 2 (reuse the file's `spread` helper).
  - `"carries an icon-set name"`: default `theme.light.icons === "material"`; `createTheme({ icons: "eva" }).dark.icons === "eva"`.
- [ ] **Step 2:** `npm test -w @its/solaris-ui -- createTheme`. Expected: the new tests FAIL.
- [ ] **Step 3: Implement.** Typography per variant `{ ...themeConfig.typography[v], ...options.typography?.[v], fontFamily }`. Shape `{ ...themeConfig.shape, ...options.shape }`. Tertiary: when `input.tertiary` exists, derive it through the same `ColorRoles` path as the six colours (extend the keys list, no copy); otherwise keep the hue-shift derivation. Overrides: derive `colors`, then `{ ...colors, ...overrides }`, then build `palette` from that result; extend `assertColors` to `parseToRgb` every provided override.
- [ ] **Step 4:** Re-run. Expected: all `createTheme` tests PASS (the G0 type-scale test is rewritten in Task 3).
- [ ] **Step 5:** `npm run type-check -w @its/solaris-ui`; `npx eslint packages/ui/src/providers`. Expected: clean.

---

### Task 3: Proposta A as the default theme

**Files:**
- Modify: `packages/ui/src/providers/theme.json` (palette inputs, a `colors` block per scheme, typography)
- Modify: `packages/ui/src/__tests__/createTheme.test.ts`, `apps/playground/__tests__/theming.test.tsx` (hex `#1D5B9D` stays primary light; update every assertion that mentions the old secondary green or the G0 scale)
- Modify docs: `packages/ui/CLAUDE.md` (remove "`secondary` is the brand green"; add the icon-set note), `.design-sync/previews/Typography.tsx` and `ThemeProvider.tsx` (comments), `docs/superpowers/specs/2026-10-12-solaris-program-design.md` and `2026-10-12-solaris-mui-api-design.md` Part B "Type scale" (add: "decision of 2026-10-13 supersedes G0's MUI sizes: the type scale is the proposal's, `button` is Sentence case"), `packages/ui/src/components/components.md` §1.2–1.3, `packages/ui/README.md` type-scale bullet

**Interfaces:** Consumes Task 2's options. `theme.json`'s `colors` blocks are merged by `createTheme` like the palette.

- [ ] **Step 1: Tests first** in `createTheme.test.ts`:
  - `"matches Proposta A in docs/design/solaris-themes.json"`: load the `crm` entry with `require("../../../../docs/design/solaris-themes.json")`; for both schemes every role key of the JSON equals `createTheme().<scheme>.colors[key]`.
  - `"gives Proposta A its status colours"`: light `error` `#B00020`, `success` `#2F7A1B`, `warning` `#A94E08`, `info` `#0A6C94`; dark `error` `#F2B8B5`, `success` `#61B340`, `warning` `#FCA600`, `info` `#7CC4E6`; `secondary` `#556579` / `#94A3B8`, `tertiary` `#61B340`.
  - Replace `"carries MUI's own type scale"` with `"carries Proposta A's type scale"`: 13 keys; h4 32/"700"/40; h5 24/"700"/32; h6 22/"500"/28; subtitle1 16/"500"/24; body1 16/"400"/24; body2 14/"400"/20; `button` 14/"500"/20 with `textTransform` `"none"`; caption 12/"400"/16; overline 11/"500"/16 `"uppercase"`.
  - Keep the existing contrast test over the six colours. If a pair on the sheet falls under 4.5:1, keep the sheet's value and list that pair as a commented exception in the test (the designers decide), do not alter the colour.
- [ ] **Step 2:** Run both test files. Expected: FAIL on the new values.
- [ ] **Step 3:** Edit `theme.json`: palette inputs for `primary`, `secondary`, `tertiary`, `error`, `warning`, `info`, `success`, `background`, `text`, `divider` from the Global Constraints; a `colors` block per scheme copying the `crm` JSON roles; typography per the A scale; `shape` unchanged.
- [ ] **Step 4:** Update the docs listed above.
- [ ] **Step 5:** If A's light primary is no longer `#1D5B9D` (it is: expected unchanged), skip; otherwise `npm run icons -w @its/solaris-playground`.
- [ ] **Step 6:** `npm test` (root). Fix tests that asserted a changed value (button label case, secondary colour) by updating the expectation, not the component. Then `npm run docgen -w @its/solaris-playground && npm run variants -w @its/solaris-playground`; `npx eslint --fix packages/ui/src apps/playground .design-sync/previews`; `npm run lint`, `type-check`, `build`, `validate-package -w @its/solaris-ui`. Expected: all pass, second generator run no diff.

---

### Task 4: Proposta B preset (colours, type, shape; icons wired in Task 6)

**Files:**
- Create: `apps/playground/site/themePresets.ts`
- Modify: `apps/playground/app/+html.tsx` (Google Fonts `<link>` for Geist 400/500/600, next to Roboto)
- Test: `apps/playground/__tests__/themePresets.test.ts`

**Interfaces:**
- Produces:
  - `type PresetId = "a" | "b"`
  - `PRESETS: Record<PresetId, { label: string; theme: ThemeSchemes }>`: A = `createTheme()`; B = `createTheme({ ... })` per Global Constraints (palette inputs, `colors` block per scheme copied from the `siti` JSON entry, `shape`, B typography with `-0.02 * fontSize` on h1–h6, `typography.fontFamily` = `Platform.OS === "web" ? "Geist, system-ui, sans-serif" : undefined`)
  - `parsePresetId(raw: unknown): PresetId` (anything other than `"a"`/`"b"` → `"a"`)
- Consumes: `createTheme`, `ThemeSchemes` from `@its/solaris-ui`.

- [ ] **Step 1: Failing tests** (`themePresets.test.ts`):
  - `"B matches the siti entry of solaris-themes.json"`: both schemes, every role key equals `PRESETS.b.theme.<scheme>.colors[key]` (JSON via `require("../../../docs/design/solaris-themes.json")`).
  - `"B has its status colours and radii"`: `info` `#0072F5`, `warning` `#FFB224`, `success` `#45A557`, `error` `#E5484D`; `shape` small 12 / medium 12 / large 24 / extraLarge 24.
  - `"B has its type scale"`: h1 56/"500"/67 with `letterSpacing` ≈ −1.12; h5 20/"600"/28; `button` 14/"500"/20 `textTransform` `"none"`.
  - `"B keeps a grey primary container"`: `primaryContainer` is `#EBEBEB` light / `#1F1F1F` dark (from the JSON).
  - `"parsePresetId falls back to a"`: `"c"`, `undefined`, `42` → `"a"`; `"b"` → `"b"`.
- [ ] **Step 2:** `npm test -w @its/solaris-playground -- themePresets`. Expected: FAIL (module missing).
- [ ] **Step 3:** Implement `themePresets.ts` per Interfaces; add the Geist `<link>`.
- [ ] **Step 4:** Re-run. Expected: PASS.

---

### Task 5: The preset switch on the theming page

**Files:**
- Create: `apps/playground/site/ThemePresetContext.tsx`
- Modify: `apps/playground/app/_layout.tsx` (preset provider outermost; an inner component reads `usePreset()` and renders `<ThemeProvider theme={PRESETS[preset].theme}>`)
- Modify: `apps/playground/app/theming.tsx` (a "Proposta A / Proposta B" row next to light/dark; the `createTheme` example mentions presets)
- Test: `apps/playground/__tests__/theming.test.tsx`

**Interfaces:**
- Produces: `PresetProvider({ children })`, `usePreset(): { preset: PresetId; setPreset: (id: PresetId) => void }`, persisted under the key `"preset"` with `usePersistentState`, read through `parsePresetId`.
- Consumes: Task 4.

- [ ] **Step 1: Failing tests** in `theming.test.tsx` (extract a `renderPage` that wraps the page in `PresetProvider` and a `ThemeProvider` fed by `usePreset()`):
  - `"switches the whole theme between Proposta A and B"`: press `Proposta B` → B's light primary `#171717` appears in the swatches and A's `#1D5B9D` does not; press `Proposta A` → back.
  - `"keeps the preset when the scheme toggles"`: with B, `Switch scheme` shows B's dark primary `#EDEDED`.
  - `"falls back to A for an unknown stored id"`: seed the AsyncStorage jest mock at `solaris.site.preset` with `"c"` → A's primary shown.
- [ ] **Step 2:** `npm test -w @its/solaris-playground -- theming`. Expected: FAIL.
- [ ] **Step 3:** Implement. Add a code comment on the one-frame flash (Review Focus). Use existing components for the two switch buttons.
- [ ] **Step 4:** Re-run, then the whole playground suite. Expected: PASS, catalogue test green.

---

### Task 6: Icon sets (Eva for B) through `Icon`

**Files:**
- Modify: `packages/ui/package.json` (`devDependencies`: `eva-icons@1.1.3`), `package-lock.json` (via `npm install`, committed with it)
- Create: `packages/ui/scripts/generate-eva-icons.mjs`
- Create: `packages/ui/src/components/icons/iconMap.ts`, generated `packages/ui/src/components/icons/evaGlyphs.generated.ts`
- Modify: `packages/ui/src/components/Icon.tsx`; the 36 files that import `MaterialCommunityIcons` directly (list: `grep -rl "vector-icons" packages/ui/src/components`); `packages/ui/README.md` (Icon section, credits: Eva Icons MIT notice), `packages/ui/CLAUDE.md`
- Modify: `.design-sync/previews/Icon.tsx` (a story showing both sets), `apps/playground/catalogue/registry/foundations.ts` only if the Icon page needs a control
- Modify: `apps/playground/site/themePresets.ts` (B gets `icons: "eva"`)
- Test: `packages/ui/src/__tests__/icon-sets.test.tsx`, `apps/playground/__tests__/playground-catalogue.test.tsx` (new `it`)

**Interfaces:**
- Produces:
  - `iconMap.ts`: `MDI_TO_EVA: Record<string, string>` mapping an MDI glyph name to an Eva outline icon name. Covers (a) the 24 glyphs of the sheet (phone, email, calendar, account, group, bell, search, filter, chart, settings, menu, plus, close, check, chevron, edit, delete, download, upload, message, clock, pin, star, home) and (b) every glyph the library draws internally. Glyphs with no Eva drawing are simply absent (decision 2).
  - `evaGlyphs.generated.ts`: `EVA_GLYPHS: Record<string, { tag: "path" | "circle" | "rect"; attrs: Record<string, string> }[]>` keyed by Eva icon name, 24×24 viewBox. Produced by `npm run icons:eva -w @its/solaris-ui` (new script) from `node_modules/eva-icons/outline/svg/*.svg`; the script **fails** on any element other than `path`, `circle`, `rect`. Never hand-edited.
  - `Icon` behaviour: with `children` = glyph name, `theme.icons === "eva"` and `MDI_TO_EVA[name]` present → `react-native-svg` `<Svg width height viewBox="0 0 24 24">` with each primitive filled with the resolved tint; otherwise the MDI glyph. Unmapped under `"eva"`: MDI drawing plus `console.warn("Icon: no Eva glyph for \"<name>\"")` once per name, only when `__DEV__`. Also, in `__DEV__`, warn when a glyph string reaches `source` (G0 backlog).
- Consumes: Task 2's `Theme.icons`.

- [ ] **Step 1: Failing tests** (`icon-sets.test.tsx`, wrap in `ThemeProvider theme={createTheme({ icons: "eva" })}` or default):
  - `"draws MDI under the default theme"`: `<Icon testID="i">close</Icon>` renders the vector-icons glyph (no `Svg`).
  - `"draws Eva under the eva theme"`: same element renders an `Svg` whose child paths equal `EVA_GLYPHS[MDI_TO_EVA.close]`, filled with the resolved tint, sized by `fontSize`.
  - `"falls back to MDI and warns once for an unmapped glyph"`: with a spy on `console.warn`, two `<Icon>not-mapped-glyph</Icon>` renders under eva → MDI drawing both times, one warning.
  - `"maps every sheet glyph"`: each of the 24 sheet names has an entry in `MDI_TO_EVA` and in `EVA_GLYPHS`.
- [ ] **Step 2:** `npm test -w @its/solaris-ui -- icon-sets`. Expected: FAIL.
- [ ] **Step 3:** `npm install -D eva-icons@1.1.3 -w @its/solaris-ui` (commit the lockfile with it). Write `iconMap.ts` for the sheet glyphs first, write and run the generator (`icons:eva` script in `packages/ui/package.json`), implement `Icon` per Interfaces. Run the test; expected PASS.
- [ ] **Step 4: Sweep.** Replace every direct `Icons` (vector-icons) use in the 36 files with `Icon` (`<Icons name={x} size={s} color={c} />` → `<Icon fontSize={s} color={c}>{x}</Icon>`). Use a throwaway script in the scratchpad, report anything it cannot rewrite, review the diff by hand. Remove the now-unused imports. `npm run type-check` and `npm test -w @its/solaris-ui`. Expected: green, no snapshot/behaviour change under the default theme.
- [ ] **Step 5: Exhaustiveness test** in `playground-catalogue.test.tsx`: `it("renders every catalogue demo under Proposta B without an unmapped Eva glyph")`: reuse the file's wrapper but pass `theme={PRESETS.b.theme}` (Task 4 sets `icons: "eva"` here, so set it first), spy `console.warn`, render every entry, and assert no call matched `/no Eva glyph/`. Expected first run: FAIL listing the missing glyph names.
- [ ] **Step 6:** Add each listed glyph to `MDI_TO_EVA` (or leave it out deliberately and allow-list it in the test with a comment), regenerate with `npm run icons:eva -w @its/solaris-ui`, rerun until PASS.
- [ ] **Step 7:** Docs and previews: README Icon section (set per theme, fallback rule, Eva MIT credit), `packages/ui/CLAUDE.md`, an `Icon` preview story with a nested `ThemeProvider theme={createTheme({ icons: "eva" })}`. Then `docgen`, `variants`, `eslint --fix`, `npm run lint`, `type-check`, `build`, `validate-package -w @its/solaris-ui`. Expected: all pass; `lib/` contains `evaGlyphs.generated.js` and `validate-package` is clean.

---

### Task 7: Gates and browser check

- [ ] **Step 1:** `npm run lint && npm run type-check && npm test && npm run build && npm run validate-package -w @its/solaris-ui`. Expected: all pass.
- [ ] **Step 2:** `npm run docgen -w @its/solaris-playground && npm run variants -w @its/solaris-playground` twice; the second run leaves no diff.
- [ ] **Step 3:** Preview (see "How to preview"): `/theming`, `/components/Button`, `/components/Typography`, `/components/Icon`, `/components/NavigationBar`, `/components/Select`, in light and dark, under A and under B. Check: Sentence-case buttons; bold Roboto headings and MDI icons in A; Geist, square-ish black/white controls and thin-line Eva icons in B; no green selection states in either; text readable on every surface.
- [ ] **Step 4:** Report the Button height (expected ≈52 dp with the 20 px line height; G2 pins MUI's 31/37/42).

---

## How to preview

From the repo root (after `npm ci --ignore-scripts`):

- **Web, live reload:** `npm run web` (Expo dev server, usually http://localhost:8081; if the port is taken by another Expo server, answer `y` to use another or pass `--port 8085`). Open `/theming` for the theme, `/components/<Name>` for a component with its live demo, props panel and 360 / 720 / Full device selector. Routes are case-sensitive (`/components/Button`).
- **Switching theme:** light/dark with the **Switch scheme** button (or `t`). **Proposta A / B** appears after Task 5; until then only A exists.
- **Phone or emulator:** `npm run ios` / `npm run android`, or `npm start` and scan the QR code with Expo Go. Geist does not load on native (system font), Eva icons do (SVG).
- **Static site, as published:** `npm run export:web -w @its/solaris-playground`, then serve `apps/playground/dist` with any static server on a free port (e.g. `npx serve apps/playground/dist -l 8090`). The same React #418 hydration warning appears in the console as before; it is not caused by this work.
- **Design-sync previews:** `.design-sync/previews/*.tsx` feed the galleries on each component page; after editing one, run `npm run variants -w @its/solaris-playground`.

## Roadmap after the theme (one plan per group, written just before it runs)

Source: `2026-10-12-solaris-mui-api-design.md` Part C. "Done" is Part D (library, tests, registry/demos, previews, design-sync, generators, all gates, browser check in light and dark, **under both presets** from now on).

| Group | Scope | Carry-over |
|---|---|---|
| G1 Layout & surfaces | Box, Stack, HStack, VStack, Center, Spacer, Grid, AspectRatio, Divider, Paper, Card parts, Image, Skeleton, ButtonBase; spacing ×8, `borderRadius` ×4, fractional width | `theme.breakpoints` (xs 0 … xl 1536), 12-column grid and B's container widths from the Griglie sheet; fix `ThemeShapeTokens.borderRadius` doc and `RadiusValue` accepting `"borderRadius"`; spacing cleanups (`spacing(8)`, `spacing(1.5)`) |
| G2 Actions | Button (`variant`/`color`/`size`, `onClick`), IconButton, Fab, AnimatedFAB, SpeedDial, SegmentedButtons, SplitButton, ProgressButton, ToggleButton(Group), Chip(Group), Link | Pin Button heights 31/37/42; glyph-name props → `<Icon>` elements (the sweep in Task 6 already made `Icon` the only renderer) |
| G3 Inputs | TextField, Select, Autocomplete, SearchBar, PinInput, NumberField, Checkbox, Radio(Group), Switch, Slider, Rating, FormControl, FormHelperText | `error` boolean + `helperText` |
| G4 Dates | DateCalendar, TimeClock, ClockDial, DateField, Date/Time/DateTime/DateRange pickers | five components replace one `mode` switch |
| G5 Navigation | AppBar, NavigationHeader, Toolbar, BottomNavigation, NavigationRail, Drawer, Tabs, TabPanel, Breadcrumbs, Pagination, Stepper | Tab label style always `button` |
| G6 Overlays & feedback | Dialog, ConfirmDialog, Menu, Popover, Tooltip, BottomSheet, SideSheet, Alert + `showAlert`, Snackbar, Toast, progress | `Banner`→`Alert` name clash |
| G7 Display | Avatar, Badge, Stat, StatusBadge, EmptyState, List(Item), Table, DataGrid, Accordion, Collapse, Carousel | |
| G8 Release | docs URLs, `0.1.0`: drop `private`, changeset, restore smoke test, migrate `examples/consumer` | Owner must enable the `@its` npm scope for `@its/solaris-ui` |

Then sub-project 3 (DBE-CRM components: 3a extensions + CaptionValue/gradient button/tint, 3b mobile pieces, 3c charts), where the mockups' stat cards, icon tiles, status chips and initials avatars belong, and the Montserrat alternative if the designers want it.

## Self-review

- Spec coverage: HANDOFF design (engine, A default, B preset, theming switch) → Tasks 2–5; icons per theme (Alice, 2026-10-13) → Task 6; "things the change will touch" (type-scale docs, secondary note, theming test, `+html.tsx`, generated files, previews, Button heights) → Tasks 3–7; sheet pages Colori/Tipografia/Icone/Griglie → Global Constraints, with Griglie's grid/breakpoints explicitly deferred to G1.
- Values: colours come from `solaris-themes.json` (drift tests in Tasks 3 and 4) and the PDF (status colours); inferred type rows are marked.
- Names consistent across tasks: `IconSetName`, `Theme.icons`, `ThemeOptions.icons/typography/shape`, `PaletteOptions.tertiary`, `colorSchemes[mode].colors`, `MDI_TO_EVA`, `EVA_GLYPHS`, `PRESETS`, `PresetId`, `parsePresetId`, `usePreset`, `PresetProvider`.
