# Parked components: documentation

Cut from `src/components/components.md` and `packages/ui/README.md` on 2026-10-14 (roadmap v2).

## From packages/ui/src/components/components.md

### TouchableRipple

A `Pressable` that paints the M3 state layer — 8% hover, 10% focus, 12% press — over a
surface, with the platform ripple on Android. Reach for it instead of re-deriving
hover/press colours in a component.

| Prop          | Type                    | Default     | Description                                |
| ------------- | ----------------------- | ----------- | ------------------------------------------ |
| children      | ReactNode (required)    | —           |                                            |
| underlayColor | string                  | `surface`   | Surface the layer sits on                  |
| rippleColor   | string                  | `onSurface` | The "on" role of that surface              |
| borderless    | boolean                 | `false`     | Tint only, no container background         |
| borderRadius  | number                  |             | Match the parent so the layer doesn't bleed |
| activeStyle   | ViewStyle               |             | Applied while hovered or pressed           |

Plus every `Pressable` prop except `style`/`children`. The `useStateLayer(base, on)` hook
exports the same colours for a component that already owns its `Pressable`.

### ProgressButton

A `Button` that carries the progress of the task it started inside its own surface
(the Google Maps "Start" pattern): **idle → loading → success | error**. Built on `Button`
(same modes, shape, state layers) and `LinearProgress`.

| Prop               | Type                                             | Default                | Description                                         |
| ------------------ | ------------------------------------------------ | ---------------------- | --------------------------------------------------- |
| status             | `"idle" \| "loading" \| "success" \| "error"`    | `idle`                 | Controlled — the caller moves it                    |
| progress           | number 0–1                                       |                        | While loading. Undefined → indeterminate sweep      |
| children           | string                                           |                        | Idle label (and loading label by default)           |
| loadingLabel       | string                                           | `children`             | e.g. "Calculating route…"                           |
| successLabel       | string                                           | `"Done"`               |                                                     |
| errorLabel         | string                                           | `"Try again"`          |                                                     |
| iconName           | icon                                             |                        | Idle and loading                                    |
| successIconName    | icon                                             | `check`                |                                                     |
| errorIconName      | icon                                             | `alert-circle-outline` |                                                     |
| indicator          | `"fill" \| "bar"`                                | `fill`                 | Tone sweep across the surface, or a 4dp bottom line |
| mode               | `"filled" \| "tonal" \| "outlined" \| "text"`    | `filled`               |                                                     |
| onPress            | () => void                                       |                        | Fires in every status but `loading`                 |
| disabled           | boolean                                          | `false`                |                                                     |
| fullWidth          | boolean                                          | `false`                |                                                     |
| successDuration    | number (ms)                                      | `2000`                 | Then `onSuccessEnd`; `0` holds success              |
| onSuccessEnd       | () => void                                       |                        | Typically sets `status` back to `idle`              |
| progressColor      | string                                           | derived                | Fill or bar colour                                  |
| trackColor         | string                                           | `on` at 20% / 6%       | Behind the bar; behind the fill on outlined / text  |
| duration           | number (ms)                                      | `300`                  | Each progress step's transition                     |
| style              | ViewStyle                                        |                        | Surface: radius, padding, width                     |
| labelStyle         | TextStyle                                        |                        | Label: font family, size, weight                    |
| accessibilityLabel | string                                           | label                  | Idle accessible name                                |
| testID             | string                                           |                        |                                                     |

- **Loading** is busy (`aria-busy="true"`), not disabled: full-strength colours, presses
  blocked. The fill grows with `transform: scaleX` on the native driver, never `width`.
  The accessible name carries the percentage ("Calculating route…, 40%").
- **Success / error** switch to the `success` / `error` tone with a Material reveal from the
  centre; skipped when the OS asks for reduced motion. Error stays pressable to retry.
- **Announcements**: status changes go to an `aria-live="polite"` region on web and to
  `AccessibilityInfo.announceForAccessibility` on iOS/Android — once per status, never per
  progress step.
- **Default fill**: on `filled`, a tone of the surface moving away from the label colour
  (darker in light, lighter in dark) so the label keeps its contrast; on `tonal` a step
  towards it; on `outlined` / `text` the label colour at 16%.
- No CSS classes or variables: customise through `style`, `labelStyle`, `progressColor`,
  `trackColor`, `mode`, and the theme.

### AnimatedFAB

A FAB that animates between an icon-only circle and a labelled pill. Drive `extended`
from a scroll offset for the M3 shrink-on-scroll behaviour.

| Prop        | Type                                            | Default        | Description                        |
| ----------- | ----------------------------------------------- | -------------- | ---------------------------------- |
| icon        | icon (required)                                 | —              |                                    |
| label       | string (required)                               | —              | It is the label that animates      |
| onPress     | () => void (required)                           | —              |                                    |
| extended    | boolean                                         | `true`         | Shows the label, or collapses      |
| animateFrom | `"left" \| "right"`                             | `right`        | Edge the label grows from          |
| iconMode    | `"static" \| "dynamic"`                         | `static`       | Icon stays put, or travels         |
| placement   | `"floating" \| "inline"`                        | `floating`     | `inline` drops absolute positioning |
| position    | `"bottom-right" \| "bottom-left" \| "top-right" \| "top-left"` | `bottom-right` | |
| duration    | number (ms)                                     | `150`          |                                    |
| disabled    | boolean                                         | `false`        |                                    |

### ToggleButton

Single segment; usually used via `ToggleButtonGroup`.

| Prop             | Type       | Default | Req | Description                     |
| ---------------- | ---------- | ------- | --- | ------------------------------- |
| active           | boolean    | —       | ✓   | Selected state                  |
| onPress          | () => void | —       | ✓   |                                 |
| label            | string     |         |     |                                 |
| icon             | icon       |         |     |                                 |
| isFirst / isLast | boolean    |         |     | Rounds outer corners in a group |
| style            | ViewStyle  |         |     |                                 |

### ToggleButtonGroup

Segmented button set (single or multi select).

| Prop          | Type                         | Default | Req | Description              |
| ------------- | ---------------------------- | ------- | --- | ------------------------ |
| options       | `{ label?, icon?, value }[]` | —       | ✓   |                          |
| value         | string \| string[]           | —       | ✓   | Array when `multiSelect` |
| onValueChange | (val) => void                | —       | ✓   |                          |
| multiSelect   | boolean                      | `false` |     |                          |

### ButtonGroup

M3 Expressive button group: `type="standard"` (spaced) or `"connected"` (joined, the successor of
segmented buttons), single or `multiSelect`, sizes `xs`/`s`/`m`. Same `options`/`value` shape as
ToggleButtonGroup; selection changes shape as well as colour. Props: see the API reference on its page of the docs site (generated from the source).

### SplitButton

A primary action (`children`, `iconName`, `onPress`) joined to a trailing button that opens a
`Menu` of `items`. Modes `filled`/`tonal`/`outlined`. Props: see the API reference on its page of the docs site (generated from the source).

### ChipGroup

A set of filter chips with the selection handled: single (optionally `required`) or `multiSelect`,
wrapping or scrolling (`wrap`). Chips report radio/checkbox semantics. Props: see the API reference on its page of the docs site (generated from the source).

---

### RadioButton / RadioGroup

`RadioButton` is a single control; `RadioGroup` (named export) manages a set.

RadioButton:

| Prop             | Type                | Default | Req | Description |
| ---------------- | ------------------- | ------- | --- | ----------- |
| selected         | boolean             | —       | ✓   |             |
| onPress          | () => void          | —       | ✓   |             |
| label            | string              |         |     |             |
| labelPosition    | `"left" \| "right"` | `right` |     |             |
| disabled / error | boolean             |         |     |             |

RadioGroup:

| Prop          | Type                | Default  | Req | Description                       |
| ------------- | ------------------- | -------- | --- | --------------------------------- |
| options       | `RadioOption[]`     | —        | ✓   | `{ id, label, value, disabled? }` |
| value         | any                 | —        | ✓   |                                   |
| onValueChange | (value) => void     | —        | ✓   |                                   |
| label         | string              |          |     |                                   |
| direction     | `"column" \| "row"` | `column` |     |                                   |
| disabled      | boolean             |          |     |                                   |
| error         | string              |          |     | Group-level error message         |

### Slider

| Prop              | Type            | Default | Req | Description                     |
| ----------------- | --------------- | ------- | --- | ------------------------------- |
| value             | number          | —       | ✓   |                                 |
| onValueChange     | (value) => void | —       | ✓   |                                 |
| onSlidingComplete | (value) => void |         |     |                                 |
| min               | number          | `0`     |     |                                 |
| max               | number          | `100`   |     |                                 |
| step              | number          |         |     | 0/undefined = continuous        |
| label             | string          |         |     |                                 |
| showValueLabel    | boolean         |         |     |                                 |
| marks             | boolean         |         |     | Ticks at each step (needs step) |
| disabled          | boolean         |         |     |                                 |
| style             | ViewStyle       |         |     |                                 |

### Calendar

The month grid used by `DateTimePicker`, exported on its own. Cross-platform, with month and year
sub-views and virtualized endless scrolling.

| Prop                | Type                                       | Default       | Req | Description                                       |
| ------------------- | ------------------------------------------ | ------------- | --- | ------------------------------------------------- |
| selectionMode       | `"single" \| "range" \| "multiple"`        | `single`      |     |                                                   |
| value               | `Date \| null`                             |               |     | Selection in `single` mode                        |
| range               | `DateRange`                                |               |     | Selection in `range` mode                         |
| dates               | `Date[]`                                   |               |     | Selection in `multiple` mode                      |
| onChange            | (date) => void                             |               |     | `single` mode; always a start-of-day `Date`       |
| onRangeChange       | (range) => void                            |               |     | `range` mode                                      |
| onDatesChange       | (dates) => void                            |               |     | `multiple` mode                                   |
| validRange          | `{ startDate?, endDate?, disabledDates? }` |               |     | Whole-day comparison                              |
| isDateDisabled      | (date) => boolean                          |               |     |                                                   |
| scrollMode          | `"endless" \| "paged"`                     | `endless`     |     | `paged` shows the month dropdown and outside days |
| startYear / endYear | number                                     | ±100 years    |     |                                                   |
| locale              | string                                     | device locale |     |                                                   |
| firstDayOfWeek      | 0–6                                        | locale's own  |     |                                                   |
| labels              | `DateTimePickerLabels`                     | English       |     |                                                   |
| showToday           | boolean                                    | `true`        |     | "Today" shortcut row                              |
| keyboardNavigation  | boolean                                    | `true`        |     | Web only                                          |
| onRequestClose      | () => void                                 |               |     | Called on Escape                                  |

### ClockPicker

The Material 3 time surface: the hour and minute readouts double as the unit selector, with the
analog dial (or two text fields) underneath.

| Prop                      | Type                     | Default       | Req | Description                           |
| ------------------------- | ------------------------ | ------------- | --- | ------------------------------------- |
| value                     | Date                     | —             | ✓   |                                       |
| onChange                  | (date) => void           | —             | ✓   |                                       |
| minimumDate / maximumDate | Date                     |               |     | Only clamp on the boundary day itself |
| minuteInterval            | `MinuteInterval`         | `1`           |     |                                       |
| locale                    | string                   | device locale |     | Decides 12h vs 24h                    |
| use24HourClock            | boolean                  | from locale   |     | `true` forces the 24-hour face        |
| inputType                 | `"picker" \| "keyboard"` | `picker`      |     | Dial or text fields                   |
| labels                    | `DateTimePickerLabels`   | English       |     |                                       |

### ClockDial

The analog face on its own: a rotating hand with a knob, a ring of labels, and drag-to-set. Drawn
with plain Views, so it adds no SVG dependency.

| Prop                            | Type                        | Default | Req | Description                                          |
| ------------------------------- | --------------------------- | ------- | --- | ---------------------------------------------------- |
| unit                            | `"hours" \| "minutes"`      | —       | ✓   | Which unit the face is editing                       |
| hours                           | number (0–23)               | —       | ✓   | Always 24-hour, whatever the face shows              |
| minutes                         | number (0–59)               | —       | ✓   |                                                      |
| use24HourClock                  | boolean                     | `false` |     | Adds the inner 13–00 ring                            |
| minuteInterval                  | number                      | `1`     |     |                                                      |
| onChangeHours / onChangeMinutes | (value) => void             | —       | ✓   |                                                      |
| onUnitComplete                  | () => void                  |         |     | Fires when a press ends, to hand over to the minutes |
| isTimeDisabled                  | (hours, minutes) => boolean |         |     | Greys out and refuses values                         |

### PinInput

One-time-code / PIN entry: single-character cells that behave as one field. Typing advances,
Backspace retreats, pasting a whole code into any cell fills the row.

| Prop                                             | Type                          | Default   | Req | Description                  |
| ------------------------------------------------ | ----------------------------- | --------- | --- | ---------------------------- |
| value                                            | string                        | —         | ✓   |                              |
| onChangeText                                     | (value) => void               | —         | ✓   |                              |
| length                                           | number                        | `6`       |     |                              |
| onComplete                                       | (value) => void               |           |     | Fired once, on becoming full |
| type                                             | `"numeric" \| "alphanumeric"` | `numeric` |     |                              |
| mask                                             | boolean                       | `false`   |     | Renders dots                 |
| label / error / helperText / required / disabled |                               |           |     | As `Input`                   |
| autoFocus                                        | boolean                       |           |     | First cell only              |
| cellSize                                         | number                        | `48`      |     |                              |

### FormControl

Groups a label, a control and its supporting text, and shares invalid/disabled/required state with
descendants via `useFormControl()`. For controls with no `label`/`error` props of their own —
Checkbox, RadioGroup, Slider, custom composites.

| Prop       | Type      | Default | Req | Description                      |
| ---------- | --------- | ------- | --- | -------------------------------- |
| children   | ReactNode | —       | ✓   |                                  |
| label      | string    |         |     |                                  |
| helperText | string    |         |     | Hidden while `error` is set      |
| error      | string    |         |     | Presence marks the group invalid |
| required   | boolean   | `false` |     |                                  |
| disabled   | boolean   | `false` |     | Dims the control                 |

### Rating

Star rating; half-stars rendered, whole values on tap.

| Prop     | Type            | Default | Req | Description               |
| -------- | --------------- | ------- | --- | ------------------------- |
| value    | number          | —       | ✓   | Supports halves (3.5)     |
| onChange | (value) => void |         |     | Interactive when provided |
| max      | number          | `5`     |     |                           |
| size     | number          | `24`    |     |                           |
| disabled | boolean         |         |     |                           |

---

### HelperText

Supporting text under a form control. `Input`, `FormControl`, `PinInput`, `Autocomplete`
and the date/time picker field all render this internally via their own `helperText` /
`error` props — use it directly for a control that has neither.

| Prop     | Type                    | Default  | Description                              |
| -------- | ----------------------- | -------- | ---------------------------------------- |
| children | ReactNode (required)    | —        |                                          |
| type     | `"info" \| "error"`     | `info`   | `error` adds the alert glyph             |
| visible  | boolean                 | `true`   | Fades out instead of unmounting          |
| disabled | boolean                 | `false`  | Dims to match a disabled field           |
| padding  | `"normal" \| "none"`    | `normal` | The 16px field gutter                    |

Hiding it keeps the text mounted so the field height does not jump, but takes it out of
the accessibility tree.

### StatusBadge

Small labeled status pill (own semantic colors, light/dark aware).

| Prop  | Type                                | Default   | Req | Description                    |
| ----- | ----------------------------------- | --------- | --- | ------------------------------ |
| label | string                              | —         | ✓   |                                |
| type  | `"success" \| "error" \| "warning"` | `success` |     |                                |
| icon  | icon                                |           |     | Override default per-type icon |

### Carousel

Paged horizontal slider.

| Prop             | Type            | Default | Req | Description                      |
| ---------------- | --------------- | ------- | --- | -------------------------------- |
| children         | ReactNode       | —       | ✓   | Each child = a page              |
| showDots         | boolean         | `true`  |     |                                  |
| showArrows       | boolean         | `false` |     | Overlay prev/next                |
| autoPlayInterval | number (ms)     | `0`     |     | 0 = off                          |
| height           | number          |         |     | Fixed height (else tallest page) |
| onIndexChange    | (index) => void |         |     |                                  |

### Stat

A single labelled metric with an optional trend delta.

| Prop              | Type                       | Default | Req | Description                    |
| ----------------- | -------------------------- | ------- | --- | ------------------------------ |
| label             | string                     | —       | ✓   | What the number measures       |
| value             | string                     | —       | ✓   | Pre-formatted by the caller    |
| delta             | string                     |         |     | e.g. `"12.5%"`                 |
| trend             | `"up" \| "down" \| "flat"` |         |     | Arrow + color for `delta`      |
| invertTrendColors | boolean                    | `false` |     | For metrics where down is good |
| helpText          | string                     |         |     |                                |
| icon              | icon                       |         |     |                                |

### Image

`react-native`'s Image plus a loading placeholder, a fallback for broken sources, and
token-driven corner radius.

| Prop             | Type                | Default                | Req | Description                                                |
| ---------------- | ------------------- | ---------------------- | --- | ---------------------------------------------------------- |
| source           | ImageSourcePropType | —                      | ✓   |                                                            |
| alt              | string              | —                      | ✓   | Required — a nameless image is invisible to screen readers |
| fallbackSource   | ImageSourcePropType |                        |     | Swapped in on load failure                                 |
| fallbackIcon     | icon                | `image-broken-variant` |     | Used when there is no `fallbackSource`                     |
| width / height   | DimensionValue      | `100%` / —             |     |                                                            |
| ratio            | number              |                        |     | Width ÷ height; use instead of `height` for fluid layouts  |
| radius           | shape key \| number | `0`                    |     |                                                            |
| resizeMode       | ImageResizeMode     | `cover`                |     |                                                            |
| showLoader       | boolean             | `true`                 |     | Skeleton until resolved                                    |
| onLoad / onError | () => void          |                        |     |                                                            |

---

### Popover

Anchored floating panel; auto-positions within the viewport.

| Prop             | Type         | Default | Req | Description               |
| ---------------- | ------------ | ------- | --- | ------------------------- |
| anchor           | ReactElement | —       | ✓   | Trigger element           |
| children         | ReactNode    | —       | ✓   | Panel content             |
| visible          | boolean      | —       | ✓   |                           |
| onDismiss        | () => void   | —       | ✓   |                           |
| matchAnchorWidth | boolean      | `false` |     | Constrain to anchor width |

### BottomSheet

Draggable bottom sheet with scrim.

| Prop              | Type       | Default | Req | Description                      |
| ----------------- | ---------- | ------- | --- | -------------------------------- |
| visible           | boolean    | —       | ✓   |                                  |
| onDismiss         | () => void | —       | ✓   |                                  |
| children          | ReactNode  | —       | ✓   |                                  |
| title             | string     |         |     |                                  |
| showHandle        | boolean    | `true`  |     | Drag handle                      |
| dismissOnScrimTap | boolean    | `true`  |     |                                  |
| maxHeightRatio    | number     |         |     | Max height as fraction of window |

### SideSheet

M3 side sheet: modal (over a scrim, from the `end` or `start` edge) or standard (inline, beside the
content). Header with optional back and close buttons, scrolling body, `actions` row. Props: see the API reference on its page of the docs site (generated from the source).

### CircularProgress

Indeterminate spinner (SVG), or a determinate ring when `progress` is set.

| Prop        | Type        | Default   | Description     |
| ----------- | ----------- | --------- | --------------- |
| size        | number      | `48`      |                 |
| strokeWidth | number      | `4`       |                 |
| color       | string      | `primary` |                 |
| duration    | number (ms) | `1000`    | Rotation period |
| progress    | number 0–1  |           | Determinate ring over a track |

### LinearProgress

Determinate or indeterminate bar.

| Prop                  | Type        | Default                   | Description            |
| --------------------- | ----------- | ------------------------- | ---------------------- |
| progress              | number 0–1  | `0`                       | Determinate value      |
| indeterminate         | boolean     | `false`                   |                        |
| height                | number \| %  | `4`                       | `"100%"` fills parent  |
| color                 | string      | `primary`                 |                        |
| trackColor            | string      | `surfaceContainerHighest` |                        |
| duration              | number (ms) | `500`                     | Determinate transition |
| indeterminateDuration | number (ms) | `1500`                    |                        |
| decorative            | boolean     | `false`                   | Hidden from a11y tree  |

The determinate bar grows with `transform: scaleX` from its leading edge (native driver).

### EmptyState

Placeholder for empty content.

| Prop        | Type                            | Default         | Req | Description |
| ----------- | ------------------------------- | --------------- | --- | ----------- |
| title       | string                          | —               | ✓   |             |
| icon        | icon                            | `inbox-outline` |     |             |
| description | string                          |                 |     |             |
| action      | `{ label, onPress, iconName? }` |                 |     | CTA button  |

### Collapse

Animates its children between `collapsedHeight` and their _measured_ natural height, so it
survives text reflow without a hardcoded height.

| Prop            | Type        | Default | Req | Description                           |
| --------------- | ----------- | ------- | --- | ------------------------------------- |
| children        | ReactNode   | —       | ✓   |                                       |
| open            | boolean     | —       | ✓   |                                       |
| duration        | number (ms) | `200`   |     |                                       |
| collapsedHeight | number      | `0`     |     | A peek/teaser height                  |
| animateOpacity  | boolean     | `true`  |     |                                       |
| keepMounted     | boolean     | `false` |     | Keep children mounted while collapsed |

### AppBar

`TopAppBar` behind react-navigation's header contract: reads the title from `options`/`route`,
shows back or a drawer menu button, renders `options.headerRight`. Props are navigator-shaped
(`navigation`, `route`, `options`, `back`, `isPinned`). Without a navigator, use `TopAppBar`.

### NavigationRail

The side-mounted counterpart of NavigationBar for medium and expanded windows: same item shape,
labels `always`/`selected`/`none`, `header` (menu, FAB) and `footer` slots. Props: see the API reference on its page of the docs site (generated from the source).

### Toolbar

M3 Expressive toolbar: `docked` (full-width, bottom inset) or `floating` (pill, elevation 3,
`standard`/`vibrant`, horizontal/vertical, optional `fab`). Lays out actions; does not position
itself. Props: see the API reference on its page of the docs site (generated from the source).

### Pagination

| Prop          | Type             | Default | Req | Description                |
| ------------- | ---------------- | ------- | --- | -------------------------- |
| page          | number (1-based) | —       | ✓   |                            |
| totalPages    | number           | —       | ✓   |                            |
| onPageChange  | (page) => void   | —       | ✓   |                            |
| siblingCount  | number           | `1`     |     | Pages each side of current |
| showFirstLast | boolean          | `false` |     | First/last arrows          |
| disabled      | boolean          |         |     |                            |

### Center

Centres its children on both axes. Every `Box` prop except `align` and `justify`.

### Spacer

| Prop | Type                         | Default    | Description                              |
| ---- | ---------------------------- | ---------- | ---------------------------------------- |
| size | SpacingValue                 |            | Fixed gap; omit to absorb leftover space |
| axis | `"vertical" \| "horizontal"` | `vertical` | Which axis `size` applies to             |

### AspectRatio

| Prop  | Type   | Default | Description                        |
| ----- | ------ | ------- | ---------------------------------- |
| ratio | number | `1`     | Width ÷ height — `16 / 9`, `4 / 3` |

---

## From packages/ui/README.md

#### `TouchableRipple`

A `Pressable` that paints the M3 state layer — 8% hover, 10% focus, 12% press — over a surface,
with the platform ripple on Android. Reach for it instead of re-deriving hover/press colours.

| Prop          | Type                                                       | Default     |
| ------------- | ---------------------------------------------------------- | ----------- |
| children      | ReactNode (required)                                       | —           |
| underlayColor | string (the surface the layer sits on)                     | `surface`   |
| rippleColor   | string (the "on" role of that surface)                     | `onSurface` |
| borderless    | boolean (tint only, no container background)               | `false`     |
| borderRadius  | number (match the parent so the layer doesn't bleed out)   |             |
| activeStyle   | ViewStyle (applied while hovered or pressed)               |             |

Plus every `Pressable` prop except `style`/`children`. The `useStateLayer(base, on)` hook exports
the same colours for a component that already owns its `Pressable`.

#### `AnimatedFAB`

A FAB that animates between an icon-only circle and a labelled pill. Drive `extended` from a
scroll offset to get the M3 shrink-on-scroll behaviour.

| Prop        | Type                                                           | Default        |
| ----------- | -------------------------------------------------------------- | -------------- |
| icon        | icon (required)                                                | —              |
| label       | string (required — it is the label that animates)              | —              |
| onPress     | () => void (required)                                          | —              |
| extended    | boolean                                                        | `true`         |
| animateFrom | `"left" \| "right"` (edge the label grows from)                | `right`        |
| iconMode    | `"static" \| "dynamic"` (icon stays put, or travels)           | `static`       |
| placement   | `"floating" \| "inline"`                                       | `floating`     |
| position    | `"bottom-right" \| "bottom-left" \| "top-right" \| "top-left"` | `bottom-right` |
| duration    | number (ms)                                                    | `150`          |
| disabled    | boolean                                                        | `false`        |

```tsx
const [extended, setExtended] = useState(true);

<ScrollView
  onScroll={(e) => setExtended(e.nativeEvent.contentOffset.y <= 0)}
  scrollEventThrottle={16}
>
  …
</ScrollView>
<AnimatedFAB icon="plus" label="Nuovo intervento" extended={extended} onPress={create} />
```

#### `ToggleButton`

Single segment; usually used via `ToggleButtonGroup`.

| Prop              | Type                                                | Default  |
| ----------------- | --------------------------------------------------- | -------- |
| active            | boolean (required)                                  | —        |
| onPress           | () => void (required)                               | —        |
| label             | string                                              |          |
| icon              | icon                                                |          |
| isFirst / isLast  | boolean (rounds outer corners in a group)           |          |
| disabled          | boolean                                             | `false`  |
| grow              | boolean (equal share of the group width)            | `false`  |
| showSelectedCheck | boolean (check mark replaces the glyph when active) | `false`  |
| accessibilityRole | `"radio" \| "checkbox" \| "button"`                 | `button` |

#### `ToggleButtonGroup`

Segmented button set (single or multi select).

Announces itself correctly: a single-select group is a `radiogroup` of `radio`s, a multi-select
one a set of `checkbox`es.

| Prop               | Type                                                            | Default |
| ------------------ | --------------------------------------------------------------- | ------- |
| options            | `{ label?, icon?, value, disabled? }[]` (required)              | —       |
| value              | string \| string[] (array when `multiSelect`, required)         | —       |
| onValueChange      | (val) => void (required)                                        | —       |
| multiSelect        | boolean                                                         | `false` |
| disabled           | boolean (whole group)                                           | `false` |
| fullWidth          | boolean (segments share the row equally)                        | `false` |
| showSelectedCheck  | boolean (M3 segmented-button check mark)                        | `false` |
| accessibilityLabel | string (names the group — a set of choices needs a question)     |         |

#### `ButtonGroup`

M3 Expressive button group — `type="standard"` or `"connected"` (the successor of segmented
buttons), single or `multiSelect`, sizes `xs` / `s` / `m`. Same `options` / `value` /
`onValueChange` shape as `ToggleButtonGroup`.

#### `SplitButton`

A primary action (`children`, `iconName`, `onPress`) joined to a trailing button that opens a
`Menu` of `items`.

#### `ChipGroup`

Filter chips with the selection handled: single (optionally `required`) or `multiSelect`,
wrapping or horizontally scrolling.

#### `RadioButton` / `RadioGroup`

`RadioButton` is a single control; `RadioGroup` (named export) manages a set.

RadioButton: `selected` (required), `onPress` (required), `label`, `labelPosition` (`right`),
`disabled`, `error`.

RadioGroup:

| Prop          | Type                                                           | Default  |
| ------------- | -------------------------------------------------------------- | -------- |
| options       | `RadioOption[]` = `{ id, label, value, disabled? }` (required) | —        |
| value         | any (required)                                                 | —        |
| onValueChange | (value) => void (required)                                     | —        |
| label         | string                                                         |          |
| direction     | `"column" \| "row"`                                            | `column` |
| error         | string (group-level message)                                   |          |

#### `Slider`

| Prop              | Type                                     | Default     |
| ----------------- | ---------------------------------------- | ----------- |
| value             | number (required)                        | —           |
| onValueChange     | (value) => void (required)               | —           |
| onSlidingComplete | (value) => void                          |             |
| min / max         | number                                   | `0` / `100` |
| step              | number (0/undefined = continuous)        |             |
| label             | string                                   |             |
| showValueLabel    | boolean                                  |             |
| marks             | boolean (ticks at each step, needs step) |             |
| disabled          | boolean                                  |             |

#### `Calendar` / `ClockPicker` / `ClockDial`

The surfaces `DateTimePicker` composes, exported on their own for inline use. All three are pure
React Native — no SVG, no native modules — so they render identically on web and native.
`Calendar` adds month and year sub-views, single/range/multiple selection, virtualized endless
month scrolling and the keyboard navigation above; `ClockPicker` is the M3 hour/minute readout
with its AM/PM switch, over `ClockDial` (the analog face, drag to set) or two text fields.
Full prop tables in
[`components.md`](https://github.com/itsolutions-dev/Solaris-ui/blob/master/packages/ui/src/components/components.md).

#### `PinInput`

One-time-code / PIN entry: single-character cells that behave as one field. Typing advances,
Backspace retreats, and pasting a whole code into any cell fills the row.

| Prop                                             | Type                                           | Default   |
| ------------------------------------------------ | ---------------------------------------------- | --------- |
| value / onChangeText                             | string / (value) => void (required)            | —         |
| length                                           | number                                         | `6`       |
| onComplete                                       | (value) => void — fired once, on becoming full |           |
| type                                             | `"numeric" \| "alphanumeric"`                  | `numeric` |
| mask                                             | boolean                                        | `false`   |
| label / error / helperText / required / disabled | as `Input`                                     |           |
| autoFocus                                        | boolean (first cell only)                      |           |
| cellSize                                         | number                                         | `48`      |

#### `FormControl`

Groups a label, a control and its supporting text, and shares invalid/disabled/required state with
descendants via `useFormControl()`. For controls with no `label`/`error` props of their own —
`Checkbox`, `RadioGroup`, `Slider`, custom composites.

| Prop                       | Type                 | Default |
| -------------------------- | -------------------- | ------- |
| children                   | ReactNode (required) | —       |
| label / helperText / error | string               |         |
| required / disabled        | boolean              | `false` |

#### `HelperText`

The supporting text under a form control. `Input`, `FormControl`, `PinInput`, `Autocomplete` and
the date/time picker field render this internally via their own `helperText` / `error` props —
use it directly for a control that has neither.

| Prop           | Type                                                   | Default  |
| -------------- | ------------------------------------------------------ | -------- |
| children       | ReactNode (required)                                   | —        |
| type           | `"info" \| "error"` (error adds the alert glyph)        | `info`   |
| visible        | boolean (fades out instead of unmounting)              | `true`   |
| disabled       | boolean (dims to match a disabled field)               | `false`  |
| padding        | `"normal" \| "none"` (the 16px field gutter)           | `normal` |

Hiding it keeps the text mounted so the field height doesn't jump, but takes it out of the
accessibility tree.

#### `Rating`

Star rating; renders half-stars, sets whole values on tap.

| Prop     | Type                                         | Default |
| -------- | -------------------------------------------- | ------- |
| value    | number (supports halves, e.g. 3.5, required) | —       |
| onChange | (value) => void (interactive when provided)  |         |
| max      | number                                       | `5`     |
| size     | number                                       | `24`    |
| disabled | boolean                                      |         |

#### `StatusBadge`

Small labeled status pill with its own semantic colors (light/dark aware).

| Prop  | Type                                  | Default   |
| ----- | ------------------------------------- | --------- |
| label | string (required)                     | —         |
| type  | `"success" \| "error" \| "warning"`   | `success` |
| icon  | icon (override default per-type icon) |           |

#### `Carousel`

Paged horizontal slider.

| Prop             | Type                                      | Default |
| ---------------- | ----------------------------------------- | ------- |
| children         | ReactNode (each child = a page, required) | —       |
| showDots         | boolean                                   | `true`  |
| showArrows       | boolean (overlay prev/next)               | `false` |
| autoPlayInterval | number (ms, 0 = off)                      | `0`     |
| height           | number (fixed; else tallest page)         |         |
| onIndexChange    | (index) => void                           |         |

#### `Stat`

A single labelled metric with an optional trend delta.

| Prop              | Type                                                   | Default |
| ----------------- | ------------------------------------------------------ | ------- |
| label / value     | string (both required)                                 | —       |
| delta             | string, e.g. `"12.5%"`                                 |         |
| trend             | `"up" \| "down" \| "flat"` — arrow + color for `delta` |         |
| invertTrendColors | boolean — for metrics where down is good               | `false` |
| helpText          | string                                                 |         |
| icon              | icon                                                   |         |

#### `Image`

`react-native`'s Image plus a skeleton placeholder, a fallback for broken sources, and
token-driven corner radius.

| Prop             | Type                                                                | Default                |
| ---------------- | ------------------------------------------------------------------- | ---------------------- |
| source           | ImageSourcePropType (required)                                      | —                      |
| alt              | string (required — a nameless image is invisible to screen readers) | —                      |
| fallbackSource   | ImageSourcePropType                                                 |                        |
| fallbackIcon     | icon (used when there is no `fallbackSource`)                       | `image-broken-variant` |
| width / height   | DimensionValue                                                      | `100%` / —             |
| ratio            | number — width ÷ height; use instead of `height` for fluid layouts  |                        |
| radius           | RadiusValue                                                         | `0`                    |
| resizeMode       | ImageResizeMode                                                     | `cover`                |
| showLoader       | boolean                                                             | `true`                 |
| onLoad / onError | () => void                                                          |                        |

#### `Popover`

Anchored floating panel; auto-positions within the viewport.

| Prop             | Type                                | Default |
| ---------------- | ----------------------------------- | ------- |
| anchor           | ReactElement (trigger, required)    | —       |
| children         | ReactNode (panel content, required) | —       |
| visible          | boolean (required)                  | —       |
| onDismiss        | () => void (required)               | —       |
| matchAnchorWidth | boolean (constrain to anchor width) | `false` |

#### `BottomSheet`

Draggable bottom sheet with scrim.

| Prop              | Type                        | Default |
| ----------------- | --------------------------- | ------- |
| visible           | boolean (required)          | —       |
| onDismiss         | () => void (required)       | —       |
| children          | ReactNode (required)        | —       |
| title             | string                      |         |
| showHandle        | boolean (drag handle)       | `true`  |
| dismissOnScrimTap | boolean                     | `true`  |
| maxHeightRatio    | number (fraction of window) |         |

#### `CircularProgress`

Indeterminate SVG spinner.

| Prop        | Type                         | Default   |
| ----------- | ---------------------------- | --------- |
| size        | number                       | `48`      |
| strokeWidth | number                       | `4`       |
| color       | string                       | `primary` |
| duration    | number (ms, rotation period) | `1000`    |

#### `LinearProgress`

Determinate or indeterminate bar.

| Prop                  | Type                                | Default                   |
| --------------------- | ----------------------------------- | ------------------------- |
| progress              | number 0–1 (determinate value)      | `0`                       |
| indeterminate         | boolean                             | `false`                   |
| height                | number                              | `4`                       |
| color                 | string                              | `primary`                 |
| trackColor            | string                              | `surfaceContainerHighest` |
| duration              | number (ms, determinate transition) | `500`                     |
| indeterminateDuration | number (ms)                         | `1500`                    |

#### `EmptyState`

Placeholder for empty content.

| Prop        | Type                                         | Default         |
| ----------- | -------------------------------------------- | --------------- |
| title       | string (required)                            | —               |
| icon        | icon                                         | `inbox-outline` |
| description | string                                       |                 |
| action      | `{ label, onPress, iconName? }` (CTA button) |                 |

#### `Collapse`

Animates its children between `collapsedHeight` and their _measured_ natural height, so it
survives text reflow without a hardcoded height.

| Prop            | Type                                            | Default |
| --------------- | ----------------------------------------------- | ------- |
| children        | ReactNode (required)                            | —       |
| open            | boolean (required)                              | —       |
| duration        | number (ms)                                     | `200`   |
| collapsedHeight | number — a peek/teaser height                   | `0`     |
| animateOpacity  | boolean                                         | `true`  |
| keepMounted     | boolean — keep children mounted while collapsed | `false` |

#### `SideSheet`

M3 side sheet: `modal` (over a scrim, from the `end` or `start` edge) or standard (inline beside
the content), with back / close buttons and an `actions` row.

#### `AppBar`

`TopAppBar` behind react-navigation's header contract (drawer/back button, title, right
actions). Its props are navigator-shaped
(`navigation`, `route`, `options`, `back`, `isPinned`) and structurally typed, so it drops
into a React Navigation `header` renderer without the library depending on the navigator.

#### `Pagination`

| Prop          | Type                                | Default |
| ------------- | ----------------------------------- | ------- |
| page          | number (1-based, required)          | —       |
| totalPages    | number (required)                   | —       |
| onPageChange  | (page) => void (required)           | —       |
| siblingCount  | number (pages each side of current) | `1`     |
| showFirstLast | boolean (first/last arrows)         | `false` |
| disabled      | boolean                             |         |

#### `NavigationRail`

The side-mounted counterpart of `NavigationBar` for medium and expanded windows — same item
shape, `header` / `footer` slots for a menu button or a FAB.

#### `Toolbar`

M3 Expressive toolbar: `docked` along the bottom edge or `floating` (standard or vibrant,
horizontal or vertical, with an optional FAB).

