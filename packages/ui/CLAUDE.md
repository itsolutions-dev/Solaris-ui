# packages/ui — the library

- Anything added under `src/components` must be exported from `src/index.ts` to exist for
  consumers.
- Native dependencies are **peerDependencies**, and every one of them is required except
  `react-dom` (web only, and always there with `react-native-web`). An "optional" peer that a
  barrel-reachable module imports is not optional — Metro resolves every static import — which
  is why `expo-localization` (replaced by `Intl`) and `expo-status-bar` (the `StatusBar`
  component moved into the playground) are gone. `polished` is the only real dependency.
  The library is **navigation-agnostic**: it must never
  depend on `@react-navigation/*`. It ships navigation widgets (`AppBar`, `NavigationBar`,
  `Tabs`, `Breadcrumbs`, `Pagination`, `Stepper`) but no navigator — that belongs to the
  consuming app.
- Source maps are **not published**. `sourceMaps: false` on bob's babel targets drops the
  `.js.map` files; bob's typescript target hardcodes `--declarationMap`, so `npm run build`
  chains `scripts/strip-declaration-maps.mjs` to delete the `.d.ts.map` files and the
  comments pointing at them. Don't "restore" either half without removing `!**/*.map` from
  the package's `files` too, or the tarball will reference maps it does not ship.
- The playground consumes `src`, never `lib`, so the published artefact is checked separately:
  `npm run validate-package -w @its/solaris-ui` (a CI step) validates the tarball's manifest
  and types statically, and `examples/consumer` exercises the published package at runtime
  (its own CI workflow, `consumer-smoke.yml`, is manual-only until the first publish; after it,
  it chains off Release again, so it runs on every push to master, plus weekly and on demand —
  never on a PR, which cannot change what is already published). Run validate-package
  after touching `package.json`, the export map or anything a `.d.ts` imports.

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

`theme.json` holds only inputs and scales: the two colour schemes, typography and shape.
Spacing is a function (`theme.spacing(n)` = 8 × n, as in MUI), not a token set. The public `Theme` type spells the tokens out explicitly (`ThemeColorTokens`,
`Palette`, `ThemeShapeTokens`, `TypographyVariant`) instead of deriving
them with `typeof themeConfig`. A public type derived from the JSON makes the emitted `.d.ts`
import `theme.json`, which is not shipped with the declarations.

Two checks keep the types honest:
- A type-level guard (`_ThemeTokensInSync` in `ThemeProvider.tsx`) fails
  `npm run type-check` if typography or shape drift from `theme.json` (spacing is a function, `theme.spacing(n)` = 8 × n, and has no tokens).
- Colour roles are checked by `deriveScheme`'s return type. **When you add a role, add it to
  `ThemeColorTokens` and to `deriveScheme`.**

Selection and tonal states use the **primary** container roles: navigation indicators,
selected chips, tonal buttons. `secondary` is the brand green, not Material 3's quiet
companion colour.

Fonts: `typography.fontFamily` defaults to Roboto on Android and web, and to the system font
on iOS, where an unregistered family is an error. Apps that embed Roboto opt in with
`createTheme({ typography: { fontFamily: Platform.OS === "ios" ? "Roboto" : undefined } })`.

**Styling pattern used throughout:** theme-reactive styles via `useMemo`:

```tsx
const styles = useMemo(() => makeStyles(theme), [theme]);
// ...
const makeStyles = (theme: Theme) => StyleSheet.create({ ... });
```

`useTheme()` exposes `{ theme, toggleTheme }`. `getStateColor()` and `getGlowStyles()` are
exported for building theme-reactive components. The theme follows the OS color scheme and
supports a manual toggle.

## Providers

- `ThemeProvider` — renders the scheme of `theme` (from `createTheme()`; defaults to the
  organization's theme) that the OS, or `toggleTheme()`, asks for.
- `AlertProvider` — cross-platform alert: native `Alert.alert` on iOS/Android, custom Modal on
  web. Call the `Alert(title, message, buttons)` singleton; `AlertProvider` wires it up
  (`AlertProviderWrapper` is a deprecated pass-through).
- `ToastProvider` — imperative queued toasts via `useToast()`.
