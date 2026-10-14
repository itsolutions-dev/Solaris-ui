# Solaris — Group 0: Park the unlisted components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the 32 components that are not on the owner's list out of the library and the docs
site without deleting them (`packages/ui/parked/`), and stop exporting the 10 that kept
components still use internally.

**Architecture:** A scratchpad script moves the parked files (`git mv`, so history follows) and
removes their barrel lines; the type-checker then names every remaining reference, which is
edited by hand. Internal components stay where they are and are only removed from the barrel and
the docs site; their tests import them by file path. `parked/` sits outside `src`, so the build
and the library `tsconfig` skip it; Jest and ESLint get one ignore each.

**Tech Stack:** Node scripts, git, TypeScript, jest-expo, ESLint, Expo static export.

**Spec:** `docs/superpowers/specs/2026-10-14-solaris-roadmap-v2-design.md` ("Parking").

## Global Constraints

- PARKED (module paths under `packages/ui/src/components`): `AnimatedFAB`, `AppBar`, `Layout/AspectRatio`, `BottomSheet`, `ButtonGroup`, `Carousel`, `Layout/Center`, `ChipGroup`, `DatePickerInput`, `DateRangePicker`, `EmptyState`, `FormControl`, `Progress/LinearProgress`, `NavigationRail`, `Pagination`, `PinInput`, `ProgressButton`, `RadioButton`, `Rating`, `SideSheet`, `Slider`, `Layout/Spacer`, `SplitButton`, `Stat`, `StatusBadge`, `Tab/TabContent`, `TimePicker`, `ToggleButton/ToggleButton`, `ToggleButton/ToggleButtonGroup`, `Toolbar`, `internal/selection`; plus `HStack` / `VStack` (cut out of `Layout/Stack.tsx`).
- INTERNAL (stay in `src`, leave the barrel and the docs site): `Progress/CircularProgress`, `Calendar`, `ClockPicker`, `ClockDial`, `Collapse`, `HelperText`, `Image`, `Popover`, `List/ListSubheader`, `TouchableRipple`.
- Always kept: theme, `Typography`, `Icon`, `Portal`, `AlertProvider`, `ToastProvider`, the `Toast` page.
- Nothing in `packages/ui/src`, `apps/playground` or `.design-sync` imports from `parked/`.
- Generated files are regenerated, never hand-edited (`npm run docgen -w @its/solaris-playground`, `npm run variants -w @its/solaris-playground`).
- No commits: each task ends with a `git status` checkpoint.

## Review Focus

- **A kept module importing a parked one** (also through a platform file like `DateTimePicker.web.tsx`) breaks the web export, not only `tsc`. Check: Task 2 Step 6 runs `export:web` and greps for `parked/` imports.
- **Docs-site links to a removed page** (`/components/Slider`) would 404. Check: Task 2 Step 3 greps the site for `/components/<removed name>`.
- **A kept preview that still renders a parked component** fails `npm run variants` or renders blank. Check: Task 2 Step 2 (grep) and Step 6 (generators).
- **An internal component's test that imported it from the barrel** fails at runtime once unexported. Check: Task 1 Step 5 runs the library suite.
- **Jest picking up `parked/tests`** (default roots include the whole package) would run unmaintained tests. Check: Task 1 Step 5 counts the suites.

---

### Task 1: Library: move, unexport, split the tests

**Files:**
- Move: every PARKED module (`.tsx` / `.ts`) → `packages/ui/parked/components/<same path>`
- Modify: `packages/ui/src/index.ts`, `packages/ui/src/components/Layout/Stack.tsx`, `packages/ui/package.json` (`jest.testPathIgnorePatterns`), `eslint.config.js` (ignore)
- Create: `packages/ui/parked/README.md`
- Move / split tests: `progress-button.test.tsx` (ProgressButton block), `animated-fab-and-portal.test.tsx` (AnimatedFAB block), `new-components.test.tsx` (NavigationRail, ButtonGroup, SplitButton, Toolbar, SideSheet, ChipGroup blocks and the AppBar half of "TopAppBar and AppBar"), `ui-primitives.test.tsx` (ToggleButtonGroup block) → `packages/ui/parked/tests/<same file name>`
- Modify: tests of INTERNAL components import them by path (`CircularProgress`, `HelperText`, `TouchableRipple`, `Collapse`)

- [ ] **Step 1: Move the parked files.** Write `<scratchpad>/park.js` and run it from the repo root:

```js
// git mv the PARKED modules into packages/ui/parked/components, keeping relative paths,
// then drop their lines (and the INTERNAL ones) from src/index.ts.
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const SRC = "packages/ui/src/components";
const DEST = "packages/ui/parked/components";
const PARKED = ["AnimatedFAB", "AppBar", "Layout/AspectRatio", "BottomSheet", "ButtonGroup", "Carousel", "Layout/Center", "ChipGroup", "DatePickerInput", "DateRangePicker", "EmptyState", "FormControl", "Progress/LinearProgress", "NavigationRail", "Pagination", "PinInput", "ProgressButton", "RadioButton", "Rating", "SideSheet", "Slider", "Layout/Spacer", "SplitButton", "Stat", "StatusBadge", "Tab/TabContent", "TimePicker", "ToggleButton/ToggleButton", "ToggleButton/ToggleButtonGroup", "Toolbar", "internal/selection"];
const INTERNAL = ["Progress/CircularProgress", "Calendar", "ClockPicker", "ClockDial", "Collapse", "HelperText", "Image", "Popover", "List/ListSubheader", "TouchableRipple"];
for (const mod of PARKED) {
  const file = [".tsx", ".ts"].map((e) => `${SRC}/${mod}${e}`).find(fs.existsSync);
  if (!file) throw new Error(`missing ${mod}`);
  const target = `${DEST}/${mod}${path.extname(file)}`;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  execFileSync("git", ["mv", file, target]);
}
const barrel = "packages/ui/src/index.ts";
const gone = new Set([...PARKED, ...INTERNAL].map((m) => `./components/${m}`));
const lines = fs.readFileSync(barrel, "utf8").split("\n");
const kept = lines.filter((line) => {
  const m = /from "(\.\/components\/[^"]+)"/.exec(line);
  return !(m && gone.has(m[1]));
});
fs.writeFileSync(barrel, kept.join("\n"));
console.log(`moved ${PARKED.length}, barrel ${lines.length - kept.length} lines removed`);
```

Expected: `moved 31, barrel 82 lines removed` (two lines per module; any multi-line `export { … } from` block for these modules is reported by `tsc` in Step 4 and removed by hand).

- [ ] **Step 2: Cut HStack and VStack.** Copy `packages/ui/src/components/Layout/Stack.tsx` to `packages/ui/parked/components/Layout/Stack.tsx` (the parked copy keeps them), then delete `StackAxisProps`, `HStack` and `VStack` from the source file.
- [ ] **Step 3: Configuration and README.**
  - `packages/ui/package.json` `jest`: add `"testPathIgnorePatterns": ["/node_modules/", "/parked/"]`.
  - `eslint.config.js` `ignores`: add `"packages/ui/parked/**"` with the comment `// Parked components (roadmap v2): not built, not maintained; see packages/ui/parked/README.md.`
  - `packages/ui/parked/README.md`:

```md
# Parked components

Solaris's roadmap v2 (`docs/superpowers/specs/2026-10-14-solaris-roadmap-v2-design.md`) keeps only
the components on the owner's list. These are the others, kept as they were on 2026-10-14 and
**not maintained**: nothing builds, type-checks, lints or tests this folder, and as the library's
API moves on they stop compiling. The roadmap's last group decides, one by one, which come back.

- `components/`: the source, at the same paths it had under `src/components`.
- `previews/`: their design-sync previews (and those of the components that stayed as internals).
- `tests/`: the tests that exercised only these components.
- `components.md`: their documentation, cut from `src/components/components.md`.

To bring one back: move its files back under `src/components` (and its preview back to
`.design-sync/previews`), export it from `src/index.ts`, restore its docs-site entries (registry,
categories, catalogue test, `ComponentPreview`, demos, manual variants) from the commit before the
one that added this README (`git log --diff-filter=A -- packages/ui/parked/README.md`), then
migrate it to the MUI API like the rest.

| Component | Was in |
|---|---|
```

followed by one table row per PARKED module (name and old path), plus `HStack, VStack | Layout/Stack.tsx`.

- [ ] **Step 4: Fix the library type-check.** Run `npx tsc --noEmit -p packages/ui`. Every error is a kept file referencing a moved module or a removed barrel name; there should be none in components (the import graph was checked), only in the barrel's multi-line export blocks and in tests. Fix the barrel blocks by deleting the moved names.
- [ ] **Step 5: Split the tests.** Move the blocks listed under Files into `packages/ui/parked/tests/<same file name>` (each new file keeps the imports its blocks use, from `"../../src/index"` paths as they were written; they are not run). In the kept files, change imports of INTERNAL components to their paths, e.g. `import CircularProgress from "../components/Progress/CircularProgress";`, `import HelperText from "../components/HelperText";`, `import TouchableRipple from "../components/TouchableRipple";`, `import Collapse from "../components/Collapse";`. Run `npm test -w @its/solaris-ui`. Expected: PASS, with fewer tests than 151 (the moved blocks) and no suite under `parked/`.
- [ ] **Step 6:** `npx tsc --noEmit -p packages/ui` and `npx eslint packages/ui`. Expected: clean. (`npm run type-check` for the whole repo stays red until Task 2: the docs site still imports removed names.) `git status` checkpoint.

---

### Task 2: Docs site, previews, design-sync, docs

**Files:**
- Modify: `apps/playground/catalogue/registry/{actions,data-display,feedback,foundations,inputs,layout,navigation}.ts`, `catalogue/categories.ts`, `catalogue/ComponentPreview.tsx`, `catalogue/demos.tsx`, `catalogue/variants/manual/index.ts` and the manual files of removed components (`AnimatedFAB.tsx`, `BottomSheet.tsx`, `Popover.tsx`; the shared-demo keys `ButtonGroup`, `ChipGroup`, `NavigationRail`, `SideSheet`, `SplitButton`, `Toolbar`), `__tests__/playground-catalogue.test.tsx` (`CATALOGUE`)
- Modify: `apps/playground/app/components/[name].tsx`, `app/components/index.tsx`, `app/theming.tsx` (ToggleButtonGroup → Chips; gallery), `app/templates.tsx`, `app/getting-started.tsx` (VStack sample)
- Move: `.design-sync/previews/<Name>.tsx` of every PARKED and INTERNAL component → `packages/ui/parked/previews/`
- Modify: previews of kept components that use removed ones; `.design-sync/config.json`; `.design-sync/NOTES.md`
- Modify: `packages/ui/src/components/components.md` (sections → `packages/ui/parked/components.md`), `packages/ui/README.md` (component sections of removed names → same file), `docs/superpowers/plans/2026-10-14-solaris-mui-g1-layout-surfaces.md` (trim)

- [ ] **Step 1: Catalogue.** Delete every registry entry, `categories.ts` name, `CATALOGUE` row, `ComponentPreview` branch, `demos.tsx` entry and manual-variant key whose name is one of: AnimatedFAB, AspectRatio, BottomSheet, ButtonGroup, Calendar, Carousel, Center, ChipGroup, CircularProgress, ClockDial, ClockPicker, Collapse, DatePickerInput, DateRangePicker, EmptyState, FormControl, HelperText, Image, LinearProgress, ListSubheader, NavigationRail, Pagination, PinInput, Popover, ProgressButton, RadioButton, RadioGroup, Rating, SideSheet, Slider, Spacer, SplitButton, Stat, StatusBadge, TabContent, TimePicker, ToggleButton, ToggleButtonGroup, Toolbar, TouchableRipple. Delete the manual files that only served them (`manual/AnimatedFAB.tsx`, `manual/BottomSheet.tsx`, `manual/Popover.tsx`) and their imports; drop now-unused imports.
- [ ] **Step 2: Previews.** `git mv` each `.design-sync/previews/<Name>.tsx` for the names in Step 1 (plus `HStack.tsx`, `VStack.tsx`) to `packages/ui/parked/previews/`. Then `grep -lE "\b(StatusBadge|ProgressButton|HStack|VStack|LinearProgress|CircularProgress|RadioButton|Slider|ToggleButtonGroup|EmptyState|Stat|Collapse|Image)\b" .design-sync/previews/*.tsx` and rewrite each hit with kept components: `HStack` → `<Stack direction="horizontal" …>` (Stack's current API; G1 changes it), `VStack` → `<Stack …>`, `StatusBadge type="success" label="X"` → `<Chip label="X" mode="tonal" />` (or drop it where it is decoration), `ProgressButton` → `Button` with `loading`, progress indicators and the rest → removed from the story. Remove the moved names' keys from `.design-sync/config.json`; add to `NOTES.md` under the Card-parts paragraph: "**Parked (roadmap v2, 2026-10-14).** 32 components and the previews of 10 internal ones moved to `packages/ui/parked/`; see its README."
- [ ] **Step 3: Site pages.**
  - `app/components/[name].tsx` (360 / 720 / Full), `app/components/index.tsx` (view switch), `app/theming.tsx` (Proposta A / B): replace `ToggleButtonGroup` with a row of `Chip`s: `{OPTIONS.map((o) => <Chip key={o.value} label={o.label} selected={value === o.value} onPress={() => setValue(o.value)} accessibilityRole="radio" />)}` inside a `View` with `flexDirection: "row", gap: 8` and `accessibilityRole="radiogroup"` plus the old group's label. Keep the existing tests green (`theming.test.tsx` presses "Proposta B" by text: unchanged).
  - `app/theming.tsx` gallery: drop StatusBadge (→ three `Chip`s with the success / warning / error containers through `style`), RadioButton, Slider, LinearProgress, CircularProgress.
  - `app/templates.tsx`: StatusBadge → `Chip`; FormControl → its fields alone; drop LinearProgress and Stat (replace a Stat by two `Typography` lines, caption + value).
  - `app/getting-started.tsx`: the `<VStack p="m" spacing="s">` sample → `<Stack p="m" spacing="s">` and its import.
  - `grep -rnE "/components/(<the Step 1 names joined by |>)\b" apps/playground/app apps/playground/site` → no hits.
- [ ] **Step 4: Docs.** Move the `components.md` sections of removed components (headings: TouchableRipple, ProgressButton, AnimatedFAB, ToggleButton, ToggleButtonGroup, ButtonGroup, SplitButton, ChipGroup, RadioButton / RadioGroup, Slider, PinInput, FormControl, Rating, HelperText, DatePickerInput / DateRangePicker / TimePicker (cut them from the shared DateTimePicker heading, which keeps `DateTimePicker / DatePicker`), Calendar, ClockPicker, ClockDial, StatusBadge, Carousel, Stat, Image, BottomSheet, SideSheet, Popover, CircularProgress, LinearProgress, EmptyState, Collapse, NavigationRail, Toolbar, TabContent (inside Tabs if shared), Pagination, ListSubheader (from "ListSection / ListSubheader", which becomes "ListSection"), AspectRatio, Center, Spacer, the HStack / VStack half of "Stack / HStack / VStack") to `packages/ui/parked/components.md`; update §9 Component Index. Do the same for `packages/ui/README.md`'s per-component sections.
- [ ] **Step 5: Trim the G1 plan.** In `docs/superpowers/plans/2026-10-14-solaris-mui-g1-layout-surfaces.md`: Goal and Task 1 drop HStack, VStack, Center, Spacer, AspectRatio (and their tests and codemod names); Task 2 becomes "Skeleton" only (Image and ButtonBase are internal now: drop their steps, tests and renames; CardMedia keeps passing `radius={0}` to Image); Task 3 drops the `Toolbar.tsx` edit; Task 4's component list and browser pages follow. Add at the top: "Revised 2026-10-14 for roadmap v2 (`2026-10-14-solaris-roadmap-v2-design.md`)."
- [ ] **Step 6: Gates.** `npm run docgen -w @its/solaris-playground && npm run variants -w @its/solaris-playground` (twice; the second leaves no diff; if a generated file of a removed component survives in `catalogue/variants/generated`, delete it and re-run), then `npm run lint`, `npm run type-check`, `npm test`, `npm run build`, `npm run validate-package -w @its/solaris-ui`, `npm run export:web -w @its/solaris-playground`. `grep -rn "parked/" packages/ui/src apps/playground .design-sync --include=*.ts --include=*.tsx` → no hits. Expected: all pass.
- [ ] **Step 7: Browser check.** Serve `apps/playground/dist` on a free port: `/components` (index, view switch), `/components/Button` (360 / 720 / Full chips), `/theming` (A / B chips, gallery), `/templates`, in light and dark. `git status` checkpoint; update `HANDOFF.md` ("What to do next": group 0 done, next G1).

---

## Self-review

- Spec "Parking" → Task 1 (what moves, where, configuration, README, tests) and Task 2 (barrel consumers, docs site, chrome, gallery, templates, previews, design-sync, docs). The G1 revision the spec names → Task 2 Step 5.
- `examples/consumer` untouched, as the spec says.
- Names: PARKED / INTERNAL lists are identical in the Global Constraints, the script and Task 2 Step 1 (Step 1 adds RadioGroup, which lives in RadioButton's module, and the internal names).
