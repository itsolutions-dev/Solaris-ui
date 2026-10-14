# Solaris-ui — roadmap v2: the component list, parking, new group order

Date: 2026-10-14 · Status: approved in conversation (section 1), written review pending ·
Amends: `2026-10-12-solaris-program-design.md` (sub-projects 2 and 3) and the group order of
`2026-10-12-solaris-mui-api-design.md` Part C. Every binding rule of the MUI-API spec (Part A)
and its done criteria (Part D) still apply.

## Why

The owner gave the list of components Solaris needs **for now**. Everything else in the library
leaves the public API until the end of the roadmap, where each parked component is reviewed.
Buttons and inputs wait for designs the owner is making in Figma; the groups that do not need
Figma go first.

## The component list

Names on the left are the owner's. Export names follow MUI where MUI has the component
(program decision D4); "new" means the component does not exist in Solaris today and is built
in its group from the DBE-CRM component of the same name.

| Owner's name | Today in Solaris | Export name after its group |
|---|---|---|
| **Layout:** Paper, Box, Divider, Stack, Grid, Skeleton | same | same |
| Card | Card + CardTitle / CardContent / CardCover / CardActions | Card + CardHeader / CardContent / CardMedia / CardActions |
| **Other:** Dialog | Modal | Dialog |
| ConfirmDialog, Menu, Tooltip, Snackbar | same | same |
| Alert | Banner | Alert |
| **Charts:** DonutChart, BarChart, StackedBarChart, LineChart, TimelineChart, Legend | — | new |
| **Display:** Avatar, Badge, ListItem, Accordion, Table, DataGrid | same | same |
| ListWrapper | ListSection | List |
| Fallback, Blink, CaptionValue | — | new |
| **Navigation:** NavBar | TopAppBar | AppBar |
| Sidebar | NavigationDrawer | Drawer |
| BreadCrumbs | Breadcrumbs | Breadcrumbs |
| Stepper, Tabs | same | same |
| BottomNavigation | NavigationBar | BottomNavigation |
| **Buttons:** Button, IconButton, Chip, Link, SpeedDial | same | same |
| Fab | FAB | Fab |
| **Base inputs:** TextField | Input | TextField |
| Select, Autocomplete, Checkbox | same | same |
| NumberField | Spinner | NumberField |
| Switch | Toggle | Switch |
| **Special inputs:** SearchBar | SearchBar | SearchBar |
| FetchAutocomplete, CheckboxStack | — | new |
| **Dates:** DatePicker, DateTimePicker | same | same |

Always kept, though not on the list because everything is built on them: the theme
(`createTheme`, `ThemeProvider`, `useTheme`), `Typography`, `Icon`, `Portal`. Whether
`AlertProvider` and `ToastProvider` (and the `Toast` docs page) stay public is decided in
group 2, because they drive Dialog and Snackbar. Until then they stay as they are.

## Parking

### What is parked

**Parked** (not on the list and used by no kept component) — 32:
AnimatedFAB, AppBar (the react-navigation header adapter, `components/AppBar.tsx`),
AspectRatio, BottomSheet, ButtonGroup, Carousel, Center, ChipGroup, DatePickerInput,
DateRangePicker, EmptyState, FormControl, HStack, LinearProgress, NavigationRail, Pagination,
PinInput, ProgressButton, RadioButton / RadioGroup, Rating, SideSheet, Slider, Spacer,
SplitButton, Stat, StatusBadge, TabContent, TimePicker, ToggleButton, ToggleButtonGroup,
Toolbar, VStack. Plus `components/internal/selection.ts`, used only by parked components.

(HStack and VStack live in `Layout/Stack.tsx` and are deleted from it rather than moved; the
parked copy of `Stack.tsx` keeps them.)

**Kept but internal** (not on the list, but a kept component uses it): stays in
`packages/ui/src/components`, is removed from the barrel, has no docs page and no preview.
CircularProgress (Button's loading state), Calendar, ClockPicker, ClockDial (DateTimePicker),
Collapse (Accordion), HelperText (the fields), Image (CardCover / CardMedia, Avatar), Popover
(Menu, Tooltip), ListSubheader (ListSection), TouchableRipple (FAB's `useStateLayer`; nothing
kept renders the component itself). `DateTimePicker.web.tsx` is a platform file of a kept
component and stays.

The G1 plan of 2026-10-14 is revised accordingly: HStack, VStack, Center, Spacer and
AspectRatio leave it (parked), Image and ButtonBase leave it (internal: Image keeps its current
props, TouchableRipple keeps its name).

### Where it goes

`packages/ui/parked/`, outside `src`, so the build (`bob`, `src` only) and the library
type-check (`tsconfig.json` includes `src` only) skip it without configuration:

```
packages/ui/parked/
  README.md          what is here, why, how to bring a component back
  components/        the parked source files, same relative paths as under src/components
  previews/          their .design-sync/previews/<Name>.tsx files, and those of the internal ones
  tests/             tests that exercise only parked components
  components.md      their sections, cut from src/components/components.md and packages/ui/README.md
```

- ESLint ignores `packages/ui/parked/**`; Jest ignores `/parked/`.
- Nothing in `src`, `apps/playground` or `.design-sync` may import from `parked/`.
- The parked files are not maintained: as the API moves they stop compiling. That is accepted;
  a component brought back at the end is migrated like the others.
- `README.md` says how to bring one back: move its files back, export it from `src/index.ts`,
  restore its docs-site entries from git (the commit before the one that adds
  `packages/ui/parked/README.md`: `git log --diff-filter=A -- packages/ui/parked/README.md`),
  then migrate it to the MUI API.

### What else changes

- **Barrel:** `src/index.ts` drops every parked and internal name, with its props types and
  helpers (`RadioGroup` goes with RadioButton; `DrawerItem` and `DrawerSection` stay with
  NavigationDrawer).
- **Docs site:** the parked and internal components lose their registry entries, categories,
  `CATALOGUE` rows, `ComponentPreview` branches, `demos.tsx` entries and manual variants;
  generated files are regenerated (`docgen`, `variants`).
- **Docs-site chrome** used `ToggleButtonGroup` for the 360 / 720 / Full selector
  (`app/components/[name].tsx`), the components index view switch (`app/components/index.tsx`)
  and the Proposta A / B switch (`app/theming.tsx`). These become a row of `Chip`s with
  `selected`, which is kept.
- **Theming gallery** (`app/theming.tsx`) drops StatusBadge, RadioButton, Slider and the two
  progress indicators; the status row uses `Chip`s in the status colours.
- **Templates page** (`app/templates.tsx`) replaces StatusBadge with a `Chip`, FormControl with
  the plain fields, and removes LinearProgress and Stat (CaptionValue arrives in group 4).
- **Previews of kept components** that use parked ones (for example Card and ThemeProvider use
  StatusBadge, ThemeProvider uses ProgressButton, Autocomplete and Link use VStack) are
  rewritten with kept components (`Stack`, `Chip`).
- **design-sync:** `config.json` loses the parked and internal keys; `NOTES.md` gets a short
  "Parked" paragraph pointing at `packages/ui/parked/README.md`.
- **Tests:** a test file that only tests parked components moves to `parked/tests/`; a mixed
  file is split.
- `examples/consumer` is not touched (it installs the published package and moves in the
  release group).

## Roadmap

| # | Group | Components | Waits for |
|---|---|---|---|
| 0 | Park | the lists above | — |
| 1 | Layout | Paper, Box, Divider, Stack, Grid, Skeleton, Card + CardHeader / CardContent / CardMedia / CardActions | — |
| 2 | Other | Dialog, ConfirmDialog, Menu, Tooltip, Snackbar, Alert | — |
| 3 | Charts | DonutChart, BarChart, StackedBarChart, LineChart, TimelineChart, Legend | the owner's choice of library |
| 4 | Display | Avatar, Badge, List, ListItem, Accordion, Table, DataGrid, Fallback, Blink, CaptionValue | — |
| 5 | Navigation | AppBar, Drawer, Tabs, Breadcrumbs, Stepper, BottomNavigation | — |
| 6 | Buttons | Button, IconButton, Fab, SpeedDial, Chip, Link | Figma |
| 7 | Base inputs | TextField, Select, Autocomplete, NumberField, Checkbox, Switch | Figma |
| 8 | Special inputs | FetchAutocomplete, SearchBar, CheckboxStack | Figma, group 7 |
| 9 | Dates | DatePicker, DateTimePicker | Figma, group 7 |
| 10 | Review and release | decide each parked component; publish `0.1.0` | — |

- Groups 1, 2, 4 and 5 do not wait for Figma. Group 3 starts as soon as the library is chosen.
- One spec section and one plan per group, written just before it runs, as before. For the
  groups the MUI-API spec already covers, its Part C table is the spec; new components and
  DBE-CRM extras get their design when their group starts.
- Until group 6 lands, kept components keep the current Button inside them (Dialog actions,
  Snackbar and Alert actions, Card examples); they follow Button when it changes.
- The release stays at the end (MUI-API spec Part E). `0.1.0` exports only the list.

## Charts: open decision

Two candidates, decided before group 3:

1. **react-native-gifted-charts** (MIT, v1.4.81, 2026-10-05; peer `react-native-svg`), wrapped
   in Solaris components. Faster for axes, scales and tooltips; web (react-native-web) support
   is not documented, so it needs a spike in the docs site on web and a phone first. It has no
   timeline chart and no legend: those are built by Solaris either way.
2. **Solaris's own charts on `react-native-svg`**, porting DBE-CRM's mobile SVG charts
   (`src/Components/Mobile/charts/`) with `d3-shape` / `d3-scale` for the maths (the same
   libraries visx uses underneath). No dependency with unknown web support, one style for all
   six, the timeline built like the rest; more work for Line and Bar.

Either way the apps use Solaris's `<DonutChart>`, `<BarChart>` … with an API shaped on
DBE-CRM's charts, so the library underneath can change. Open questions for group 3: whether
StackedBarChart means BarChart's stacked mode or DBE-CRM's single horizontal percentage bar.

## Out of scope

- Migrating the parked components (group 10 decides).
- The design of the new components (FetchAutocomplete, CheckboxStack, Fallback, Blink,
  CaptionValue, the charts): each in its group.
- MUI breakpoints and the 12-column grid: not on the list; revisit in group 10.
