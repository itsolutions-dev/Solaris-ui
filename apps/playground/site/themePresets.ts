import { Platform, type TextStyle } from "react-native";
import { createTheme, type ThemeSchemes } from "@its/solaris-ui";

import sheet from "../../../docs/design/solaris-themes.json";

export type PresetId = "a" | "b";

/** The `siti` entry of the designers' sheet: exact Material 3 roles per scheme. */
const siti = sheet.find((theme) => theme.id === "siti")!;

const main = (hex: string) => ({ main: hex });

/** Status colours are the same in both schemes: the sheet's "700" accents. */
const status = {
  error: main("#E5484D"),
  warning: main("#FFB224"),
  info: main("#0072F5"),
  success: main("#45A557"),
};

/** Headings of the sites' scale, app-sized, with the sheet's -2% tracking. */
const heading = (
  fontSize: number,
  fontWeight: TextStyle["fontWeight"],
  lineHeight: number,
): TextStyle => ({
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing: -0.02 * fontSize,
});

/**
 * Proposta B: the Databeasy / InXpire sites. Colours are the sheet's, taken
 * from the JSON itself so they cannot drift; type is Geist on the web (loaded
 * in `app/+html.tsx`), the system font elsewhere; radii 12 / 24 / pill.
 */
const proposalB = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: main("#171717"),
        secondary: main("#1D5B9C"),
        tertiary: main("#62B241"),
        ...status,
        background: { default: "#FAFAFA", paper: "#FFFFFF" },
        text: { primary: "#171717", secondary: "#666666" },
        divider: "#EBEBEB",
      },
      colors: siti.light,
    },
    dark: {
      palette: {
        primary: main("#EDEDED"),
        secondary: main("#1D5B9C"),
        tertiary: main("#62B241"),
        ...status,
        background: { default: "#000000", paper: "#0A0A0A" },
        text: { primary: "#EDEDED", secondary: "#A1A1A1" },
        divider: "#2E2E2E",
      },
      colors: siti.dark,
    },
  },
  shape: { small: 12, medium: 12, large: 24, extraLarge: 24 },
  icons: "eva",
  typography: {
    // Native keeps the platform default: Geist is not embedded.
    fontFamily:
      Platform.OS === "web" ? "Geist, system-ui, sans-serif" : undefined,
    // The sheet's H1 and H2 are presentation sizes; h3 and h4 are inferred.
    h1: heading(56, "500", 67),
    h2: heading(40, "500", 48),
    h3: heading(32, "600", 40),
    h4: heading(24, "600", 32),
    h5: heading(20, "600", 28),
    h6: heading(18, "600", 24),
    subtitle1: { fontSize: 16, fontWeight: "500", lineHeight: 24 },
    subtitle2: { fontSize: 14, fontWeight: "500", lineHeight: 20 },
    body1: { fontSize: 16, fontWeight: "400", lineHeight: 24 },
    body2: { fontSize: 14, fontWeight: "400", lineHeight: 20 },
    button: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
      textTransform: "none",
    },
    caption: { fontSize: 12, fontWeight: "400", lineHeight: 16 },
    overline: {
      fontSize: 11,
      fontWeight: "500",
      lineHeight: 16,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
  },
});

/** Built once: every component memoises its styles on the theme object. */
export const PRESETS: Record<PresetId, { label: string; theme: ThemeSchemes }> =
  {
    a: { label: "Proposta A", theme: createTheme() },
    b: { label: "Proposta B", theme: proposalB },
  };

/** A stored id this build does not know (or none) is Proposta A. */
export const parsePresetId = (raw: unknown): PresetId =>
  raw === "b" ? "b" : "a";
