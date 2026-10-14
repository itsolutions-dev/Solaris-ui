# Solaris Component Library — Specification

IT Solutions' Material-based component library. Reference spec for rebuilding this
UI kit on a chosen frontend framework. Current implementation: **Expo React Native**
(iOS / Android / Web) using `expo-vector-icons/MaterialCommunityIcons`.

Use this file as input to a chat to decide which frontend framework to target for a new
project. It documents every component, its props, defaults, and the design-token system —
framework-agnostic.

---

## 1. Design System

### 1.1 Principles

- Material Design 3 visuals — tonal surfaces, state layers, "glow" focus — driven by an MUI-shaped theme.
- Theme-reactive: every component reads a `theme` object; light + dark variants.
- Cross-platform: one API renders on native and web. Hover states are web-only; press/ripple on native.
- Accessibility built in: roles, states (`selected`, `checked`, `expanded`, `disabled`), ARIA attrs on web.

### 1.2 Color tokens (per mode: light / dark)

The theme is MUI-shaped in, Material 3 out. `createTheme(options)` takes MUI v6's
`colorSchemes` shape and derives the full M3 role set (`theme.colors`, each `xxx` paired with
`onXxx`) plus MUI's read shape (`theme.palette`). The organization's inputs:

| Input                       | Light                    | Dark                           |
| --------------------------- | ------------------------ | ------------------------------ |
| primary                     | `#1D5B9D`                | `#5893D4`                      |
| secondary (slate)           | `#556579`                | `#94A3B8`                      |
| tertiary (brand green)      | `#61B340`                | `#61B340`                      |
| error / warning             | `#B00020` / `#A94E08`    | `#F2B8B5` / `#FCA600`          |
| info / success              | `#0A6C94` / `#2F7A1B`    | `#7CC4E6` / `#61B340`          |
| background.default / paper  | `#F0F2F5` / `#FFFFFF`    | `#111111` / `#171717`          |
| text.primary / secondary    | `#15181D` / `#556579`    | `#EDEDED` / `#94A3B8`          |
| divider                     | `#DDE1E7`                | `#2E2E2E`                      |

This is **Proposta A** of the design review (`docs/design/solaris-ui-themes.pdf`). The
default theme also pins the sheet's exact roles (`theme.json` `colors`, 35 per scheme,
checked against `docs/design/solaris-themes.json`), for the values the derivation below cannot
guess, such as `primaryContainer` `#E8F0FA`.

Derivation, for each of primary, secondary, error, warning, info, success:

- `xxx` = the input `main`, normalised to `#RRGGBB`.
- `onXxx` = `contrastText` if given, else black or white, whichever contrasts more (≥ 4.58:1).
- `xxxContainer` / `onXxxContainer` = tones 90 / 10 (light) or 30 / 90 (dark) of a tonal palette
  of `main`'s hue at chroma 48.
- `background` / `surface` = `background.default` / `paper`; `onSurface` = `text.primary` or
  a neutral tone; `onSurfaceVariant` = `text.secondary`; `outlineVariant` = `divider`.
- Tertiary (unless given), the surface containers, inverse roles and `outline` come from the primary hue.
- An app that passes a palette colour replaces the default's pinned roles for that colour's family (for `primary`: also the roles derived from its hue); roles it does not touch keep the default's pins. `createTheme` also takes `typography.<step>`, `shape`, `colorSchemes.<mode>.colors` (exact roles) and `icons`.

Selection and tonal states (navigation indicators, selected chips, tonal buttons) use the
**primary** container roles: `secondary` is slate; the brand green is `tertiary`.

### 1.3 Typography scale (Proposta A)

`fontFamily`: Roboto on Android and web, the system font on iOS unless the app embeds Roboto and passes `createTheme({ typography: { fontFamily: Platform.OS === "ios" ? "Roboto" : undefined } })`. `variant` prop selects one.

| Variant   | Size | Line | Weight | Tracking | Case      |
| --------- | ---- | ---- | ------ | -------- | --------- |
| h1        | 32   | 40   | 700    | 0        |           |
| h2        | 32   | 40   | 700    | 0        |           |
| h3        | 32   | 40   | 700    | 0        |           |
| h4        | 32   | 40   | 700    | 0        |           |
| h5        | 24   | 32   | 700    | 0        |           |
| h6        | 22   | 28   | 500    | 0        |           |
| subtitle1 | 16   | 24   | 500    | 0        |           |
| subtitle2 | 14   | 20   | 500    | 0        |           |
| body1     | 16   | 24   | 400    | 0        |           |
| body2     | 14   | 20   | 400    | 0        |           |
| button    | 14   | 20   | 500    | 0        | sentence  |
| caption   | 12   | 16   | 400    | 0        |           |
| overline  | 11   | 16   | 500    | 0.5      | uppercase |

MUI's variant names carry the Material 3 sizes of the CRM (Roboto, three weights). h1–h3 and
caption are not on the sheet: h1–h3 repeat h4, caption is 12/16.

### 1.4 Spacing & Shape

- **Spacing**: `theme.spacing(n)` = 8 × n, as in MUI: `spacing(0.5)` 4, `spacing(1)` 8, `spacing(2)` 16, `spacing(3)` 24, `spacing(4)` 32. Fractions and negatives work.
- **Shape (corner radius)**: `borderRadius:4  small:8  medium:12  large:16  extraLarge:24  full:9999` — fields 12, cards 16, dialogs and sheets 24, buttons fully rounded

### 1.5 Theme utilities

- `useTheme()` → `{ theme, toggleTheme }`; the scheme is `theme.isDark`. Syncs with OS scheme + manual toggle.
- `getStateColor(bg, on, state)` → composites a hover/press state-layer color over a base.
- `getGlowStyles(theme, active, variant?)` → the M3 "glow" focus/hover ring (variant `"error"` for error state).

### 1.6 Custom themes

`ThemeProvider` renders the organization's theme unless given one. `createTheme(options)`
deep-merges only what the app passes over it, and returns both schemes:

```tsx
const theme = createTheme({
  colorSchemes: { light: { palette: { primary: { main: "#00639B" } } } },
});
<ThemeProvider theme={theme}>…</ThemeProvider>
```

### 1.7 Shared type

`MaterialCommunityIconsGlyphs` — icon names are kebab-case strings (e.g. `"plus"`, `"bell-outline"`).
Outline variants append `-outline`. Any prop typed "icon" below takes one of these.

---

## 2. Foundations

### Typography

Renders themed text in one of MUI's type-scale steps.

| Prop     | Type                     | Default        | Req | Description  |
| -------- | ------------------------ | -------------- | --- | ------------ |
| children | ReactNode                | —              | ✓   | Text content |
| variant  | typography key (see 1.3) | `body1`        |     | Type scale   |
| color    | palette name, palette path (`"text.secondary"`), M3 role or raw colour | `"text.primary"` | | Text colour |
| align    | `"left" \| "center" \| "right" \| "justify"` | | | Text alignment |
| noWrap   | boolean                  | `false`        |     | One line, ellipsis |
| gutterBottom | boolean              | `false`        |     | 0.35em bottom margin |
| style    | TextStyle                |                |     | Override     |
| …rest    | TextProps                |                |     | Forwarded to `Text` (`numberOfLines`, `selectable`, `testID`…) |

### Divider

Horizontal or vertical rule, optionally with a centered label.

| Prop           | Type                         | Default      | Description                      |
| -------------- | ---------------------------- | ------------ | -------------------------------- |
| orientation    | `"horizontal" \| "vertical"` | `horizontal` |                                  |
| inset          | number                       | `0`          | Margin along the line            |
| thickness      | number                       | `1`          | Line thickness                   |
| contentSpacing | number                       | `16`         | Gap around label                 |
| children       | ReactNode (string → label)   |              | Centered label (horizontal only) |
| style          | ViewStyle                    |              |                                  |

### Paper

Elevated / tonal surface container.

| Prop      | Type       | Default | Req | Description                   |
| --------- | ---------- | ------- | --- | ----------------------------- |
| children  | ReactNode  | —       | ✓   |                               |
| elevation | number 0–5 | `1`     |     | Maps to surface tone + shadow |
| outline   | boolean    | `false` |     | 1px outlineVariant border     |
| glow      | boolean    | `false` |     | Use glow instead of shadow    |
| style     | ViewStyle  |         |     |                               |

### Card

Pressable content surface.

| Prop               | Type                                             | Default  | Req | Description                        |
| ------------------ | ------------------------------------------------ | -------- | --- | ---------------------------------- |
| children           | ReactNode                                        | —        | ✓   |                                    |
| variant            | `"elevated" \| "filled" \| "outlined" \| "glow"` | `filled` |     |                                    |
| onPress            | () => void                                       |          |     | Makes it interactive (button role) |
| accessibilityLabel | string                                           |          |     |                                    |
| style              | ViewStyle                                        |          |     |                                    |

---

### Icon

Icon primitive, MUI style: a MaterialCommunityIcons glyph goes in as the children
(`<Icon>plus</Icon>`), the way MUI's `Icon` takes its ligature. `source` covers the rest —
a bundled bitmap, an SVG render function, a ready-made element.

| Prop       | Type                            | Default     | Description                            |
| ---------- | ------------------------------- | ----------- | -------------------------------------- |
| children   | string                          | —           | MaterialCommunityIcons glyph name      |
| source     | image source, render fn, element | —          | When the icon is not a glyph           |
| fontSize   | `"small" \| "medium" \| "large"` \| number | `"medium"` | 20 / 24 / 35                     |
| color      | palette name or path, M3 role, raw colour | `onSurface` | Tints a glyph; omit for a colour bitmap |
| flipForRTL | boolean                         | `false`     | Mirrors directional glyphs under RTL   |
| style      | ImageStyle                      |             |                                        |

`source` is an `ImageSourcePropType`, a `({ size, color }) => ReactNode` render function,
or a ready-made element.

### CardTitle / CardContent / CardCover / CardActions

The compound parts of `Card`, reachable either as `Card.Title` … `Card.Actions` or as these
standalone exports. Compose them instead of hand-building a header row.

(The heading uses the standalone names on purpose: the docs splitter only accepts
identifier-shaped names, so a `Card.Title`-style heading would be dropped along with this
whole section.)

| Part           | Props                                                                                  |
| -------------- | -------------------------------------------------------------------------------------- |
| `Card.Title`   | `title` (required), `subtitle`, `left`, `right`, `titleNumberOfLines` (1), `subtitleNumberOfLines` (2) |
| `Card.Content` | `children` (required)                                                                  |
| `Card.Cover`   | `source` + `alt` (both required), `ratio` (`16/9`) — bleeds past the card padding       |
| `Card.Actions` | `children` (required), `align`: `"start" \| "end" \| "space-between"` (`end`)          |

```tsx
<Card variant="elevated" onPress={open}>
  <Card.Cover source={photo} alt="Line 4" />
  <Card.Title title="Line 4" subtitle="Scheduled maintenance" />
  <Card.Content>
    <Typography variant="body2">Next service: 12 March</Typography>
  </Card.Content>
  <Card.Actions>
    <Button mode="text" onPress={postpone}>Postpone</Button>
    <Button onPress={confirm}>Confirm</Button>
  </Card.Actions>
</Card>
```

## 3. Buttons & Actions

### Button

| Prop               | Type                                          | Default              | Req | Description                |
| ------------------ | --------------------------------------------- | -------------------- | --- | -------------------------- |
| children           | ReactNode                                     |                      |     | Label                      |
| onPress            | () => void                                    |                      |     |                            |
| mode               | `"filled" \| "tonal" \| "outlined" \| "text"` | `filled`             |     |                            |
| tone               | `"primary" \| "error" \| "success"`           | `primary`            |     | `success`: fixed green     |
| iconName           | icon                                          |                      |     | Leading/trailing icon      |
| iconPosition       | `"left" \| "right"`                           | `left`               |     |                            |
| iconStyle          | object                                        |                      |     |                            |
| size               | number                                        | `theme.shape.medium` |     | Icon size                  |
| fullWidth          | boolean                                       | `false`              |     | Stretch to parent width    |
| disabled           | boolean                                       | `false`              |     |                            |
| loading            | boolean                                       | `false`              |     | Shows inline spinner       |
| busy               | boolean                                       | `false`              |     | Blocks presses, aria-busy  |
| underlay           | ReactNode                                     |                      |     | Drawn behind the label     |
| labelStyle         | TextStyle                                     |                      |     | After the type style       |
| accessibilityLabel | string                                        |                      |     | Falls back to string child |
| accessibilityHint  | string                                        |                      |     |                            |
| testID             | string                                        |                      |     |                            |
| style              | object                                        |                      |     |                            |

`busy` is `loading` without the spinner: label, icon and full-strength colours stay on
screen. `underlay` fills the whole surface behind the content, clipped to its shape and
blind to touches: a progress fill, a state animation.

### IconButton

Square, icon-only action. `Button` with only an icon comes out pill-shaped and label-padded.

| Prop               | Type                                              | Default    | Req | Description                                  |
| ------------------ | ------------------------------------------------- | ---------- | --- | -------------------------------------------- |
| icon               | icon                                              | —          | ✓   |                                              |
| accessibilityLabel | string                                            | —          | ✓   | Required: an icon carries no accessible name |
| onPress            | () => void                                        |            |     |                                              |
| mode               | `"standard" \| "filled" \| "tonal" \| "outlined"` | `standard` |     |                                              |
| size               | `"small" \| "medium" \| "large"`                  | `medium`   |     | 32 / 40 / 48                                 |
| selected           | boolean                                           |            |     | M3 toggle-icon-button state                  |
| loading            | boolean                                           |            |     | Inline spinner                               |
| disabled           | boolean                                           |            |     |                                              |
| style              | ViewStyle                                         |            |     |                                              |

### Link

Inline navigational text.

| Prop             | Type                            | Default                  | Req | Description                                                  |
| ---------------- | ------------------------------- | ------------------------ | --- | ------------------------------------------------------------ |
| children         | string                          | —                        | ✓   | Label                                                        |
| href             | string                          |                          |     | Opened with `Linking.openURL`; ignored when `onPress` is set |
| allowedSchemes   | string[]                        | `http, https, mailto, tel` |   | An `href` with any other scheme does nothing                 |
| onPress          | () => void                      |                          |     |                                                              |
| variant          | typography key                  | `body2`                  |     |                                                              |
| underline        | `"always" \| "hover" \| "none"` | `hover`                  |     |                                                              |
| showExternalIcon | boolean                         | `true` for remote `href` |     |                                                              |
| externalIcon     | icon                            | `open-in-new`            |     |                                                              |
| color            | string                          | `colors.primary`         |     |                                                              |
| disabled         | boolean                         |                          |     |                                                              |

### FAB (Floating Action Button)

Absolutely positioned; respects safe-area insets.

| Prop     | Type                                                           | Default        | Req | Description                       |
| -------- | -------------------------------------------------------------- | -------------- | --- | --------------------------------- |
| icon     | icon                                                           | —              | ✓   |                                   |
| onPress  | () => void                                                     | —              | ✓   |                                   |
| label    | string                                                         |                |     | Shown only when `size="extended"` |
| size     | `"small" \| "regular" \| "large" \| "extended"`                | `regular`      |     |                                   |
| position | `"bottom-right" \| "bottom-left" \| "top-right" \| "top-left"` | `bottom-right` |     |                                   |
| disabled | boolean                                                        |                |     |                                   |
| style    | ViewStyle                                                      |                |     |                                   |

### SpeedDial

FAB that expands a stack of labeled actions.

| Prop     | Type                | Default        | Req | Description                    |
| -------- | ------------------- | -------------- | --- | ------------------------------ |
| actions  | `SpeedDialAction[]` | —              | ✓   | `{ id, label, icon, onPress }` |
| mainIcon | icon                | —              | ✓   | Rotates 45° when open          |
| position | same as FAB         | `bottom-right` |     |                                |

### Chip

| Prop     | Type                                | Default  | Req | Description                  |
| -------- | ----------------------------------- | -------- | --- | ---------------------------- |
| label    | string                              | —        | ✓   |                              |
| onPress  | () => void                          |          |     | Makes body pressable         |
| onClose  | () => void                          |          |     | Renders a trailing close (X) |
| icon     | icon                                |          |     | Leading icon                 |
| selected | boolean                             | `false`  |     | Shows check + tertiary tone  |
| mode     | `"filled" \| "tonal" \| "outlined"` | `filled` |     |                              |
| size     | `"small" \| "medium"`               | `medium` |     | small = 24px                 |
| disabled | boolean                             | `false`  |     |                              |
| style    | object                              |          |     |                              |

## 4. Inputs & Forms

### Input

Text field, outlined or filled; supports affixes, icons, multiline, number mode.

| Prop                       | Type                     | Default    | Req | Description                          |
| -------------------------- | ------------------------ | ---------- | --- | ------------------------------------ |
| value                      | string                   | —          | ✓   |                                      |
| onChangeText               | (text) => void           | —          | ✓   |                                      |
| label                      | string                   |            |     |                                      |
| placeholder                | string                   |            |     |                                      |
| type                       | `"text" \| "number"`     | `text`     |     | number = decimal keypad + sanitizing |
| variant                    | `"outlined" \| "filled"` | `outlined` |     |                                      |
| precision                  | number                   |            |     | Decimal places (number type)         |
| prefix / suffix            | string                   |            |     | Inline affix text                    |
| leadingIcon / trailingIcon | icon                     |            |     |                                      |
| onTrailingIconPress        | () => void               |            |     |                                      |
| error                      | string                   |            |     | Error message + error styling        |
| helperText                 | string                   |            |     | Hidden while error shown             |
| required                   | boolean                  |            |     | Asterisk on label                    |
| disabled                   | boolean                  |            |     |                                      |
| readonly                   | boolean                  |            |     |                                      |
| secureTextEntry            | boolean                  |            |     | Password mode                        |
| maxLength                  | number                   |            |     |                                      |
| multiline                  | boolean                  | `false`    |     |                                      |
| numberOfLines              | number                   | `4`        |     |                                      |
| minHeight                  | number                   | `56`       |     |                                      |
| onFocus / onBlur           | () => void               |            |     |                                      |
| style                      | ViewStyle                |            |     |                                      |

### Select

Dropdown built on Popover; single or multi select, optional chip display.

| Prop                | Type                     | Default            | Req | Description                   |
| ------------------- | ------------------------ | ------------------ | --- | ----------------------------- |
| options             | `Option[]`               | —                  | ✓   | `{ id, label, value, icon? }` |
| value               | any                      | —                  | ✓   | Selected value (single)       |
| onSelect            | (value) => void          | —                  | ✓   |                               |
| label               | string                   |                    |     |                               |
| placeholder         | string                   | `Select an option` |     |                               |
| variant             | `"outlined" \| "filled"` | `outlined`         |     |                               |
| error               | string                   |                    |     |                               |
| disabled            | boolean                  |                    |     |                               |
| multiSelect         | boolean                  | `false`            |     |                               |
| showAsChips         | boolean                  | `false`            |     | Render selection as chips     |
| selectedValues      | any[]                    | `[]`               |     | Multi-select value set        |
| toggleOptions       | (value) => void          |                    |     | Multi-select handler          |
| style / optionStyle | object                   |                    |     |                               |

### Checkbox

| Prop          | Type                | Default | Req | Description |
| ------------- | ------------------- | ------- | --- | ----------- |
| checked       | boolean             | —       | ✓   |             |
| onValueChange | (value) => void     | —       | ✓   |             |
| label         | string              |         |     |             |
| labelPosition | `"left" \| "right"` | `right` |     |             |
| indeterminate | boolean             |         |     | Mixed state |
| disabled      | boolean             |         |     |             |
| error         | boolean             |         |     |             |

### Toggle (Switch)

Animated M3 switch.

| Prop              | Type            | Default | Req | Description         |
| ----------------- | --------------- | ------- | --- | ------------------- |
| value             | boolean         | —       | ✓   |                     |
| onValueChange     | (value) => void | —       | ✓   |                     |
| disabled          | boolean         | `false` |     |                     |
| width             | number          | `32`    |     |                     |
| height            | number          | `18`    |     |                     |
| containerStyle    | ViewStyle       |         |     |                     |

### Spinner (Number stepper)

Numeric field with +/- steppers. (Distinct from progress spinners in §6.)

| Prop     | Type          | Default | Req | Description |
| -------- | ------------- | ------- | --- | ----------- |
| value    | number        | —       | ✓   |             |
| onChange | (val) => void | —       | ✓   |             |
| label    | string        |         |     |             |
| step     | number        | `1`     |     |             |
| min      | number        | `0`     |     |             |
| max      | number        | `100`   |     |             |
| disabled | boolean       |         |     |             |

### SearchBar

| Prop         | Type           | Default | Req | Description                      |
| ------------ | -------------- | ------- | --- | -------------------------------- |
| value        | string         | —       | ✓   |                                  |
| onChangeText | (text) => void | —       | ✓   |                                  |
| onSubmit     | (text) => void |         |     |                                  |
| onClear      | () => void     |         |     | After clear button empties field |
| placeholder  | string         |         |     |                                  |
| leadingIcon  | icon           |         |     |                                  |
| disabled     | boolean        |         |     |                                  |
| autoFocus    | boolean        |         |     |                                  |
| style        | ViewStyle      |         |     |                                  |

### DateTimePicker / DatePicker

Field that opens a Material 3 date/time picker. There is no OS picker underneath: the same
in-house surface renders everywhere — a dialog on native, a popover docked to the field on web —
so the picker follows the theme on all three platforms. Every locale-dependent label — month and
weekday names, week start, 12h/24h, AM/PM, typed-entry field order, day announcements — is derived
from `Intl` and memoized per locale; nothing is hardcoded to a language. Relative day labels
(Today/Yesterday/Tomorrow) come from `Intl.RelativeTimeFormat` unless overridden.

`DatePicker` is the same component with `mode` locked to `"date"`.

| Prop                | Type                                       | Default       | Req | Description                                                         |
| ------------------- | ------------------------------------------ | ------------- | --- | ------------------------------------------------------------------- |
| value               | `Date \| null` · `DateRange` · `Date[]`    | —             | ✓   | Shape follows `selectionMode`                                       |
| onChange            | matching setter                            | —             | ✓   | Single mode is never called with `null`; clearing goes to `onClear` |
| label               | string                                     |               |     | Also labels the typed-entry field inside the dialog                 |
| mode                | `"date" \| "datetime" \| "time"`           | `date`        |     | `datetime` collects the day, then the time                          |
| selectionMode       | `"single" \| "range" \| "multiple"`        | `single`      |     | Ignored when `mode="time"`                                          |
| validRange          | `{ startDate?, endDate?, disabledDates? }` |               |     | Inclusive bounds compared at day granularity                        |
| isDateDisabled      | (date) => boolean                          |               |     | For rules `validRange` cannot express                               |
| scrollMode          | `"endless" \| "paged"`                     | `endless`     |     | `endless` virtualizes the months in one list                        |
| inputEnabled        | boolean                                    | `true`        |     | Typed entry in the field and the calendar↔keyboard toggle           |
| defaultInputType    | `"picker" \| "keyboard"`                   | `picker`      |     | Which surface the dialog opens on                                   |
| use24HourClock      | boolean                                    | locale's own  |     | `true` forces the 24-hour dial                                      |
| minuteInterval      | `1\|2\|3\|4\|5\|6\|10\|12\|15\|20\|30`     | `1`           |     | Granularity the dial snaps to                                       |
| startYear / endYear | number                                     | ±100 years    |     | Bounds of the year grid and the endless scroller                    |
| placeholder         | string                                     |               |     | Shown while the value is empty                                      |
| clearable           | boolean                                    |               |     | Adds a clear button; needs `onClear`                                |
| onClear             | () => void                                 |               |     |                                                                     |
| error               | string                                     |               |     | Error text; also recolors the field                                 |
| helperText          | string                                     |               |     | Hidden while `error` is set                                         |
| required            | boolean                                    |               |     | Appends `*` to the label                                            |
| locale              | string                                     | device locale |     | Formatting/labelling override                                       |
| firstDayOfWeek      | 0–6 (0 = Sunday)                           | locale's own  |     |                                                                     |
| labels              | `DateTimePickerLabels`                     | English       |     | Chrome strings (`selectDate`, `confirm`, `next`, …)                 |
| relativeLabels      | `{ today?, yesterday?, tomorrow? }`        | `Intl`        |     |                                                                     |
| defaultOpen         | boolean                                    | `false`       |     | Mount with the picker open                                          |
| disabled            | boolean                                    |               |     |                                                                     |
| style               | ViewStyle                                  |               |     |                                                                     |
| testID              | string                                     |               |     |                                                                     |

**Typed entry.** The field accepts a date typed in the locale's own order (`22/11/2026` in
`it-IT`, `11/22/2026` in `en-US`), validated against `validRange` on blur. Only a single calendar
date is typable in the field itself; a range types its two ends inside the dialog, reached from
the pencil toggle in its header. `multiple` has no typed form, so the toggle is hidden there.

**Keyboard (web).** Arrows = day/week, PageUp/PageDown = month (Shift = year), Home/End = ends of
the week, Enter/Space = select, Escape = close.

### Autocomplete

Text field with a suggestion list. Free text allowed — this is not a `Select`. The list renders
inside the field's own container (a modal would steal focus from the input), so the parent must
not clip overflow while it is open.

| Prop                                                           | Type                       | Default                      | Req | Description                                 |
| -------------------------------------------------------------- | -------------------------- | ---------------------------- | --- | ------------------------------------------- |
| value                                                          | string                     | —                            | ✓   |                                             |
| onChangeText                                                   | (text) => void             | —                            | ✓   |                                             |
| options                                                        | `AutocompleteOption[]`     | —                            | ✓   | `{ id, label, value, description?, icon? }` |
| onSelect                                                       | (option) => void           | —                            | ✓   |                                             |
| filter                                                         | (option, query) => boolean | accent-insensitive substring |     | `() => true` for server-side filtering      |
| minChars                                                       | number                     | `1`                          |     |                                             |
| maxSuggestions                                                 | number                     | `8`                          |     |                                             |
| loading                                                        | boolean                    |                              |     | Spinner in the field                        |
| emptyMessage                                                   | string                     |                              |     | Omit to hide the list on no match           |
| label / placeholder / error / helperText / required / disabled |                            |                              |     | As `Input`                                  |
| leadingIcon                                                    | icon                       |                              |     |                                             |
| clearable                                                      | boolean                    | `true`                       |     |                                             |

**Keyboard (web).** ArrowUp/ArrowDown move the highlight, Enter selects, Escape closes.

## 5. Data Display

### Avatar

| Prop                        | Type                                                | Default    | Req | Description                     |
| --------------------------- | --------------------------------------------------- | ---------- | --- | ------------------------------- |
| source                      | image source                                        |            |     | Image; else initials; else icon |
| name                        | string                                              |            |     | Initials fallback               |
| icon                        | icon                                                | `account`  |     | Icon fallback                   |
| size                        | number                                              | `40`       |     |                                 |
| variant                     | `"circular" \| "rounded" \| "square"`               | `circular` |     |                                 |
| status                      | `"online" \| "offline" \| "busy" \| "away" \| null` |            |     | Status dot                      |
| backgroundColor / textColor | string                                              |            |     |                                 |
| onPress                     | () => void                                          |            |     |                                 |

### Badge

Small count/dot overlay (position it over its target).

| Prop     | Type                 | Default | Description                |
| -------- | -------------------- | ------- | -------------------------- |
| count    | number               |         | Omit → dot                 |
| size     | `"small" \| "large"` | `large` | small = dot                |
| max      | number               | `99`    | Shows `max+` when exceeded |
| showZero | boolean              | `false` | Render at count 0          |
| visible  | boolean              | `true`  |                            |
| style    | any                  |         |                            |

### DataGrid

Virtualized table: sortable columns, reorder, density, loading, empty state. Built on the public `Table` primitives below.

| Prop                           | Type                          | Default  | Req | Description                        |
| ------------------------------ | ----------------------------- | -------- | --- | ---------------------------------- |
| data                           | any[]                         | —        | ✓   | Row objects                        |
| columns                        | `ColumnDefinition[]`          | —        | ✓   | `{ id, label, width?, sortable? }` |
| loading                        | boolean                       | `false`  |     |                                    |
| density                        | `"normal" \| "dense"`         | `normal` |     |                                    |
| sortColumn                     | string                        |          |     |                                    |
| sortDirection                  | `"asc" \| "desc"`             |          |     |                                    |
| onSort                         | (columnId, direction) => void |          |     |                                    |
| onColumnReorder                | (newColumns) => void          |          |     |                                    |
| onEndReached                   | () => void                    |          |     | Infinite scroll                    |
| onEndReachedThreshold          | number                        |          |     |                                    |
| emptyMessage                   | string                        |          |     | Shown when empty & not loading     |
| style / rowStyle / headerStyle | ViewStyle                     |          |     |                                    |

### Table / TableHead / TableRow / TableHeaderCell / TableCell

The primitives DataGrid is assembled from, for a table whose rows the caller lays out. They carry
the table/row/columnheader/cell roles. `TableHeaderCell` takes `sortable`/`sortDirection`/`onPress`;
cells take a fixed `width` (default 150). Props: see the API reference on its page of the docs site (generated from the source).

### ListItem

Single pressable list row (centered title text).

| Prop                                                                     | Type       | Default | Req | Description             |
| ------------------------------------------------------------------------ | ---------- | ------- | --- | ----------------------- |
| children                                                                 | ReactNode  | —       | ✓   | Label                   |
| onPress                                                                  | () => void |         |     | Adds hover/press states |
| itemContainerStyle / itemTextStyle / itemPressedStyle / itemHoveredStyle | object     |         |     | Style overrides         |

### ListSection

Groups related `ListItem`s under a heading. Use this for a settings screen rather than
wrapping each group in a `Card` — a sequence of labelled groups, not a pile of surfaces.

| Component       | Props                                                                     |
| --------------- | ------------------------------------------------------------------------- |
| `ListSection`   | `children` (required), `title` (heading above the rows), `divider` (`false`) |

### Tooltip

Wraps a child; shows a bubble on hover (web) / long-press (native).

| Prop      | Type                                     | Default | Req | Description      |
| --------- | ---------------------------------------- | ------- | --- | ---------------- |
| content   | string                                   | —       | ✓   |                  |
| children  | ReactNode                                | —       | ✓   | Anchor           |
| position  | `"top" \| "bottom" \| "left" \| "right"` | `top`   |     |                  |
| disabled  | boolean                                  |         |     |                  |
| hideDelay | number (ms)                              | `1500`  |     | Native auto-hide |
| variant   | `"plain" \| "rich"`                     | `plain` |     | Rich: `title`, body, optional `action`; persistent with an action |

### Accordion

Expandable section with animated height.

| Prop               | Type               | Default | Req | Description |
| ------------------ | ------------------ | ------- | --- | ----------- |
| title              | string             | —       | ✓   |             |
| children           | ReactNode          | —       | ✓   | Content     |
| startExpanded      | boolean            | `false` |     |             |
| onPress            | (expanded) => void |         |     |             |
| style / titleStyle | style              |         |     |             |

## 6. Feedback & Overlays

### Snackbar

Bottom transient message; animated in/out.

| Prop      | Type                                | Default   | Req | Description            |
| --------- | ----------------------------------- | --------- | --- | ---------------------- |
| visible   | boolean                             | —         | ✓   |                        |
| message   | string                              | —         | ✓   |                        |
| onDismiss | () => void                          | —         | ✓   |                        |
| duration  | number (ms)                         | `4000`    |     | 0 = no auto-hide       |
| action    | `{ label, onPress }`                |           |     | Trailing action button |
| type      | `"default" \| "success" \| "error"` | `default` |     |                        |
| icon      | icon                                |           |     | Override leading icon  |

### Banner

Inline prominent message with up to two actions.

| Prop        | Type                                          | Default   | Req | Description                |
| ----------- | --------------------------------------------- | --------- | --- | -------------------------- |
| visible     | boolean                                       | —         | ✓   |                            |
| message     | string                                        | —         | ✓   |                            |
| type        | `"default" \| "info" \| "warning" \| "error"` | `default` |     |                            |
| icon        | icon                                          |           |     | Overrides per-type default |
| actions     | `{ label, onPress }[]`                        |           |     | Right-aligned, ≤ 2         |
| dismissable | boolean                                       | `false`   |     | Close (X); needs onDismiss |
| onDismiss   | () => void                                    |           |     |                            |

### Portal / Portal.Host

Renders an overlay at the host instead of in place, so it escapes a clipping parent, sits
above siblings regardless of elevation, and is not dragged by a `ScrollView`. Mount the
host once near the app root; with no host above it, `Portal` renders inline, so opting in
is safe in a tree that has not been wrapped.

```tsx
<ThemeProvider>
  <Portal.Host>
    <App />
  </Portal.Host>
</ThemeProvider>
```

`usePortalHost()` reports whether a host is mounted above the caller.

`Tooltip` and `Autocomplete`'s suggestion list are the overlays that use this. Every other
overlay in the kit — `Modal`, `ConfirmDialog`, `Popover`, `Menu`, `Select`, `BottomSheet` —
goes through a native `Modal`, which is a separate window on native and a `createPortal`
into `document.body` on web: already stronger isolation. Portal exists for the two cases a
`Modal` cannot serve — a tooltip must never take touches, and the Autocomplete list must
not steal focus from the field being typed into.

### Modal

Centered dialog surface.

| Prop          | Type                          | Default | Req | Description                 |
| ------------- | ----------------------------- | ------- | --- | --------------------------- |
| visible       | boolean                       | —       | ✓   |                             |
| children      | ReactNode \| string           | —       | ✓   | Body (string → styled text) |
| title         | string                        |         |     |                             |
| animationType | `"none" \| "slide" \| "fade"` | `fade`  |     |                             |
| transparent   | boolean                       | `true`  |     |                             |
| onClose       | () => void                    |         |     | Renders a close button      |
| onDismiss     | () => void                    |         |     | Android back / ESC          |
| closeText     | string                        | `Close` |     |                             |
| fullScreen    | boolean                       | `false` |     | M3 full-screen dialog: close, title and `actions` in a header |

### ConfirmDialog

Modal preset with confirm/cancel actions.

| Prop        | Type       | Default   | Req | Description |
| ----------- | ---------- | --------- | --- | ----------- |
| visible     | boolean    | —         | ✓   |             |
| onConfirm   | () => void | —         | ✓   |             |
| onCancel    | () => void | —         | ✓   |             |
| title       | string     |           |     |             |
| message     | string     |           |     |             |
| confirmText | string     | `Confirm` |     |             |
| cancelText  | string     | `Cancel`  |     |             |

### Menu

Anchored action menu.

| Prop          | Type         | Default | Req | Description                                                                        |
| ------------- | ------------ | ------- | --- | ---------------------------------------------------------------------------------- |
| anchor        | ReactElement | —       | ✓   |                                                                                    |
| items         | `MenuItem[]` | —       | ✓   | `{ id, label, icon?, trailing?, disabled?, destructive?, dividerAbove?, onPress }` |
| visible       | boolean      | —       | ✓   |                                                                                    |
| onDismiss     | () => void   | —       | ✓   |                                                                                    |
| closeOnSelect | boolean      | `true`  |     |                                                                                    |

### Skeleton

Loading placeholder with pulse.

| Prop         | Type                           | Default | Description    |
| ------------ | ------------------------------ | ------- | -------------- |
| variant      | `"rect" \| "circle" \| "text"` | `rect`  |                |
| width        | number \| %                    |         |                |
| height       | number \| %                    |         |                |
| borderRadius | number                         |         |                |
| duration     | number (ms)                    |         | Pulse cycle    |
| animate      | boolean                        | `true`  | false = static |
| style        | ViewStyle                      |         |                |

### ToastProvider / useToast

Imperative toasts from anywhere in the tree — no `visible` state to thread through the screen.
Mount `ToastProvider` once above the app; the queue is FIFO and renders one `Snackbar` at a time.

```tsx
const toast = useToast();
toast.success("Saved");
toast.error("Upload failed", { action: { label: "Retry", onPress: retry } });
toast.show({ id: "sync", message: "Syncing…", duration: 8000 }); // same id replaces
toast.hide(); // clears the queue
```

| `ToastOptions` | Type                                | Default     | Description                                                  |
| -------------- | ----------------------------------- | ----------- | ------------------------------------------------------------ |
| message        | string                              | —           |                                                              |
| type           | `"default" \| "success" \| "error"` | `default`   | Container colors + default icon                              |
| duration       | number (ms)                         | `4000`      |                                                              |
| icon           | icon                                | from `type` |                                                              |
| action         | `{ label, onPress }`                |             |                                                              |
| id             | string                              |             | Replaces a queued toast with the same id instead of stacking |

---

## 7. Navigation

### TopAppBar

Navigator-agnostic M3 top app bar: `small`, `center`, `medium`, `large`; `leading` and `actions`
slots; `elevated` for the on-scroll state; pads the top safe-area inset. Props: see the API reference on its page of the docs site (generated from the source).

### NavigationBar

Bottom navigation bar.

| Prop        | Type                     | Default  | Req | Description                                   |
| ----------- | ------------------------ | -------- | --- | --------------------------------------------- |
| items       | `NavigationBarItem[]`    | —        | ✓   | `{ id, label, icon, badgeCount?, disabled? }` |
| activeId    | string                   | —        | ✓   |                                               |
| onItemPress | (id) => void             | —        | ✓   |                                               |
| showLabels  | `"always" \| "selected"` | `always` |     |                                               |

### NavigationDrawer / DrawerItem / DrawerSection

M3 navigation drawer: `variant="standard"` (inline panel) or `"modal"` (slides in over a scrim;
Escape and Android back close it). `DrawerItem` has `icon`, `selected`, trailing `badge`;
`DrawerSection` a `title` and an optional divider. Props: see the API reference on its page of the docs site (generated from the source).

### Tabs

Top tab bar with animated indicator; text-only or icon tabs.

| Prop      | Type                              | Default | Req | Description |
| --------- | --------------------------------- | ------- | --- | ----------- |
| tabs      | `string[]` \| `{ label, icon }[]` | —       | ✓   |             |
| activeTab | number (index)                    | —       | ✓   |             |
| onChange  | (index) => void                   | —       | ✓   |             |

### Breadcrumbs

| Prop      | Type               | Default         | Req | Description                      |
| --------- | ------------------ | --------------- | --- | -------------------------------- |
| items     | `BreadcrumbItem[]` | —               | ✓   | `{ id, label, icon?, onPress? }` |
| separator | icon               | `chevron-right` |     |                                  |
| maxItems  | number             |                 |     | Collapse middle behind ellipsis  |

### Stepper

Horizontal progress steps.

| Prop        | Type                               | Default | Req | Description          |
| ----------- | ---------------------------------- | ------- | --- | -------------------- |
| steps       | `string[]` \| `{ label, icon? }[]` | —       | ✓   |                      |
| activeStep  | number (index)                     | —       | ✓   |                      |
| onStepPress | (stepIndex) => void                |         |     | Makes steps tappable |
| style       | object                             |         |     |                      |

---

## 8. Layout Primitives

Token-driven layout, so screens stop hardcoding spacing. `SpacingValue` is a spacing name
(`"xs" | "s" | "m" | "l" | "xl"`, 4/8/16/24/32 dp) or a raw number of dp; `RadiusValue` is a `theme.shape` key or a raw
number; `ColorValue` is a palette name or path (`"text.secondary"`), an M3 role or any raw colour string.

### Box

A `View` that reads spacing, shape and color off the theme. Anything not covered by a prop still
goes through `style`.

| Prop                      | Type             | Description                         |
| ------------------------- | ---------------- | ----------------------------------- |
| p, px, py, pt, pr, pb, pl | SpacingValue     | Padding — narrowest wins, as in CSS |
| m, mx, my, mt, mr, mb, ml | SpacingValue     | Margin                              |
| bg                        | ColorValue       | Background                          |
| radius                    | RadiusValue      | Corner radius                       |
| borderWidth               | number           |                                     |
| borderColor               | ColorValue       |                                     |
| flex                      | number           |                                     |
| gap                       | SpacingValue     |                                     |
| align / justify           | ViewStyle values | `alignItems` / `justifyContent`     |
| width / height            | ViewStyle values |                                     |
| row                       | boolean          | Horizontal instead of vertical      |
| wrap                      | boolean          |                                     |

Extends `ViewProps`.

### Stack

Evenly spaced children via `gap`, so spacing stays correct when children are conditionally
rendered.

| Prop      | Type                         | Default    | Description           |
| --------- | ---------------------------- | ---------- | --------------------- |
| direction | `"vertical" \| "horizontal"` | `vertical` |                       |
| spacing   | SpacingValue                 | `"s"`      | Gap between children  |
| reverse   | boolean                      |            | Reverses visual order |

Plus every `Box` prop except `row` and `gap`.

### Grid

Equal-width grid. Children are chunked into explicit rows rather than left to wrap, so the gap
never pushes a cell onto the next line and a short last row keeps its cells at column width.

| Prop          | Type         | Default | Description                                        |
| ------------- | ------------ | ------- | -------------------------------------------------- |
| columns       | number       | `2`     | Ignored when `minChildWidth` is set                |
| minChildWidth | number       |         | Fits as many columns of at least this width as fit |
| spacing       | SpacingValue | `"s"`   |                                                    |

## 9. Component Index

**Foundations**: Typography, Divider, Paper, Card, Card.Title/Content/Cover/Actions, Icon
**Layout**: Box, Stack, Grid
**Actions**: Button, IconButton, Link, FAB, SpeedDial, Chip
**Inputs**: Input, Select, Autocomplete, Checkbox, Toggle, Spinner, SearchBar, DateTimePicker/DatePicker
**Data display**: Avatar, Badge, DataGrid, Table, ListItem, ListSection, Tooltip, Accordion
**Feedback & overlays**: Snackbar, ToastProvider/useToast, Banner, Modal, ConfirmDialog, Menu, Portal/Portal.Host, Skeleton
**Navigation**: TopAppBar, NavigationBar, NavigationDrawer, Tabs, Breadcrumbs, Stepper

Parked (roadmap v2), documented in `packages/ui/parked/components.md`: AnimatedFAB, AppBar (react-navigation adapter), AspectRatio, BottomSheet, ButtonGroup, Carousel, Center, ChipGroup, DatePickerInput, DateRangePicker, EmptyState, FormControl, HStack, LinearProgress, NavigationRail, Pagination, PinInput, ProgressButton, RadioButton/RadioGroup, Rating, SideSheet, Slider, Spacer, SplitButton, Stat, StatusBadge, TabContent, TimePicker, ToggleButton, ToggleButtonGroup, Toolbar, VStack. Internal only (used by the components above, not exported): CircularProgress, Calendar, ClockPicker, ClockDial, Collapse, HelperText, Image, Popover, ListSubheader, TouchableRipple.

---

## 10. Framework Selection Notes

Requirements this kit implies for a target framework:

- **Theming**: runtime light/dark token switch, component-level theme access (context/hook or CSS vars).
- **Cross-platform** (if keeping native + web): React Native / Expo, or split web (React/Vue/Svelte) + native.
- **Animation**: springs/timing for Toggle, Tabs indicator, SpeedDial, Snackbar, BottomSheet, Carousel.
- **Overlays/portals**: Modal, Popover, Menu, BottomSheet, Tooltip need portal/z-index layering + outside-viewport positioning.
- **Icons**: a Material Community icon set (kebab-case names, outline variants).
- **SVG**: CircularProgress uses SVG stroke animation.
- **Accessibility**: roles + states across all interactive components.

If web-only: React + a headless primitive lib (Radix/Ark) + CSS-vars theming maps cleanly.
If keeping mobile: stay on Expo React Native, or React Native Web for shared code.
