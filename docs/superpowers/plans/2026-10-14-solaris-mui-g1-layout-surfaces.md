# Solaris MUI API — G1 Layout and Surfaces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Revised 2026-10-14 for roadmap v2** (`docs/superpowers/specs/2026-10-14-solaris-roadmap-v2-design.md`):
> HStack, VStack, Center, Spacer and AspectRatio are parked; Image and TouchableRipple are
> internal (Image keeps its `radius` prop, TouchableRipple keeps its name, no ButtonBase);
> Toolbar is parked. The tasks below are already trimmed; where a step still names one of
> these, skip that part.

**Goal:** Give the layout primitives (Box, Stack, Grid) and the surfaces (Paper, Divider, Card,
Skeleton) MUI's API: spacing props in multiples of 8, MUI's flex prop names, `bgcolor` / `border`
/ `borderRadius` × 4, the fraction rule for sizes, MUI's Divider / Paper / Card / Skeleton values,
and the renames CardTitle → CardHeader, CardCover → CardMedia.

**Architecture:** One resolver file (`components/Layout/tokens.ts`) turns MUI numbers into
React Native values (`theme.spacing(n)`, `n × shape.borderRadius`, `0.5` → `"50%"`). Every layout
primitive is a thin `Box` wrapper, so the change lands in `Box` and the wrappers only rename
props. Surfaces change their props in place (Approach A: no aliases, no compatibility layer).
Each task also moves every call site of the components it touches (library, docs site, previews),
so the repo type-checks after every task.

**Tech Stack:** TypeScript, React Native + react-native-web (Expo), jest-expo with RNTL 14
(`await render`, `await fireEvent`), Node scripts for the codemods.

**Spec:** `docs/superpowers/specs/2026-10-12-solaris-mui-api-design.md`: Part A (rules 1–12),
Part C "G1 — Layout and surfaces", Part D (how a group lands).

## Global Constraints

- Spacing props are numbers × 8 (`p={2}` = 16); tokens (`"xs"`…`"xl"`) are removed. Margins also take `"auto"`; negatives are allowed.
- `width` / `height`: a number in (0, 1] is a percentage (`0.5` = `"50%"`, `1` = `"100%"`); any other number is dp; strings pass through.
- `borderRadius` on layout props and Image is × `theme.shape.borderRadius` (4): `borderRadius={2}` = 8.
- Colours (`bgcolor`, `borderColor`) go through `resolveColor` (palette path, palette name, M3 role, raw).
- Every `onPress` becomes `onClick` (no alias); `onLongPress`, `onPressIn`, `onPressOut`, `onFocus`, `onBlur` stay.
- Every `style?: object` becomes `style?: StyleProp<ViewStyle>`.
- No new behaviour (rule 10): Grid keeps `columns` / `minChildWidth`; MUI's 12-column grid and breakpoints are **not** in G1 (the roadmap row in `2026-10-13-solaris-theme-proposals.md` that lists them is superseded by the spec's Grid row).
- Defaults change where the spec says so: Stack / Grid `spacing` = 0, Paper `elevation` = 3, Card `variant` = `"elevation"`, Skeleton `variant` = `"text"`.
- Renamed components keep **no** old export. Their docs pages move with the name (`/components/CardHeader`, `/components/CardMedia`).
- Generated files (`docgen/props.generated.json`, `catalogue/variants/generated/*`) are never hand-edited: run `npm run docgen -w @its/solaris-playground` and `npm run variants -w @its/solaris-playground`.
- JSX text with quotes or apostrophes is wrapped in `{"..."}`. Scripts with regexes go in a file (Git Bash mangles inline backslashes).
- No commits: every task ends with a `git status` checkpoint (the user commits).

## Review Focus

- **`width={1}` / `height={1}`** is now 100%, not 1 dp; `width={0}` stays 0. Test: Task 1 "reads a width in (0, 1] as a fraction".
- **Fractional, negative and `"auto"` spacing** (`p={0.5}` = 4, `mt={-1}` = −8, `mx="auto"`). Test: Task 1 "multiplies spacing props by 8".
- **Calls that relied on the old `spacing="s"` default** collapse to 0 unless given `spacing={1}`; the Task 1 codemod adds it to every Stack/Grid call without `spacing`. Test: Task 1 "has no gap by default" pins the new default; the browser check (Task 4) catches a missed call.
- **Paper elevation outside 0–24 or fractional** (`-1`, `30`, `2.5`) clamps to a level instead of rendering no surface. Test: Task 3 "maps MUI's 0–24 elevation onto five levels".
- **A labelled Divider with `variant="inset"` / `"middle"`** puts the margins on the rule segments, not on the full-width container (which would overflow, as the comment in `Divider.tsx` records). Test: Task 3 "puts the variant margins on the rule, not on a labelled container".

---

### Task 1: Layout primitives (Box, Stack, Grid)

**Files:**
- Modify: `packages/ui/src/components/Layout/tokens.ts`, `Box.tsx`, `Stack.tsx`, `Grid.tsx`
- Modify: `packages/ui/src/providers/ThemeProvider.tsx` (the `borderRadius` doc comment only, if it needs wording)
- Modify: `apps/playground/catalogue/registry/layout.ts`, `apps/playground/app/getting-started.tsx` (the `<Stack p="m" spacing="s">` sample), `packages/ui/README.md` (the two `<Box p="m" … radius="large">` samples)
- Modify (codemod): every `.design-sync/previews/*.tsx` that uses a layout primitive
- Test: `packages/ui/src/__tests__/layout.test.tsx` (new)

**Interfaces:**
- Produces (`components/Layout/tokens.ts`, re-exported by the barrel):
  - `type SpacingValue = number`, `type MarginValue = number | "auto"`
  - `resolveSpacing(theme: Theme, value: MarginValue | undefined): number | "auto" | undefined`
  - `resolveSize(value: DimensionValue | undefined): DimensionValue | undefined`
  - `ColorValue`, `resolveColor` unchanged. **Removed:** `SPACING_TOKENS` (spacing tokens). `RadiusValue` and `resolveRadius` stay for the internal Image; they are not used by layout props any more.
- Produces (`Box.tsx`): `BoxProps extends ViewProps` with `p px py pt pr pb pl?: number`, `m mx my mt mr mb ml?: MarginValue`, `gap rowGap columnGap?: number`, `flexDirection?: ViewStyle["flexDirection"]`, `flexWrap?: ViewStyle["flexWrap"]`, `alignItems?`, `justifyContent?`, `flex?: number`, `width? height?: DimensionValue`, `bgcolor?: ColorValue`, `border?: number`, `borderColor?: ColorValue`, `borderRadius?: number`.
- Produces: `StackProps = Omit<BoxProps, "flexDirection" | "gap"> & { direction?: "row" | "row-reverse" | "column" | "column-reverse"; spacing?: number }`; `GridProps = Omit<BoxProps, "flexDirection" | "flexWrap" | "gap" | "rowGap" | "columnGap"> & { columns?; minChildWidth?; spacing?: number }`. (`RadiusValue` / `resolveRadius` stay, used by the internal Image.)

- [ ] **Step 1: Write the failing tests** in `packages/ui/src/__tests__/layout.test.tsx`:

```tsx
import React from "react";
import { StyleSheet, Text, type ViewStyle } from "react-native";
import { render } from "@testing-library/react-native";
import { Box, createTheme, Grid, Stack, ThemeProvider } from "../index";

const wrap = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

const styleOf = (node: { props: { style?: unknown } }) =>
  StyleSheet.flatten(node.props.style as ViewStyle) ?? {};

describe("Box", () => {
  it("multiplies spacing props by 8", async () => {
    const { getByTestId } = await wrap(
      <Box testID="b" p={2} mx={1} mt={-1} mb="auto" gap={0.5} rowGap={3} />,
    );
    expect(styleOf(getByTestId("b"))).toMatchObject({
      padding: 16,
      marginHorizontal: 8,
      marginTop: -8,
      marginBottom: "auto",
      gap: 4,
      rowGap: 24,
    });
  });

  it("reads a width in (0, 1] as a fraction", async () => {
    const { getByTestId } = await wrap(
      <>
        <Box testID="half" width={0.5} height={0.25} />
        <Box testID="full" width={1} />
        <Box testID="px" width={360} height={0} />
        <Box testID="str" width="80%" />
      </>,
    );
    expect(styleOf(getByTestId("half"))).toMatchObject({ width: "50%", height: "25%" });
    expect(styleOf(getByTestId("full")).width).toBe("100%");
    expect(styleOf(getByTestId("px"))).toMatchObject({ width: 360, height: 0 });
    expect(styleOf(getByTestId("str")).width).toBe("80%");
  });

  it("multiplies borderRadius by shape.borderRadius and takes MUI's names", async () => {
    const { getByTestId } = await wrap(
      <Box
        testID="b"
        borderRadius={2}
        border={1}
        borderColor="divider"
        bgcolor="primary.main"
        flexDirection="row"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
      />,
    );
    const { palette } = createTheme().light;
    expect(styleOf(getByTestId("b"))).toMatchObject({
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.divider,
      backgroundColor: palette.primary.main,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
    });
  });
});

describe("Stack", () => {
  it("has no gap by default and stacks as a column", async () => {
    const { getByTestId } = await wrap(<Stack testID="s" />);
    const style = styleOf(getByTestId("s"));
    expect(style.gap ?? 0).toBe(0);
    expect(style.flexDirection).toBe("column");
  });

  it("spaces children by spacing × 8 along MUI's directions", async () => {
    const { getByTestId } = await wrap(
      <Stack testID="s" spacing={2} direction="row-reverse" />,
    );
    expect(styleOf(getByTestId("s"))).toMatchObject({
      gap: 16,
      flexDirection: "row-reverse",
    });
  });

});

describe("Grid", () => {
  it("gaps a Grid by spacing × 8, 0 by default", async () => {
    const { getByTestId } = await wrap(
      <>
        <Grid testID="g" spacing={2}>
          <Text>a</Text>
        </Grid>
        <Grid testID="z">
          <Text>b</Text>
        </Grid>
      </>,
    );
    expect(styleOf(getByTestId("g")).gap).toBe(16);
    expect(styleOf(getByTestId("z")).gap).toBe(0);
  });
});
```

- [ ] **Step 2: Run** `npm test -w @its/solaris-ui -- layout`. Expected: FAIL. Jest does not type-check, so the failures are the assertions: `padding` is the raw `2`, `width` is `0.5`, `borderRadius` and `backgroundColor` are missing, and Stack's default `gap` is 8.

- [ ] **Step 3: Implement `tokens.ts`.** Replace the spacing/radius half of the file with:

```ts
import type { DimensionValue } from "react-native";
import { Theme } from "../../providers/ThemeProvider";

/** A spacing amount in MUI's unit: `2` is `theme.spacing(2)`, 16 dp. */
export type SpacingValue = number;

/** A margin: a spacing amount, or `"auto"`. */
export type MarginValue = SpacingValue | "auto";

/** (ColorValue unchanged.) */

export const resolveSpacing = (
  theme: Theme,
  value: MarginValue | undefined,
): number | "auto" | undefined =>
  value === undefined || value === "auto" ? value : theme.spacing(value);

/** MUI's sizing rule: a number in (0, 1] is a fraction of the parent. */
export const resolveSize = (
  value: DimensionValue | undefined,
): DimensionValue | undefined =>
  typeof value === "number" && value > 0 && value <= 1
    ? `${value * 100}%`
    : value;
```

Keep `lookup`, `ColorValue` and `resolveColor` as they are.

- [ ] **Step 4: Implement `Box.tsx`** with the Interfaces props. The style object becomes:

```ts
const space = (value: MarginValue | undefined) => resolveSpacing(theme, value);
return {
  padding: space(p),
  paddingHorizontal: space(px),
  paddingVertical: space(py),
  paddingTop: space(pt),
  paddingRight: space(pr),
  paddingBottom: space(pb),
  paddingLeft: space(pl),
  margin: space(m),
  marginHorizontal: space(mx),
  marginVertical: space(my),
  marginTop: space(mt),
  marginRight: space(mr),
  marginBottom: space(mb),
  marginLeft: space(ml),
  gap: space(gap),
  rowGap: space(rowGap),
  columnGap: space(columnGap),
  backgroundColor: resolveColor(theme, bgcolor),
  borderRadius:
    borderRadius === undefined ? undefined : borderRadius * theme.shape.borderRadius,
  borderWidth: border,
  borderColor: resolveColor(theme, borderColor),
  flex,
  flexDirection,
  flexWrap,
  alignItems,
  justifyContent,
  width: resolveSize(width),
  height: resolveSize(height),
} as ViewStyle;
```

Update the destructuring, the `useMemo` dependency list and the JSDoc on each prop (`/** Padding on every edge, × 8 (MUI's spacing unit). */`, `/** Corner radius × theme.shape.borderRadius (4): 2 is 8 dp. */`, `/** A number in (0, 1] is a percentage of the parent. */`).

- [ ] **Step 5: Implement the wrappers.**
  - `Stack.tsx`: `direction = "column"`, `spacing = 0`, renders `<Box {...boxProps} gap={spacing} flexDirection={direction} style={style}>`. Drop the `reverse` prop.
  - `Grid.tsx`: `spacing = 0`, `const gap = theme.spacing(spacing)`, props per Interfaces; JSDoc on `columns` adds: "A fixed column count, not MUI's 12-column model."
- [ ] **Step 6: Run** `npm test -w @its/solaris-ui -- layout`. Expected: PASS.

- [ ] **Step 7: Migrate the previews with a codemod.** Write `<scratchpad>/g1-layout-codemod.js` and run it with `node <scratchpad>/g1-layout-codemod.js C:/dev/Solaris-ui/.design-sync/previews`:

```js
// Rewrites the opening tags of the layout primitives to the G1 API. Prints every
// tag it could not rewrite on its own (a token held in a variable).
const fs = require("fs");
const path = require("path");
const dir = process.argv[2];
const TOKENS = { xs: 0.5, s: 1, m: 2, l: 3, xl: 4 };
const RADII = { small: 2, medium: 3, large: 4, extraLarge: 6 };
const SPACE = "p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|spacing|size";
const NAMES = ["Box", "Grid", "Stack"];
const SPACED = new Set(["Stack", "Grid"]);
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".tsx"))) {
  const full = path.join(dir, file);
  let src = fs.readFileSync(full, "utf8");
  const before = src;
  for (const name of NAMES) {
    const open = new RegExp(`<${name}(?=[\\s/>])`, "g");
    let m;
    while ((m = open.exec(src))) {
      let i = m.index + m[0].length, depth = 0;
      for (; i < src.length; i++) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}") depth--;
        else if (src[i] === ">" && depth === 0) break;
      }
      let tag = src.slice(m.index, i);
      tag = tag
        .replace(new RegExp(`(\\s)(${SPACE})="(xs|s|m|l|xl)"`, "g"), (_, w, k, t) => `${w}${k}={${TOKENS[t]}}`)
        .replace(/(\s)radius="(small|medium|large|extraLarge)"/g, (_, w, r) => `${w}borderRadius={${RADII[r]}}`)
        .replace(/(\s)bg=/g, "$1bgcolor=")
        .replace(/(\s)borderWidth=/g, "$1border=")
        .replace(/(\s)align=/g, "$1alignItems=")
        .replace(/(\s)justify=/g, "$1justifyContent=")
        .replace(/(\s)row(?=[\s/]|$)/g, '$1flexDirection="row"')
        .replace(/(\s)wrap(?=[\s/]|$)/g, '$1flexWrap="wrap"');
      if (name === "Stack") {
        tag = tag
          .replace(/direction="vertical"/, 'direction="column"')
          .replace(/direction="horizontal"/, 'direction="row"');
        if (/\sreverse(?=[\s/]|$)/.test(tag)) {
          tag = tag
            .replace(/\sreverse(?=[\s/]|$)/, "")
            .replace(/direction="(row|column)"/, 'direction="$1-reverse"');
        }
      }
      if (SPACED.has(name) && !/\sspacing=/.test(tag)) {
        tag = tag.replace(`<${name}`, `<${name} spacing={1}`);
      }
      if (new RegExp(`\\s(${SPACE}|radius)=\\{(?![-\\d.]+\\})`).test(tag)) {
        console.log(`CHECK ${file}: ${tag.replace(/\s+/g, " ").slice(0, 120)}`);
      }
      src = src.slice(0, m.index) + tag + src.slice(i);
    }
  }
  if (src !== before) fs.writeFileSync(full, src);
}
```

Expected output: no `CHECK` lines (the VStack story that held a token in a variable is parked). Hand-edit any `CHECK` that does appear: replace the token values in the variable with numbers (`xs` 0.5, `s` 1, `m` 2, `l` 3, `xl` 4). A `CHECK` on an `align={align}`-style prop is a rename only and already done.

- [ ] **Step 8: Hand-migrate the rest.**
  - `registry/layout.ts`: Box `p` → `{ type: "number", default: 2, label: "Padding (× 8)" }`; `bg` → `bgcolor` (same options); `radius` → `borderRadius: { type: "number", default: 4, label: "Border radius (× 4)" }`; `row` → `flexDirection: { type: "select", default: "column", label: "Direction", options: column / row / column-reverse / row-reverse }`. Stack `direction` options → Column `column`, Row `row`, Column reverse `column-reverse`, Row reverse `row-reverse`, default `column`; `spacing` → `{ type: "number", default: 1, label: "Spacing (× 8)" }`; delete `reverse`. Grid `spacing` → same number control.
  - `app/getting-started.tsx`: `<Stack p="m" spacing="s">` → `<Stack p={2} spacing={1}>`; the README's usage sample likewise.
  - `packages/ui/README.md` lines ~66–69 and ~380–383: `<Box p="m" bg="primaryContainer" radius="large">` → `<Box p={2} bgcolor="primaryContainer" borderRadius={4}>` (and the `secondaryContainer` twin). Grep the README for `spacing="` / `p="` / `radius=` once more and fix any other sample.
  - `ThemeProvider.tsx:79`: the `borderRadius` comment ("layout props multiply their `borderRadius` by it") is now true; leave it.
- [ ] **Step 9: Verify.** `npm run docgen -w @its/solaris-playground`, then `npm run type-check`, `npm run lint`, `npm test`. Expected: all pass (the catalogue test pins registry controls to real props, so it fails if a control still names `bg` / `radius` / `row`). Fix any remaining call site the type-check names.
- [ ] **Step 10:** `git status` checkpoint. No commit.

---

### Task 2: Skeleton

**Files:**
- Modify: `packages/ui/src/components/Skeleton.tsx`, `packages/ui/src/components/Image.tsx` (its loader passes `borderRadius` to Skeleton: becomes `style`)
- Modify (docs site): `catalogue/registry/feedback.ts` (Skeleton)
- Modify (previews): `.design-sync/previews/Skeleton.tsx`
- Test: `packages/ui/src/__tests__/surfaces.test.tsx` (new; Task 3 adds to it)

**Interfaces:**
- Produces: `SkeletonProps`: `variant?: "text" | "rectangular" | "rounded" | "circular" = "text"`, `animation?: "pulse" | false = "pulse"`; `borderRadius` and `animate` removed.

- [ ] **Step 1: Write the failing test** in a new `packages/ui/src/__tests__/surfaces.test.tsx`:

```tsx
import React from "react";
import { StyleSheet, type ViewStyle } from "react-native";
import { render } from "@testing-library/react-native";
import { Skeleton, ThemeProvider } from "../index";

const wrap = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

const styleOf = (node: { props: { style?: unknown } }) =>
  StyleSheet.flatten(node.props.style as ViewStyle) ?? {};

describe("Skeleton", () => {
  it("takes MUI's variants, text by default", async () => {
    const { toJSON } = await wrap(
      <>
        <Skeleton />
        <Skeleton variant="rectangular" />
        <Skeleton variant="rounded" />
        <Skeleton variant="circular" width={40} />
      </>,
    );
    const [text, rect, rounded, circle] = (toJSON() as { props: { style?: unknown } }[]).map(styleOf);
    expect(text).toMatchObject({ height: 16, borderRadius: 4 });
    expect(rect.borderRadius).toBe(0);
    expect(rounded.borderRadius).toBe(4);
    expect(circle).toMatchObject({ width: 40, height: 40 });
    expect(circle.borderRadius).toBeGreaterThanOrEqual(20);
  });
});
```

- [ ] **Step 2: Run** `npm test -w @its/solaris-ui -- surfaces`. Expected: FAIL (the default variant is `rect`, `rectangular` / `rounded` / `circular` are unknown).
- [ ] **Step 3: Implement Skeleton.** `variant = "text"`, `animation = "pulse"`; `useEffect` keys on `animation !== false`. Variant styles:

```ts
switch (variant) {
  case "circular": {
    const size = width ?? 40;
    return { width: size, height: height ?? size, borderRadius: theme.shape.full };
  }
  case "rectangular":
    return { width: width ?? "100%", height: height ?? 48, borderRadius: 0 };
  case "rounded":
    return { width: width ?? "100%", height: height ?? 48, borderRadius: theme.shape.borderRadius };
  default:
    return { width: width ?? "100%", height: height ?? 16, borderRadius: theme.shape.borderRadius };
}
```

(`theme` joins the `useMemo` dependencies.) In `Image.tsx`, the loader becomes `<Skeleton variant="rectangular" width="100%" height="100%" style={{ borderRadius }} />`.
- [ ] **Step 4: Run** the test. Expected: PASS.
- [ ] **Step 5: Docs site and preview.**
  - `registry/feedback.ts` Skeleton: `variant` options Text `text`, Rectangular `rectangular`, Rounded `rounded`, Circular `circular`, default `"text"`; `animate` boolean → `animation: { type: "select", default: "pulse", label: "Animation", options: [{ label: "Pulse", value: "pulse" }, { label: "None", value: false }] }` (select options are `value: any` in `catalogue/types.ts`); the `duration` control's `appliesWhen` reads `values.animation !== false`; the catalogue test's Skeleton exclusion row moves from `animate` to `animation`.
  - `.design-sync/previews/Skeleton.tsx`: `variant="circle"` → `"circular"`; `variant="rect"` with no `borderRadius` → `"rounded"`; `variant="rect" … borderRadius={0}` → `"rectangular"` (drop the prop); `variant="rect" … borderRadius={14|20}` → `variant="rounded" … style={{ borderRadius: 14 }}` (same number); `variant="text"` unchanged; any `animate={false}` → `animation={false}`.
- [ ] **Step 6: Verify.** `npm run docgen -w @its/solaris-playground && npm run variants -w @its/solaris-playground`, then `npm run type-check`, `npm run lint`, `npm test`. Expected: all pass.
- [ ] **Step 7:** `git status` checkpoint. No commit.

---

### Task 3: Divider, Paper, Card, CardHeader, CardMedia

**Files:**
- Modify: `packages/ui/src/components/Divider.tsx`, `Paper.tsx`, `Card.tsx`
- Rename: `components/CardParts/CardTitle.tsx` → `CardHeader.tsx`, `CardParts/CardCover.tsx` → `CardMedia.tsx` (`git mv`)
- Modify: `packages/ui/src/index.ts` (CardHeader / CardMedia lines)
- Modify (docs site): `registry/foundations.ts` (Divider, Paper, Card, CardHeader, CardMedia), `categories.ts`, `__tests__/playground-catalogue.test.tsx` (`CATALOGUE`, and the Divider snippet test if it sets `inset`), `catalogue/ComponentPreview.tsx` (the CardTitle / CardCover branches and their `<Card variant="elevated">` wrappers), `catalogue/variants/manual/CardParts.tsx` and `manual/index.ts` (keys `CardHeader`, `CardMedia`), `manual/AnimatedFAB.tsx` and `manual/Icon.tsx` (`<Paper elevation={1} outline>`), `manual/shared.ts` (comment naming CardCover), `catalogue/snippet.ts` (comment), `app/theming.tsx`, `app/templates.tsx`
- Modify (previews): `Card.tsx`, `Divider.tsx`, `Paper.tsx`, and every preview using `<Paper … outline>` / `elevation={…}` or `<Card variant="elevated">` (list: `grep -rlE "<Paper|<Card" .design-sync/previews`)
- Test: `packages/ui/src/__tests__/surfaces.test.tsx`, `ui-primitives.test.tsx` ("Card compound parts", "organization shapes")

**Interfaces:**
- Produces:
  - `DividerProps`: `variant?: "fullWidth" | "inset" | "middle" = "fullWidth"`; `inset` removed; `style?: StyleProp<ViewStyle>`; `orientation`, `thickness`, `contentSpacing`, `children` unchanged.
  - `PaperProps`: `elevation?: number = 3` (MUI 0–24), `variant?: "elevation" | "outlined" | "glow" = "elevation"`; `outline`, `glow` removed. `outlined` draws the border and **no shadow** (MUI); its tone still follows `elevation`.
  - `CardProps`: `variant?: "elevation" | "outlined" | "filled" | "glow" = "elevation"`, `onClick?: () => void`; `onPress` removed. Statics `Card.Header`, `Card.Content`, `Card.Media`, `Card.Actions` (`Title` / `Cover` removed).
  - `CardHeaderProps`: `title?`, `subheader?`, `avatar?`, `action?` (all `ReactNode`), `titleNumberOfLines = 1`, `subheaderNumberOfLines = 2`, `style`.
  - `CardMediaProps`: `image: ImageSourcePropType`, `alt`, `ratio = 16 / 9`, `style`, `testID`.
- Consumes: the internal Image, unchanged (`radius={0}`).

- [ ] **Step 1: Write the failing tests** (append to `surfaces.test.tsx`; add `Card, CardHeader, CardMedia, Divider, Paper, createTheme` to its `../index` import, `Text` to the `react-native` import and `fireEvent` to the testing-library import):

```tsx
const colors = createTheme().light.colors;

/** The nearest ancestor that carries the given style key. */
const surfaceOf = (node: { parent: unknown; props: { style?: unknown } } | null, key: keyof ViewStyle) => {
  let current = node as { parent: unknown; props: { style?: unknown } } | null;
  while (current && styleOf(current)[key] === undefined) current = current.parent as typeof current;
  return current ? styleOf(current)[key] : undefined;
};

describe("Divider", () => {
  it("takes MUI's variants along its own axis", async () => {
    const inset = await wrap(<Divider variant="inset" />);
    expect(styleOf(inset.toJSON() as never)).toMatchObject({ marginStart: 72 });
    const middle = await wrap(<Divider variant="middle" />);
    expect(styleOf(middle.toJSON() as never)).toMatchObject({ marginStart: 16, marginEnd: 16 });
    const vertical = await wrap(<Divider orientation="vertical" variant="middle" />);
    expect(styleOf(vertical.toJSON() as never)).toMatchObject({ marginTop: 16, marginBottom: 16 });
  });

  it("puts the variant margins on the rule, not on a labelled container", async () => {
    const { toJSON } = await wrap(<Divider variant="middle">OR</Divider>);
    const row = toJSON() as { props: { style?: unknown }; children: { props: { style?: unknown } }[] };
    expect(styleOf(row).marginStart ?? 0).toBe(0);
    expect(styleOf(row.children[0]).marginStart).toBe(16);
    expect(styleOf(row.children[row.children.length - 1]).marginEnd).toBe(16);
  });
});

describe("Paper", () => {
  it("maps MUI's 0–24 elevation onto five levels", async () => {
    const cases: [number, string][] = [
      [-1, colors.surface],
      [0, colors.surface],
      [1, colors.surfaceContainerLow],
      [2.5, colors.surfaceContainer],
      [3, colors.surfaceContainer],
      [6, colors.surfaceContainerHigh],
      [12, colors.surfaceContainerHighest],
      [30, colors.surfaceDim],
    ];
    for (const [elevation, tone] of cases) {
      const { getByText } = await wrap(<Paper elevation={elevation}><Text>x</Text></Paper>);
      expect(surfaceOf(getByText("x"), "backgroundColor")).toBe(tone);
    }
  });

  it("defaults to elevation 3 and outlines without a shadow", async () => {
    const { getByText } = await wrap(
      <>
        <Paper><Text>plain</Text></Paper>
        <Paper variant="outlined" elevation={8}><Text>outlined</Text></Paper>
      </>,
    );
    expect(surfaceOf(getByText("plain"), "backgroundColor")).toBe(colors.surfaceContainer);
    expect(surfaceOf(getByText("outlined"), "borderWidth")).toBe(1);
    expect(surfaceOf(getByText("outlined"), "shadowOpacity")).toBeUndefined();
    expect(surfaceOf(getByText("outlined"), "elevation")).toBeUndefined();
  });
});

describe("Card", () => {
  it("defaults to the elevation variant and fires onClick", async () => {
    const onClick = jest.fn();
    const { getByText } = await wrap(
      <Card onClick={onClick} accessibilityLabel="Open"><Text>Body</Text></Card>,
    );
    expect(surfaceOf(getByText("Body"), "backgroundColor")).toBe(colors.surfaceContainerLow);
    await fireEvent.press(getByText("Body"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // Found in the 2026-10-14 browser check: a Card with no handler rendered a
  // disabled Pressable, so its fields, checkboxes and links read as disabled.
  it("does not mark a card without onClick, or its content, as disabled", async () => {
    const { getByText } = await wrap(
      <Card>
        <Text>Body</Text>
      </Card>,
    );
    let node = getByText("Body").parent as { props: Record<string, unknown>; parent: unknown } | null;
    while (node) {
      expect((node.props.accessibilityState as { disabled?: boolean } | undefined)?.disabled).not.toBe(true);
      expect(node.props["aria-disabled"]).not.toBe(true);
      node = node.parent as typeof node;
    }
  });

  it("renders a header with MUI's slot names and an optional title", async () => {
    const { getByText, queryByText } = await wrap(
      <Card>
        <CardHeader subheader="Only a subheader" avatar={<Text>AV</Text>} action={<Text>ACT</Text>} />
        <CardMedia image={{ uri: "cover.png" }} alt="Cover" />
      </Card>,
    );
    expect(getByText("Only a subheader")).toBeTruthy();
    expect(getByText("AV")).toBeTruthy();
    expect(getByText("ACT")).toBeTruthy();
    expect(queryByText("undefined")).toBeNull();
  });
});
```

In `ui-primitives.test.tsx`: "Card compound parts" uses `<Card variant="elevation">`, `<Card.Header title="Impianto 4" subheader="Manutenzione" />`; "organization shapes" keeps `<Card>` (its radius assertion is unchanged).

- [ ] **Step 2: Run** `npm test -w @its/solaris-ui -- surfaces ui-primitives`. Expected: FAIL on the new props and defaults.
- [ ] **Step 3: Implement Divider.** Remove `inset`; add `variant`. Before the `if (!hasLabel)`:

```ts
const INSET = 72;
const MIDDLE = 16;
const startMargin = variant === "inset" ? INSET : variant === "middle" ? MIDDLE : 0;
const endMargin = variant === "middle" ? MIDDLE : 0;
const startEdge: ViewStyle = isHorizontal ? { marginStart: startMargin } : { marginTop: startMargin };
const endEdge: ViewStyle = isHorizontal ? { marginEnd: endMargin } : { marginBottom: endMargin };
```

(Hoist the two constants to module scope.) `line` drops its `marginHorizontal: inset` / `marginVertical: inset`. Bare rule: `[line, styles.bareRule, startEdge, endEdge, style]`. Labelled: first segment `[line, styles.segment, startEdge]`, last `[line, styles.segment, endEdge]`. `style?: StyleProp<ViewStyle>`.
- [ ] **Step 4: Implement Paper.**

```ts
/** MUI elevation (0–24) → Material 3 level (0–5): 0, 1, 2–3, 4–7, 8–15, 16–24. */
const levelOf = (elevation: number) =>
  elevation < 1 ? 0 : elevation < 2 ? 1 : elevation < 4 ? 2 : elevation < 8 ? 3 : elevation < 16 ? 4 : 5;
```

`elevation = 3`, `variant = "elevation"`; `const level = levelOf(elevation)`; background from `level` (same `levels` table); styles: `variant === "outlined" && styles.outlined`, `variant === "elevation" && level > 0 && styles[\`elevation${level}\`]`, `variant === "glow" && getGlowStyles(theme, true)`. JSDoc on `elevation`: "MUI's 0–24 scale, drawn with Material 3's five levels."
- [ ] **Step 5: Implement Card, CardHeader, CardMedia.**
  - `Card.tsx`: `variant = "elevation"`, style key `elevated` → `elevation`, `onPress` → `onClick` (prop, `Pressable onPress={onClick}`, role and cursor follow `onClick`). **Without `onClick` render a plain `View`** with the same surface styles, not a `Pressable` with `disabled`: a disabled Pressable sets `aria-disabled` on the container and every field inside reads as disabled (seen on /templates). Statics `Header: CardHeader`, `Content`, `Media: CardMedia`, `Actions`. Update the JSDoc example to `Card.Media image={photo}` / `Card.Header title subheader` / `onClick={open}` (keep the inner `Button`s as they are: Button is G2).
  - `git mv` the two part files; rename components and interfaces. CardHeader: props per Interfaces; render the title `Text` only when `title != null && title !== ""`; slots `avatar` (leading) and `action` (trailing). CardMedia: `image` replaces `source`, passed to `<Image source={image} … radius={0} />`.
  - `index.ts`: replace the CardCover and CardTitle export pairs with CardHeader and CardMedia pairs (alphabetical).
- [ ] **Step 6: Run** the two test files. Expected: PASS.
- [ ] **Step 7: Docs site.**
  - `registry/foundations.ts`: Divider `inset` → `variant: { type: "select", default: "fullWidth", label: "Variant", options: Full width / Inset / Middle }`. Paper `elevation` → `{ type: "number", default: 3, label: "Elevation (0–24)" }`; `outline` + `glow` → `variant: { type: "select", default: "elevation", options: Elevation / Outlined / Glow }`. Card `variant` options Elevation `elevation`, Outlined `outlined`, Filled `filled`, Glow `glow`, default `"elevation"`. `CardTitle` entry → `CardHeader` (`title`, `subheader` controls); `CardCover` entry → `CardMedia` (unchanged controls). Imports follow.
  - `categories.ts`, `CATALOGUE`: `CardTitle` → `CardHeader`, `CardCover` → `CardMedia`.
  - `ComponentPreview.tsx`: the `"CardTitle"` / `"CardCover"` branches → `"CardHeader"` / `"CardMedia"`; `<CardTitle title subtitle>` → `<CardHeader title subheader>`; `<Card variant="elevated">` → `<Card variant="elevation">`; the CardMedia demo passes `image=`.
  - `manual/CardParts.tsx`: `CardTitle` → `CardHeader` (`subtitle` → `subheader`, `left` → `avatar`, `right` → `action`), `CardCover source=` → `CardMedia image=`, `variant="elevated"` → `"elevation"`; rename `cardTitleVariants` / `cardCoverVariants` to `cardHeaderVariants` / `cardMediaVariants`; `manual/index.ts` keys `CardHeader`, `CardMedia`. `manual/AnimatedFAB.tsx`, `manual/Icon.tsx`: `<Paper elevation={1} outline>` → `<Paper elevation={1} variant="outlined">`. Comments in `manual/shared.ts` and `snippet.ts` name the new components.
  - `app/theming.tsx:490` and `app/templates.tsx`: `variant="elevated"` → `"elevation"`, `CardTitle` → `CardHeader`, `subtitle` → `subheader`, `left` → `avatar`, `right` → `action`.
- [ ] **Step 8: Previews.** In `.design-sync/previews`: `<Paper … outline>` → `variant="outlined"`; `<Paper … glow>` → `variant="glow"`; Paper `elevation` values move to MUI's scale so the look stays: `0→0, 1→1, 2→2, 3→4, 4→8, 5→16`; a `<Paper>` with no `elevation` was level 1, so add `elevation={1}` to keep it (the new default would make it level 2). `Paper.tsx`'s `Elevations` story maps `[0, 1, 2, 4, 8, 16]` and labels `elevation {e}`. `<Card variant="elevated">` → `"elevation"`; a `<Card>` with no `variant` was `filled`, so add `variant="filled"`; `onPress=` on Card → `onClick=`; `CardTitle` / `CardCover` as in Step 7. `Divider.tsx`: `inset={24}` → `variant="middle"` (the closest MUI value; fix the story text if it says 24).
- [ ] **Step 9: Verify.** `npm run docgen -w @its/solaris-playground && npm run variants -w @its/solaris-playground`; `npm run type-check`, `npm run lint`, `npm test`. Expected: all pass.
- [ ] **Step 10:** `git status` checkpoint. No commit.

---

### Task 4: Docs, design-sync, gates and browser check

**Files:**
- Modify: `packages/ui/src/components/components.md` (§1.4, Divider, Paper, Card, the Card parts heading and table, Skeleton, §8 Layout Primitives, §9 index), `.design-sync/config.json` (key `TouchableRipple` → `ButtonBase`), `.design-sync/NOTES.md` (the Card parts paragraph names), `packages/ui/README.md` (Paper, Card parts, TouchableRipple sections and the file tree line `CardParts/`), `HANDOFF.md` ("What to do next")
- Modify: the G0 spacing cleanups: `grep -rnE "spacing\(4\) \* 2|spacing\(1\) \+ theme\.spacing\(0\.5\)" packages/ui/src` → `theme.spacing(8)` / `theme.spacing(1.5)`

- [ ] **Step 1: components.md.** Rewrite each section's table from the Interfaces of Tasks 1–3:
  - §1.4: add "Layout props take MUI numbers: spacing × 8, `borderRadius` × `shape.borderRadius` (4), a size in (0, 1] is a percentage."
  - Divider: replace the `inset` row with `variant | "fullWidth" \| "inset" \| "middle" | fullWidth | inset: 72 at the start; middle: 16 at each end`.
  - Paper: `elevation | number 0–24 | 3 | MUI's scale on five levels (0, 1, 2–3, 4–7, 8–15, 16–24)`; replace `outline` / `glow` with `variant | "elevation" \| "outlined" \| "glow" | elevation | outlined has no shadow`.
  - Card: `variant | "elevation" \| "outlined" \| "filled" \| "glow" | elevation`; `onPress` → `onClick`.
  - `### CardTitle / CardContent / CardCover / CardActions` → `### CardHeader / CardContent / CardMedia / CardActions`; table rows `Card.Header`: `title`, `subheader`, `avatar`, `action`, `titleNumberOfLines` (1), `subheaderNumberOfLines` (2); `Card.Media`: `image` + `alt` (required), `ratio` (16/9); example uses `Card.Media image`, `Card.Header … subheader`, `onClick`.
  - Skeleton: `variant | "text" \| "rectangular" \| "rounded" \| "circular" | text`; `animation | "pulse" \| false | "pulse"`; drop `borderRadius`.
  - §8: Box table with the Task 1 props (× 8 spacing, `"auto"` margins, `rowGap` / `columnGap`, `flexDirection`, `flexWrap`, `alignItems`, `justifyContent`, fraction sizes, `bgcolor`, `border`, `borderColor`, `borderRadius` × 4); Stack `direction` (4 values, `column`), `spacing` (× 8, **0**); HStack / VStack keep `reverse`; Center "every Box prop except `alignItems` and `justifyContent`"; Spacer `size` × 8; Grid `spacing` (× 8, 0) and the sentence "`columns` is a fixed column count, not MUI's 12-column model."
- [ ] **Step 2: design-sync and README.** `config.json` key rename (keep alphabetical order); NOTES.md names (`CardHeader` / `CardContent` / `CardMedia` / `CardActions`); README sections and samples follow components.md; grep `-rn "TouchableRipple\|CardTitle\|CardCover\|Card\.Title\|Card\.Cover\|radius=\"" packages apps .design-sync README.md --include=*.ts --include=*.tsx --include=*.md --include=*.json` (excluding `node_modules`, `dist`, `lib`, `docgen/props.generated.json`) returns nothing but history (specs and plans).
- [ ] **Step 3: Spacing cleanups** from the G0 backlog (the grep above), one-line edits.
- [ ] **Step 4: Gates.** `npm run docgen -w @its/solaris-playground && npm run variants -w @its/solaris-playground` (twice; the second run leaves no diff), `npm run lint`, `npm run type-check`, `npm test`, `npm run build`, `npm run validate-package -w @its/solaris-ui`, `npm run export:web -w @its/solaris-playground`. Expected: all pass.
- [ ] **Step 5: Browser check.** Serve `apps/playground/dist` on a free port (not 8081). In light and dark, under Proposta A and B, open `/components/Box`, `/components/Stack`, `/components/Grid`, `/components/Divider`, `/components/Paper`, `/components/Card`, `/components/CardHeader`, `/components/CardMedia`, `/components/Skeleton`, and `/theming`. Check: gallery spacing matches before (no collapsed stacks), Paper elevations step visibly, Card default is the elevated tone, Divider inset/middle margins, no console errors besides the known React #418.
- [ ] **Step 6: HANDOFF.md.** "What to do next": G1 done (list the renames and default changes), next G2. Remove the G0 backlog items G1 closed (`borderRadius` doc, `RadiusValue`, spacing cleanups).
- [ ] **Step 7:** `git status` checkpoint. No commit.

---

## Self-review

- Spec coverage (Part C G1): Box rows → Task 1 Steps 3–4; Stack, Grid → Task 1 Step 5 (HStack, VStack, Center, Spacer, AspectRatio parked); Divider, Paper, Card, CardTitle → CardHeader, CardCover → CardMedia, CardContent/CardActions unchanged → Task 3; Skeleton → Task 2 (Image and TouchableRipple are internal, unchanged). Part A rule 6 (`onClick`) → Card; the `StyleProp<ViewStyle>` rule → Divider. Part D items 1–6 → each task's Steps 7–9 plus Task 4.
- Out of scope, named: MUI's 12-column grid and breakpoints (rule 10); Button / IconButton props inside Card examples (G2); Image's `image-broken-variant` has no Eva drawing, but `fallbackIcon` is now an element an app can replace.
- Names used across tasks: `resolveSpacing`, `resolveSize`, `MarginValue`, `SpacingValue`, `BoxProps`, `StackProps`, `GridProps`, `CardHeader`, `CardHeaderProps`, `CardMedia`, `CardMediaProps`, `Card.Header`, `Card.Media`.
