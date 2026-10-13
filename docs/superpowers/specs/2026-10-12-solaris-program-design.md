# Solaris-ui — program design

Date: 2026-10-12 · Status: agreed in brainstorming, pending written review

Solaris-ui is the organization's React Native component library: Material-based, carrying
the organization's theme and the generic components of its web apps, published to npm and
documented on a live site. It starts as a **hard fork of Glowup** (this repository was cloned
from `itsolutions-dev/Glowup`) and becomes an unrelated product: nothing named Glowup survives.

This document records the decisions that span the whole program and how the work is split.
Each sub-project has its own spec, plan and implementation.

## Decisions

| # | Decision | Consequence |
|---|---|---|
| D1 | Hard fork. Solaris is a different product. | Rename everything; no upstream merges. The `upstream` remote is the owner's to remove. |
| D2 | React Native first (iOS, Android, Web via react-native-web), as Glowup already is. | Web-only features of the MUI apps are translated or left out (see D8). |
| D3 | Components come from porting the MUI app **DBE-CRM** (`C:\dev\DBE-CRM`), on top of Glowup's ~75 components. | Generic pieces become library components; CRM-specific code stays in the app. |
| D4 | **MUI-style API.** MUI's component names where MUI has the component; MUI's prop names and values (`variant`, `color`, `size`, `startIcon`, `open`/`onClose`, `label`/`helperText`/`error`). M3-only components keep their names. | Every component, test, demo and generated doc changes. |
| D5 | **`onClick`**, not `onPress`, on every pressable component. `onChange` passes the **value**, not an event. `style`, not `sx`. | No `onPress` alias: one name per concept. |
| D6 | **MUI-shaped theme input, Material 3 look.** `createTheme({ colorSchemes: { light, dark } })`, MUI v6's own shape; components keep Glowup's M3 visuals, styled by roles derived from the input. | The organization's MUI theme ports almost line for line. |
| D7 | The organization's theme is the **default**, with corrections (see the Identity spec). | `createTheme()` with no argument is the organization's theme. |
| D8 | Not ported: react-hook-form wrappers ("not for now"), the desktop visx charts, the HTML email viewer, pivot table, react-big-calendar, CRM-specific code. | Fields are plain controlled components; apps wire `Controller` themselves. |
| D9 | Icon props are **elements** (`startIcon={<Icon … />}`), not glyph names. | Each app picks its icon set; the library keeps MaterialCommunityIcons for its own chrome. |
| D10 | Built-in strings default to English and are all overridable by props. | The apps pass Italian. |
| D11 | Theming page: light/dark switch, token swatches, a gallery of real components. No palette picker, no live colour editing. | Glowup's 20 preset palettes are removed. |
| D12 | Consumer apps are assumed to be **Expo** (managed, or bare with Expo modules), because of `@expo/vector-icons`. | Revisit if a non-Expo app must consume Solaris. |

## Sub-projects

1. **Identity: rename and theme.** Spec: `2026-10-12-solaris-identity-design.md`.
   Result: the docs site is online as Solaris in the organization's colours, still with
   Glowup's prop names. The package is **not published** yet.
2. **MUI API.** Approach A: rename in place, no compatibility layer, no wrappers. Component
   renames:

   | Glowup | Solaris | Glowup | Solaris |
   |---|---|---|---|
   | Input | TextField | TopAppBar | AppBar |
   | Toggle | Switch | AppBar (react-navigation adapter) | NavigationHeader |
   | RadioButton | Radio (+ RadioGroup) | NavigationBar | BottomNavigation |
   | Modal | Dialog | NavigationDrawer | Drawer |
   | FAB | Fab | Banner | Alert |
   | HelperText | FormHelperText | TouchableRipple | ButtonBase |
   | CardTitle / CardCover | CardHeader / CardMedia | TabContent | TabPanel |
   | ListSection | List | Spinner (number stepper) | NumberField |
   | Calendar / ClockPicker | DateCalendar / TimeClock | DatePickerInput | DateField |

   Also in scope: `variant` values (Button `contained` default, `outlined`, `text`, M3 extras
   such as `tonal` kept as extra values), `color` with the six MUI colours, Typography
   variants `h1`–`h6`, `subtitle1/2`, `body1/2` (default), `caption`, `overline`, `button`
   **at MUI's own sizes** (h1 96 … `button` 14 UPPERCASE; decided 2026-10-12, **superseded 2026-10-13** by the design review's Proposta A scale, sentence-case buttons), with `color`
   accepting palette paths (`"text.secondary"`), `theme.spacing(n)` = 8·n, the organization's
   component defaults (Paper elevation 3), docs URLs following the new names. ButtonGroup
   becomes **SegmentedButtons** (MUI's ButtonGroup is a layout wrapper); **Toolbar** keeps its
   name. Detailed spec: `2026-10-12-solaris-mui-api-design.md`.
   **The first npm publish happens at the end of this sub-project**, so the first published
   API is the MUI one.
3. **Ported components**, in three batches, each with its own plan:
   - **3a**: `Dialog` (`overTitle`, `icon`, `leftAction`, `onSubmit`, `submitLabel`,
     `cancelLabel`, `disableSubmit`), `AppBar` (rounded bottom, `search` and `extra` slots),
     `Drawer` (gradient selected item, nested collapsible sections), `Snackbar` severities,
     `Select` (`nullable`, disabled options, `size`), `Autocomplete` (`multiple`, async with
     debounce), `IconButton` `title` tooltip, `CircularProgress` centre content,
     `LinearProgress` value label, `Stat` `valueColor`, `BottomSheet` title + close header,
     `CaptionValue`, `Button variant="gradient"`, `color` on any hex for `Chip`/`Avatar`
     with `colorFromString()`.
   - **3b**: `SegmentedControl`, `SelectSheet`, `BigButton` + `IconTile`, `MobileStepper`,
     `CheckboxGroup`, `FormControlLabel`.
   - **3c**: charts on react-native-svg: `DonutChart`, `ChartLegend`, `LineChart`,
     `BarChart`, `StackedBar`, and a `chartColors` palette.

Order: 1 → 2 → 3a → 3b → 3c. Sub-project 3 builds on the MUI API from the start.

## Source inventory (DBE-CRM → Solaris)

Generic DBE-CRM pieces already covered by a Glowup component (restyle, plus a few props in
3a): ConfirmDialog; ContentError / NoData / MobilePlaceholder → EmptyState; OtpField →
PinInput; Mobile/BottomSheet → BottomSheet; MobileTabBar → BottomNavigation; StatTile → Stat;
ReportCard / WidgetBox → Card; StyledTooltip → Tooltip rich; DbeDatePicker / DateRangeField →
DatePicker / DateRangePicker; RoundedTabs → ToggleButtonGroup; Select / MultipleChipSelect →
Select; FetchAutoComplete → Autocomplete; StyledSwitch / FormSwitch → Switch; Snackbar →
Snackbar; MobileHeader → AppBar; SectionLabel → Typography `overline`.

DBE-CRM's FlexBox family (184 imports) maps onto `Box` / `Stack`; no presets are added.
