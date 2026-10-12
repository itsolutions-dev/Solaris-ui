# Solaris-ui — sub-project 2: MUI API

Date: 2026-10-12 · Status: pending written review · Program:
`2026-10-12-solaris-program-design.md` (decisions D4, D5, D9, D10)

## Goal

Every Solaris component exposes the API a developer who writes MUI on the web already knows:
MUI's component names, MUI's prop names and values, MUI's defaults and MUI's type scale.
The target is **MUI 9.1.1**, the version the organization's apps use. Its type definitions
(`C:\dev\DBE-CRM\node_modules\@mui\material`, `@mui\x-date-pickers`) are the reference for
every name in this spec.

At the end of this sub-project `@its/solaris-ui` is **published for the first time, as
`0.1.0`**. Only this API is ever published.

## Part A — Binding rules

These rules decide every case the per-component tables do not spell out.

1. **Names.** Where MUI has the component, it takes MUI's name. A component with no MUI
   counterpart keeps its name but follows rules 2–12.
2. **`variant`** takes MUI's values. A Material 3 look the component already has stays as an
   **extra** value (Button `tonal`, Card `filled`/`glow`), never dropped.
3. **`color`**: every component MUI gives a `color` prop gets one, even if that is the only
   change the component needs. It takes `primary | secondary | error | warning | info | success`,
   plus `default` and `inherit` only where MUI has them. The theme has every role for all six
   colours, so this is styling only and rule 10 does not block it.
4. **`size`** is allowed only where MUI has it, with MUI's values. It is not required: a size
   preset that needs a new layout waits (rule 10). Pixel knobs that MUI expresses as presets
   become presets.
5. **Icons are elements**, `React.ReactNode`, never glyph-name strings: `startIcon`, `endIcon`,
   `icon`, `avatar`, `deleteIcon`, `selectedIcon`. The `MaterialCommunityIconsGlyphs` type
   leaves every public prop. The library keeps MaterialCommunityIcons for its own chrome
   (chevrons, close, check). Apps make icon elements with `<Icon>plus</Icon>` (Part B).
6. **Events.** Every pressable takes **`onClick`**. There is no `onPress` alias. **`onChange`
   passes the value, not an event.** React Native events with no MUI equivalent (`onLongPress`,
   `onFocus`, `onBlur`, `onPressIn`, `onPressOut`) stay.
7. **Overlays** use **`open` / `onClose: () => void`**. Dismiss on a tap outside, the Android back
   button or Escape is controlled by **`dismissable`** everywhere.
8. **Fields** use `label`, `helperText`, **`error` as a boolean** (the message goes in
   `helperText`), `required`, `disabled`, `fullWidth`, `placeholder`, and `value` /
   `defaultValue`.
9. **Styling** goes through `style` (React Native). There is no `sx`, `className`, `classes`,
   `slots` or `slotProps`. Accessibility props and `testID` stay.
10. **No new behaviour.** This sub-project renames and reshapes the API. An MUI prop whose
    behaviour the component lacks today is **not added**; the per-component notes name the
    notable ones. Later sub-projects add behaviour.
11. **Defaults follow MUI**, except where MUI's default needs behaviour the component lacks
    (rule 10). Every such exception is listed in its table.
12. **Lists of items stay arrays** (`items`, `tabs`, `steps`, `options`) rather than MUI's
    children (`<Tab/>`, `<MenuItem/>`). Every item uses the same field names: `value`, `label`,
    `icon`, `selectedIcon`, `disabled`, `onClick`, `badge`.

## Part B — Foundations (group G0)

### Type scale

`theme.typography` becomes MUI's 13 styles at **MUI's own sizes**. These are the values from
MUI 9's `createTypography`, converted to React Native: `lineHeight` becomes `fontSize × ratio`
rounded, `letterSpacing` is in px, and casing uses `textTransform`.

| Variant | fontSize | fontWeight | lineHeight | letterSpacing | textTransform |
|---|---|---|---|---|---|
| h1 | 96 | 300 | 112 | -1.5 | |
| h2 | 60 | 300 | 72 | -0.5 | |
| h3 | 48 | 400 | 56 | 0 | |
| h4 | 34 | 400 | 42 | 0.25 | |
| h5 | 24 | 400 | 32 | 0 | |
| h6 | 20 | 500 | 32 | 0.15 | |
| subtitle1 | 16 | 400 | 28 | 0.15 | |
| subtitle2 | 14 | 500 | 22 | 0.1 | |
| body1 | 16 | 400 | 24 | 0.15 | |
| body2 | 14 | 400 | 20 | 0.15 | |
| button | 14 | 500 | 25 | 0.4 | uppercase |
| caption | 12 | 400 | 20 | 0.4 | |
| overline | 12 | 400 | 32 | 1 | uppercase |

- `TypographyVariant` becomes these 13 names.
- `theme.json`'s `typography` is re-keyed to them, and the `_ThemeTokensInSync` guard follows.
- The web font link in `apps/playground/app/+html.tsx` adds Roboto **300**.

**Internal text styles.** Every component's own text moves from Material 3 names to MUI names
using this map:

| Material 3 | MUI | | Material 3 | MUI |
|---|---|---|---|---|
| displayLarge | h2 | | titleMedium | subtitle1 |
| displayMedium | h3 | | titleSmall | subtitle2 |
| displaySmall | h4 | | bodyLarge | body1 |
| headlineLarge | h4 | | bodyMedium | body2 |
| headlineMedium | h5 | | bodySmall | caption |
| headlineSmall | h5 | | labelMedium | caption |
| titleLarge | h6 | | labelSmall | caption |

`labelLarge` maps to **`button`** (uppercase) in the components whose MUI counterpart uses
button typography: Button, Fab, AnimatedFAB, ToggleButton,
SegmentedButtons, SplitButton, ProgressButton, Tabs, and the action buttons of Dialog, Alert
and Snackbar. Everywhere else `labelLarge` maps to **`subtitle2`**. The same map applies to the
docs site and the previews.

### Spacing, shape and colour paths

- **`theme.spacing(n)`** = 8 × n, as a function. The token object (`xs`…`xl`) and
  `ThemeSpacingTokens` are removed. Internal uses migrate xs→`spacing(0.5)`, s→`spacing(1)`,
  m→`spacing(2)`, l→`spacing(3)`, xl→`spacing(4)`.
- **`theme.shape.borderRadius = 4`** is added, as in MUI. It is the unit for `borderRadius`
  numbers in layout props. The named radii (`small`, `medium`, `large`, `extraLarge`, `full`)
  stay for the components' own use.
- **Colour paths.** One shared resolver (in `components/Layout/tokens.ts`) accepts:
  1. A dotted path into `theme.palette` (`"text.secondary"`, `"primary.main"`,
     `"background.paper"`).
  2. A palette colour name (`"primary"` → `palette.primary.main`).
  3. A Material 3 role (`"primaryContainer"`).
  4. Any raw colour.

  Typography `color`, Icon `color` and Box `bgcolor` / `borderColor` all use it.

### Typography

| Current | Target | Change |
|---|---|---|
| `variant` (15 M3 names) = `displayLarge` | `variant?: TypographyVariant = "body1"` | MUI names; the default changes |
| — | `color?: string = "text.primary"` | **added**: palette name, path, role or raw colour |
| — | `align?: "left" \| "center" \| "right" \| "justify"` | added, maps to `textAlign` |
| — | `noWrap?: boolean = false` | added: `numberOfLines={1}`, `ellipsizeMode="tail"` |
| — | `gutterBottom?: boolean = false` | added: `marginBottom` = 0.35 × fontSize |

### Icon

| Current | Target | Change |
|---|---|---|
| `source: IconSource` (glyph name, image or render function) | `children?: string`: a MaterialCommunityIcons glyph name (`<Icon>plus</Icon>`); `source?: ImageSourcePropType \| render function` | a glyph is the children, as with MUI's `Icon`; images and render functions stay on `source` |
| `size: number = 24` | `fontSize?: "small" \| "medium" \| "large" \| number = "medium"` | MUI names: small 20, medium 24, large 35; a number stays allowed |
| `color?: string` | `color?: string` | goes through the colour-path resolver |
| `flipForRTL`, `style`, `testID` | unchanged | |

## Part C — Components by group

Each table lists **only the props that change**. A prop not listed is unchanged. "→" means
rename. Every `onPress` becomes `onClick` and every `style?: object` becomes
`style?: StyleProp<ViewStyle>`; those two changes are not repeated in the tables.

### G1 — Layout and surfaces

**Box.** Applies to Stack, HStack, VStack, Center, Grid and AspectRatio too.

| Current | Target | Change |
|---|---|---|
| `p, px, py, pt, pr, pb, pl` (token or raw dp) | same names: `number` | **a number means × 8** (`p={2}` = 16); tokens are removed |
| `m, mx, my, mt, mr, mb, ml` | same names: `number \| "auto"` | × 8, as above; negative numbers are allowed |
| `gap` | `gap`, plus new `rowGap` and `columnGap`: `number` | × 8 |
| `row: boolean` | `flexDirection?: "row" \| "row-reverse" \| "column" \| "column-reverse"` | |
| `wrap: boolean` | `flexWrap?: "wrap" \| "nowrap" \| "wrap-reverse"` | |
| `align` / `justify` | `alignItems` / `justifyContent` | |
| `width`, `height` | `number \| string` | a number in (0, 1] is a percentage (`0.5` = 50%), as in MUI |
| `bg` | `bgcolor` | colour-path resolver |
| `borderWidth` | `border?: number` | width in px (MUI `border={1}`) |
| `borderColor` | `borderColor` | colour-path resolver |
| `radius` (token or raw) | `borderRadius?: number` | × `shape.borderRadius` (4): `borderRadius={2}` = 8 |

**Stack.** Box rows plus:

| Current | Target | Change |
|---|---|---|
| `direction: "vertical" \| "horizontal"` | `direction?: "row" \| "row-reverse" \| "column" \| "column-reverse" = "column"` | |
| `reverse` | removed | use the `*-reverse` directions |
| `spacing = "s"` | `spacing?: number = 0` | × 8; **the default becomes 0**, as in MUI |

- **HStack / VStack** (no MUI counterpart): Box rows; `spacing?: number = 0` (× 8); `reverse`
  is kept.
- **Center** (no MUI counterpart): Box rows.
- **Spacer** (no MUI counterpart): `size` becomes a number × 8. Leaving it out still fills the
  remaining space.
- **Grid**: `spacing?: number = 0` (× 8). `columns` and `minChildWidth` are unchanged:
  `columns` is a fixed column count, not MUI's 12-column model, and that difference is
  documented on the page.
- **AspectRatio**: Box rows.

**Divider**

| Current | Target | Change |
|---|---|---|
| `inset: number` | `variant?: "fullWidth" \| "inset" \| "middle" = "fullWidth"` | inset = 72 at the start; middle = 16 at each end |

`thickness` and `contentSpacing` are kept as extras.

**Paper**

| Current | Target | Change |
|---|---|---|
| `elevation = 1` (0–5) | `elevation?: number = 3` | MUI's 0–24 scale, mapped onto the 5 shadow levels: 0→0, 1→1, 2–3→2, 4–7→3, 8–15→4, 16–24→5 |
| `outline`, `glow` | `variant?: "elevation" \| "outlined" \| "glow" = "elevation"` | `glow` is an extra value |

**Card**

| Current | Target | Change |
|---|---|---|
| `variant = "filled"` (`elevated`, `filled`, `outlined`, `glow`) | `variant?: "elevation" \| "outlined" \| "filled" \| "glow" = "elevation"` | `elevated` → `elevation`; **the default becomes `elevation`** (MUI) |

**CardTitle → CardHeader**

| Current | Target | Change |
|---|---|---|
| `title` (required) | `title?: ReactNode` | now optional |
| `subtitle` | `subheader` | |
| `left` | `avatar` | |
| `right` | `action` | |
| `subtitleNumberOfLines` | `subheaderNumberOfLines` | `titleNumberOfLines` is unchanged |

- **CardCover → CardMedia**: `source` → `image`.
- **CardContent, CardActions**: unchanged.

**Image**

| Current | Target | Change |
|---|---|---|
| `radius` | `borderRadius?: number` | × 4 |
| `fallbackIcon` (glyph) | `fallbackIcon?: ReactNode` | |
| `width`, `height` | same | the fraction rule as Box |

**Skeleton**

| Current | Target | Change |
|---|---|---|
| `variant = "rect"` (`rect`, `circle`, `text`) | `variant?: "text" \| "rectangular" \| "rounded" \| "circular" = "text"` | MUI values and default |
| `animate = true` | `animation?: "pulse" \| false = "pulse"` | |
| `borderRadius` | removed | use `variant="rounded"` or `style` |

**TouchableRipple → ButtonBase**: renamed, plus the `onClick` rule. `rippleColor`,
`underlayColor`, `activeStyle`, `borderless` and `borderRadius` (raw dp) are kept.

### G2 — Actions

**Button**

| Current | Target | Change |
|---|---|---|
| `mode = "filled"` | `variant?: "contained" \| "outlined" \| "text" \| "tonal" = "contained"` | filled → contained; `tonal` is an extra value |
| `tone = "primary"` (primary, error, success) | `color?: "primary" \| "secondary" \| "error" \| "warning" \| "info" \| "success" \| "inherit" = "primary"` | |
| `iconName`, `iconPosition` | `startIcon?: ReactNode`, `endIcon?: ReactNode` | |
| `iconStyle` | removed | style the element you pass |
| `size: number` (icon size) | `size?: "small" \| "medium" \| "large" = "medium"` | a preset for height, padding and icon size |

- The label uses the `button` style (UPPERCASE).
- The exported helper `getButtonColors(theme, mode, tone)` becomes
  `getButtonColors(theme, variant, color)`. It looks up `colors[c]`, `colors.on<C>`,
  `colors[c + "Container"]` and `colors["on" + C + "Container"]`.
  - `inherit` means `onSurface` text, a transparent fill for `text` / `outlined`, and
    `surfaceContainerHighest` for `contained` / `tonal`.
  - The outlined border stays `outline` for `primary` and the colour's main role for the others,
    as today.
- `ButtonMode` / `ButtonTone` are renamed `ButtonVariant` / `ButtonColor`.

**IconButton**

| Current | Target | Change |
|---|---|---|
| `icon` (glyph, required) | `children: ReactNode` | the icon element, as in MUI |
| `mode = "standard"` | `variant?: "standard" \| "contained" \| "tonal" \| "outlined" = "standard"` | filled → contained |
| — | `color?: "default" \| "inherit" \| "primary" \| "secondary" \| "error" \| "warning" \| "info" \| "success" = "default"` | added |

**FAB → Fab**

| Current | Target | Change |
|---|---|---|
| `icon` (glyph), `label` | `children: ReactNode` | the icon element, followed by the label text when extended |
| `size = "regular"` (small, regular, large, extended) | `size?: "small" \| "medium" \| "large" = "medium"`, `variant?: "circular" \| "extended" = "circular"` | regular → medium; extended moves to `variant` |
| — | `color?: "default" \| "primary" \| "secondary" \| "error" \| "warning" \| "info" \| "success" = "default"` | added. `default` is `surfaceContainerHigh`; a colour fills its container role (Material 3 look) |
| — | `accessibilityLabel`, `testID` | added |

**AnimatedFAB** (no MUI counterpart): `icon` becomes a ReactNode; adds `color` (as Fab).

**SpeedDial**

| Current | Target | Change |
|---|---|---|
| `mainIcon` (glyph) | `icon?: ReactNode` | |
| `actions[].icon` (glyph), `actions[].onPress` | `icon: ReactNode`, `onClick` | |
| — | `open?`, `onOpen?`, `onClose?` | added: controlled mode next to `defaultOpen` |

**ButtonGroup → SegmentedButtons** (no MUI counterpart: MUI's `ButtonGroup` is a layout
wrapper, which Solaris does not have)

| Current | Target | Change |
|---|---|---|
| `onValueChange` | `onChange(value: string \| string[])` | |
| `mode = "tonal"` | `variant?: "tonal" \| "outlined" \| "contained" \| "text" = "tonal"` | |
| `size = "s"` (xs, s, m) | `size?: "small" \| "medium" \| "large" = "medium"` | xs → small, s → medium, m → large |
| `options[].icon` (glyph) | `ReactNode` | |
| — | `color?` (Button colours) `= "primary"` | added |

**SplitButton** (no MUI counterpart): `iconName` → `startIcon`;
`mode` → `variant?: "contained" | "tonal" | "outlined" = "contained"`; adds `color`.
`items[]` follow Menu's item shape (G6).

**ProgressButton** (no MUI counterpart): `mode` → `variant` (as Button); `iconName` →
`startIcon`; `errorIconName` → `errorIcon?: ReactNode`; `successIconName` →
`successIcon?: ReactNode`. Adds `color` (idle and loading states) and `size`. `progress` stays
0–1.

**ToggleButton**

| Current | Target | Change |
|---|---|---|
| `active` | `selected` | |
| `label`, `icon` (glyph) | `children: ReactNode` | |

**ToggleButtonGroup**

| Current | Target | Change |
|---|---|---|
| `onValueChange` | `onChange(value: string \| string[])` | |
| `multiSelect = false` | `exclusive?: boolean = true` | **inverted** |
| `options[].icon` | `ReactNode` | |
| — | `color?: "standard" \| "primary" \| "secondary" \| "error" \| "warning" \| "info" \| "success" = "standard"` | added |

**Chip**

| Current | Target | Change |
|---|---|---|
| `mode = "filled"` | `variant?: "filled" \| "outlined" \| "tonal" = "filled"` | `tonal` is an extra value |
| `icon` (glyph) | `icon?: ReactNode` | |
| `onClose` | `onDelete?: () => void`, `deleteIcon?: ReactNode` | MUI names; `onClose` is reserved for overlays |
| `label: string` | `label: ReactNode` | |
| — | `color?: "default" \| "primary" \| "secondary" \| "error" \| "warning" \| "info" \| "success" = "default"` | added |

**ChipGroup** (no MUI counterpart): `onValueChange` → `onChange`; `mode` →
`variant = "outlined"`; option icons become ReactNode; adds `color` and `disabled`, both passed
to Chip.

**Link**

| Current | Target | Change |
|---|---|---|
| `color?: string` | `color?: "primary" \| "secondary" \| "error" \| "warning" \| "info" \| "success" = "primary"` | raw colours go through `style` |
| `variant` (M3) = `bodyMedium` | `variant?: TypographyVariant = "body1"` | |
| `externalIcon` (glyph) | `externalIcon?: ReactNode` | |

### G3 — Inputs

**Input → TextField**

| Current | Target | Change |
|---|---|---|
| `onChangeText` | `onChange(value: string)` | |
| — | `defaultValue?: string` | added (uncontrolled) |
| `error?: string` | `error?: boolean` | the message goes in `helperText` |
| `numberOfLines` | `rows?: number` | |
| `minHeight` | removed | `style` |
| `leadingIcon`, `trailingIcon` | `startAdornment?: ReactNode`, `endAdornment?: ReactNode` | |
| `onTrailingIconPress` | removed | put an `IconButton` in `endAdornment` |
| `secureTextEntry` | `type?: "text" \| "number" \| "password"` | password replaces `secureTextEntry` |
| `readonly` | `readOnly` | |
| — | `fullWidth?: boolean`, `color?` (six) `= "primary"` | added; `color` is the focus colour |

Kept as extras: `prefix`, `suffix`, `precision`, `maxLength`. MUI's `variant="standard"` and
`size` are not added (rule 10).

**Select**

| Current | Target | Change |
|---|---|---|
| `onSelect` | `onChange(value)` | |
| `multiSelect`, `selectedValues`, `toggleOptions` | `multiple?: boolean`; with it, `value` and `onChange` carry arrays | three props merge into MUI's one |
| `error?: string` | `error?: boolean`, `helperText?: string` | |
| `options[].icon` | `ReactNode` | |
| — | `open?`, `onOpen?`, `onClose?`, `required?`, `fullWidth?` | added |

`showAsChips`, `optionStyle` and `defaultOpen` are kept.

**Autocomplete**

| Current | Target | Change |
|---|---|---|
| `value` (the typed text) | `inputValue?: string` | **meaning moves**: `value` is now the selected option |
| `onChangeText` | `onInputChange(text: string)` | |
| `onSelect(option)` | `onChange(option \| null)` | |
| — | `value?: AutocompleteOption \| null` | added |
| `leadingIcon` | `startAdornment?: ReactNode` | |
| `error?: string` | `error?: boolean` | |
| `emptyMessage` | `noOptionsText` | MUI name |
| `clearAccessibilityLabel` | `clearText` | MUI name |
| `options[].icon` | `ReactNode` | |

Kept: `filter`, `maxSuggestions`, `minChars`, `clearable`.

**SearchBar** (no MUI counterpart): `onChangeText` → `onChange`; `leadingIcon` →
`startIcon?: ReactNode`; adds `accessibilityLabel` and `testID`.

**PinInput** (no MUI counterpart): `onChangeText` → `onChange`; `error` becomes a boolean.

**Spinner → NumberField**: renamed only. MUI 9.1.1 Material has no NumberField; the name says
what the component is.

**Checkbox**: `onValueChange` → `onChange(checked: boolean)`; adds
`color?: "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success" = "primary"`.

**RadioButton → Radio**: `selected` → `checked`; `onPress` →
`onChange?: (checked: boolean) => void`; adds `color` (as Checkbox).

**RadioGroup**

| Current | Target | Change |
|---|---|---|
| `onValueChange` | `onChange(value)` | |
| `direction = "column"` | `row?: boolean = false` | |
| `error?: string` | `error?: boolean`, `helperText?: string` | |
| — | `color?` | added, passed to Radio |

**Toggle → Switch**

| Current | Target | Change |
|---|---|---|
| `value` | `checked` | |
| `onValueChange` | `onChange(checked: boolean)` | |
| `width`, `height` | `size?: "small" \| "medium" = "medium"` | medium is today's default look; small is 75% of it |
| `containerStyle` | `style` | |
| — | `color?` (as Checkbox) `= "primary"` | added |

**Slider**

| Current | Target | Change |
|---|---|---|
| `onValueChange` | `onChange(value: number)` | |
| `onSlidingComplete` | `onChangeCommitted(value: number)` | |
| `showValueLabel = false` | `valueLabelDisplay?: "auto" \| "off" = "off"` | `auto` is today's behaviour (a label plus a bubble while dragging); `on` is not added |
| — | `color?` (six) `= "primary"` | added |

**Rating**

| Current | Target | Change |
|---|---|---|
| `value: number`, `onChange(value)` | `value: number \| null`, `onChange(value: number \| null)` | |
| `size: number = 24` | `size?: "small" \| "medium" \| "large" = "medium"` | 18 / 24 / 30 |

**FormControl**: `error` becomes a boolean.

**HelperText → FormHelperText**: `type: "info" | "error"` → `error?: boolean = false`. `visible`
and `padding` are kept.

### G4 — Dates

Values stay JavaScript `Date`; there is no date adapter and no new dependency.

**Pickers, common props** (DatePicker, TimePicker, DateTimePicker, DateRangePicker, DateField):

| Current | Target | Change |
|---|---|---|
| `value: Date \| null` (required) | `value?: Date \| null` | range: `[Date \| null, Date \| null]` instead of `{ startDate, endDate }` |
| — | `defaultValue?` | added (uncontrolled) |
| `onChange(date: Date)` | `onChange(value: Date \| null)` | range: `onChange([start, end])`. **Clearing calls `onChange(null)`** |
| `onClear` | removed | folded into `onChange(null)` |
| `validRange.startDate` / `endDate` | `minDate?: Date`, `maxDate?: Date` | |
| `validRange.disabledDates`, `isDateDisabled` | `shouldDisableDate?: (date: Date) => boolean` | merged |
| `use24HourClock` | `ampm?: boolean` (default from the locale) | **inverted** |
| `minuteInterval` | `minutesStep` | |
| `error?: string` | `error?: boolean` | the message goes in `helperText` |
| `inputEnabled` | removed | `readOnly` covers it |
| — | `readOnly?`, `fullWidth?`, `open?`, `onOpen?`, `onClose?` | added; `open` is wired in the shared `usePickerParts` hook |
| `mode`, `selectionMode` | removed | each picker is its own component |

Kept as extras: `clearable`, `defaultOpen`, `defaultInputType`, `scrollMode`, `startYear`,
`endYear`, `firstDayOfWeek`, `labels`, `relativeLabels`, `locale`.

- **DatePicker** is today's `DateTimePicker` with `mode="date"`. Its type omits `ampm` and
  `minutesStep`. Range selection moves to DateRangePicker, multiple selection to DateCalendar.
- **TimePicker** is `mode="time"`. Its type omits `shouldDisableDate`, `scrollMode`,
  `startYear`, `endYear`, `firstDayOfWeek` and `relativeLabels`. `minDate` / `maxDate` still
  clamp the clock on the boundary day.
- **DateTimePicker** is `mode="datetime"`. Both the native shell (`DateTimePicker.tsx`) and the
  web shell (`.web.tsx`) take `open` from the hook; on web, Escape calls `onClose`.
- **DateRangePicker**: the common props in tuple form. `shouldDisableDate` keeps the
  one-argument signature.
- **DatePickerInput → DateField**: the common props. Its trailing icon still opens the calendar
  (a Solaris extension of MUI X's DateField). An empty blur calls `onChange(null)`.

**Calendar → DateCalendar**

| Current | Target | Change |
|---|---|---|
| `value` / `dates` / `range`, with `onChange` / `onDatesChange` / `onRangeChange` | `value` + `onChange`, typed by `selectionMode` (`Date`, `Date[]` or `[Date \| null, Date \| null]`) | merged into one discriminated union |
| `validRange`, `isDateDisabled` | `minDate`, `maxDate`, `shouldDisableDate` | |
| — | `defaultValue?`, `disabled?`, `readOnly?` | added |

Kept: `selectionMode`, `startYear`, `endYear`, `firstDayOfWeek`, `locale`, `labels`,
`scrollMode`, `showToday`, `keyboardNavigation`, `autoFocus`, `onRequestClose`.

**ClockPicker → TimeClock**

| Current | Target | Change |
|---|---|---|
| `minimumDate` / `maximumDate` | `minTime` / `maxTime` | |
| `use24HourClock` | `ampm` | inverted |
| `minuteInterval` | `minutesStep` | |
| `value`, `onChange` (required) | optional; `defaultValue?` added | `value` stays non-null |

**ClockDial** (no MUI counterpart): `isTimeDisabled` → `shouldDisableTime`; `minuteInterval` →
`minutesStep`; `use24HourClock = false` → `ampm?: boolean = true` (inverted, so rendering is
unchanged).

**Shared plumbing.** These must change together: `DateTimePicker.shared.ts` (`DateRange`
becomes a tuple, `ValidRange` is removed, the prop unions are removed, `EMPTY_RANGE` becomes
`[null, null]`), `.hooks.ts` (`usePickerController`, `usePickerParts`), `.surface.tsx` and
`.field.tsx`.

### G5 — Navigation

**TopAppBar → AppBar**: adds
`color?: "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success" | "transparent" = "default"`,
where `default` is today's surface. `title`, `subtitle`, `leading`, `actions`, `variant`
(small, center, medium, large), `elevated`, `divider` and `safeArea` are kept. `position` is not
added (rule 10).

**AppBar (react-navigation adapter) → NavigationHeader**: renamed. The `navigation`, `options`,
`route` and `back` contract is unchanged. Internally it renders the new AppBar and IconButton.

**Toolbar**: the name is kept (decision), as is the API: the Material 3 bottom action bar.
`fab` becomes a ReactNode where it isn't already.

**NavigationBar → BottomNavigation**

| Current | Target | Change |
|---|---|---|
| `items[].id` | `value: string \| number` | |
| `items[].icon` (glyph; active state strips `-outline`) | `icon: ReactNode`, `selectedIcon?: ReactNode` | |
| `items[].badgeCount` | `badge?: number` | |
| `activeId` | `value` | |
| `onItemPress(id)` | `onChange(value)` | |
| `showLabels = "always"` (always, selected) | `showLabels?: boolean = true` | `false` = label on the selected item only |

**NavigationRail** (no MUI counterpart): the same item and `value` / `onChange` changes;
`showLabels` keeps its three values.

**NavigationDrawer → Drawer**

| Current | Target | Change |
|---|---|---|
| `variant = "standard"` (standard, modal) | `variant?: "permanent" \| "temporary" = "temporary"` | standard → permanent, modal → temporary; **default `temporary`** (MUI) |
| `visible`, `onDismiss` | `open`, `onClose` | |

`width`, `title` and `footer` are kept. MUI's `persistent` and `anchor` are not added.

- **DrawerItem** (kept name): `icon` becomes a ReactNode; adds `selectedIcon`.
- **DrawerSection** (kept name): `showDivider` → `divider`.

**Tabs**

| Current | Target | Change |
|---|---|---|
| `activeTab: number` | `value: number \| string` | |
| `onChange(index)` | `onChange(value)` | |
| `tabs[].icon` (glyph) | `icon?: ReactNode`; adds `value?` (defaults to the index) | strings stay allowed |

Tabs keep filling the width, which is MUI's `fullWidth`. `variant` is not added (rule 10).

**TabContent → TabPanel**: `activeTab` → `value`. It shows the child at that index, as today.

**Breadcrumbs**: `items[].icon` becomes a ReactNode; `separator` becomes a ReactNode.
`maxItems` is unchanged.

**Pagination**

| Current | Target | Change |
|---|---|---|
| `totalPages` | `count` | |
| `onPageChange(page)` | `onChange(page)` | |
| `showFirstLast` | `showFirstButton?`, `showLastButton?` | split |
| — | `color?: "standard" \| "primary" \| "secondary" = "standard"` | added (rule 3): the selected page's colour |

**Stepper**: `steps[].icon` becomes a ReactNode; `onStepPress` → `onStepClick(index)`.

### G6 — Overlays and feedback

**Modal → Dialog**

| Current | Target | Change |
|---|---|---|
| `visible` | `open` | |
| `onClose` (close button) + `onDismiss` (back, Escape, scrim) | `onClose?: () => void` | one callback for every way of closing |
| `icon` | `icon?: ReactNode` | |
| `scrollable` | `scroll?: "paper" \| "body" = "paper"` | `paper` = the body scrolls inside the dialog (today's `scrollable`) |
| `transparent` | removed | always on internally |

`title`, `actions`, `closeText`, `dismissable`, `fullScreen` and `animationType` are kept. The
default `testID` becomes `"dialog"`.

**ConfirmDialog**: `visible` → `open`; `icon` becomes a ReactNode. `onConfirm` and `onCancel`
are kept.

- **Menu**: `visible` → `open`, `onDismiss` → `onClose`; items take `onClick` and an `icon`
  ReactNode. `anchor`, `closeOnSelect`, `trailing`, `destructive` and `dividerAbove` are kept.
- **Popover**: `visible` → `open`, `onDismiss` → `onClose`. `anchor` and `matchAnchorWidth` are
  kept.

**Tooltip**

| Current | Target | Change |
|---|---|---|
| `content` (the tip text) | `title: ReactNode` | MUI's name for the tip |
| `title` (rich-tooltip heading) | `heading?: string` | renamed to free `title` |
| `position` | `placement?: "top" \| "bottom" \| "left" \| "right" = "top"` | |
| `hideDelay` | `leaveTouchDelay` | |
| `action.onPress` | `action.onClick` | |

**BottomSheet**: `visible` → `open`, `onDismiss` → `onClose`, `dismissOnScrimTap` →
`dismissable`.

**SideSheet**: `visible` → `open`, `onDismiss` → `onClose`.

**Banner → Alert**

| Current | Target | Change |
|---|---|---|
| `visible` | `open?: boolean` | kept as an extra (MUI's Alert is always rendered) |
| `message` | `children: ReactNode` | |
| `type = "default"` (default, info, warning, error) | `severity?: "success" \| "info" \| "warning" \| "error" = "info"` | `default` → `info`; `success` is new |
| `icon` (glyph) | `icon?: ReactNode \| false` | |
| `actions[]` | `action?: ReactNode` | pass Buttons |
| `dismissable` + `onDismiss` | `onClose?: () => void` | the close button shows when `onClose` is set |
| — | `color?: "success" \| "info" \| "warning" \| "error"` | added (rule 3): overrides the colour `severity` picks |

The imperative **`Alert(title, message, buttons)`** function in `AlertProvider` becomes
**`showAlert(…)`**, so the name `Alert` belongs to the component.

**Snackbar**

| Current | Target | Change |
|---|---|---|
| `visible`, `onDismiss` | `open`, `onClose` | |
| `message: string` | `message: ReactNode` | |
| `action: { label, onPress }` | `action?: ReactNode` | |
| `duration = 4000` | `autoHideDuration?: number \| null = 4000` | `null` never hides |
| `icon` (glyph) | `icon?: ReactNode` | |

`type` stays until sub-project 3a brings `severity`.

**Toast** (`useToast`): its options mirror Snackbar: `duration` → `autoHideDuration`, `icon` and
`action` become ReactNodes. `show`, `success`, `error`, `hide` and the queue are unchanged.

**CircularProgress**

| Current | Target | Change |
|---|---|---|
| `progress` 0–1 | `value?: number` (0–100) | |
| — | `variant?: "determinate" \| "indeterminate" = "indeterminate"` | added. **MUI's default: `value` only counts with `determinate`** |
| `color?: string` | `color?: "primary" \| "secondary" \| "error" \| "warning" \| "info" \| "success" \| "inherit" = "primary"` | |
| `strokeWidth` | `thickness` | |

**LinearProgress**: `progress` → `value` (0–100); `indeterminate: boolean` →
`variant?: "determinate" | "indeterminate" = "indeterminate"`; `color` as CircularProgress.
`trackColor`, `height` and the durations are kept.

### G7 — Display

**Avatar**

| Current | Target | Change |
|---|---|---|
| `source` | `src` | |
| `name` | `alt` | the initials come from `alt` |
| `icon` (glyph) | `children?: ReactNode` | the fallback content |

Kept as Solaris extras: `size` (a number), `status`, `backgroundColor`, `textColor`, `variant`.

**Badge**

| Current | Target | Change |
|---|---|---|
| `count` | `badgeContent?: ReactNode` | |
| `visible = true` | `invisible?: boolean = false` | **inverted** |
| `size = "large"` (small, large) | `variant?: "standard" \| "dot" = "standard"` | small → dot |
| — | `color?: "default" \| "primary" \| "secondary" \| "error" \| "warning" \| "info" \| "success" = "default"` | added. **The default is grey** (MUI) |

The badge stays standalone: MUI's wrap-a-child form is not added (rule 10).

- **Stat** (no MUI counterpart): `icon` becomes a ReactNode.
- **StatusBadge** (no MUI counterpart): `type` → `color?` (six) `= "success"`; `icon` becomes a
  ReactNode.
- **EmptyState** (no MUI counterpart): `icon` becomes a ReactNode;
  `action: { label, onPress, iconName }` → `action?: ReactNode` (pass a Button).
- **ListSection → List**: `title` → `subheader?: ReactNode`. `divider` is kept.
- **ListItem**: `trailing` → `secondaryAction`; `itemContainerStyle` → `style`. `leading`,
  `secondary` and the text and state style extras are kept.
- **ListSubheader**: adds `color?: "default" | "primary" = "default"` (rule 3).
- **Table, TableHead, TableRow, TableCell**: unchanged.
- **TableHeaderCell** (kept name): `sortDirection: null` → `false`.

**DataGrid** (MUI X names)

| Current | Target | Change |
|---|---|---|
| `data` | `rows` | |
| `columns[].id` / `label` | `field` / `headerName` | |
| `density = "normal"` (normal, dense) | `density?: "standard" \| "compact" = "standard"` | MUI's `comfortable` is not added |
| `sortColumn`, `sortDirection`, `onSort` | `sortModel?: { field: string; sort: "asc" \| "desc" }[]`, `onSortModelChange?` | |
| `onEndReached` | `onRowsScrollEnd` | `onEndReachedThreshold` is kept (a FlatList fraction, not MUI's px) |
| `onColumnReorder` | `onColumnOrderChange` | |

**Accordion**

| Current | Target | Change |
|---|---|---|
| `startExpanded` | `defaultExpanded` | |
| — | `expanded?: boolean` | added (controlled) |
| `onPress(expanded)` | `onChange(expanded: boolean)` | |
| `title: string` | `title: ReactNode` | |

**Collapse**

| Current | Target | Change |
|---|---|---|
| `open` | `in` | |
| `collapsedHeight` | `collapsedSize` | |
| `duration` | `timeout` | |
| `keepMounted = false` | `unmountOnExit?: boolean = false` | **inverted, with MUI's default: collapsed content stays mounted** |

**Carousel** (no MUI counterpart): `onIndexChange` → `onChange(index)`.

**Providers**: ThemeProvider, ToastProvider and AlertProviderWrapper are unchanged.
AlertProvider changes only through `showAlert`.

## Part D — How each group lands

A group is done when **all** of these hold for every component it touches:

1. **Library.** The component, its exported types and the barrel names change. Other library
   components that use it are updated in the same group.
2. **Tests.** Existing tests are updated. Each semantic change the group introduces gets one
   behaviour test: `onChange` passes the value, `error` is a boolean, `open` / `onClose`, an
   inverted flag, the 0–100 progress scale, × 8 spacing.
3. **Docs site.**
   - `catalogue/registry/*.ts` (the prop controls), `categories.ts`, the `CATALOGUE` list in
     `__tests__/playground-catalogue.test.tsx`, `demos.tsx` and `catalogue/variants/manual/*`
     are updated.
   - So are `ComponentPreview.tsx` and every `site/*` and `app/*` file that uses the component.
   - A renamed component's page moves with its name (`/components/TextField`).
4. **Previews and design-sync.** `.design-sync/previews/<Name>.tsx` is updated, renamed for a
   renamed component. Also updated: the override keys in `.design-sync/config.json`, the
   names in `split-docs.mjs`, and the component's section of
   `packages/ui/src/components/components.md`.
5. **Generated files.** `npm run docgen` and `npm run variants` are re-run.
6. **Gates.** `lint`, `type-check`, `test`, `build`, `validate-package` and `export:web` pass.
   A visual check of the group's pages runs in a browser, in light and dark.

**Plans.** The spec covers G0–G8. One implementation plan is written per group, just before
that group runs, against the code the previous group left.

## Part E — Release (group G8)

- `packages/ui/README.md`: the hand-written component reference is replaced by a link to the
  docs site, whose prop tables are generated and cannot drift. `components.md` stays, because
  it feeds design-sync.
- `examples/consumer` moves to the new API.
- `private: true` is removed and a changeset is added. The package's first version is
  **`0.1.0`**.
- `consumer-smoke.yml` gets its `schedule` and `workflow_run` triggers back.
- The getting-started page drops "not yet published".
- **Owner action**: make sure the `@its` npm scope can publish `@its/solaris-ui` before G8 is
  merged.

## Out of scope

- Children composition (`<Tab/>`, `<MenuItem/>`, `<BottomNavigationAction/>`), `sx`, slots,
  responsive values.
- Every MUI prop the notes mark "not added", and the new behaviour they would need.
- Sub-project 3: Dialog `onSubmit` / `overTitle`, AppBar `search`, Snackbar `severity`, colour
  tinting of Chip and Avatar, the gradient button, mobile pieces and charts.
