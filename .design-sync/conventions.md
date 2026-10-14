## How to build with @its/solaris-ui

IT Solutions' Material-based components for **Expo React Native**, rendered here through
react-native-web. It is a **prop-and-theme** system: there are **no CSS classes, no CSS
custom properties, and no stylesheet to import**. Every colour, type size, space and
radius comes from the theme object at runtime. Class names you invent will not resolve.

### Wrap the app, or nothing is styled

Three providers, in this order. `ThemeProvider` supplies every token — without it
components mount but render unthemed. `SafeAreaProvider` is required by `TopAppBar`,
`FAB`, `SpeedDial` and the modal `NavigationDrawer` (they read insets and throw without it). `AlertProviderWrapper` is what binds
the imperative `Alert()` singleton; omit it and every `Alert()` call is a no-op warning.

```tsx
<SafeAreaProvider>
  <ThemeProvider>
    <AlertProvider>
      <AlertProviderWrapper>{/* app */}</AlertProviderWrapper>
    </AlertProvider>
  </ThemeProvider>
</SafeAreaProvider>
```

### The styling idiom

Read tokens with `useTheme()` and put them in a `StyleSheet`-shaped object memoised on
the theme — this is the pattern used in every file of the library:

```tsx
const { theme, toggleTheme } = useTheme();
const styles = useMemo(() => makeStyles(theme), [theme]);
```

The real token vocabulary, all under `theme`:

| Group        | Names |
| ------------ | ----- |
| `colors`     | The Material 3 roles: `primary`, `onPrimary`, `primaryContainer`, `onPrimaryContainer`, and the same four for `secondary` / `tertiary` / `error` / `warning` / `info` / `success`; `background`, `onBackground`, `surface`, `onSurface`, `surfaceVariant`, `onSurfaceVariant`, `surfaceContainer`, `surfaceContainerLow`, `surfaceContainerHigh`, `surfaceContainerHighest`, `surfaceDim`, `inverseSurface`, `inverseOnSurface`, `inversePrimary`, `outline`, `outlineVariant`, `shadow`, `scrim` |
| `palette`    | The same colours in MUI's shape: `primary` … `success` as `{ main, light, dark, contrastText }`, `background.default` / `paper`, `text.primary` / `secondary` / `disabled`, `divider` |
| `typography` | MUI's variant names on the CRM's Roboto scale (`h4` 32/700 … `caption` 12): `h1`–`h6`, `subtitle1`, `subtitle2`, `body1`, `body2`, `button` (sentence case), `caption`, `overline` (uppercase) |
| `spacing`    | a function, as in MUI: `theme.spacing(n)` = 8 × n (`spacing(2)` = 16) |
| `shape`      | `borderRadius` 4 (MUI's base), `small` 8, `medium` 12, `large` 16, `extraLarge` 24, `full` 9999 — fields 12, cards 16, dialogs and sheets 24, buttons fully rounded |
|              | `isDark` — boolean; the scheme follows the OS, `toggleTheme()` overrides it |

Helpers: `getStateColor(base, on, "hover" | "press" | "focus")` for M3 state layers, and
`getGlowStyles(theme, isActive, error?)` for the library's focus/error border treatment.

### The theme

With no props, `ThemeProvider` renders the organization's theme (Proposta A): primary `#1D5B9D`
(dark `#5893D4`), secondary slate `#556579`, tertiary the brand green `#61B340`, page background `#F0F2F5`.
Selection and tonal states (navigation indicators, selected chips, tonal buttons) use the
**primary** container roles. To render a design in other colours, build a theme with
`createTheme` in MUI's `colorSchemes` shape, passing only what differs; never override
colours component by component:

```tsx
const theme = createTheme({
  colorSchemes: { light: { palette: { primary: { main: "#00639B" } } } },
});

<ThemeProvider theme={theme}>{/* design */}</ThemeProvider>;
```

### Progress inside a button

For an action that runs a task the user waits on (route, upload, payment), give the
`Button` itself `loading` (spinner, presses blocked) or `busy` (presses blocked, label kept);
there is no separate progress-button or progress-bar component in the library.

**Text goes in `<Typography variant="...">`**, never a bare string — that is the only way
type picks up the scale. **Icons** are MaterialCommunityIcons kebab-case name strings
(`iconName="plus"`, `leadingIcon="email-outline"`); outline variants take `-outline`.

**Layout comes from the library, not from `<div>`.** `Stack` (`direction`, `spacing`,
`reverse`, `wrap`), `Box` (`p` / `px` / `py`, `bg`, `radius`, `gap`, `justify`, `align`) and
`Grid` (`columns`, `spacing`) all take
the spacing names `xs`/`s`/`m`/`l`/`xl` (4/8/16/24/32) and `bg` colour-role names. There is
no `View` and no `Text` export: reach for these first, and drop to a plain `<div>` with
inline styles only for glue they cannot express (react-native-web renders real DOM, so
divs compose fine) — taking values from `theme.spacing(n)` when you do.

### Where the truth lives

Read `_ds/<folder>/components/<group>/<Name>/<Name>.prompt.md` for a component's real
prop table and usage, and its `<Name>.d.ts` for the exact contract. The M3 principles,
full token tables and type scale are in `_ds/<folder>/guidelines/design-system.md`.
`styles.css` is intentionally near-empty: react-native-web injects all styles at runtime.

### A representative screen

```tsx
const { theme } = useTheme();

<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    padding: theme.spacing(3),
  }}
>
  <Typography variant="h5">Invoices</Typography>
  <SearchBar
    value={query}
    onChangeText={setQuery}
    placeholder="Search invoices"
  />
  <div style={{ display: "flex", gap: theme.spacing(1), flexWrap: "wrap" }}>
    <Chip label="Paid" mode="tonal" selected onPress={() => {}} />
    <Chip label="Overdue" mode="outlined" onPress={() => {}} />
  </div>
  <Paper elevation={0} outline style={{ borderRadius: theme.shape.large }}>
    <DataGrid
      data={rows}
      columns={columns}
      sortColumn="issued"
      sortDirection="asc"
      onSort={onSort}
    />
  </Paper>
  <Button mode="filled" iconName="plus" fullWidth onPress={() => {}}>
    New invoice
  </Button>
</div>;
```

### Two things worth knowing

`ListItem` is a real M3 row: pass `leading`, `secondary` and `trailing` rather than
composing a row by hand; with none of them it falls back to a centred single-line tile.
`Tooltip` caps its text at two lines, so keep tips to a short phrase.
