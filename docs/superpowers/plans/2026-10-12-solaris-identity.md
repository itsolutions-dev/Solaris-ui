# Solaris Identity (rename + theme) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Glowup fork into Solaris. Nothing is named Glowup any more, the library renders the organization's corrected theme through an MUI-shaped `createTheme()`, and the docs site shows that theme on a theming page with a live component gallery.

**Architecture:**
- **Rename first.** A mechanical rename runs across every tracked text file, then the generated files are regenerated.
- **Then the theme.** A new `providers/createTheme.ts` deep-merges MUI-style `colorSchemes` input over the defaults in `theme.json`. It derives the Material 3 roles (`theme.colors`), which components already paint with, and MUI's read shape (`theme.palette`). `ThemeProvider` renders the scheme the OS or `toggleTheme()` asks for.
- **Removed:** the 20 Glowup palettes and their picker.

**Tech Stack:**
- Expo 57 / React Native 0.86 / react-native-web
- TypeScript 6, polished (already a dependency), jest-expo + @testing-library/react-native 14
- npm workspaces

**Spec:** `docs/superpowers/specs/2026-10-12-solaris-identity-design.md`, within the program `docs/superpowers/specs/2026-10-12-solaris-program-design.md`.

## Global Constraints

- **Do NOT commit, stage or push anything.** This is the user's instruction for this whole plan. Each task ends at a checkpoint (`git status --short`), not at a commit.
- Names: library `@its/solaris-ui`, playground `@its/solaris-playground`, root `solaris-monorepo`, consumer `solaris-consumer-smoke`, repo `itsolutions-dev/Solaris-ui`, site `https://itsolutions-dev.github.io/Solaris-ui/`, env var `SOLARIS_BASE_URL`, Expo name `Solaris` / slug `solaris-playground` / scheme `solaris`, design-sync `globalName` `SolarisUI`.
- `packages/ui/package.json` must have `"private": true` and `"version": "0.0.0"` until sub-project 2. Nothing may be published.
- `consumer-smoke.yml` keeps only the `workflow_dispatch` trigger.
- Every `main` colour is used exactly as given, normalised to uppercase `#RRGGBB` (any CSS colour polished can parse; anything else throws).
- `onX` = `contrastText` if given, else `#000000` or `#FFFFFF`, whichever contrasts more with `main` (always ≥ 4.58:1).
- Containers: tonal palette of `main`'s hue at chroma 48. Light uses tones 90 / 10, dark uses tones 30 / 90.
- Default theme:
  - light: primary `#1D5B9D`, secondary `#61B340`, error `#D32F2F`, warning `#ED6C02`, info `#0288D1`, success `#2E7D32`, background `#F0F2F5` / paper `#FFFFFF`, text.secondary `#64748B`, divider `rgba(0, 0, 0, 0.12)`
  - dark: primary `#5893D4`, secondary `#61B340`, error `#F44336`, warning `#FFA726`, info `#29B6F6`, success `#66BB6A`, background `#111111` / paper `#171717`, divider `rgba(255, 255, 255, 0.12)`
- Font default: Android `"Roboto"`, web `"Roboto, system-ui, sans-serif"`, iOS `"System"`.
- Shape: `extraLarge` 24 (was 28), new `full` 9999, Button → `full`, Card → `large`.
- Selection and tonal states use primary roles, never `secondary*`.
- Generated files (`apps/playground/docgen/props.generated.json`, `apps/playground/catalogue/variants/generated/*`) are only ever rewritten by `npm run docgen -w @its/solaris-playground` / `npm run variants -w @its/solaris-playground`.
- Line endings LF (enforced by `.gitattributes`). Prettier: `trailingComma: "all"`.

## Review Focus

1. **Non-hex `main`.** An app passes `#06c`, `red` or `rgb(…)`; it should get the same colour normalised to `#RRGGBB`. A typo like `"blu"` should throw at `createTheme` time, not paint `NaN`. Tested in Task 3.
2. **Partial overrides.** An app overrides only `colorSchemes.light.palette.primary`; every other light key and the whole dark scheme should keep the organization's defaults. Tested in Task 3.
3. **Explicit `contrastText`.** An app passes one, even a low-contrast one; it should win over the computed black/white. Tested in Task 3.
4. **MUI-style rgba text colours.** An app passes `text.primary: "rgba(0, 0, 0, 0.87)"` (MUI's own default); `palette.text.disabled` should still be a valid colour (`rgba(0,0,0,0.38)`). Tested in Task 3.
5. **Scheme switch on the theming page.** A reader switches light/dark; the swatches and the gallery should re-render from the other scheme with no stale light values left. Tested in Task 5.

---

### Task 1: Rename everything to Solaris

**Files:**
- Modify: every tracked text file containing `glowup` (case-insensitive) except `package-lock.json` and `docs/superpowers/**`. About 258 files, including `package.json`, `packages/ui/package.json`, `apps/playground/package.json`, `examples/consumer/package.json`, `apps/playground/app.config.ts`, `apps/playground/tsconfig.json`, `eslint.config.js`, `.changeset/config.json`, `.design-sync/**`, `.github/workflows/*.yml`, `apps/playground/**`, `README.md`, `SECURITY.md`, `CLAUDE.md` files.
- Modify: `packages/ui/package.json` (`private`, `version`), `.design-sync/config.json` (drop `projectId`), `.design-sync/NOTES.md` (upload status), `.github/workflows/consumer-smoke.yml` (triggers)
- Delete: `docs/library-split-plan.md`, `docs/nativebase-comparison.md`, `docs/npm-publishing-plan.md`, `packages/ui/CHANGELOG.md`
- Regenerate: `package-lock.json`, `apps/playground/docgen/props.generated.json`, `apps/playground/catalogue/variants/generated/*`

**Interfaces:**
- Produces: the package name `@its/solaris-ui`, which every later task imports from, and the workspace name `@its/solaris-playground` used in `npm run … -w`.

- [ ] **Step 1: Delete the Glowup history files**

```bash
cd /c/dev/Solaris-ui
rm docs/library-split-plan.md docs/nativebase-comparison.md docs/npm-publishing-plan.md packages/ui/CHANGELOG.md
```

- [ ] **Step 2: Run the mechanical rename**

The specific patterns go first, so URLs land on the repository's real name (`Solaris-ui`), not `Solaris`.

```bash
cd /c/dev/Solaris-ui
git ls-files -z \
  | grep -zv -e '^package-lock\.json$' -e '^docs/superpowers/' \
  | xargs -0 grep -lIi glowup 2>/dev/null \
  | while IFS= read -r f; do
      sed -i \
        -e 's#itsolutions-dev/Glowup\b#itsolutions-dev/Solaris-ui#g' \
        -e 's#github\.io/Glowup#github.io/Solaris-ui#g' \
        -e 's#GlowupUI#SolarisUI#g' \
        -e 's#GLOWUP#SOLARIS#g' \
        -e 's#Glowup#Solaris#g' \
        -e 's#glowup#solaris#g' \
        "$f"
    done
```

- [ ] **Step 3: Verify nothing is left**

Tracked and new files only. Ignored build output (`packages/ui/lib`, `.expo`, `dist`) still says Glowup until it is rebuilt:

```bash
git ls-files -z --cached --others --exclude-standard \
  | grep -zv -e '^package-lock\.json$' -e '^docs/superpowers/' \
  | xargs -0 grep -lIi glowup 2>/dev/null
```

Expected: no output.

- [ ] **Step 4: Lock the package against publishing**

In `packages/ui/package.json`, replace the opening of the manifest:

```json
{
  "name": "@its/solaris-ui",
  "version": "0.9.0",
```

with:

```json
{
  "name": "@its/solaris-ui",
  "private": true,
  "version": "0.0.0",
```

`changeset publish` skips private packages, so `release.yml` cannot publish until sub-project 2 removes `private`.

- [ ] **Step 5: Detach design-sync from Glowup's Claude Design project**

```bash
cd /c/dev/Solaris-ui
sed -i '/"projectId"/d' .design-sync/config.json
node -e 'JSON.parse(require("fs").readFileSync(".design-sync/config.json","utf8")); console.log("config.json ok")'
```

Expected: `config.json ok`

In `.design-sync/NOTES.md`, replace these three lines (around line 364):

```markdown
Uploaded. Project: **Solaris Design System**, `projectId`
`c02682fc-2db9-465f-b4c0-1d7581b437ec` (pinned in `config.json`) —
https://claude.ai/design/p/c02682fc-2db9-465f-b4c0-1d7581b437ec
```

with:

```markdown
Not uploaded. That id belonged to Glowup's Claude Design project, so `config.json` carries
no `projectId`: the next `/design-sync` creates a new project for Solaris. Pin its id in
`config.json` afterwards.
```

- [ ] **Step 6: Stop the consumer smoke test running on a schedule**

In `.github/workflows/consumer-smoke.yml`, replace:

```yaml
on:
  workflow_dispatch:
  schedule:
    - cron: "0 6 * * 1"
  workflow_run:
    workflows: [Release]
    types: [completed]
    branches: [master]
```

with:

```yaml
# Manual only until @its/solaris-ui is first published (sub-project 2 of the
# program, docs/superpowers/specs/2026-10-12-solaris-program-design.md). Until
# then the package does not exist on the registry and every run would fail.
# Restore the weekly `schedule` and the `workflow_run` on Release with it.
on:
  workflow_dispatch:
```

- [ ] **Step 7: Relink the workspaces and regenerate the lockfile**

Run: `npm install`
Expected: exits 0. `ls node_modules/@its` lists `solaris-playground` and `solaris-ui` (symlinks), and no `glowup-*`. `grep -c glowup package-lock.json` prints `0`.

- [ ] **Step 8: Regenerate the generated files**

```bash
npm run docgen -w @its/solaris-playground
npm run variants -w @its/solaris-playground
```

Expected: both exit 0.

- [ ] **Step 9: Run the gates**

```bash
npm run lint && npm run type-check && npm test && npm run build && npm run validate-package -w @its/solaris-ui
```

Expected: all pass. `validate-package` may warn that the package is private; that is fine, but it must not error.

- [ ] **Step 10: Checkpoint (no commit)**

Run: `git status --short | wc -l`
Expected: a few hundred modified files, plus the 4 deletions. Do not stage or commit.

---

### Task 2: Rewrite the prose that describes the product

The rename produced sentences like "Solaris is a Material You library". This task makes the descriptions true for Solaris.

**Files:**
- Modify: `README.md` (intro, the `apps/mobile` note, the CHANGELOG bullet)
- Modify: `packages/ui/README.md` (intro and status line)
- Modify: `packages/ui/package.json` (`description`)
- Modify: `apps/playground/app/index.tsx` (eyebrow and description)
- Modify: `CLAUDE.md` (workspace table row)

**Interfaces:** none (copy only).

- [ ] **Step 1: Root README intro**

In `README.md`, replace everything from `# Solaris` down to (but not including) the line `The repo is an **npm-workspaces monorepo** with two workspaces:` with:

```markdown
# Solaris

**Solaris** is IT Solutions' component library for **React Native + Web**: Material-based
components carrying the organization's theme, built with Expo, plus a presentation app that
showcases and exercises every component.

**→ [Live documentation and component gallery](https://itsolutions-dev.github.io/Solaris-ui/)** —
every component on its own page, with a live demo, its variants and a generated API reference.

```

Then delete this blockquote:

```markdown
> The playground was previously called `apps/mobile`. It was renamed because it is **not
> mobile-only** — it runs on web too — and its job is to exercise the library, not to be a
> shippable mobile product.
```

And delete this bullet (the file no longer exists; changesets recreates it at the first release):

```markdown
- [`packages/ui/CHANGELOG.md`](packages/ui/CHANGELOG.md) — release notes
```

- [ ] **Step 2: Library README intro**

In `packages/ui/README.md`, replace the title, the intro paragraph and the status blockquote (everything before `## Installation`) with:

```markdown
# @its/solaris-ui

IT Solutions' component library for **React Native + Web** (Expo): Material-based,
theme-reactive components — layout primitives, buttons, inputs, navigation, dialogs, data
grids, progress indicators and a locale-aware date/time picker family — styled by the
organization's theme, with light/dark support.

> Status: pre-`1.0.0` and not yet published. The API changes before the first release.

```

- [ ] **Step 3: Package description**

In `packages/ui/package.json`, set:

```json
  "description": "IT Solutions' Material-based component library for React Native + Web (Expo)",
```

- [ ] **Step 4: Home page copy**

In `apps/playground/app/index.tsx`, replace:

```tsx
      eyebrow="Material You · React Native · Web"
      title="Solaris"
      description="A Material Design 3 component library for Expo apps that ship to iOS, Android and the browser from one codebase — and the live reference for every component in it."
```

with:

```tsx
      eyebrow="Material · React Native · Web"
      title="Solaris"
      description="IT Solutions' component library for Expo apps that ship to iOS, Android and the browser from one codebase — and the live reference for every component in it."
```

- [ ] **Step 5: Root CLAUDE.md workspace table**

In `CLAUDE.md`, replace the cell text `The product: a publishable Material You (MD3) component library.` with `The product: IT Solutions' publishable Material-based component library.` Then re-pad that table by hand so its `|` separators line up again. Do not run Prettier on the Markdown files: it would reflow unrelated paragraphs.

- [ ] **Step 6: Verify**

Run: `npm run lint && npm run type-check -w @its/solaris-playground`
Expected: pass.

- [ ] **Step 7: Checkpoint (no commit)**

Run: `git status --short README.md packages/ui/README.md packages/ui/package.json apps/playground/app/index.tsx CLAUDE.md`
Expected: all five listed as modified. Do not commit.

---

### Task 3: `createTheme` and the organization's default theme

**Files:**
- Create: `packages/ui/src/providers/createTheme.ts`
- Create: `packages/ui/src/__tests__/createTheme.test.ts`
- Modify: `packages/ui/src/providers/theme.json` (replace `colors` with `colorSchemes`, drop `fontFamily`, shape)
- Modify: `packages/ui/src/providers/ThemeProvider.tsx` (types, guard, provider)
- Modify: `packages/ui/src/index.ts:6` (export `createTheme` instead of `palettes`)
- Modify: `packages/ui/src/components/Button.tsx:20,48-69` (roles from the theme)
- Modify: `packages/ui/src/components/StatusBadge.tsx:5,20-37` (roles from the theme)
- Delete: `packages/ui/src/providers/palettes.ts`, `packages/ui/src/providers/successRoles.ts`, `packages/ui/src/__tests__/palettes.test.ts`
- Modify: `packages/ui/CLAUDE.md` (Theme system and Providers sections), `packages/ui/README.md` (Theme sections)

**Interfaces:**
- Produces (public, from `@its/solaris-ui`):
  - `createTheme(options?: ThemeOptions): ThemeSchemes`
  - `interface ThemeSchemes { light: Theme; dark: Theme }`
  - `interface ThemeOptions { colorSchemes?: { light?: { palette?: PaletteOptions }; dark?: { palette?: PaletteOptions } }; typography?: { fontFamily?: string } }`
  - `interface PaletteOptions { primary?, secondary?, error?, warning?, info?, success?: PaletteColorOptions; background?: { default?: string; paper?: string }; text?: { primary?: string; secondary?: string }; divider?: string }`
  - `interface PaletteColorOptions { main: string; contrastText?: string }`
  - `Theme` gains `palette: Palette`. `interface Palette { mode: "light" | "dark"; primary, secondary, error, warning, info, success: PaletteColor; background: { default: string; paper: string }; text: { primary: string; secondary: string; disabled: string }; divider: string }`, where `interface PaletteColor { main: string; light: string; dark: string; contrastText: string }`.
  - `ThemeColorTokens` gains `info`, `onInfo`, `infoContainer`, `onInfoContainer`, `success`, `onSuccess`, `successContainer`, `onSuccessContainer`, `warning`, `onWarning`, `warningContainer`, `onWarningContainer`.
  - `ThemeShapeTokens` gains `full: number`.
  - `<ThemeProvider theme?: ThemeSchemes>`. `useTheme()` returns `{ theme: Theme; toggleTheme: () => void }`.
- Removed: `palettes`, `createPalette`, `ThemePalette`, `PaletteId`, `MaterialPaletteId`, `PaletteChroma`, `BASELINE_SEED`, `initialPalette`, `palette` / `setPalette` on `useTheme()`, `getSuccessRoles`, `getWarningRoles`.

- [ ] **Step 1: Write the failing test**

Create `packages/ui/src/__tests__/createTheme.test.ts`:

```ts
import { getContrast } from "polished";

import { createTheme, type ThemeColorTokens } from "../index";

const theme = createTheme();
const SCHEMES = ["light", "dark"] as const;
const COLORS = [
  "primary",
  "secondary",
  "error",
  "warning",
  "info",
  "success",
] as const;

const capitalize = (name: string) => name[0].toUpperCase() + name.slice(1);
const role = (colors: ThemeColorTokens, name: string) =>
  (colors as unknown as Record<string, string>)[name];

describe("createTheme", () => {
  it("uses the organization's primaries exactly", () => {
    expect(theme.light.colors.primary).toBe("#1D5B9D");
    expect(theme.dark.colors.primary).toBe("#5893D4");
    expect(theme.light.palette.primary.main).toBe("#1D5B9D");
    expect(theme.light.colors.secondary).toBe("#61B340");
  });

  it("keeps every colour and its container legible in both schemes", () => {
    SCHEMES.forEach((scheme) => {
      const colors = theme[scheme].colors;
      COLORS.forEach((name) => {
        [
          [name, `on${capitalize(name)}`],
          [`${name}Container`, `on${capitalize(name)}Container`],
        ].forEach(([bg, fg]) => {
          const ratio = getContrast(role(colors, bg), role(colors, fg));
          // A labelled tuple, so a failure names the scheme and the role.
          expect([scheme, bg, ratio >= 4.5]).toEqual([scheme, bg, true]);
        });
      });
    });
  });

  it("puts dark text on the brand green and white text on the brand blue", () => {
    expect(theme.light.colors.onSecondary).toBe("#000000");
    expect(theme.light.colors.onPrimary).toBe("#FFFFFF");
    expect(theme.dark.colors.onPrimary).toBe("#000000");
  });

  it("keeps every default it was not asked to change", () => {
    const custom = createTheme({
      colorSchemes: { light: { palette: { primary: { main: "#B00020" } } } },
    });
    expect(custom.light.colors.primary).toBe("#B00020");
    expect(custom.light.colors.secondary).toBe("#61B340");
    expect(custom.light.colors.background).toBe("#F0F2F5");
    expect(custom.light.colors.onSurfaceVariant).toBe("#64748B");
    expect(custom.dark.colors.primary).toBe("#5893D4");
  });

  it("honours an explicit contrastText, even a poor one", () => {
    const custom = createTheme({
      colorSchemes: {
        light: { palette: { primary: { main: "#1D5B9D", contrastText: "#99CCFF" } } },
      },
    });
    expect(custom.light.colors.onPrimary).toBe("#99CCFF");
    expect(custom.light.palette.primary.contrastText).toBe("#99CCFF");
  });

  it("derives light and dark the way MUI does", () => {
    // lighten(0.2) / darken(0.3), channels truncated, as @mui/system does.
    expect(theme.light.palette.primary.light).toBe("#4A7BB0");
    expect(theme.light.palette.primary.dark).toBe("#143F6D");
  });

  it("normalises any CSS colour and rejects garbage", () => {
    const short = createTheme({
      colorSchemes: { light: { palette: { primary: { main: "#06c" } } } },
    });
    expect(short.light.colors.primary).toBe("#0066CC");
    expect(short.light.colors.primaryContainer).toMatch(/^#[0-9A-F]{6}$/);
    const named = createTheme({
      colorSchemes: { light: { palette: { error: { main: "red" } } } },
    });
    expect(named.light.colors.error).toBe("#FF0000");
    expect(() =>
      createTheme({
        colorSchemes: { light: { palette: { primary: { main: "blu" } } } },
      }),
    ).toThrow();
  });

  it("maps the MUI read shape onto the roles", () => {
    const { palette, colors } = theme.light;
    expect(palette.mode).toBe("light");
    expect(theme.dark.palette.mode).toBe("dark");
    expect(palette.background).toEqual({ default: "#F0F2F5", paper: "#FFFFFF" });
    expect(colors.surface).toBe("#FFFFFF");
    expect(palette.text.secondary).toBe("#64748B");
    expect(palette.divider).toBe("rgba(0, 0, 0, 0.12)");
    expect(colors.outlineVariant).toBe("rgba(0, 0, 0, 0.12)");
    expect(palette.warning.main).toBe("#ED6C02");
    expect(colors.warningContainer).toMatch(/^#[0-9A-F]{6}$/);
  });

  it("accepts MUI's rgba text colours", () => {
    const custom = createTheme({
      colorSchemes: {
        light: { palette: { text: { primary: "rgba(0, 0, 0, 0.87)" } } },
      },
    });
    expect(custom.light.colors.onSurface).toBe("rgba(0, 0, 0, 0.87)");
    expect(custom.light.palette.text.disabled).toBe("rgba(0,0,0,0.38)");
  });

  it("puts one font family on every type step", () => {
    const custom = createTheme({ typography: { fontFamily: "Roboto" } });
    Object.values(custom.light.typography).forEach((style) =>
      expect(style.fontFamily).toBe("Roboto"),
    );
    const families = new Set(
      Object.values(theme.light.typography).map((style) => style.fontFamily),
    );
    expect(families.size).toBe(1);
  });

  it("rounds dialogs and sheets at 24 and buttons fully", () => {
    expect(theme.light.shape.extraLarge).toBe(24);
    expect(theme.light.shape.full).toBe(9999);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -w @its/solaris-ui -- createTheme`
Expected: FAIL, because `createTheme` is not exported from `../index`.

- [ ] **Step 3: Replace the colours in `theme.json`**

Run this from the repo root. It rewrites `colors` as the organization's input, drops the per-step `fontFamily` (`createTheme` sets it), and updates `shape`:

```bash
node -e '
const fs = require("fs");
const path = "packages/ui/src/providers/theme.json";
const t = JSON.parse(fs.readFileSync(path, "utf8"));
const colorSchemes = {
  light: { palette: {
    primary: { main: "#1D5B9D" }, secondary: { main: "#61B340" },
    error: { main: "#D32F2F" }, warning: { main: "#ED6C02" },
    info: { main: "#0288D1" }, success: { main: "#2E7D32" },
    background: { default: "#F0F2F5", paper: "#FFFFFF" },
    text: { secondary: "#64748B" },
    divider: "rgba(0, 0, 0, 0.12)",
  } },
  dark: { palette: {
    primary: { main: "#5893D4" }, secondary: { main: "#61B340" },
    error: { main: "#F44336" }, warning: { main: "#FFA726" },
    info: { main: "#29B6F6" }, success: { main: "#66BB6A" },
    background: { default: "#111111", paper: "#171717" },
    divider: "rgba(255, 255, 255, 0.12)",
  } },
};
for (const step of Object.values(t.typography)) delete step.fontFamily;
const shape = { ...t.shape, extraLarge: 24, full: 9999 };
fs.writeFileSync(path, JSON.stringify({ colorSchemes, typography: t.typography, spacing: t.spacing, shape }, null, 4) + "\n");
'
```

Expected: `packages/ui/src/providers/theme.json` starts with `"colorSchemes"`, has no `"colors"` key and no `"fontFamily"`, and its `shape` reads `small 8, medium 12, large 16, extraLarge 24, full 9999`.

- [ ] **Step 4: Create `packages/ui/src/providers/createTheme.ts`**

```ts
import { Platform } from "react-native";
import { parseToRgb, readableColor, rgba } from "polished";

import themeConfig from "./theme.json";
import { hexToLch, tone } from "./tonal";
import type {
  Palette,
  PaletteColor,
  Theme,
  ThemeColorTokens,
} from "./ThemeProvider";

/** One colour as an app passes it: MUI's `PaletteColorOptions`, minus `light`/`dark`. */
export interface PaletteColorOptions {
  main: string;
  /** Text and icons on `main`. Omitted: black or white, whichever contrasts more. */
  contrastText?: string;
}

/** The part of MUI's `PaletteOptions` Solaris reads. */
export interface PaletteOptions {
  primary?: PaletteColorOptions;
  secondary?: PaletteColorOptions;
  error?: PaletteColorOptions;
  warning?: PaletteColorOptions;
  info?: PaletteColorOptions;
  success?: PaletteColorOptions;
  background?: { default?: string; paper?: string };
  text?: { primary?: string; secondary?: string };
  divider?: string;
}

/** MUI v6's `colorSchemes` shape, plus the one typography setting the theme carries. */
export interface ThemeOptions {
  colorSchemes?: {
    light?: { palette?: PaletteOptions };
    dark?: { palette?: PaletteOptions };
  };
  typography?: { fontFamily?: string };
}

/** Both schemes of a theme. `ThemeProvider` renders the one the OS, or `toggleTheme()`, asks for. */
export interface ThemeSchemes {
  light: Theme;
  dark: Theme;
}

const COLOR_KEYS = [
  "primary",
  "secondary",
  "error",
  "warning",
  "info",
  "success",
] as const;
type ColorKey = (typeof COLOR_KEYS)[number];

/** A palette after merging over `theme.json`, which supplies every required key. */
type ResolvedPalette = Record<ColorKey, PaletteColorOptions> & {
  background: { default: string; paper: string };
  text?: { primary?: string; secondary?: string };
  divider?: string;
};

interface ColorRoles {
  main: string;
  on: string;
  container: string;
  onContainer: string;
}

const BOX_SHADOW =
  "0px 1px 3px rgba(0,0,0,0.2), 0px 1px 2px rgba(0,0,0,0.14), 0px 1px 1px rgba(0,0,0,0.12)";

/** Chroma of every given colour's tonal palette: TonalSpot's primary value. */
const CHROMA = 48;
const NEUTRAL_CHROMA = 4;
const NEUTRAL_VARIANT_CHROMA = 7;
const TERTIARY_CHROMA = 20;
const TERTIARY_HUE_SHIFT = 60;

/**
 * React Native has no font fallback, and iOS raises an error for a family the
 * app has not registered. So Roboto is the default only where it is known to
 * exist: Android's system font, and the web, which takes a stack. An iOS app
 * that embeds Roboto opts in with `createTheme({ typography: { fontFamily: "Roboto" } })`.
 */
const DEFAULT_FONT_FAMILY = Platform.select({
  android: "Roboto",
  web: "Roboto, system-ui, sans-serif",
  default: "System",
});

/** Any CSS colour polished can parse, as `#RRGGBB`. Throws on anything else. */
const toHex = (color: string): string => {
  const { red, green, blue } = parseToRgb(color);
  return `#${[red, green, blue]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
};

const channels = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const fromChannels = (values: number[]) =>
  `#${values
    .map((c) => Math.trunc(c).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
/** MUI's `lighten(main, 0.2)`: each channel a fifth of the way to white, truncated as MUI does. */
const muiLight = (hex: string) =>
  fromChannels(channels(hex).map((c) => c + (255 - c) * 0.2));
/** MUI's `darken(main, 0.3)`. */
const muiDark = (hex: string) =>
  fromChannels(channels(hex).map((c) => c * 0.7));

/** Two levels deep, which is all a palette has. */
const mergePalette = (
  base: PaletteOptions,
  over: PaletteOptions = {},
): PaletteOptions => {
  const out: Record<string, unknown> = { ...base };
  (Object.keys(over) as (keyof PaletteOptions)[]).forEach((key) => {
    const b = base[key];
    const o = over[key];
    out[key] =
      typeof b === "object" && typeof o === "object" ? { ...b, ...o } : (o ?? b);
  });
  return out as PaletteOptions;
};

const deriveScheme = (
  p: ResolvedPalette,
  isDark: boolean,
): Pick<Theme, "colors" | "palette"> => {
  const containerTone = isDark ? 30 : 90;
  const onContainerTone = isDark ? 90 : 10;
  const primaryHue = hexToLch(toHex(p.primary.main)).h;
  const n = (t: number) => tone(primaryHue, NEUTRAL_CHROMA, t);
  const nv = (t: number) => tone(primaryHue, NEUTRAL_VARIANT_CHROMA, t);
  const t3 = (t: number) =>
    tone((primaryHue + TERTIARY_HUE_SHIFT) % 360, TERTIARY_CHROMA, t);

  const roles = {} as Record<ColorKey, ColorRoles>;
  COLOR_KEYS.forEach((key) => {
    const main = toHex(p[key].main);
    const hue = hexToLch(main).h;
    roles[key] = {
      main,
      on:
        p[key].contrastText ??
        readableColor(main, "#000000", "#FFFFFF", false),
      container: tone(hue, CHROMA, containerTone),
      onContainer: tone(hue, CHROMA, onContainerTone),
    };
  });
  const { primary, secondary, error, warning, info, success } = roles;

  const onSurface = p.text?.primary ?? n(isDark ? 90 : 10);
  const onSurfaceVariant = p.text?.secondary ?? nv(isDark ? 80 : 30);
  const outlineVariant = p.divider ?? nv(isDark ? 30 : 80);

  const colors: ThemeColorTokens = {
    primary: primary.main,
    onPrimary: primary.on,
    primaryContainer: primary.container,
    onPrimaryContainer: primary.onContainer,
    inversePrimary: tone(primaryHue, CHROMA, isDark ? 40 : 80),
    secondary: secondary.main,
    onSecondary: secondary.on,
    secondaryContainer: secondary.container,
    onSecondaryContainer: secondary.onContainer,
    tertiary: t3(isDark ? 80 : 40),
    onTertiary: t3(isDark ? 20 : 100),
    tertiaryContainer: t3(containerTone),
    onTertiaryContainer: t3(onContainerTone),
    error: error.main,
    onError: error.on,
    errorContainer: error.container,
    onErrorContainer: error.onContainer,
    warning: warning.main,
    onWarning: warning.on,
    warningContainer: warning.container,
    onWarningContainer: warning.onContainer,
    info: info.main,
    onInfo: info.on,
    infoContainer: info.container,
    onInfoContainer: info.onContainer,
    success: success.main,
    onSuccess: success.on,
    successContainer: success.container,
    onSuccessContainer: success.onContainer,
    background: p.background.default,
    onBackground: onSurface,
    surface: p.background.paper,
    onSurface,
    surfaceVariant: nv(isDark ? 30 : 90),
    onSurfaceVariant,
    surfaceContainerLow: n(isDark ? 10 : 96),
    surfaceContainer: n(isDark ? 12 : 94),
    surfaceContainerHigh: n(isDark ? 17 : 92),
    surfaceContainerHighest: n(isDark ? 22 : 90),
    surfaceDim: n(isDark ? 5 : 87),
    inverseSurface: n(isDark ? 90 : 20),
    inverseOnSurface: n(isDark ? 20 : 95),
    surfaceTint: primary.main,
    outline: nv(isDark ? 60 : 50),
    outlineVariant,
    scrim: "#000000",
    shadow: "#000000",
    boxShadow: BOX_SHADOW,
  };

  const paletteColor = (key: ColorKey): PaletteColor => ({
    main: roles[key].main,
    light: muiLight(roles[key].main),
    dark: muiDark(roles[key].main),
    contrastText: roles[key].on,
  });

  const palette: Palette = {
    mode: isDark ? "dark" : "light",
    primary: paletteColor("primary"),
    secondary: paletteColor("secondary"),
    error: paletteColor("error"),
    warning: paletteColor("warning"),
    info: paletteColor("info"),
    success: paletteColor("success"),
    background: { default: p.background.default, paper: p.background.paper },
    text: {
      primary: onSurface,
      secondary: onSurfaceVariant,
      disabled: rgba(onSurface, 0.38),
    },
    divider: outlineVariant,
  };

  return { colors, palette };
};

/**
 * The theme an app renders: MUI's `colorSchemes` in, both schemes out. Pass
 * only what differs. Everything else stays the organization's theme
 * (`theme.json`). Call it once, at module scope: every component memoises
 * its styles on the theme object.
 *
 * ```ts
 * const theme = createTheme({
 *   colorSchemes: { light: { palette: { primary: { main: "#00639B" } } } },
 * });
 * <ThemeProvider theme={theme}>…</ThemeProvider>
 * ```
 */
export const createTheme = (options: ThemeOptions = {}): ThemeSchemes => {
  const fontFamily = options.typography?.fontFamily ?? DEFAULT_FONT_FAMILY;
  const typography = Object.fromEntries(
    Object.entries(themeConfig.typography).map(([variant, style]) => [
      variant,
      { ...style, fontFamily },
    ]),
  ) as Theme["typography"];

  const build = (mode: "light" | "dark"): Theme => {
    const input = mergePalette(
      themeConfig.colorSchemes[mode].palette as PaletteOptions,
      options.colorSchemes?.[mode]?.palette,
    ) as ResolvedPalette;
    return {
      ...deriveScheme(input, mode === "dark"),
      typography,
      spacing: themeConfig.spacing,
      shape: themeConfig.shape,
      isDark: mode === "dark",
    };
  };

  return { light: build("light"), dark: build("dark") };
};
```

- [ ] **Step 5: Update the types and the provider in `ThemeProvider.tsx`**

5a. Replace the import block at the top:

```tsx
import { mix } from "polished";
import themeConfig from "./theme.json";
import { palettes, type ThemePalette } from "./palettes";
```

with:

```tsx
import { mix } from "polished";
import themeConfig from "./theme.json";
import { createTheme, type ThemeSchemes } from "./createTheme";
```

5b. In `interface ThemeColorTokens`, add these twelve members. They are alphabetical like the rest, so insert each in order:

```ts
  info: string;
  infoContainer: string;
  onInfo: string;
  onInfoContainer: string;
  onSuccess: string;
  onSuccessContainer: string;
  onWarning: string;
  onWarningContainer: string;
  success: string;
  successContainer: string;
  warning: string;
  warningContainer: string;
```

5c. In `interface ThemeShapeTokens`, after `extraLarge: number;`, add:

```ts
  /** Fully rounded: pills and circles. */
  full: number;
```

5d. Add the MUI read shape right before `export interface Theme {`:

```ts
/** One colour in MUI's shape, as `theme.palette.primary` and the rest carry it. */
export interface PaletteColor {
  main: string;
  /** MUI's `lighten(main, 0.2)`. */
  light: string;
  /** MUI's `darken(main, 0.3)`. */
  dark: string;
  contrastText: string;
}

/** MUI's `theme.palette`, resolved for the current scheme. */
export interface Palette {
  mode: "light" | "dark";
  primary: PaletteColor;
  secondary: PaletteColor;
  error: PaletteColor;
  warning: PaletteColor;
  info: PaletteColor;
  success: PaletteColor;
  background: { default: string; paper: string };
  text: { primary: string; secondary: string; disabled: string };
  divider: string;
}
```

and in `export interface Theme`, after `colors: ThemeColorTokens;`, add:

```ts
  /** The same colours in MUI's shape: what code ported from an MUI app reads. */
  palette: Palette;
```

5e. In the `_ThemeTokensInSync` guard, delete these two lines (colour roles are now derived, and `deriveScheme`'s return type checks them):

```ts
    Exact<ThemeColorTokens, typeof themeConfig.colors.light>,
    Exact<ThemeColorTokens, typeof themeConfig.colors.dark>,
```

Update the guard's comment, which begins `// Type-level only: emits no JavaScript…`. Change "If a token is added to or removed from theme.json" to "If a typography, spacing or shape token is added to or removed from theme.json".

5f. Replace everything from `interface ThemeContextType {` down to (but not including) `export const useTheme = () => useContext(ThemeContext);` with:

```tsx
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

/** The organization's theme. Built once: every component memoises its styles on it. */
const DEFAULT_THEME = createTheme();

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME.dark,
  toggleTheme: () => {},
});

export const ThemeProvider = ({
  children,
  theme: schemes = DEFAULT_THEME,
}: {
  children: React.ReactNode;
  /**
   * Both schemes, from `createTheme()`. Defaults to the organization's theme.
   * Create it once, at module scope: a new object every render rebuilds
   * every component's styles.
   */
  theme?: ThemeSchemes;
}) => {
  const systemScheme = useColorScheme(); // Hook to listen to system changes
  // null = follow the OS color scheme; "light"/"dark" = manual override
  const [override, setOverride] = useState<"light" | "dark" | null>(null);
  const mode = override ?? systemScheme ?? "light";

  const toggleTheme = useCallback(() => {
    setOverride(mode === "light" ? "dark" : "light");
  }, [mode]);

  // Each scheme is one stable object, so the seventy-odd components that
  // memoise their StyleSheet on `theme` rebuild only when the scheme changes.
  const theme = mode === "dark" ? schemes.dark : schemes.light;

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
```

5g. Check whether `useState` and `useMemo` are still imported, and whether `themeConfig` is still referenced (the guard uses it). Leave the imports as they are if they are used.

- [ ] **Step 6: Export `createTheme` from the barrel**

In `packages/ui/src/index.ts`, replace:

```ts
export * from "./providers/palettes";
```

with:

```ts
export * from "./providers/createTheme";
```

- [ ] **Step 7: Delete the palette modules and their test**

```bash
cd /c/dev/Solaris-ui
rm packages/ui/src/providers/palettes.ts packages/ui/src/providers/successRoles.ts packages/ui/src/__tests__/palettes.test.ts
```

- [ ] **Step 8: Read Button's roles from the theme**

In `packages/ui/src/components/Button.tsx`, delete the import line:

```ts
import { getSuccessRoles } from "../providers/successRoles";
```

and in `getButtonColors`, replace everything from `const success = tone === "success" ? getSuccessRoles(theme.isDark) : null;` through the closing `;` of the `onContainer` declaration with:

```ts
  const c = theme.colors;
  const [accent, onAccent, container, onContainer] =
    tone === "success"
      ? [c.success, c.onSuccess, c.successContainer, c.onSuccessContainer]
      : tone === "error"
        ? [c.error, c.onError, c.errorContainer, c.onErrorContainer]
        : [c.primary, c.onPrimary, c.primaryContainer, c.onPrimaryContainer];
```

The primary tonal button now uses `primaryContainer`. Before, it used `secondaryContainer`, which is now the brand green.

- [ ] **Step 9: Read StatusBadge's roles from the theme**

In `packages/ui/src/components/StatusBadge.tsx`, delete:

```ts
import { getSuccessRoles, getWarningRoles } from "../providers/successRoles";
```

and replace the comment plus the whole `const { bg, on } = useMemo(...)` block with:

```tsx
  // Container roles from the theme, so a badge follows the scheme instead of a
  // hand-picked hex pair per mode.
  const { bg, on } = useMemo(() => {
    const c = theme.colors;
    if (type === "error") {
      return { bg: c.errorContainer, on: c.onErrorContainer };
    }
    if (type === "warning") {
      return { bg: c.warningContainer, on: c.onWarningContainer };
    }
    return { bg: c.successContainer, on: c.onSuccessContainer };
  }, [type, theme]);
```

- [ ] **Step 10: Run the new test to verify it passes**

Run: `npm test -w @its/solaris-ui -- createTheme`
Expected: PASS, 11 tests.

- [ ] **Step 11: Run the library's whole suite and type-check**

Run: `npm test -w @its/solaris-ui && npm run type-check -w @its/solaris-ui`
Expected: PASS.

The playground does **not** type-check yet: `app/theming.tsx`, `site/usePersistedPalette.ts` and `.design-sync/previews/ThemeProvider.tsx` still use the removed palette API. Task 5 fixes them, so do not run the root `type-check` here.

- [ ] **Step 12: Update the library's docs**

12a. In `packages/ui/CLAUDE.md`, replace the paragraph block from `## Theme system` down to (but not including) `**Styling pattern used throughout:**` with:

```markdown
## Theme system

The theme is **MUI-shaped in, Material 3 out**:

- **Input.** `createTheme(options)` (`providers/createTheme.ts`) takes MUI v6's `colorSchemes`
  shape: the `main` colours of `primary` / `secondary` / `error` / `warning` / `info` /
  `success`, plus `background`, `text` and `divider`. It deep-merges the input over the
  organization's defaults in `providers/theme.json`.
- **Output.** It derives the Material 3 roles every component paints with (`theme.colors`),
  and MUI's read shape (`theme.palette`) for code ported from MUI apps.
- **Derivation rules.**
  - Each `main` is used as given, normalised to `#RRGGBB`.
  - Its on-colour is black or white, whichever contrasts more, so AA holds for any input.
  - Containers come from a tonal palette of its hue (`providers/tonal.ts`, internal).

`theme.json` holds only inputs and scales: the two colour schemes, typography, spacing and
shape. The public `Theme` type spells the tokens out explicitly (`ThemeColorTokens`,
`Palette`, `ThemeSpacingTokens`, `ThemeShapeTokens`, `TypographyVariant`) instead of deriving
them with `typeof themeConfig`. A public type derived from the JSON makes the emitted `.d.ts`
import `theme.json`, which is not shipped with the declarations.

Two checks keep the types honest:
- A type-level guard (`_ThemeTokensInSync` in `ThemeProvider.tsx`) fails
  `npm run type-check` if typography, spacing or shape drift from `theme.json`.
- Colour roles are checked by `deriveScheme`'s return type. **When you add a role, add it to
  `ThemeColorTokens` and to `deriveScheme`.**

Selection and tonal states use the **primary** container roles: navigation indicators,
selected chips, tonal buttons. `secondary` is the brand green, not Material 3's quiet
companion colour.

Fonts: `typography.fontFamily` defaults to Roboto on Android and web, and to the system font
on iOS, where an unregistered family is an error. Apps that embed Roboto opt in with
`createTheme({ typography: { fontFamily: "Roboto" } })`.

```

12b. In the same file, replace the paragraph that begins `Colour sets live in \`providers/palettes.ts\`` (through `…not re-exported from the barrel.`) and the following paragraph `\`useTheme()\` exposes { theme, toggleTheme }; …` with:

```markdown
`useTheme()` exposes `{ theme, toggleTheme }`. `getStateColor()` and `getGlowStyles()` are
exported for building theme-reactive components. The theme follows the OS color scheme and
supports a manual toggle.
```

12c. In the same file's `## Providers` list, replace the `ThemeProvider` bullet with:

```markdown
- `ThemeProvider` — renders the scheme of `theme` (from `createTheme()`; defaults to the
  organization's theme) that the OS, or `toggleTheme()`, asks for.
```

12d. In `packages/ui/README.md`, replace the `### Theme` block (from `### Theme` through the closing ```` ``` ```` of its `useTheme` snippet) with:

````markdown
### Theme

Every colour, type step, spacing unit and radius comes from the theme. With no props,
`ThemeProvider` renders the organization's theme. To change it, pass only what differs,
in MUI's `colorSchemes` shape:

```tsx
import { createTheme, ThemeProvider, useTheme } from "@its/solaris-ui";

const theme = createTheme({
  colorSchemes: { light: { palette: { primary: { main: "#00639B" } } } },
});

<ThemeProvider theme={theme}>…</ThemeProvider>;

const { theme: current, toggleTheme } = useTheme();
current.palette.text.secondary; // MUI's shape
current.colors.primaryContainer; // the Material 3 roles components paint with
```
````

12e. In `packages/ui/README.md`, in `### Theme, alert & toasts`, replace the `ThemeProvider` and `useTheme()` bullets with:

```markdown
- **`ThemeProvider`** — wraps the app; renders `createTheme()`'s result (or the
  organization's theme), follows the OS color scheme, and supports a manual toggle.
- **`createTheme(options)`** — MUI's `colorSchemes` in, both schemes out; see [Theme](#theme).
- **`useTheme()`** → `{ theme, toggleTheme }`; the scheme is `theme.isDark`.
```

and replace the paragraph that starts `Theme tokens: colors (primary/secondary/tertiary/error` with:

```markdown
Theme tokens:
- **`theme.colors`** — the Material 3 roles: primary, secondary, tertiary, error, warning,
  info and success, each with its on-colour and container pair; the surface tones; the
  inverse pair; outline and scrim.
- **`theme.palette`** — the same colours in MUI's shape (`main` / `light` / `dark` /
  `contrastText`, `background`, `text`, `divider`).
- **Type scale** — the full Material 3 scale (`displayLarge` → `labelSmall`).
- **Spacing** — `xs:4 s:8 m:16 l:24 xl:32`.
- **Shape radii** — `small:8 medium:12 large:16 extraLarge:24 full:9999`.
```

12f. Find any other prose that still names the removed API:

Run: `grep -rn "palettes\|setPalette\|createPalette\|initialPalette\|successRoles" packages/ui --include=*.md --include=*.ts --include=*.tsx`
Expected: no output. If `components.md` lists any, rewrite each mention to the `createTheme` / `theme` API described above.

- [ ] **Step 13: Checkpoint (no commit)**

Run: `git status --short packages/ui`
Expected: `createTheme.ts` and `createTheme.test.ts` are new; `palettes.ts`, `successRoles.ts` and `palettes.test.ts` are deleted; the rest are modified. Do not commit.

---

### Task 4: Selection follows primary; organization radii

**Files:**
- Modify: `packages/ui/src/components/{Banner,Chip,ClockPicker,IconButton,NavigationBar,NavigationDrawer,NavigationRail,Snackbar}.tsx`, `List/ListItem.tsx`, `Modal/Modal.tsx`, `Progress/CircularProgress.tsx`, `Tab/Tabs.tsx`, `ToggleButton/ToggleButton.tsx`. Button.tsx was already done in Task 3.
- Modify: `packages/ui/src/components/Button.tsx` (`buttonContainer.borderRadius`), `packages/ui/src/components/Card.tsx` (`base.borderRadius`)
- Test: `packages/ui/src/__tests__/ui-primitives.test.tsx` (append one test)

**Interfaces:**
- Consumes: `theme.shape.full` and `theme.colors.primaryContainer` / `onPrimaryContainer` from Task 3.

- [ ] **Step 1: Write the failing test**

In `packages/ui/src/__tests__/ui-primitives.test.tsx`, extend the imports. The `react-native` line becomes `import { StyleSheet, Text, View } from "react-native";`, and add `Button,` and `createTheme,` to the `from "../index"` list (alphabetical: `Button` before `Card`, `createTheme` after `ConfirmDialog`). Then append:

```tsx
describe("organization shapes", () => {
  it("draws Button as a pill and Card at the large radius", async () => {
    const shape = createTheme().light.shape;
    const { getByTestId, getByText } = await wrap(
      <>
        <Button testID="pill" onPress={() => {}}>
          Go
        </Button>
        <Card>
          <Text>Body</Text>
        </Card>
      </>,
    );
    const radiusOf = (node: { props: { style?: unknown } }) =>
      StyleSheet.flatten(node.props.style as never)?.borderRadius;
    expect(radiusOf(getByTestId("pill"))).toBe(shape.full);
    // The Card's surface is the nearest ancestor that carries a radius.
    let node = getByText("Body").parent;
    while (node && radiusOf(node) === undefined) node = node.parent;
    expect(node && radiusOf(node)).toBe(shape.large);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -w @its/solaris-ui -- ui-primitives -t "organization shapes"`
Expected: FAIL, because the Button radius is `12` (`shape.medium`) and the Card radius is `12`. If `getByTestId("pill")` lands on a node whose style has no `borderRadius`, walk `.parent` the way the Card branch does.

- [ ] **Step 3: Apply the radii**

In `packages/ui/src/components/Button.tsx`, inside `makeStyles` → `buttonContainer`, change `borderRadius: theme.shape.medium,` to `borderRadius: theme.shape.full,`.

In `packages/ui/src/components/Card.tsx`, inside `makeStyles` → `base`, change `borderRadius: theme.shape.medium,` to `borderRadius: theme.shape.large,`.

ButtonGroup, SplitButton and ProgressButton already compute fully rounded corners from their height, so leave them as they are.

- [ ] **Step 4: Move selection states to the primary roles**

```bash
cd /c/dev/Solaris-ui/packages/ui/src/components
sed -i \
  -e 's/colors\.onSecondaryContainer/colors.onPrimaryContainer/g' \
  -e 's/colors\.secondaryContainer/colors.primaryContainer/g' \
  -e 's/colors\.secondary\b/colors.primary/g' \
  Banner.tsx Chip.tsx ClockPicker.tsx IconButton.tsx NavigationBar.tsx \
  NavigationDrawer.tsx NavigationRail.tsx Snackbar.tsx List/ListItem.tsx \
  Modal/Modal.tsx Progress/CircularProgress.tsx Tab/Tabs.tsx \
  ToggleButton/ToggleButton.tsx
```

Then check for leftovers:

Run: `grep -rnE "colors\.(on)?[sS]econdary" /c/dev/Solaris-ui/packages/ui/src/components`
Expected: no output.

In `Chip.tsx`, fix the stale comment `// Or theme.colors.secondary` that the sed turned into `// Or theme.colors.primary`: delete the comment.

- [ ] **Step 5: Run the tests**

Run: `npm test -w @its/solaris-ui && npm run type-check -w @its/solaris-ui && npm run lint`
Expected: PASS, including "organization shapes".

- [ ] **Step 6: Checkpoint (no commit)**

Run: `git status --short packages/ui/src/components`
Expected: the 15 component files and the test file are modified. Do not commit.

---

### Task 5: Theming page with a live component gallery

**Files:**
- Modify (full rewrite): `apps/playground/app/theming.tsx`
- Create: `apps/playground/__tests__/theming.test.tsx`
- Delete: `apps/playground/site/usePersistedPalette.ts`
- Modify: `apps/playground/site/SiteShell.tsx:32,131-134` (drop the palette hook)
- Modify: `.design-sync/previews/ThemeProvider.tsx` (drop the palette picker)

**Interfaces:**
- Consumes: `useTheme()` → `{ theme, toggleTheme }`, `createTheme` and `theme.palette` from Task 3. Components keep their Glowup API (`mode`, `tone`, `onPress`, `iconName`) until sub-project 2.

- [ ] **Step 1: Write the failing test**

Create `apps/playground/__tests__/theming.test.tsx`:

```tsx
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@its/solaris-ui";

import Theming from "../app/theming";

// The page sets <head> tags through expo-router, which this test does not mount.
jest.mock("expo-router/head", () => ({ __esModule: true, default: () => null }));
jest.mock("expo-clipboard", () => ({ setStringAsync: jest.fn() }));

const renderPage = () =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 1280, height: 900 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <ThemeProvider>
        <Theming />
      </ThemeProvider>
    </SafeAreaProvider>,
  );

describe("theming page", () => {
  it("renders a gallery of real components", async () => {
    const { getByText } = await renderPage();
    expect(getByText("Components in this theme")).toBeTruthy();
    expect(getByText("Banners follow the theme too.")).toBeTruthy();
  });

  it("re-renders everything from the dark roles when the scheme switches", async () => {
    const { getByText, getAllByText, queryAllByText } = await renderPage();
    expect(getByText("light")).toBeTruthy();
    expect(getAllByText("#1D5B9D").length).toBeGreaterThan(0);

    await fireEvent.press(getByText("Switch scheme"));

    expect(getByText("dark")).toBeTruthy();
    expect(getAllByText("#5893D4").length).toBeGreaterThan(0);
    expect(queryAllByText("#1D5B9D")).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -w @its/solaris-playground -- theming`
Expected: FAIL. `app/theming.tsx` imports `palettes`, which is no longer exported, or "Components in this theme" is not found.

- [ ] **Step 3: Rewrite `apps/playground/app/theming.tsx`**

Replace the whole file with:

```tsx
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Avatar,
  Badge,
  Banner,
  Button,
  Card,
  CardContent,
  CardTitle,
  Checkbox,
  Chip,
  CircularProgress,
  Input,
  LinearProgress,
  NavigationBar,
  RadioButton,
  Slider,
  StatusBadge,
  Tabs,
  Toggle,
  Typography,
  useTheme,
  type NavigationBarItem,
  type Theme,
  type TypographyVariant,
} from "@its/solaris-ui";

import { CodeBlock } from "../site/CodeBlock";
import { Page, Section } from "../site/Page";
import { useLayout } from "../site/breakpoints";

/**
 * The colour roles, grouped the way M3 groups them. Tokens the theme has but
 * this list does not are collected into "Other" rather than dropped, so adding
 * a role to the theme makes it appear here without an edit.
 */
const COLOR_GROUPS: { label: string; tokens: string[] }[] = [
  {
    label: "Primary",
    tokens: [
      "primary",
      "onPrimary",
      "primaryContainer",
      "onPrimaryContainer",
      "inversePrimary",
    ],
  },
  {
    label: "Secondary",
    tokens: [
      "secondary",
      "onSecondary",
      "secondaryContainer",
      "onSecondaryContainer",
    ],
  },
  {
    label: "Tertiary",
    tokens: [
      "tertiary",
      "onTertiary",
      "tertiaryContainer",
      "onTertiaryContainer",
    ],
  },
  {
    label: "Error",
    tokens: ["error", "onError", "errorContainer", "onErrorContainer"],
  },
  {
    label: "Warning",
    tokens: ["warning", "onWarning", "warningContainer", "onWarningContainer"],
  },
  {
    label: "Info",
    tokens: ["info", "onInfo", "infoContainer", "onInfoContainer"],
  },
  {
    label: "Success",
    tokens: ["success", "onSuccess", "successContainer", "onSuccessContainer"],
  },
  {
    label: "Surfaces",
    tokens: [
      "background",
      "onBackground",
      "surface",
      "onSurface",
      "surfaceVariant",
      "onSurfaceVariant",
      "surfaceContainerLow",
      "surfaceContainer",
      "surfaceContainerHigh",
      "surfaceContainerHighest",
      "surfaceDim",
      "inverseSurface",
      "inverseOnSurface",
      "surfaceTint",
    ],
  },
  {
    label: "Lines & shadows",
    tokens: ["outline", "outlineVariant", "scrim", "shadow"],
  },
];

const TYPE_SCALE: TypographyVariant[] = [
  "displayLarge",
  "displayMedium",
  "displaySmall",
  "headlineLarge",
  "headlineMedium",
  "headlineSmall",
  "titleLarge",
  "titleMedium",
  "titleSmall",
  "bodyLarge",
  "bodyMedium",
  "bodySmall",
  "labelLarge",
  "labelMedium",
  "labelSmall",
];

const USAGE = `import { useTheme } from "@its/solaris-ui";
import { StyleSheet } from "react-native";

const Card = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return <View style={styles.card} />;
};

// Styles are rebuilt when the theme changes — never read a token at module scope.
const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      padding: theme.spacing.m,
      borderRadius: theme.shape.large,
      backgroundColor: theme.colors.surfaceContainerLow,
    },
  });`;

const READ_PALETTE = `import { useTheme } from "@its/solaris-ui";

// Code ported from an MUI app reads the palette in MUI's shape…
const Caption = ({ children }: { children: string }) => {
  const { theme } = useTheme();
  return <Text style={{ color: theme.palette.text.secondary }}>{children}</Text>;
};

// …and the Material 3 roles the components paint with are beside it:
// theme.colors.primaryContainer, theme.colors.surfaceContainerHigh, …`;

const CREATE_THEME = `import { createTheme, ThemeProvider } from "@its/solaris-ui";

// MUI's colorSchemes shape. Pass only what differs: everything else stays the
// organization's theme. Create it once, at module scope — a new theme object
// re-styles every component.
const theme = createTheme({
  colorSchemes: {
    light: { palette: { primary: { main: "#00639B" } } },
    dark: { palette: { primary: { main: "#95CCFF" } } },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <Root />
    </ThemeProvider>
  );
}`;

/**
 * `theme.colors` is spelled out token by token in the public `Theme` type — on
 * purpose, so the emitted .d.ts does not import theme.json — which means it has
 * no index signature to read a dynamic token name through.
 */
const colorToken = (theme: Theme, token: string): string | undefined =>
  (theme.colors as unknown as Record<string, string>)[token];

export default function Theming() {
  const { theme, toggleTheme } = useTheme();
  const layout = useLayout();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const known = new Set(COLOR_GROUPS.flatMap((group) => group.tokens));
  const extras = Object.keys(theme.colors).filter(
    (token) =>
      !known.has(token) && typeof colorToken(theme, token) === "string",
  );
  const groups = extras.length
    ? [...COLOR_GROUPS, { label: "Other", tokens: extras }]
    : COLOR_GROUPS;

  return (
    <Page
      eyebrow="Design tokens"
      title="Theming"
      description="Every colour, type step, spacing unit and corner radius in the library comes from one theme, resolved for the light and dark schemes. The components and swatches on this page are rendered with it, live."
    >
      <View style={styles.toggleRow}>
        <Typography
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Showing the{" "}
          <Text style={styles.strong}>{theme.isDark ? "dark" : "light"}</Text>{" "}
          scheme.
        </Typography>
        <Button
          mode="tonal"
          iconName={theme.isDark ? "weather-sunny" : "weather-night"}
          onPress={toggleTheme}
        >
          Switch scheme
        </Button>
      </View>

      <Section
        title="Components in this theme"
        description="Real components, not pictures of them. Switch the scheme and every one of them re-renders from the other set of roles."
      >
        <Gallery />
      </Section>

      {groups.map((group) => (
        <Section key={group.label} title={group.label}>
          <View style={styles.swatchGrid}>
            {group.tokens.map((token) => {
              const value = colorToken(theme, token);
              if (!value) return null;
              return (
                <Swatch
                  key={token}
                  token={token}
                  value={value}
                  columns={
                    layout.atLeast("large")
                      ? 4
                      : layout.atLeast("medium")
                        ? 3
                        : 2
                  }
                />
              );
            })}
          </View>
        </Section>
      ))}

      <Section
        title="Type scale"
        description="Fifteen steps on the theme's font family: Roboto on Android and the web, the system font on iOS unless the app embeds Roboto. `Typography` takes the step name as its variant."
      >
        <View style={styles.typeList}>
          {TYPE_SCALE.map((variant) => {
            const spec = theme.typography[variant];
            return (
              <View key={variant} style={styles.typeRow}>
                <Typography
                  variant={variant}
                  style={{ color: theme.colors.onSurface }}
                >
                  {variant}
                </Typography>
                <Typography
                  variant="labelSmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {spec.fontSize} / {spec.lineHeight} ·{" "}
                  {String(spec.fontWeight)}
                </Typography>
              </View>
            );
          })}
        </View>
      </Section>

      <Section
        title="Spacing"
        description="Five steps. Layout primitives take the token name, StyleSheets take the value."
      >
        <View style={styles.tokenRow}>
          {Object.entries(theme.spacing).map(([name, value]) => (
            <View key={name} style={styles.tokenChip}>
              <View
                style={[
                  styles.spacingBar,
                  { width: value as number, height: value as number },
                ]}
              />
              <Typography
                variant="labelMedium"
                style={{ color: theme.colors.onSurface }}
              >
                {name}
              </Typography>
              <Typography
                variant="labelSmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {String(value)}dp
              </Typography>
            </View>
          ))}
        </View>
      </Section>

      <Section
        title="Shape"
        description="Corner radii, by role rather than by number: 12 for fields, 16 for cards, 24 for dialogs and sheets, fully rounded for buttons."
      >
        <View style={styles.tokenRow}>
          {Object.entries(theme.shape).map(([name, value]) => (
            <View key={name} style={styles.tokenChip}>
              <View
                style={[styles.shapeSample, { borderRadius: value as number }]}
              />
              <Typography
                variant="labelMedium"
                style={{ color: theme.colors.onSurface }}
              >
                {name}
              </Typography>
              <Typography
                variant="labelSmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {String(value)}dp
              </Typography>
            </View>
          ))}
        </View>
      </Section>

      <Section
        title="Reading the theme in your own code"
        description="The pattern every component in the library follows, and MUI's palette shape for code ported from a web app."
      >
        <CodeBlock code={USAGE} title="Card.tsx" />
        <CodeBlock code={READ_PALETTE} title="Caption.tsx" />
      </Section>

      <Section
        title="Your own theme"
        description="createTheme takes MUI's colorSchemes shape. Text on each colour is black or white, whichever reads better, so a new brand colour cannot produce unreadable buttons."
      >
        <CodeBlock code={CREATE_THEME} title="App.tsx" />
      </Section>
    </Page>
  );
}

const noop = () => {};

const GALLERY_TABS = ["Overview", "Activity", "Settings"];

const GALLERY_NAV: NavigationBarItem[] = [
  { id: "home", label: "Home", icon: "home-outline" },
  { id: "contacts", label: "Contacts", icon: "account-group-outline" },
  {
    id: "agenda",
    label: "Agenda",
    icon: "calendar-month-outline",
    badgeCount: 3,
  },
];

/** A static spread of the components a theme change is most visible on. */
const Gallery = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [name, setName] = useState("Mario Rossi");
  const [notify, setNotify] = useState(true);
  const [remember, setRemember] = useState(true);
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");
  const [volume, setVolume] = useState(40);
  const [tab, setTab] = useState(0);
  const [nav, setNav] = useState("home");

  return (
    <View style={styles.gallery}>
      <View style={styles.galleryRow}>
        <Button mode="filled" onPress={noop}>
          Filled
        </Button>
        <Button mode="tonal" onPress={noop}>
          Tonal
        </Button>
        <Button mode="outlined" onPress={noop}>
          Outlined
        </Button>
        <Button mode="text" onPress={noop}>
          Text
        </Button>
      </View>
      <View style={styles.galleryRow}>
        <Button tone="error" onPress={noop}>
          Delete
        </Button>
        <Button tone="success" onPress={noop}>
          Confirm
        </Button>
        <Button mode="tonal" tone="error" onPress={noop}>
          Discard
        </Button>
        <Button disabled onPress={noop}>
          Disabled
        </Button>
      </View>
      <View style={styles.galleryRow}>
        <Chip label="All" mode="outlined" onPress={noop} />
        <Chip label="Selected" mode="tonal" selected onPress={noop} />
        <StatusBadge label="Active" type="success" />
        <StatusBadge label="Pending" type="warning" />
        <StatusBadge label="Failed" type="error" />
      </View>
      <View style={styles.galleryRow}>
        <Avatar name="Mario Rossi" />
        <Avatar icon="account" variant="rounded" />
        <Badge count={5} />
        <Toggle value={notify} onValueChange={setNotify} />
        <Checkbox
          checked={remember}
          onValueChange={setRemember}
          label="Remember me"
        />
      </View>
      <View style={styles.galleryRow}>
        <RadioButton
          label="Monthly"
          selected={plan === "monthly"}
          onPress={() => setPlan("monthly")}
        />
        <RadioButton
          label="Annual"
          selected={plan === "annual"}
          onPress={() => setPlan("annual")}
        />
      </View>
      <Input
        label="Name"
        value={name}
        onChangeText={setName}
        helperText="As it appears on the contract"
      />
      <Slider
        label="Volume"
        value={volume}
        onValueChange={setVolume}
        min={0}
        max={100}
      />
      <View style={styles.progressRow}>
        <View style={styles.grow}>
          <LinearProgress progress={0.6} />
        </View>
        <CircularProgress progress={0.6} size={32} />
      </View>
      <Card variant="elevated">
        <CardTitle title="Card" subtitle="An elevated surface" />
        <CardContent>
          <Typography
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Surfaces, outlines and text all come from the theme's neutral roles.
          </Typography>
        </CardContent>
      </Card>
      <Tabs tabs={GALLERY_TABS} activeTab={tab} onChange={setTab} />
      <Banner
        visible
        type="info"
        icon="information-outline"
        message="Banners follow the theme too."
      />
      <NavigationBar items={GALLERY_NAV} activeId={nav} onItemPress={setNav} />
    </View>
  );
};

const Swatch = ({
  token,
  value,
  columns,
}: {
  token: string;
  value: string;
  columns: number;
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View
      style={[
        styles.swatch,
        { flexBasis: `${100 / columns}%`, maxWidth: `${100 / columns}%` },
      ]}
    >
      <View style={[styles.swatchChip, { backgroundColor: value }]} />
      <Typography
        variant="labelMedium"
        style={{ color: theme.colors.onSurface }}
      >
        {token}
      </Typography>
      <Typography
        variant="labelSmall"
        style={{ color: theme.colors.onSurfaceVariant }}
      >
        {value}
      </Typography>
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: theme.spacing.m,
    },
    strong: { fontWeight: "700", color: theme.colors.onSurface },
    gallery: { gap: theme.spacing.m },
    galleryRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: theme.spacing.s,
    },
    progressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.m,
    },
    grow: { flex: 1 },
    swatchGrid: { flexDirection: "row", flexWrap: "wrap" },
    swatch: {
      gap: 2,
      paddingRight: theme.spacing.m,
      paddingBottom: theme.spacing.m,
    },
    swatchChip: {
      height: 56,
      borderRadius: theme.shape.medium,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      marginBottom: theme.spacing.xs,
    },
    typeList: { gap: theme.spacing.m },
    typeRow: { gap: 2 },
    tokenRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.m,
      alignItems: "flex-end",
    },
    tokenChip: { alignItems: "center", gap: 2, minWidth: 72 },
    spacingBar: {
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
      marginBottom: theme.spacing.xs,
    },
    shapeSample: {
      width: 56,
      height: 56,
      backgroundColor: theme.colors.primaryContainer,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      marginBottom: theme.spacing.xs,
    },
  });
```

- [ ] **Step 4: Remove the palette persistence**

```bash
cd /c/dev/Solaris-ui
rm apps/playground/site/usePersistedPalette.ts
```

In `apps/playground/site/SiteShell.tsx`, delete the import line:

```tsx
import { usePersistedPalette } from "./usePersistedPalette";
```

and delete this block:

```tsx
  // Site-wide preferences live with the chrome that owns them: the shell is
  // mounted for every route, so the colour set is restored wherever the reader
  // lands, not only on /theming.
  usePersistedPalette();
```

- [ ] **Step 5: Drop the palette picker from the design-sync preview**

In `.design-sync/previews/ThemeProvider.tsx`:
- Remove `palettes,` from the `@its/solaris-ui` import list.
- Replace everything from the comment line `// The palette picker. \`palettes\` holds the Material 3 baseline plus the` to the end of the file with:

```tsx
// The scheme switch. ThemeProvider follows the OS colour scheme; toggleTheme()
// overrides it, and every component below the provider re-renders from the
// other set of roles. Nested provider on purpose: switching here re-themes
// this card only, not the rest of the design system.
const SchemeSwitch = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div style={stack(12)}>
      <div style={lines}>
        <Typography variant="titleMedium">Light and dark</Typography>
        <Typography variant="bodySmall">
          Showing the {theme.isDark ? "dark" : "light"} scheme.
        </Typography>
      </div>
      <Paper outline style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button mode="filled" onPress={toggleTheme}>
            Switch scheme
          </Button>
          <Button mode="tonal" onPress={() => {}}>
            Tonal
          </Button>
          <Chip label="Selected" mode="tonal" selected onPress={() => {}} />
          <ProgressButton status="loading" progress={0.6}>
            Loading
          </ProgressButton>
        </div>
      </Paper>
    </div>
  );
};

export const Schemes = () => (
  <ThemeProvider>
    <SchemeSwitch />
  </ThemeProvider>
);
```

Then check: `grep -n "palette\b\|setPalette\|palettes" .design-sync/previews/ThemeProvider.tsx`. Expected: no output. If the earlier `Palette` cell's comments mention "palette picker", leave them: they describe the token swatches.

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -w @its/solaris-playground -- theming`
Expected: PASS, 2 tests.

If the "light" assertion fails because jest's `useColorScheme()` reports `"dark"`, check `node_modules/jest-expo` for the Appearance mock and assert the opposite order. Do not mock the provider.

- [ ] **Step 7: Run every gate**

Run: `npm run lint && npm run type-check && npm test`
Expected: PASS. This is the first task where the root `type-check` must pass again.

- [ ] **Step 8: Checkpoint (no commit)**

Run: `git status --short apps/playground .design-sync/previews`
Expected: `theming.tsx`, `SiteShell.tsx` and `ThemeProvider.tsx` modified, `theming.test.tsx` new, `usePersistedPalette.ts` deleted. Do not commit.

---

### Task 6: Roboto on the docs site, font guidance, regenerated icons

**Files:**
- Create: `apps/playground/app/+html.tsx`
- Modify: `apps/playground/app/getting-started.tsx` (font section, theme hook snippet)
- Modify: `apps/playground/scripts/generate-icons.mjs:36,172-175`
- Regenerate: `apps/playground/assets/*.png`, `apps/playground/public/og-image.png`

**Interfaces:**
- Consumes: `theme.json`'s `colorSchemes.light.palette` (Task 3) and `createTheme({ typography: { fontFamily } })` (Task 3).

- [ ] **Step 1: Load Roboto on the web build**

Create `apps/playground/app/+html.tsx`:

```tsx
import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

/**
 * The root HTML of every prerendered page. Expo's default, plus Roboto: the
 * theme's web font stack starts with it, and unlike Android the browser does
 * not ship it.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Document fonts on the getting-started page**

In `apps/playground/app/getting-started.tsx`, add this constant after `THEME_HOOK`:

```tsx
const FONTS = `// app.config.ts — embed Roboto in the native build.
// Config plugins need a development build; Expo Go cannot embed fonts.
plugins: [
  [
    "expo-font",
    {
      fonts: [
        "./assets/fonts/Roboto-Regular.ttf",
        "./assets/fonts/Roboto-Medium.ttf",
        "./assets/fonts/Roboto-Bold.ttf",
      ],
    },
  ],
],

// App.tsx — then tell the theme the family is there.
const theme = createTheme({ typography: { fontFamily: "Roboto" } });
<ThemeProvider theme={theme}>…</ThemeProvider>;`;
```

Change the `THEME_HOOK` comment line to:

```tsx
// theme.palette.primary.main, theme.colors.primary, theme.spacing.m, theme.shape.large, theme.isDark`;
```

And add this section after the `5. Read the theme` section:

```tsx
      <Section
        title="6. Fonts"
        description="The theme uses Roboto on Android, where it is the system font, and on the web, where your HTML loads it (this site's app/+html.tsx does). iOS has no Roboto and React Native has no font fallback, so on iOS the theme uses the system font until the app embeds Roboto and says so."
      >
        <CodeBlock code={FONTS} title="app.config.ts / App.tsx" />
      </Section>
```

- [ ] **Step 3: Draw the icons from the new theme**

In `apps/playground/scripts/generate-icons.mjs`, replace:

```js
const light = theme.colors.light;
```

with:

```js
// theme.json stores the theme's inputs, not the derived roles (those are
// computed in TypeScript). The icon needs four colours: the brand primary,
// white on it (6.9:1 on #1D5B9D), a light tint of it, and the page background.
const palette = theme.colorSchemes.light.palette;
```

Then replace these four lines:

```js
const PRIMARY = rgba(light.primary);
const ON_PRIMARY = rgba(light.onPrimary);
const PRIMARY_CONTAINER = rgba(light.primaryContainer);
const SURFACE = rgba(light.surfaceContainerLow);
```

with:

```js
const PRIMARY = rgba(palette.primary.main);
const ON_PRIMARY = rgba("#FFFFFF");
// 85% of the way to white: close to the derived primaryContainer, which is
// all an icon needs.
const PRIMARY_CONTAINER = PRIMARY.map((v, i) =>
  i < 3 ? Math.round(v + (255 - v) * 0.85) : v,
);
const SURFACE = rgba(palette.background.default);
```

Run: `grep -n "light\.\|theme\.colors" apps/playground/scripts/generate-icons.mjs`
Expected: no output.

- [ ] **Step 4: Regenerate the icons**

Run: `npm run icons -w @its/solaris-playground`
Expected: exits 0; `git status --short apps/playground/assets apps/playground/public` shows the PNGs modified. Open `apps/playground/assets/icon.png` with the Read tool and confirm the mark is the brand blue `#1D5B9D`.

- [ ] **Step 5: Verify the web export**

Run: `npm run lint && npm run type-check -w @its/solaris-playground && npm run export:web -w @its/solaris-playground`
Expected: PASS. Then `grep -l "fonts.googleapis.com/css2?family=Roboto" apps/playground/dist/theming.html` prints the file.

- [ ] **Step 6: Checkpoint (no commit)**

Run: `git status --short apps/playground`
Expected: `+html.tsx` new; `getting-started.tsx`, `generate-icons.mjs` and the PNGs modified. `apps/playground/dist` is build output and is ignored. Do not commit.

---

### Task 7: Whole-branch verification

**Files:** none modified, unless a gate fails. In that case, fix the failure in the file it names and re-run.

- [ ] **Step 1: Every CI gate, in CI's order**

```bash
cd /c/dev/Solaris-ui
npm run type-check && npm test && npm run build && npm run validate-package -w @its/solaris-ui && npm run lint
npm run docgen -w @its/solaris-playground && npm run variants -w @its/solaris-playground
npm run export:web -w @its/solaris-playground
```

Expected: all exit 0.

- [ ] **Step 2: The generated files are stable**

Run the two generators a second time and compare:

```bash
GEN="apps/playground/docgen apps/playground/catalogue/variants/generated"
before=$(git diff -- $GEN | git hash-object --stdin)
npm run docgen -w @its/solaris-playground && npm run variants -w @its/solaris-playground
after=$(git diff -- $GEN | git hash-object --stdin)
[ "$before" = "$after" ] && echo stable || echo CHANGED
```

Expected: `stable`.

- [ ] **Step 3: No Glowup left, nothing publishable**

```bash
git ls-files -z --cached --others --exclude-standard \
  | grep -zv -e '^docs/superpowers/' \
  | xargs -0 grep -lIi glowup 2>/dev/null
node -p 'const p=require("./packages/ui/package.json"); p.private===true && p.version==="0.0.0" ? "locked" : "NOT LOCKED"'
grep -c "schedule\|workflow_run" .github/workflows/consumer-smoke.yml
```

Expected: no file names (the lockfile included, since Task 1 regenerated it); `locked`; `0`.

- [ ] **Step 4: Look at it in a browser**

Start the site: run `npm run web` in the background (Expo serves on `http://localhost:8081`). With the Playwright tools:
1. Navigate to `http://localhost:8081/theming`, wait for "Components in this theme", and take a full-page screenshot.
2. Click "Switch scheme" and take a second screenshot.
3. Navigate to `http://localhost:8081/components/button` and take a screenshot.

Confirm, by looking at the screenshots:
- Buttons are pills, and the filled ones are blue `#1D5B9D` with white text.
- The tonal button, the selected chip, the tab indicator and the navigation indicator are light **blue**, not green.
- In dark mode, primary is `#5893D4` with **black** text.
- Text renders in Roboto (web).

Stop the dev server afterwards.

- [ ] **Step 5: Final checkpoint (no commit)**

Run: `git status --short | wc -l` and `git diff --stat | tail -1`
Report both numbers to the user. Do not stage, commit or push. The user will decide.
