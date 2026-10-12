# Solaris MUI API — G0 Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the whole library MUI's foundations: MUI's own type scale in the theme and in every component, `theme.spacing(n)`, `theme.shape.borderRadius`, palette-path colours, and the MUI-shaped `Typography` and `Icon`.

**Architecture:**
- Two throwaway codemods, kept in the scratchpad and not in the repo, rewrite every Material 3 text-style name and every `theme.spacing.<token>` across the library, the docs site and the previews. A handful of manual edits handle what a regex can't.
- A shared colour resolver in `components/Layout/tokens.ts` gains MUI palette paths. Typography and Icon then move to their MUI APIs on top of it.
- Each task leaves lint, type-check and tests green.

**Tech Stack:** Expo 57 / React Native 0.86 / react-native-web, TypeScript 6, jest-expo + @testing-library/react-native 14, polished.

**Spec:** `docs/superpowers/specs/2026-10-12-solaris-mui-api-design.md` (Part A rules, Part B, Part D). Program: `docs/superpowers/specs/2026-10-12-solaris-program-design.md`.

## Global Constraints

- **Never stage, commit or push** (user preference). Every task ends with a `git status` checkpoint.
- `<scratchpad>` means the session's scratchpad directory, outside the repo. The codemods and helper servers live there and are never added to the repository.
- **Type scale** (fontSize / fontWeight / lineHeight / letterSpacing / textTransform):

  | Variant | fontSize | fontWeight | lineHeight | letterSpacing | textTransform |
  |---|---|---|---|---|---|
  | h1 | 96 | "300" | 112 | -1.5 | |
  | h2 | 60 | "300" | 72 | -0.5 | |
  | h3 | 48 | "400" | 56 | 0 | |
  | h4 | 34 | "400" | 42 | 0.25 | |
  | h5 | 24 | "400" | 32 | 0 | |
  | h6 | 20 | "500" | 32 | 0.15 | |
  | subtitle1 | 16 | "400" | 28 | 0.15 | |
  | subtitle2 | 14 | "500" | 22 | 0.1 | |
  | body1 | 16 | "400" | 24 | 0.15 | |
  | body2 | 14 | "400" | 20 | 0.15 | |
  | button | 14 | "500" | 25 | 0.4 | uppercase |
  | caption | 12 | "400" | 20 | 0.4 | |
  | overline | 12 | "400" | 32 | 1 | uppercase |

- **Text-style map:** displayLarge→h2, displayMedium→h3, displaySmall→h4, headlineLarge→h4, headlineMedium→h5, headlineSmall→h5, titleLarge→h6, titleMedium→subtitle1, titleSmall→subtitle2, bodyLarge→body1, bodyMedium→body2, bodySmall→caption, labelLarge→subtitle2, labelMedium→caption, labelSmall→caption.
- **Button labels:** the label goes to **`button`** in `Button.tsx` (labelMedium today), `AnimatedFAB.tsx`, `ButtonGroup.tsx`, `FAB.tsx`, `SplitButton.tsx`, `Tab/Tabs.tsx` and `ToggleButton/ToggleButton.tsx` (labelLarge today).
- **Spacing:** `theme.spacing(n)` = 8 × n. Old tokens: xs→0.5, s→1, m→2, l→3, xl→4.
- **Shape:** `theme.shape.borderRadius = 4`. The named radii stay.
- **Colour resolver** accepts, in this order:
  1. a dotted path into `theme.palette` (`"text.secondary"`);
  2. a palette name (`"primary"` → `.main`; `"divider"` → its string);
  3. a Material 3 role;
  4. a raw colour.
- **Icon:** a glyph goes in as `children` (`<Icon>plus</Icon>`). `fontSize` accepts `"small"` (20), `"medium"` (24) or `"large"` (35), or a number; the default is `"medium"`.
- **Layout props are unchanged in G0.** `p="m"` and `spacing="s"` still take token names until G1.
- Line endings LF. Prettier: `trailingComma: "all"`.

## Review Focus

1. **A raw colour that contains a dot.** `rgba(0, 0, 0, 0.5)` must pass through as a colour, not be read as a palette path. Pinned in Task 3.
2. **A palette leaf that is a string.** `color="divider"` must resolve to `theme.palette.divider`, not be returned as the literal word. Pinned in Task 3.
3. **Fractional and negative spacing.** `theme.spacing(1.5)` must be 12 and `theme.spacing(-1)` must be -8, as in MUI. Pinned in Task 2.
4. **An explicit `numberOfLines` without `noWrap`.** Typography must keep the caller's `numberOfLines`; `noWrap` only forces 1 when set. Pinned in Task 4.
5. **An unknown glyph name.** `<Icon>not-a-glyph</Icon>` must render (vector-icons shows its placeholder), not throw. Pinned in Task 5.

---

### Task 1: MUI type scale everywhere

**Files:**
- Modify: `packages/ui/src/providers/theme.json` (`typography`)
- Modify: `packages/ui/src/providers/ThemeProvider.tsx` (`TypographyVariant`)
- Modify (codemod): every `.ts`/`.tsx` under `packages/ui/src`, `apps/playground` (except `node_modules`, `dist`, `.expo`, `catalogue/variants/generated`), and `.design-sync/previews`
- Modify: `apps/playground/catalogue/registry/foundations.ts` (Typography `variant` options), `apps/playground/app/theming.tsx` (`TYPE_SCALE`)
- Test: `packages/ui/src/__tests__/createTheme.test.ts`

**Interfaces:**
- Produces: `TypographyVariant = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "subtitle1" | "subtitle2" | "body1" | "body2" | "button" | "caption" | "overline"`; `theme.typography[variant]: TextStyle` with the Global Constraints values.

- [ ] **Step 1: Write the failing test**

Add to `packages/ui/src/__tests__/createTheme.test.ts`, inside `describe("createTheme", …)`:

```ts
  it("carries MUI's own type scale", () => {
    const t = theme.light.typography;
    expect(Object.keys(t).sort()).toEqual([
      "body1",
      "body2",
      "button",
      "caption",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "overline",
      "subtitle1",
      "subtitle2",
    ]);
    expect(t.h1).toMatchObject({
      fontSize: 96,
      fontWeight: "300",
      lineHeight: 112,
      letterSpacing: -1.5,
    });
    expect(t.body1).toMatchObject({ fontSize: 16, fontWeight: "400", lineHeight: 24 });
    expect(t.button).toMatchObject({
      fontSize: 14,
      fontWeight: "500",
      textTransform: "uppercase",
    });
    expect(t.overline.textTransform).toBe("uppercase");
  });
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -w @its/solaris-ui -- createTheme`
Expected: FAIL. TypeScript-in-jest ignores the type error, so the keys assertion fails because it receives the 15 Material 3 names.

- [ ] **Step 3: Re-key `theme.json` typography**

```bash
cd /c/dev/Solaris-ui && node -e '
const fs = require("fs");
const p = "packages/ui/src/providers/theme.json";
const t = JSON.parse(fs.readFileSync(p, "utf8"));
const v = (fontSize, fontWeight, lineHeight, letterSpacing, extra = {}) =>
  ({ fontSize, lineHeight, letterSpacing, fontWeight, ...extra });
t.typography = {
  h1: v(96, "300", 112, -1.5), h2: v(60, "300", 72, -0.5), h3: v(48, "400", 56, 0),
  h4: v(34, "400", 42, 0.25), h5: v(24, "400", 32, 0), h6: v(20, "500", 32, 0.15),
  subtitle1: v(16, "400", 28, 0.15), subtitle2: v(14, "500", 22, 0.1),
  body1: v(16, "400", 24, 0.15), body2: v(14, "400", 20, 0.15),
  button: v(14, "500", 25, 0.4, { textTransform: "uppercase" }),
  caption: v(12, "400", 20, 0.4),
  overline: v(12, "400", 32, 1, { textTransform: "uppercase" }),
};
fs.writeFileSync(p, JSON.stringify(t, null, 4) + "\n");'
```

- [ ] **Step 4: Write the type-scale codemod (scratchpad, not the repo)**

Create `<scratchpad>/migrate-type-scale.js` with the Write tool:

```js
// Throwaway: Material 3 text-style names -> MUI names across the repo.
// Run from the repo root: node <scratchpad>/migrate-type-scale.js
const fs = require("fs");
const path = require("path");

const MAP = {
  displayLarge: "h2", displayMedium: "h3", displaySmall: "h4",
  headlineLarge: "h4", headlineMedium: "h5", headlineSmall: "h5",
  titleLarge: "h6", titleMedium: "subtitle1", titleSmall: "subtitle2",
  bodyLarge: "body1", bodyMedium: "body2", bodySmall: "caption",
  labelLarge: "subtitle2", labelMedium: "caption", labelSmall: "caption",
};
// Components whose MUI counterpart sets its label in `button` (UPPERCASE).
const OVERRIDES = {
  "packages/ui/src/components/Button.tsx": { labelMedium: "button" },
  "packages/ui/src/components/AnimatedFAB.tsx": { labelLarge: "button" },
  "packages/ui/src/components/ButtonGroup.tsx": { labelLarge: "button" },
  "packages/ui/src/components/FAB.tsx": { labelLarge: "button" },
  "packages/ui/src/components/SplitButton.tsx": { labelLarge: "button" },
  "packages/ui/src/components/Tab/Tabs.tsx": { labelLarge: "button" },
  "packages/ui/src/components/ToggleButton/ToggleButton.tsx": { labelLarge: "button" },
};
const ROOTS = ["packages/ui/src", "apps/playground", ".design-sync/previews"];
const SKIP = new Set(["node_modules", "dist", ".expo", "generated"]);
const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP.has(e.name)) walk(p, out);
    } else if (/\.(tsx?|mjs)$/.test(e.name)) out.push(p);
  }
  return out;
};
const NAMES = Object.keys(MAP).join("|");
const ACCESS = new RegExp(`typography\\.(${NAMES})\\b`, "g");
const LITERAL = new RegExp("([\"'`])(" + NAMES + ")\\1", "g");
let files = 0;
for (const file of ROOTS.flatMap((r) => walk(r))) {
  const key = file.split(path.sep).join("/");
  const map = { ...MAP, ...(OVERRIDES[key] || {}) };
  const src = fs.readFileSync(file, "utf8");
  const out = src
    .replace(ACCESS, (_, n) => `typography.${map[n]}`)
    .replace(LITERAL, (_, q, n) => `${q}${map[n]}${q}`);
  if (out !== src) {
    fs.writeFileSync(file, out);
    files += 1;
  }
}
console.log(`rewrote ${files} files`);
```

- [ ] **Step 5: Run the codemod**

Run: `node <scratchpad>/migrate-type-scale.js`
Expected: `rewrote N files`, where N is roughly 100.

Then confirm no Material 3 name is left in code:

Run: `grep -rnE "typography\.(display|headline|title|body|label)(Large|Medium|Small)|[\"'\`](display|headline|title|body|label)(Large|Medium|Small)[\"'\`]" packages/ui/src apps/playground .design-sync/previews --include=*.ts --include=*.tsx --include=*.mjs | grep -v node_modules`
Expected: no output.

Then confirm the button labels:

Run: `grep -c "typography.button\|variant=\"button\"" packages/ui/src/components/Button.tsx packages/ui/src/components/FAB.tsx packages/ui/src/components/Tab/Tabs.tsx`
Expected: each count ≥ 1.

- [ ] **Step 6: Rewrite the TypographyVariant union**

The codemod turned the union in `packages/ui/src/providers/ThemeProvider.tsx` into duplicate MUI names. Replace the whole `export type TypographyVariant = …;` declaration (and its doc comment) with:

```ts
/** MUI's type scale, at MUI's own sizes. */
export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "subtitle1"
  | "subtitle2"
  | "body1"
  | "body2"
  | "button"
  | "caption"
  | "overline";
```

- [ ] **Step 7: De-duplicate the two lists the codemod collapsed**

In `apps/playground/catalogue/registry/foundations.ts`, replace the Typography `variant.options` array with:

```ts
        options: [
          { label: "h1", value: "h1" },
          { label: "h2", value: "h2" },
          { label: "h3", value: "h3" },
          { label: "h4", value: "h4" },
          { label: "h5", value: "h5" },
          { label: "h6", value: "h6" },
          { label: "subtitle1", value: "subtitle1" },
          { label: "subtitle2", value: "subtitle2" },
          { label: "body1", value: "body1" },
          { label: "body2", value: "body2" },
          { label: "button", value: "button" },
          { label: "caption", value: "caption" },
          { label: "overline", value: "overline" },
        ],
```

In `apps/playground/app/theming.tsx`, replace the `TYPE_SCALE` array with:

```ts
const TYPE_SCALE: TypographyVariant[] = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "subtitle1",
  "subtitle2",
  "body1",
  "body2",
  "button",
  "caption",
  "overline",
];
```

In the same file, change the "Type scale" section's description to: `"MUI's thirteen steps at MUI's own sizes, on the theme's font family: Roboto on Android and the web, the system font on iOS unless the app embeds Roboto. Typography takes the step name as its variant."`

- [ ] **Step 8: Run the test and every gate**

Run: `npm test -w @its/solaris-ui -- createTheme`
Expected: PASS, including "carries MUI's own type scale".

Run: `npm run lint && npm run type-check && npm test`
Expected: PASS. If Prettier reports wrapping on rewritten lines, run `npx eslint --fix` on the files it names and re-run.

- [ ] **Step 9: Checkpoint (no commit)**

Run: `git status --short | wc -l`
Expected: roughly 100 modified files. Do not commit.

---

### Task 2: `theme.spacing(n)` and `theme.shape.borderRadius`

**Files:**
- Modify: `packages/ui/src/providers/theme.json` (drop `spacing`, add `shape.borderRadius`)
- Modify: `packages/ui/src/providers/ThemeProvider.tsx` (remove `ThemeSpacingTokens`, `Theme.spacing` type, guard, `ThemeShapeTokens.borderRadius`)
- Modify: `packages/ui/src/providers/createTheme.ts:301` (`spacing`)
- Modify: `packages/ui/src/components/Layout/tokens.ts` (`SpacingValue`, `resolveSpacing`)
- Modify (codemod): every `.ts`/`.tsx` under the three roots
- Modify: `apps/playground/app/theming.tsx` (Spacing section), `.design-sync/previews/ThemeProvider.tsx` (`SpacingAndShape`)
- Test: `packages/ui/src/__tests__/createTheme.test.ts`

**Interfaces:**
- Consumes: the Task 1 type scale (variant names in the snippets below).
- Produces: `Theme.spacing: (n: number) => number` (8 × n); `ThemeShapeTokens.borderRadius: number` (= 4); `SpacingValue = "xs" | "s" | "m" | "l" | "xl" | number` (layout props, until G1).

- [ ] **Step 1: Write the failing test**

Add to `createTheme.test.ts`:

```ts
  it("spaces by MUI's 8-point function, fractions and negatives included", () => {
    const { spacing } = theme.light;
    expect(spacing(2)).toBe(16);
    expect(spacing(0.5)).toBe(4);
    expect(spacing(1.5)).toBe(12);
    expect(spacing(-1)).toBe(-8);
  });

  it("carries MUI's base corner radius beside the named ones", () => {
    expect(theme.light.shape.borderRadius).toBe(4);
    expect(theme.light.shape.large).toBe(16);
  });
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -w @its/solaris-ui -- createTheme`
Expected: FAIL with "spacing is not a function", and `borderRadius` undefined.

- [ ] **Step 3: Change the theme data and types**

```bash
cd /c/dev/Solaris-ui && node -e '
const fs = require("fs");
const p = "packages/ui/src/providers/theme.json";
const t = JSON.parse(fs.readFileSync(p, "utf8"));
delete t.spacing;
t.shape = { borderRadius: 4, ...t.shape };
fs.writeFileSync(p, JSON.stringify(t, null, 4) + "\n");'
```

In `packages/ui/src/providers/ThemeProvider.tsx`:
- Delete the `ThemeSpacingTokens` interface and its doc comment.
- In `ThemeShapeTokens`, add as the first member:

  ```ts
    /** MUI's base radius: layout props multiply their `borderRadius` by it. */
    borderRadius: number;
  ```

- In `interface Theme`, replace `spacing: ThemeSpacingTokens;` with:

  ```ts
    /** MUI's spacing function: `spacing(2)` = 16. Fractions and negatives allowed. */
    spacing: (n: number) => number;
  ```

- In the `_ThemeTokensInSync` guard, delete the line
  `Exact<ThemeSpacingTokens, typeof themeConfig.spacing>,`.

In `packages/ui/src/providers/createTheme.ts`, replace `spacing: themeConfig.spacing,` with:

```ts
      spacing: (n: number) => n * 8,
```

- [ ] **Step 4: Keep layout token names working until G1**

In `packages/ui/src/components/Layout/tokens.ts`, replace the `SpacingValue` type and `resolveSpacing` with:

```ts
/**
 * The spacing token names layout props still accept. Group G1 moves the
 * layout props to MUI's numbers (multiples of 8) and removes these.
 */
const SPACING_TOKENS = { xs: 0.5, s: 1, m: 2, l: 3, xl: 4 } as const;

/** A spacing token name (`"m"`) or a raw density-independent pixel value. */
export type SpacingValue = keyof typeof SPACING_TOKENS | number;

export const resolveSpacing = (
  theme: Theme,
  value: SpacingValue | undefined,
): number | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === "number") return value;
  return theme.spacing(SPACING_TOKENS[value]);
};
```

- [ ] **Step 5: Write and run the spacing codemod**

Create `<scratchpad>/migrate-spacing.js`:

```js
// Throwaway: theme.spacing.<token> -> theme.spacing(<n>) across the repo.
const fs = require("fs");
const path = require("path");
const STEPS = { xs: "0.5", s: "1", m: "2", l: "3", xl: "4" };
const ROOTS = ["packages/ui/src", "apps/playground", ".design-sync/previews"];
const SKIP = new Set(["node_modules", "dist", ".expo", "generated"]);
const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP.has(e.name)) walk(p, out);
    } else if (/\.(tsx?|mjs)$/.test(e.name)) out.push(p);
  }
  return out;
};
const RE = /\.spacing\.(xs|s|m|l|xl)\b/g;
let files = 0;
for (const file of ROOTS.flatMap((r) => walk(r))) {
  const src = fs.readFileSync(file, "utf8");
  const out = src.replace(RE, (_, k) => `.spacing(${STEPS[k]})`);
  if (out !== src) {
    fs.writeFileSync(file, out);
    files += 1;
  }
}
console.log(`rewrote ${files} files`);
```

Run: `node <scratchpad>/migrate-spacing.js`
Expected: `rewrote N files`, where N is roughly 50.

Run: `grep -rnE "\.spacing\.(xs|s|m|l|xl)\b" packages/ui/src apps/playground .design-sync/previews --include=*.ts --include=*.tsx | grep -v node_modules`
Expected: no output.

- [ ] **Step 6: Rewrite the two pages that enumerate spacing**

In `apps/playground/app/theming.tsx`, replace the whole Spacing `<Section>` (title "Spacing") with:

```tsx
      <Section
        title="Spacing"
        description="theme.spacing(n) is 8 × n, as in MUI. These are the steps the library itself uses; fractions and negatives work too."
      >
        <View style={styles.tokenRow}>
          {SPACING_STEPS.map((step) => {
            const value = theme.spacing(step);
            return (
              <View key={step} style={styles.tokenChip}>
                <View
                  style={[styles.spacingBar, { width: value, height: value }]}
                />
                <Typography
                  variant="caption"
                  style={{ color: theme.colors.onSurface }}
                >
                  spacing({step})
                </Typography>
                <Typography
                  variant="caption"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {value}dp
                </Typography>
              </View>
            );
          })}
        </View>
      </Section>
```

and add, next to `TYPE_SCALE`:

```ts
/** The spacing steps the library's own components use. */
const SPACING_STEPS = [0.5, 1, 2, 3, 4];
```

In `.design-sync/previews/ThemeProvider.tsx`, in `SpacingAndShape`, replace `const { colors, spacing, shape } = theme;` with `const { colors, shape } = theme;`. Then replace the spacing block (from the `<Typography variant=…>Spacing</Typography>` heading's `lines` div through the closing `</div>` of the `["xs", "s", "m", "l", "xl"]` map) with:

```tsx
      <div style={lines}>
        <Typography variant="subtitle1">Spacing</Typography>
        <Typography variant="caption">
          theme.spacing(n) is 8 × n, as in MUI — the steps below are the ones
          the library itself uses.
        </Typography>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[0.5, 1, 2, 3, 4].map((step) => (
          <div
            key={step}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <div style={{ width: 120 }}>
              <Typography
                variant="caption"
                style={{ color: colors.onSurfaceVariant }}
              >
                spacing({step}) · {theme.spacing(step)}px
              </Typography>
            </div>
            <div
              style={{
                width: theme.spacing(step) * 6,
                height: 12,
                borderRadius: 6,
                background: colors.primary,
              }}
            />
          </div>
        ))}
      </div>
```

- [ ] **Step 7: Run the test and every gate**

Run: `npm test -w @its/solaris-ui -- createTheme`
Expected: PASS.

Run: `npm run lint && npm run type-check && npm test`
Expected: PASS. Use `npx eslint --fix` for Prettier wraps on rewritten lines.

- [ ] **Step 8: Checkpoint (no commit)**

Run: `git status --short | wc -l`. Do not commit.

---

### Task 3: Palette-path colour resolver

**Files:**
- Modify: `packages/ui/src/components/Layout/tokens.ts` (`ColorValue`, `resolveColor`)
- Test: create `packages/ui/src/__tests__/color-paths.test.ts`

**Interfaces:**
- Produces: `resolveColor(theme: Theme, value: ColorValue | undefined): string | undefined`, following the Global Constraints order. `ColorValue = keyof Theme["colors"] | (string & {})`. Box keeps calling it; Typography (Task 4) and Icon (Task 5) use it too.

- [ ] **Step 1: Write the failing test**

Create `packages/ui/src/__tests__/color-paths.test.ts`:

```ts
import { createTheme } from "../index";
import { resolveColor } from "../components/Layout/tokens";

const theme = createTheme().light;

describe("resolveColor", () => {
  it("reads a dotted path into the MUI palette", () => {
    expect(resolveColor(theme, "text.secondary")).toBe("#64748B");
    expect(resolveColor(theme, "primary.main")).toBe("#1D5B9D");
    expect(resolveColor(theme, "background.paper")).toBe("#FFFFFF");
  });

  it("reads a palette colour name as its main", () => {
    expect(resolveColor(theme, "primary")).toBe("#1D5B9D");
    expect(resolveColor(theme, "secondary")).toBe("#61B340");
  });

  it("reads a palette leaf that is itself a colour", () => {
    expect(resolveColor(theme, "divider")).toBe("rgba(0, 0, 0, 0.12)");
  });

  it("still reads a Material 3 role", () => {
    expect(resolveColor(theme, "primaryContainer")).toBe(
      theme.colors.primaryContainer,
    );
  });

  it("passes a raw colour through, even one with dots in it", () => {
    expect(resolveColor(theme, "#123456")).toBe("#123456");
    expect(resolveColor(theme, "rgba(0, 0, 0, 0.5)")).toBe("rgba(0, 0, 0, 0.5)");
    expect(resolveColor(theme, undefined)).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -w @its/solaris-ui -- color-paths`
Expected: FAIL. `"text.secondary"` comes back as the literal string.

- [ ] **Step 3: Implement**

In `packages/ui/src/components/Layout/tokens.ts`, replace the `ColorValue` doc comment and `resolveColor` with:

```ts
/**
 * A colour the way MUI code writes it: a palette path (`"text.secondary"`),
 * a palette name (`"primary"`), a Material 3 role (`"primaryContainer"`) or
 * any raw colour string.
 */
export type ColorValue = keyof Theme["colors"] | (string & {});

const lookup = (node: unknown, key: string): unknown =>
  node !== null && typeof node === "object"
    ? (node as Record<string, unknown>)[key]
    : undefined;

/**
 * Resolves a colour against the active theme: palette path, then palette
 * name (its `main`, or the leaf itself when it is a colour, like `divider`),
 * then Material 3 role. Anything else is a raw colour and passes through.
 */
export const resolveColor = (
  theme: Theme,
  value: ColorValue | undefined,
): string | undefined => {
  if (value === undefined) return undefined;
  if (value.includes(".")) {
    const found = value.split(".").reduce<unknown>(lookup, theme.palette);
    if (typeof found === "string") return found;
  }
  const named = lookup(theme.palette, value);
  if (typeof named === "string") return named;
  const main = lookup(named, "main");
  if (typeof main === "string") return main;
  return (lookup(theme.colors, value) as string | undefined) ?? value;
};
```

- [ ] **Step 4: Run the tests**

Run: `npm test -w @its/solaris-ui -- color-paths`
Expected: PASS, 5 tests.

Run: `npm run lint && npm run type-check && npm test -w @its/solaris-ui`
Expected: PASS.

- [ ] **Step 5: Checkpoint (no commit)**

Run: `git status --short packages/ui`. Do not commit.

---

### Task 4: Typography on MUI's API

**Files:**
- Modify: `packages/ui/src/components/Typography.tsx`
- Modify: `apps/playground/catalogue/registry/foundations.ts` (Typography props)
- Test: create `packages/ui/src/__tests__/typography.test.tsx`

**Interfaces:**
- Consumes: `resolveColor` (Task 3); `TypographyVariant` (Task 1).
- Produces: `TypographyProps extends TextProps { children; variant?: TypographyVariant = "body1"; color?: string = "text.primary"; align?: "left" | "center" | "right" | "justify"; noWrap?: boolean = false; gutterBottom?: boolean = false }`.

- [ ] **Step 1: Write the failing test**

Create `packages/ui/src/__tests__/typography.test.tsx`:

```tsx
import React from "react";
import { StyleSheet, type TextStyle } from "react-native";
import { render } from "@testing-library/react-native";

import { createTheme, ThemeProvider, Typography } from "../index";

const theme = createTheme().light;
const flat = (node: { props: { style?: unknown } }) =>
  StyleSheet.flatten(node.props.style as TextStyle);

const renderText = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe("Typography", () => {
  it("defaults to body1 in the primary text colour", async () => {
    const { getByText } = await renderText(<Typography>Hi</Typography>);
    const style = flat(getByText("Hi"));
    expect(style.fontSize).toBe(16);
    expect(style.color).toBe(theme.palette.text.primary);
  });

  it("takes a palette path as its colour", async () => {
    const { getByText } = await renderText(
      <Typography color="text.secondary">Muted</Typography>,
    );
    expect(flat(getByText("Muted")).color).toBe("#64748B");
  });

  it("sets button text in uppercase", async () => {
    const { getByText } = await renderText(
      <Typography variant="button">Save</Typography>,
    );
    expect(flat(getByText("Save")).textTransform).toBe("uppercase");
  });

  it("aligns, adds a bottom gutter and truncates on noWrap", async () => {
    const { getByText } = await renderText(
      <Typography align="center" gutterBottom noWrap>
        Long
      </Typography>,
    );
    const node = getByText("Long");
    const style = flat(node);
    expect(style.textAlign).toBe("center");
    expect(style.marginBottom).toBeCloseTo(0.35 * 16);
    expect(node.props.numberOfLines).toBe(1);
    expect(node.props.ellipsizeMode).toBe("tail");
  });

  it("keeps the caller's numberOfLines when noWrap is off", async () => {
    const { getByText } = await renderText(
      <Typography numberOfLines={3}>Para</Typography>,
    );
    expect(getByText("Para").props.numberOfLines).toBe(3);
  });

  it("lets style override the colour", async () => {
    const { getByText } = await renderText(
      <Typography color="primary" style={{ color: "#010203" }}>
        Override
      </Typography>,
    );
    expect(flat(getByText("Override")).color).toBe("#010203");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -w @its/solaris-ui -- typography`
Expected: FAIL. `color="text.secondary"` is ignored (the colour stays `onSurface`), and `textAlign` and `marginBottom` are undefined.

- [ ] **Step 3: Implement**

Replace `packages/ui/src/components/Typography.tsx` with:

```tsx
import React from "react";
import { Text, type TextProps } from "react-native";

import {
  useTheme,
  type TypographyVariant,
} from "../providers/ThemeProvider";
import { resolveColor } from "./Layout/tokens";

export interface TypographyProps extends TextProps {
  children: React.ReactNode;
  /** MUI type-scale step. Defaults to `"body1"`. */
  variant?: TypographyVariant;
  /**
   * A palette name (`"primary"`), a palette path (`"text.secondary"`), a
   * Material 3 role or any raw colour. Defaults to `"text.primary"`.
   */
  color?: string;
  align?: "left" | "center" | "right" | "justify";
  /** One line, truncated with an ellipsis. */
  noWrap?: boolean;
  /** Adds MUI's 0.35em bottom margin. */
  gutterBottom?: boolean;
}

/**
 * Text in one of MUI's type-scale steps. Every other `Text` prop —
 * `numberOfLines`, `selectable`, `accessibilityRole`, `testID` — is forwarded.
 */
const Typography = ({
  children,
  variant = "body1",
  color = "text.primary",
  align,
  noWrap = false,
  gutterBottom = false,
  numberOfLines,
  ellipsizeMode,
  style,
  ...rest
}: TypographyProps) => {
  const { theme } = useTheme();
  const scale = theme.typography[variant];

  return (
    <Text
      {...rest}
      numberOfLines={noWrap ? 1 : numberOfLines}
      ellipsizeMode={noWrap ? "tail" : ellipsizeMode}
      style={[
        scale,
        { color: resolveColor(theme, color) },
        align ? { textAlign: align } : null,
        gutterBottom ? { marginBottom: 0.35 * (scale.fontSize ?? 16) } : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export default Typography;
```

- [ ] **Step 4: Add the new controls to the docs page**

In `apps/playground/catalogue/registry/foundations.ts`, in the Typography `props`, after `variant: {…}`, add:

```ts
      color: { type: "text", default: "text.primary", label: "Color" },
      align: {
        type: "select",
        default: "left",
        label: "Align",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
          { label: "Justify", value: "justify" },
        ],
      },
      noWrap: { type: "boolean", default: false, label: "No wrap" },
      gutterBottom: { type: "boolean", default: false, label: "Gutter bottom" },
```

- [ ] **Step 5: Run the tests and gates**

Run: `npm test -w @its/solaris-ui -- typography`
Expected: PASS, 6 tests.

Run: `npm run lint && npm run type-check && npm test`
Expected: PASS, including the playground catalogue test (it renders the Typography demo with the new defaults).

- [ ] **Step 6: Checkpoint (no commit)**

Run: `git status --short packages/ui apps/playground/catalogue`. Do not commit.

---

### Task 5: Icon on MUI's API

**Files:**
- Modify: `packages/ui/src/components/Icon.tsx`
- Modify: `packages/ui/src/components/ButtonGroup.tsx:140`, `Modal/Modal.tsx:166`, `NavigationDrawer.tsx:74`, `NavigationRail.tsx:102-110`, `SplitButton.tsx:90-95,122`
- Modify: `apps/playground/catalogue/registry/foundations.ts` (Icon props), `apps/playground/catalogue/ComponentPreview.tsx:801-804`, `apps/playground/catalogue/variants/manual/Icon.tsx`, `.design-sync/previews/Icon.tsx`, `.design-sync/previews/ListItem.tsx`
- Test: `packages/ui/src/__tests__/ui-primitives.test.tsx` (the `describe("Icon")` block)

**Interfaces:**
- Consumes: `resolveColor` (Task 3).
- Produces: `IconProps { children?: string; source?: ImageSourcePropType | ((p: IconRenderProps) => React.ReactNode) | React.ReactElement; fontSize?: "small" | "medium" | "large" | number = "medium"; color?: string; flipForRTL?; style?; testID? }`. The exported `IconSource` type stays unchanged for Modal and ConfirmDialog until G6.

- [ ] **Step 1: Write the failing tests**

In `packages/ui/src/__tests__/ui-primitives.test.tsx`, replace the whole `describe("Icon", …)` block with:

```tsx
describe("Icon", () => {
  const glyphOf = (node: { props: { children?: unknown } }) =>
    String(node.props.children);

  it("renders the glyph named by its children", async () => {
    const { getByTestId } = await wrap(
      <>
        <Icon testID="plus">plus</Icon>
        <Icon testID="minus">minus</Icon>
      </>,
    );
    expect(glyphOf(getByTestId("plus"))).not.toBe("");
    expect(glyphOf(getByTestId("plus"))).not.toBe(glyphOf(getByTestId("minus")));
  });

  it("sizes by MUI's fontSize names and colours by palette name", async () => {
    const palette = createTheme().light.palette;
    const { getByTestId } = await wrap(
      <>
        <Icon testID="small" fontSize="small" color="primary">
          plus
        </Icon>
        <Icon testID="large" fontSize="large">
          plus
        </Icon>
        <Icon testID="raw" fontSize={18}>
          plus
        </Icon>
      </>,
    );
    const style = (id: string) =>
      StyleSheet.flatten(getByTestId(id).props.style as ViewStyle & { fontSize?: number; color?: string });
    expect(style("small").fontSize).toBe(20);
    expect(style("small").color).toBe(palette.primary.main);
    expect(style("large").fontSize).toBe(35);
    expect(style("raw").fontSize).toBe(18);
  });

  it("renders an unknown glyph name without throwing", async () => {
    const { toJSON } = await wrap(<Icon>not-a-glyph</Icon>);
    expect(toJSON()).toBeTruthy();
  });

  it("renders a render-function source with the resolved size and colour", async () => {
    const spy = jest.fn(() => <View testID="custom-glyph" />);
    const { getByTestId } = await wrap(
      <Icon source={spy} fontSize={32} color="#123456" />,
    );

    expect(getByTestId("custom-glyph")).toBeTruthy();
    expect(spy).toHaveBeenCalledWith({ size: 32, color: "#123456" });
  });

  it("renders a bitmap source as an image", async () => {
    const { getByTestId } = await wrap(
      <Icon source={{ uri: "https://example.test/a.png" }} testID="bitmap" />,
    );
    expect(getByTestId("bitmap")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm test -w @its/solaris-ui -- ui-primitives -t "Icon"`
Expected: FAIL. `fontSize` and `children` are not props yet, so the glyph and size assertions fail.

- [ ] **Step 3: Implement**

In `packages/ui/src/components/Icon.tsx`:

1. Add the import `import { resolveColor } from "./Layout/tokens";`.
2. Replace `export interface IconProps { … }` with:

   ```ts
   const FONT_SIZES = { small: 20, medium: 24, large: 35 } as const;

   export interface IconProps {
     /** A MaterialCommunityIcons glyph name, as MUI's Icon takes its ligature: `<Icon>plus</Icon>`. */
     children?: string;
     /** A bitmap, a render function or a ready-made element, when the icon is not a glyph. */
     source?:
       | ImageSourcePropType
       | ((props: IconRenderProps) => React.ReactNode)
       | React.ReactElement;
     /** MUI's sizes: small 20, medium 24, large 35 — or any number. */
     fontSize?: keyof typeof FONT_SIZES | number;
     /** A palette name, a palette path, a Material 3 role or any raw colour. */
     color?: string;
     /** Mirror the glyph when the layout direction is RTL (arrows, chevrons). */
     flipForRTL?: boolean;
     style?: StyleProp<ImageStyle>;
     testID?: string;
   }
   ```

3. Replace the doc comment's examples with:

   ```
    * <Icon>camera</Icon>
    * <Icon fontSize="large" color="primary">camera</Icon>
    * <Icon source={require("./logo.png")} />
    * <Icon source={({ size, color }) => <MySvg width={size} fill={color} />} />
   ```

4. Replace the component's parameter list and its first lines with:

   ```tsx
   const Icon = ({
     children,
     source,
     fontSize = "medium",
     color,
     flipForRTL = false,
     style,
     testID,
   }: IconProps) => {
     const { theme } = useTheme();
     const size = typeof fontSize === "number" ? fontSize : FONT_SIZES[fontSize];
     const tint = resolveColor(theme, color) ?? theme.colors.onSurface;
   ```

5. Keep the `transform` memo. Then, before the `typeof source === "function"` branch, add:

   ```tsx
     if (children !== undefined) {
       return (
         <Icons
           testID={testID}
           name={children as MaterialCommunityIconsGlyphs}
           size={size}
           color={tint}
           style={[transform ? { transform } : null, style as StyleProp<ImageStyle>]}
         />
       );
     }
   ```

6. In the image branch, change `tintColor={color}` to `tintColor={color ? tint : undefined}`.
7. Replace the final glyph branch (the `return (<Icons … name={source} … />)` at the end) with `return null;`. A glyph now arrives only as `children`.

- [ ] **Step 4: Move the library's own Icon calls**

- `components/ButtonGroup.tsx` line ~140:
  `<Icon source={option.icon} size={20} color={colors.on} />` → `<Icon fontSize={20} color={colors.on}>{option.icon}</Icon>`
- `components/NavigationDrawer.tsx` line ~74:
  `<Icon source={glyph} size={24} color={content} />` → `<Icon fontSize={24} color={content}>{glyph}</Icon>`
- `components/NavigationRail.tsx` line ~102: in the multi-line `<Icon source={icon} size={24} color={…} />`, change `source={icon}` → remove it, `size={24}` → `fontSize={24}`, and make it a non-self-closing element with `{icon}` as its child:

  ```tsx
                      <Icon
                        fontSize={24}
                        color={
                          active
                            ? theme.colors.onPrimaryContainer
                            : theme.colors.onSurfaceVariant
                        }
                      >
                        {icon}
                      </Icon>
  ```

- `components/SplitButton.tsx` line ~90:

  ```tsx
        <Icon
          fontSize={20}
          color={colors.on}
          style={open ? styles.flipped : undefined}
        >
          chevron-down
        </Icon>
  ```

  and line ~122: `{iconName && <Icon source={iconName} size={20} color={colors.on} />}` → `{iconName && <Icon fontSize={20} color={colors.on}>{iconName}</Icon>}`
- `components/Modal/Modal.tsx` line ~166 (`icon` is still an `IconSource` until G6):

  ```tsx
              {typeof icon === "string" ? (
                <Icon fontSize={24} color={theme.colors.primary}>
                  {icon}
                </Icon>
              ) : (
                <Icon source={icon} fontSize={24} color={theme.colors.primary} />
              )}
  ```

Run: `grep -rn "<Icon[^s]*source=\"\|size={" packages/ui/src/components --include=*.tsx | grep "<Icon"`
Expected: no `<Icon … size=` and no glyph-string `source=` left.

- [ ] **Step 5: Move the docs site and previews**

In `apps/playground/catalogue/registry/foundations.ts`, replace the Icon `props` with:

```ts
    props: {
      children: { type: "text", default: "camera", label: "Glyph" },
      fontSize: {
        type: "select",
        default: "large",
        label: "Font size",
        options: [
          { label: "Small (20)", value: "small" },
          { label: "Medium (24)", value: "medium" },
          { label: "Large (35)", value: "large" },
        ],
      },
      color: { type: "text", default: "text.primary", label: "Color" },
      flipForRTL: { type: "boolean", default: false, label: "Flip for RTL" },
    },
```

In `apps/playground/catalogue/ComponentPreview.tsx`, delete the line `props.size = Number(props.size) || 24;` inside the `if (selectedComponentName === "Icon")` branch.

In `apps/playground/catalogue/variants/manual/Icon.tsx`, `.design-sync/previews/Icon.tsx` and `.design-sync/previews/ListItem.tsx`:

```bash
cd /c/dev/Solaris-ui
for f in apps/playground/catalogue/variants/manual/Icon.tsx .design-sync/previews/Icon.tsx .design-sync/previews/ListItem.tsx; do
  sed -i -E \
    -e 's#<Icon source="([^"]+)" size=\{([^}]+)\}( color="[^"]+")? />#<Icon fontSize={\2}\3>\1</Icon>#g' \
    -e 's#<Icon source=\{name\} size=\{28\} />#<Icon fontSize={28}>{name}</Icon>#g' \
    -e 's#^(\s*)size=\{32\}$#\1fontSize={32}#' \
    "$f"
done
grep -n "<Icon" apps/playground/catalogue/variants/manual/Icon.tsx .design-sync/previews/Icon.tsx .design-sync/previews/ListItem.tsx | grep "size=\|source=\""
```

Expected: no output from the grep. The render-function `source={({ size, color }) => …}` blocks stay; only their `size={32}` became `fontSize={32}`. If the Icon page's text still describes `source="camera"`, rewrite those sentences to `<Icon>camera</Icon>`.

Then regenerate the galleries that come from the previews:

Run: `npm run variants -w @its/solaris-playground`
Expected: exit 0.

- [ ] **Step 6: Run the tests and gates**

Run: `npm test -w @its/solaris-ui -- ui-primitives -t "Icon"`
Expected: PASS, 5 tests.

Run: `npm run lint && npm run type-check && npm test`
Expected: PASS.

- [ ] **Step 7: Checkpoint (no commit)**

Run: `git status --short`. Do not commit.

---

### Task 6: Docs, fonts, generated files, whole-group verification

**Files:**
- Modify: `apps/playground/app/+html.tsx` (Roboto 300)
- Modify: `packages/ui/src/components/components.md` (§1.3, §1.4, Typography and Icon sections), `.design-sync/conventions.md` (token table, code samples), `packages/ui/README.md` (theme tokens, Typography and Icon reference), `packages/ui/CLAUDE.md` (the guard sentence)
- Regenerate: `apps/playground/docgen/props.generated.json`, `apps/playground/catalogue/variants/generated/*`

- [ ] **Step 1: Load the light weight on web**

In `apps/playground/app/+html.tsx`, change `family=Roboto:wght@400;500;700` to `family=Roboto:wght@300;400;500;700`. MUI's h1 and h2 use weight 300.

- [ ] **Step 2: Find every doc that still names the old tokens**

Run: `grep -rnE "(display|headline|title|body|label)(Large|Medium|Small)|spacing\.(xs|s|m|l|xl)\b|xs:4|extraLarge:24 full|source=\"camera\"" packages/ui/README.md packages/ui/CLAUDE.md packages/ui/src/components/components.md .design-sync/conventions.md .design-sync/split-docs.mjs`

Rewrite each hit:
- **Type-scale tables** (`components.md` §1.3, the conventions token table, the README "Type scale" bullet and the Typography reference rows) become the 13 MUI steps with the Global Constraints values.
- **Spacing mentions** become `theme.spacing(n)` = 8 × n (`components.md` §1.4, the conventions table, the README "Spacing" bullet).
- **Shape lists** gain `borderRadius: 4`.
- **Code samples:** `theme.spacing.m` → `theme.spacing(2)` and so on, using the token map.
- **Typography reference:** the `variant` default becomes `body1`, and `color`, `align`, `noWrap` and `gutterBottom` are documented.
- **Icon reference:** `<Icon>name</Icon>`, `fontSize` small/medium/large/number, `source` for images and render functions.
- **`packages/ui/CLAUDE.md`:** "fails `npm run type-check` if typography, spacing or shape drift" becomes "if typography or shape drift"; spacing is now a function.

Re-run the grep. Expected: no hit, except deliberate historical mentions (none expected).

- [ ] **Step 3: Regenerate the generated files**

Run: `npm run docgen -w @its/solaris-playground && npm run variants -w @its/solaris-playground`
Expected: exit 0.

- [ ] **Step 4: Every gate**

Run: `npm run lint && npm run type-check && npm test && npm run build && npm run validate-package -w @its/solaris-ui && npm run export:web -w @its/solaris-playground`
Expected: all pass.

- [ ] **Step 5: Visual check**

Serve `apps/playground/dist` and open three pages, in light and dark:
- `/theming`: the type scale shows h1 at 96 in weight 300, and BUTTON / OVERLINE in uppercase; the spacing chips read `spacing(0.5)` … `spacing(4)`.
- `/components/Button`: the label is UPPERCASE.
- `/components/Icon`: the default demo shows the camera glyph at 35.

Serve it with the scratchpad static server used for sub-project 1, or with `npx serve`. Port 8081 may be taken by the user's own Expo server; don't stop it. Confirm the screenshots look as described.

- [ ] **Step 6: Final checkpoint (no commit)**

Run: `git status --short | wc -l` and `git diff --stat | tail -1`. Report both numbers. Do not commit.
