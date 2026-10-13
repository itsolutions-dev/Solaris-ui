import { Platform, type TextStyle } from "react-native";
import { parseToRgb, readableColor, rgba } from "polished";

import themeConfig from "./theme.json";
import { hexToLch, tone } from "./tonal";
import type {
  IconSetName,
  Palette,
  PaletteColor,
  Theme,
  ThemeColorTokens,
  ThemeShapeTokens,
  TypographyVariant,
} from "./ThemeProvider";

/** One colour as an app passes it: MUI's `PaletteColorOptions`, minus `light`/`dark`. */
export interface PaletteColorOptions {
  main: string;
  /** Text and icons on `main`. Omitted: black or white, whichever contrasts more. */
  contrastText?: string;
}

/** The part of MUI's `PaletteOptions` Solaris reads. */
export interface PaletteOptions {
  primary?: PaletteColorOptions;
  secondary?: PaletteColorOptions;
  error?: PaletteColorOptions;
  warning?: PaletteColorOptions;
  info?: PaletteColorOptions;
  success?: PaletteColorOptions;
  /** A Solaris extension. Omitted: derived from primary's hue, as before. */
  tertiary?: PaletteColorOptions;
  background?: { default?: string; paper?: string };
  text?: { primary?: string; secondary?: string };
  divider?: string;
}

/** One scheme as an app passes it: MUI's `palette`, plus exact Material 3 roles. */
export interface SchemeOptions {
  palette?: PaletteOptions;
  /**
   * Exact Material 3 roles, applied after derivation, for values the
   * derivation cannot guess (a designer's `primaryContainer`). The six
   * colours' `main`s are still normalised to `#RRGGBB`; every value must be a
   * colour.
   */
  colors?: Partial<ThemeColorTokens>;
}

/** MUI v6's `colorSchemes` shape, plus typography, shape and icon-set settings. */
export interface ThemeOptions {
  colorSchemes?: {
    light?: SchemeOptions;
    dark?: SchemeOptions;
  };
  /** `fontFamily` for every step, and any step's own style (`h4: { fontSize: 24 }`). */
  typography?: { fontFamily?: string } & Partial<
    Record<TypographyVariant, TextStyle>
  >;
  /** Radii; each given key replaces the default. */
  shape?: Partial<ThemeShapeTokens>;
  /** Which drawing set `Icon` uses. Default `"material"`. */
  icons?: IconSetName;
}

/** Both schemes of a theme. `ThemeProvider` renders the one the OS, or `toggleTheme()`, asks for. */
export interface ThemeSchemes {
  light: Theme;
  dark: Theme;
}

const COLOR_KEYS = [
  "primary",
  "secondary",
  "error",
  "warning",
  "info",
  "success",
] as const;
type ColorKey = (typeof COLOR_KEYS)[number];

/** A palette after merging over `theme.json`, which supplies every required key. */
type ResolvedPalette = Record<ColorKey, PaletteColorOptions> & {
  tertiary?: PaletteColorOptions;
  background: { default: string; paper: string };
  text?: { primary?: string; secondary?: string };
  divider?: string;
};

interface ColorRoles {
  main: string;
  on: string;
  container: string;
  onContainer: string;
}

const BOX_SHADOW =
  "0px 1px 3px rgba(0,0,0,0.2), 0px 1px 2px rgba(0,0,0,0.14), 0px 1px 1px rgba(0,0,0,0.12)";

/** Chroma of every given colour's tonal palette: TonalSpot's primary value. */
const CHROMA = 48;
const NEUTRAL_CHROMA = 4;
const NEUTRAL_VARIANT_CHROMA = 7;
const TERTIARY_CHROMA = 20;
const TERTIARY_HUE_SHIFT = 60;
/**
 * Below this LCh chroma a colour is grey, and its hue is floating-point
 * noise: at full chroma MUI's grey would get a mint container and black a
 * pink one. Such a colour gets grey tonal palettes instead (a grey primary
 * also greys the neutrals and tertiary, which take their hue from it). Every
 * organization colour sits far above it (lowest: 39).
 */
const ACHROMATIC = 5;

/**
 * React Native has no font fallback, and iOS raises an error for a family the
 * app has not registered. So Roboto is the default only where it is known to
 * exist: Android's system font, and the web, which takes a stack. An iOS app
 * that embeds Roboto opts in with `createTheme({ typography: { fontFamily: Platform.OS === "ios" ? "Roboto" : undefined } })`.
 */
const DEFAULT_FONT_FAMILY = Platform.select({
  android: "Roboto",
  web: "Roboto, system-ui, sans-serif",
  default: "System",
});

/** Any CSS colour polished can parse, as `#RRGGBB`. Throws on anything else. */
const toHex = (color: string): string => {
  const { red, green, blue } = parseToRgb(color);
  return `#${[red, green, blue]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
};

const channels = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const fromChannels = (values: number[]) =>
  `#${values
    .map((c) => Math.trunc(c).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
/** MUI's `lighten(main, 0.2)`: each channel a fifth of the way to white, truncated as MUI does. */
const muiLight = (hex: string) =>
  fromChannels(channels(hex).map((c) => c + (255 - c) * 0.2));
/** MUI's `darken(main, 0.3)`. */
const muiDark = (hex: string) =>
  fromChannels(channels(hex).map((c) => c * 0.7));

/**
 * The colours used as given (not normalised like `main`) still have to be
 * colours: a typo would otherwise pass here and throw later, deep in a
 * press or hover handler. `parseToRgb` throws on anything it cannot read.
 */
const assertColors = (
  p: PaletteOptions,
  overrides: Partial<ThemeColorTokens> = {},
) => {
  const given = [
    ...COLOR_KEYS.map((key) => p[key]?.contrastText),
    p.tertiary?.contrastText,
    // boxShadow is a CSS shadow, the one role that is not a colour.
    ...Object.entries(overrides)
      .filter(([key]) => key !== "boxShadow")
      .map(([, value]) => value),
    p.background?.default,
    p.background?.paper,
    p.text?.primary,
    p.text?.secondary,
    p.divider,
  ];
  given.forEach((color) => color !== undefined && parseToRgb(color));
};

/**
 * Roles a palette entry fixes. `theme.json` pins exact roles for the default
 * theme (a designer's `primaryContainer`); an app that passes the matching
 * palette entry means a different colour, so the default's pins for that
 * family would only tint it with the old one.
 */
/** Roles derived from primary's hue: they go with it, so a grey brand does not keep the default's blue-grey surfaces. */
const PRIMARY_DERIVED = [
  "inversePrimary",
  "surfaceTint",
  "surfaceVariant",
  "surfaceContainerLow",
  "surfaceContainer",
  "surfaceContainerHigh",
  "surfaceContainerHighest",
  "surfaceDim",
  "inverseSurface",
  "inverseOnSurface",
  "outline",
];
const familyOf = (key: string): string[] => {
  const cap = key[0].toUpperCase() + key.slice(1);
  const family = [key, `on${cap}`, `${key}Container`, `on${cap}Container`];
  return key === "primary" ? [...family, ...PRIMARY_DERIVED] : family;
};
const shadowedBy = (palette: PaletteOptions = {}): string[] => [
  ...[...COLOR_KEYS, "tertiary" as const]
    .filter((key) => palette[key])
    .flatMap(familyOf),
  ...(palette.background?.default ? ["background"] : []),
  ...(palette.background?.paper ? ["surface"] : []),
  ...(palette.text?.primary ? ["onSurface", "onBackground"] : []),
  ...(palette.text?.secondary ? ["onSurfaceVariant"] : []),
  ...(palette.divider ? ["outlineVariant"] : []),
];

/** Two levels deep, which is all a palette has. */
const mergePalette = (
  base: PaletteOptions,
  over: PaletteOptions = {},
): PaletteOptions => {
  const out: Record<string, unknown> = { ...base };
  (Object.keys(over) as (keyof PaletteOptions)[]).forEach((key) => {
    const b = base[key];
    const o = over[key];
    out[key] =
      typeof b === "object" && typeof o === "object"
        ? { ...b, ...o }
        : (o ?? b);
  });
  return out as PaletteOptions;
};

const deriveScheme = (
  p: ResolvedPalette,
  isDark: boolean,
  overrides: Partial<ThemeColorTokens> = {},
): Pick<Theme, "colors" | "palette"> => {
  const containerTone = isDark ? 30 : 90;
  const onContainerTone = isDark ? 90 : 10;
  const { h: primaryHue, c: primaryChroma } = hexToLch(toHex(p.primary.main));
  // A grey primary has no hue to lend the neutrals and tertiary.
  const tint = (chroma: number) => (primaryChroma < ACHROMATIC ? 0 : chroma);
  const n = (t: number) => tone(primaryHue, tint(NEUTRAL_CHROMA), t);
  const nv = (t: number) => tone(primaryHue, tint(NEUTRAL_VARIANT_CHROMA), t);
  const t3 = (t: number) =>
    tone((primaryHue + TERTIARY_HUE_SHIFT) % 360, tint(TERTIARY_CHROMA), t);

  const rolesOf = (option: PaletteColorOptions): ColorRoles => {
    const main = toHex(option.main);
    const { h, c } = hexToLch(main);
    const chroma = c < ACHROMATIC ? 0 : CHROMA;
    return {
      main,
      on:
        option.contrastText ?? readableColor(main, "#000000", "#FFFFFF", false),
      container: tone(h, chroma, containerTone),
      onContainer: tone(h, chroma, onContainerTone),
    };
  };
  const roles = {} as Record<ColorKey, ColorRoles>;
  COLOR_KEYS.forEach((key) => {
    roles[key] = rolesOf(p[key]);
  });
  const { primary, secondary, error, warning, info, success } = roles;
  // A given tertiary is derived like the six colours; otherwise it keeps the
  // hue-shifted derivation every component already renders.
  const given = p.tertiary ? rolesOf(p.tertiary) : undefined;

  const onSurface = p.text?.primary ?? n(isDark ? 90 : 10);
  const onSurfaceVariant = p.text?.secondary ?? nv(isDark ? 80 : 30);
  const outlineVariant = p.divider ?? nv(isDark ? 30 : 80);

  const derived: ThemeColorTokens = {
    primary: primary.main,
    onPrimary: primary.on,
    primaryContainer: primary.container,
    onPrimaryContainer: primary.onContainer,
    inversePrimary: tone(primaryHue, tint(CHROMA), isDark ? 40 : 80),
    secondary: secondary.main,
    onSecondary: secondary.on,
    secondaryContainer: secondary.container,
    onSecondaryContainer: secondary.onContainer,
    tertiary: given?.main ?? t3(isDark ? 80 : 40),
    onTertiary: given?.on ?? t3(isDark ? 20 : 100),
    tertiaryContainer: given?.container ?? t3(containerTone),
    onTertiaryContainer: given?.onContainer ?? t3(onContainerTone),
    error: error.main,
    onError: error.on,
    errorContainer: error.container,
    onErrorContainer: error.onContainer,
    warning: warning.main,
    onWarning: warning.on,
    warningContainer: warning.container,
    onWarningContainer: warning.onContainer,
    info: info.main,
    onInfo: info.on,
    infoContainer: info.container,
    onInfoContainer: info.onContainer,
    success: success.main,
    onSuccess: success.on,
    successContainer: success.container,
    onSuccessContainer: success.onContainer,
    background: p.background.default,
    onBackground: onSurface,
    surface: p.background.paper,
    onSurface,
    surfaceVariant: nv(isDark ? 30 : 90),
    onSurfaceVariant,
    surfaceContainerLow: n(isDark ? 10 : 96),
    surfaceContainer: n(isDark ? 12 : 94),
    surfaceContainerHigh: n(isDark ? 17 : 92),
    surfaceContainerHighest: n(isDark ? 22 : 90),
    surfaceDim: n(isDark ? 5 : 87),
    inverseSurface: n(isDark ? 90 : 20),
    inverseOnSurface: n(isDark ? 20 : 95),
    surfaceTint: primary.main,
    outline: nv(isDark ? 60 : 50),
    outlineVariant,
    scrim: "#000000",
    shadow: "#000000",
    boxShadow: BOX_SHADOW,
  };

  // The six colours' `main`s stay `#RRGGBB` even when overridden: components
  // append hex alpha to them (`${primary}33`).
  const fixed: Partial<ThemeColorTokens> = { ...overrides };
  [...COLOR_KEYS, "tertiary"].forEach((key) => {
    const k = key as keyof ThemeColorTokens;
    if (fixed[k] !== undefined) fixed[k] = toHex(fixed[k] as string);
  });
  const colors: ThemeColorTokens = { ...derived, ...fixed };

  // Built from the final roles, so `palette` and `colors` never disagree.
  const paletteColor = (main: string, contrastText: string): PaletteColor => ({
    main,
    light: muiLight(main),
    dark: muiDark(main),
    contrastText,
  });

  const palette: Palette = {
    mode: isDark ? "dark" : "light",
    primary: paletteColor(colors.primary, colors.onPrimary),
    secondary: paletteColor(colors.secondary, colors.onSecondary),
    error: paletteColor(colors.error, colors.onError),
    warning: paletteColor(colors.warning, colors.onWarning),
    info: paletteColor(colors.info, colors.onInfo),
    success: paletteColor(colors.success, colors.onSuccess),
    tertiary: paletteColor(colors.tertiary, colors.onTertiary),
    background: { default: colors.background, paper: colors.surface },
    text: {
      primary: colors.onSurface,
      secondary: colors.onSurfaceVariant,
      disabled: rgba(colors.onSurface, 0.38),
    },
    divider: colors.outlineVariant,
  };

  return { colors, palette };
};

/**
 * The theme an app renders: MUI's `colorSchemes` in, both schemes out. Pass
 * only what differs. Everything else stays the organization's theme
 * (`theme.json`). Call it once, at module scope: every component memoises
 * its styles on the theme object.
 *
 * ```ts
 * const theme = createTheme({
 *   colorSchemes: { light: { palette: { primary: { main: "#00639B" } } } },
 * });
 * <ThemeProvider theme={theme}>…</ThemeProvider>
 * ```
 */
export const createTheme = (options: ThemeOptions = {}): ThemeSchemes => {
  const fontFamily = options.typography?.fontFamily ?? DEFAULT_FONT_FAMILY;
  const typography = Object.fromEntries(
    Object.entries(themeConfig.typography).map(([variant, style]) => [
      variant,
      {
        ...style,
        ...options.typography?.[variant as TypographyVariant],
        fontFamily,
      },
    ]),
  ) as Theme["typography"];
  const shape: ThemeShapeTokens = { ...themeConfig.shape, ...options.shape };

  const build = (mode: "light" | "dark"): Theme => {
    const input = mergePalette(
      themeConfig.colorSchemes[mode].palette as PaletteOptions,
      options.colorSchemes?.[mode]?.palette,
    ) as ResolvedPalette;
    const appScheme = options.colorSchemes?.[mode];
    const pinned = Object.entries(
      (themeConfig.colorSchemes[mode] as SchemeOptions).colors ?? {},
    ).filter(([key]) => !shadowedBy(appScheme?.palette).includes(key));
    const overrides: Partial<ThemeColorTokens> = {
      ...Object.fromEntries(pinned),
      ...appScheme?.colors,
    };
    assertColors(input, overrides);
    return {
      ...deriveScheme(input, mode === "dark", overrides),
      typography,
      spacing: (n: number) => n * 8,
      shape,
      icons: options.icons ?? "material",
      isDark: mode === "dark",
    };
  };

  return { light: build("light"), dark: build("dark") };
};
