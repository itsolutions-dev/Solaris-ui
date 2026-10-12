import { getContrast } from "polished";

import { createTheme, type ThemeColorTokens } from "../index";

const theme = createTheme();
const SCHEMES = ["light", "dark"] as const;
const COLORS = [
  "primary",
  "secondary",
  "error",
  "warning",
  "info",
  "success",
] as const;

const capitalize = (name: string) => name[0].toUpperCase() + name.slice(1);
const role = (colors: ThemeColorTokens, name: string) =>
  (colors as unknown as Record<string, string>)[name];

describe("createTheme", () => {
  it("uses the organization's primaries exactly", () => {
    expect(theme.light.colors.primary).toBe("#1D5B9D");
    expect(theme.dark.colors.primary).toBe("#5893D4");
    expect(theme.light.palette.primary.main).toBe("#1D5B9D");
    expect(theme.light.colors.secondary).toBe("#61B340");
  });

  it("keeps every colour and its container legible in both schemes", () => {
    SCHEMES.forEach((scheme) => {
      const colors = theme[scheme].colors;
      COLORS.forEach((name) => {
        [
          [name, `on${capitalize(name)}`],
          [`${name}Container`, `on${capitalize(name)}Container`],
        ].forEach(([bg, fg]) => {
          const ratio = getContrast(role(colors, bg), role(colors, fg));
          // A labelled tuple, so a failure names the scheme and the role.
          expect([scheme, bg, ratio >= 4.5]).toEqual([scheme, bg, true]);
        });
      });
    });
  });

  it("puts dark text on the brand green and white text on the brand blue", () => {
    expect(theme.light.colors.onSecondary).toBe("#000000");
    expect(theme.light.colors.onPrimary).toBe("#FFFFFF");
    expect(theme.dark.colors.onPrimary).toBe("#000000");
  });

  it("keeps every default it was not asked to change", () => {
    const custom = createTheme({
      colorSchemes: { light: { palette: { primary: { main: "#B00020" } } } },
    });
    expect(custom.light.colors.primary).toBe("#B00020");
    expect(custom.light.colors.secondary).toBe("#61B340");
    expect(custom.light.colors.background).toBe("#F0F2F5");
    expect(custom.light.colors.onSurfaceVariant).toBe("#64748B");
    expect(custom.dark.colors.primary).toBe("#5893D4");
  });

  it("honours an explicit contrastText, even a poor one", () => {
    const custom = createTheme({
      colorSchemes: {
        light: {
          palette: { primary: { main: "#1D5B9D", contrastText: "#99CCFF" } },
        },
      },
    });
    expect(custom.light.colors.onPrimary).toBe("#99CCFF");
    expect(custom.light.palette.primary.contrastText).toBe("#99CCFF");
  });

  it("derives light and dark the way MUI does", () => {
    // lighten(0.2) / darken(0.3), channels truncated, as @mui/system does.
    expect(theme.light.palette.primary.light).toBe("#4A7BB0");
    expect(theme.light.palette.primary.dark).toBe("#143F6D");
  });

  it("normalises any CSS colour and rejects garbage", () => {
    const short = createTheme({
      colorSchemes: { light: { palette: { primary: { main: "#06c" } } } },
    });
    expect(short.light.colors.primary).toBe("#0066CC");
    expect(short.light.colors.primaryContainer).toMatch(/^#[0-9A-F]{6}$/);
    const named = createTheme({
      colorSchemes: { light: { palette: { error: { main: "red" } } } },
    });
    expect(named.light.colors.error).toBe("#FF0000");
    expect(() =>
      createTheme({
        colorSchemes: { light: { palette: { primary: { main: "blu" } } } },
      }),
    ).toThrow();
  });

  it("maps the MUI read shape onto the roles", () => {
    const { palette, colors } = theme.light;
    expect(palette.mode).toBe("light");
    expect(theme.dark.palette.mode).toBe("dark");
    expect(palette.background).toEqual({
      default: "#F0F2F5",
      paper: "#FFFFFF",
    });
    expect(colors.surface).toBe("#FFFFFF");
    expect(palette.text.secondary).toBe("#64748B");
    expect(palette.divider).toBe("rgba(0, 0, 0, 0.12)");
    expect(colors.outlineVariant).toBe("rgba(0, 0, 0, 0.12)");
    expect(palette.warning.main).toBe("#ED6C02");
    expect(colors.warningContainer).toMatch(/^#[0-9A-F]{6}$/);
  });

  it("accepts MUI's rgba text colours", () => {
    const custom = createTheme({
      colorSchemes: {
        light: { palette: { text: { primary: "rgba(0, 0, 0, 0.87)" } } },
      },
    });
    expect(custom.light.colors.onSurface).toBe("rgba(0, 0, 0, 0.87)");
    expect(custom.light.palette.text.disabled).toBe("rgba(0,0,0,0.38)");
  });

  it("puts one font family on every type step", () => {
    const custom = createTheme({ typography: { fontFamily: "Roboto" } });
    Object.values(custom.light.typography).forEach((style) =>
      expect(style.fontFamily).toBe("Roboto"),
    );
    const families = new Set(
      Object.values(theme.light.typography).map((style) => style.fontFamily),
    );
    expect(families.size).toBe(1);
    // The documented iOS-only opt-in passes undefined elsewhere: the default stays.
    const unset = createTheme({ typography: { fontFamily: undefined } });
    expect(unset.light.typography.bodyLarge.fontFamily).toBe(
      theme.light.typography.bodyLarge.fontFamily,
    );
  });

  it("keeps a grey or black colour's containers and surfaces grey", () => {
    // A grey has no hue: LCh reports floating-point noise, which at full
    // chroma painted MUI's grey a mint container and black a pink one.
    const spread = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
      return Math.max(r, g, b) - Math.min(r, g, b);
    };
    const grey = createTheme({
      colorSchemes: {
        light: {
          palette: {
            primary: { main: "#212121" },
            secondary: { main: "#9E9E9E" },
          },
        },
        dark: { palette: { primary: { main: "#000000" } } },
      },
    });
    const { light, dark } = grey;
    [
      light.colors.secondaryContainer,
      light.colors.primaryContainer,
      light.colors.surfaceContainerHighest,
      light.colors.tertiaryContainer,
      light.colors.inversePrimary,
      dark.colors.primaryContainer,
      dark.colors.surfaceContainer,
    ].forEach((hex) => expect([hex, spread(hex) <= 2]).toEqual([hex, true]));
    // A real colour keeps its tonal palette.
    expect(spread(theme.light.colors.primaryContainer)).toBeGreaterThan(20);
  });

  it("rejects a typo in any colour, not only in main", () => {
    const bad = (palette: object) => () =>
      createTheme({ colorSchemes: { light: { palette } } });
    expect(
      bad({ primary: { main: "#1D5B9D", contrastText: "whitee" } }),
    ).toThrow();
    expect(bad({ background: { paper: "#FFFFFG" } })).toThrow();
    expect(bad({ text: { secondary: "gray-ish" } })).toThrow();
    expect(bad({ divider: "rgba(0,0,0" })).toThrow();
    // Valid CSS colours, rgba included, pass through as given.
    const ok = createTheme({
      colorSchemes: {
        light: {
          palette: {
            divider: "rgba(0, 0, 0, 0.2)",
            text: { secondary: "slategray" },
          },
        },
      },
    });
    expect(ok.light.colors.outlineVariant).toBe("rgba(0, 0, 0, 0.2)");
    expect(ok.light.colors.onSurfaceVariant).toBe("slategray");
  });

  it("rounds dialogs and sheets at 24 and buttons fully", () => {
    expect(theme.light.shape.extraLarge).toBe(24);
    expect(theme.light.shape.full).toBe(9999);
  });
});
