import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useColorScheme, Platform, TextStyle } from "react-native";

import { mix } from "polished";
import themeConfig from "./theme.json";
import { createTheme, type ThemeSchemes } from "./createTheme";

/**
 * The Material 3 colour roles every component paints with, derived by
 * `createTheme` from the palette input in `theme.json` (and the app's own).
 *
 * The theme types are spelled out instead of derived with `typeof themeConfig`
 * on purpose: a public type derived from the JSON import makes the emitted
 * `.d.ts` import `./theme.json`, which is not shipped with the type
 * declarations (bob's typescript target emits `.d.ts` only) and would force
 * every consumer to enable `resolveJsonModule`. The `_ThemeTokensInSync` guard
 * below fails `tsc` if typography or shape drift from `theme.json`;
 * these roles are checked by `deriveScheme`'s return type.
 */
export interface ThemeColorTokens {
  background: string;
  boxShadow: string;
  error: string;
  errorContainer: string;
  info: string;
  infoContainer: string;
  inverseOnSurface: string;
  inversePrimary: string;
  inverseSurface: string;
  onBackground: string;
  onError: string;
  onErrorContainer: string;
  onInfo: string;
  onInfoContainer: string;
  onPrimary: string;
  onPrimaryContainer: string;
  onSecondary: string;
  onSecondaryContainer: string;
  onSuccess: string;
  onSuccessContainer: string;
  onSurface: string;
  onSurfaceVariant: string;
  onTertiary: string;
  onTertiaryContainer: string;
  onWarning: string;
  onWarningContainer: string;
  outline: string;
  outlineVariant: string;
  primary: string;
  primaryContainer: string;
  scrim: string;
  secondary: string;
  secondaryContainer: string;
  shadow: string;
  success: string;
  successContainer: string;
  surface: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceContainerLow: string;
  surfaceDim: string;
  surfaceTint: string;
  surfaceVariant: string;
  tertiary: string;
  tertiaryContainer: string;
  warning: string;
  warningContainer: string;
}

/** Corner radii, in density-independent pixels. */
export interface ThemeShapeTokens {
  /** MUI's base radius: layout props multiply their `borderRadius` by it. */
  borderRadius: number;
  small: number;
  medium: number;
  large: number;
  extraLarge: number;
  /** Fully rounded: pills and circles. */
  full: number;
}

/** MUI's type scale, at MUI's own sizes. */
export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "subtitle1"
  | "subtitle2"
  | "body1"
  | "body2"
  | "button"
  | "caption"
  | "overline";

/** One colour in MUI's shape, as `theme.palette.primary` and the rest carry it. */
export interface PaletteColor {
  main: string;
  /** MUI's `lighten(main, 0.2)`. */
  light: string;
  /** MUI's `darken(main, 0.3)`. */
  dark: string;
  contrastText: string;
}

/** The drawing set `Icon` uses for a glyph name: Material Design Icons, or Eva outline. */
export type IconSetName = "material" | "eva";

/** MUI's `theme.palette`, resolved for the current scheme. */
export interface Palette {
  mode: "light" | "dark";
  primary: PaletteColor;
  secondary: PaletteColor;
  error: PaletteColor;
  warning: PaletteColor;
  info: PaletteColor;
  success: PaletteColor;
  /** A Solaris extension: MUI has no tertiary. */
  tertiary: PaletteColor;
  background: { default: string; paper: string };
  text: { primary: string; secondary: string; disabled: string };
  divider: string;
}

export interface Theme {
  colors: ThemeColorTokens;
  /** The same colours in MUI's shape: what code ported from an MUI app reads. */
  palette: Palette;
  typography: { [key in TypographyVariant]: TextStyle };
  /** MUI's spacing function: `spacing(2)` = 16. Fractions and negatives allowed. */
  spacing: (n: number) => number;
  shape: ThemeShapeTokens;
  /** Which icon set `Icon` draws with. */
  icons: IconSetName;
  isDark: boolean;
}

// Type-level only: emits no JavaScript and, being unexported, no declaration
// either. If a typography or shape token is added to or removed from
// theme.json, one of these stops being `true` and `npm run type-check` fails
// here instead of shipping a theme whose public type lies about its contents.
type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type AllTrue<T extends true[]> = T;
// The alias IS the assertion: tsc checks it where it is declared, so nothing
// needs to reference it afterwards.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _ThemeTokensInSync = AllTrue<
  [
    Exact<ThemeShapeTokens, typeof themeConfig.shape>,
    Exact<TypographyVariant, keyof typeof themeConfig.typography>,
  ]
>;

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

/** The organization's theme. Built once: every component memoises its styles on it. */
const DEFAULT_THEME = createTheme();

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME.dark,
  toggleTheme: () => {},
});

export const ThemeProvider = ({
  children,
  theme: schemes = DEFAULT_THEME,
}: {
  children: React.ReactNode;
  /**
   * Both schemes, from `createTheme()`. Defaults to the organization's theme.
   * Create it once, at module scope: a new object every render rebuilds
   * every component's styles.
   */
  theme?: ThemeSchemes;
}) => {
  const systemScheme = useColorScheme(); // Hook to listen to system changes
  // null = follow the OS color scheme; "light"/"dark" = manual override
  const [override, setOverride] = useState<"light" | "dark" | null>(null);
  const mode = override ?? systemScheme ?? "light";

  const toggleTheme = useCallback(() => {
    setOverride(mode === "light" ? "dark" : "light");
  }, [mode]);

  // Each scheme is one stable object, so the seventy-odd components that
  // memoise their StyleSheet on `theme` rebuild only when the scheme changes.
  const theme = mode === "dark" ? schemes.dark : schemes.light;

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;

/**
 * @param baseColor - The background of the component (e.g., colors.primary)
 * @param stateColor - The text/icon color (e.g., colors.onPrimary)
 * @param state - 'hover' | 'press' | 'focus'
 */
export const getStateColor = (
  baseColor: string,
  stateColor: string,
  state: "hover" | "press" | "focus",
) => {
  const opacities = {
    hover: 0.08,
    focus: 0.1,
    press: 0.12,
  };
  const weight = opacities[state] || 0;
  return mix(weight, stateColor, baseColor);
};

export const getGlowStyles = (
  theme: Theme,
  isActive: boolean,
  error?: string,
) => {
  if (!isActive && !error) {
    return {
      borderColor: theme.colors.outlineVariant,
      borderWidth: 1,
    };
  }

  const glowColor = error ? theme.colors.error : theme.colors.primary;

  return {
    borderColor: glowColor,
    borderWidth: 1.5,
    ...Platform.select({
      web: {
        boxShadow: `0 0 0 4px ${glowColor}33`,
        transition: "all 0.2s ease-in-out" as any,
      },
      ios: {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  };
};
