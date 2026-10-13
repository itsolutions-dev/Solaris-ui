import { getContrast } from "polished";
import themeSheet from "../../../../docs/design/solaris-themes.json";

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
    expect(theme.light.colors.secondary).toBe("#556579");
    expect(theme.light.colors.tertiary).toBe("#61B340");
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
    expect(theme.light.colors.onTertiary).toBe("#1A1A1A");
    expect(theme.light.colors.onPrimary).toBe("#FFFFFF");
    expect(theme.dark.colors.onPrimary).toBe("#0A2540");
  });

  it("keeps every default it was not asked to change", () => {
    const custom = createTheme({
      colorSchemes: { light: { palette: { primary: { main: "#B00020" } } } },
    });
    expect(custom.light.colors.primary).toBe("#B00020");
    expect(custom.light.colors.secondary).toBe("#556579");
    expect(custom.light.colors.background).toBe("#F0F2F5");
    expect(custom.light.colors.onSurfaceVariant).toBe("#556579");
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
    expect(palette.text.secondary).toBe("#556579");
    expect(palette.divider).toBe("#DDE1E7");
    expect(colors.outlineVariant).toBe("#DDE1E7");
    expect(palette.warning.main).toBe("#A94E08");
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
    expect(unset.light.typography.body1.fontFamily).toBe(
      theme.light.typography.body1.fontFamily,
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
      light.colors.inversePrimary,
      dark.colors.primaryContainer,
      dark.colors.surfaceContainer,
    ].forEach((hex) => expect([hex, spread(hex) <= 2]).toEqual([hex, true]));
    // The brand green is explicit in the default theme, so a grey primary leaves it.
    expect(light.colors.tertiary).toBe("#61B340");
    // A real colour keeps its tonal palette.
    expect(spread(theme.light.colors.primaryContainer)).toBeGreaterThan(10);
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

  it("carries Proposta A's type scale", () => {
    const t = theme.light.typography;
    expect(Object.keys(t).sort()).toEqual([
      "body1",
      "body2",
      "button",
      "caption",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "overline",
      "subtitle1",
      "subtitle2",
    ]);
    const step = (v: keyof typeof t) => [
      t[v].fontSize,
      t[v].fontWeight,
      t[v].lineHeight,
    ];
    expect(step("h4")).toEqual([32, "700", 40]);
    expect(step("h5")).toEqual([24, "700", 32]);
    expect(step("h6")).toEqual([22, "500", 28]);
    expect(step("subtitle1")).toEqual([16, "500", 24]);
    expect(step("subtitle2")).toEqual([14, "500", 20]);
    expect(step("body1")).toEqual([16, "400", 24]);
    expect(step("body2")).toEqual([14, "400", 20]);
    expect(step("button")).toEqual([14, "500", 20]);
    expect(t.button.textTransform).toBe("none");
    expect(step("caption")).toEqual([12, "400", 16]);
    expect(step("overline")).toEqual([11, "500", 16]);
    expect(t.overline.textTransform).toBe("uppercase");
  });

  it("spaces by MUI's 8-point function, fractions and negatives included", () => {
    const { spacing } = theme.light;
    expect(spacing(2)).toBe(16);
    expect(spacing(0.5)).toBe(4);
    expect(spacing(1.5)).toBe(12);
    expect(spacing(-1)).toBe(-8);
  });

  it("carries MUI's base corner radius beside the named ones", () => {
    expect(theme.light.shape.borderRadius).toBe(4);
    expect(theme.light.shape.large).toBe(16);
  });

  it("rounds dialogs and sheets at 24 and buttons fully", () => {
    expect(theme.light.shape.extraLarge).toBe(24);
    expect(theme.light.shape.full).toBe(9999);
  });
});

describe("createTheme options for a full theme (proposals A/B)", () => {
  const spread = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return Math.max(r, g, b) - Math.min(r, g, b);
  };

  it("overrides single type steps and keeps the rest", () => {
    const t = createTheme({ typography: { h4: { fontSize: 24 } } }).light
      .typography;
    expect(t.h4.fontSize).toBe(24);
    expect(t.h4.fontWeight).toBe(theme.light.typography.h4.fontWeight);
    expect(t.h4.lineHeight).toBe(theme.light.typography.h4.lineHeight);
    expect(t.h4.fontFamily).toBe(theme.light.typography.h4.fontFamily);
    expect(t.h5).toEqual(theme.light.typography.h5);
  });

  it("takes shape radii", () => {
    const { shape } = createTheme({ shape: { large: 20 } }).light;
    expect(shape.large).toBe(20);
    expect(shape.small).toBe(8);
  });

  it("derives tertiary from a given colour and exposes it on the palette", () => {
    const given = createTheme({
      colorSchemes: {
        light: { palette: { tertiary: { main: "#61B340" } } },
      },
    }).light;
    expect(given.colors.tertiary).toBe("#61B340");
    expect(given.palette.tertiary.main).toBe("#61B340");
    expect(theme.light.palette.tertiary.main).toBe(theme.light.colors.tertiary);
  });

  it("applies exact role overrides after derivation", () => {
    const custom = createTheme({
      colorSchemes: { light: { colors: { primaryContainer: "#E8F0FA" } } },
    }).light;
    expect(custom.colors.primaryContainer).toBe("#E8F0FA");
    expect(custom.colors.onPrimary).toBe(theme.light.colors.onPrimary);
  });

  it("keeps palette and colors in agreement after overrides", () => {
    const custom = createTheme({
      colorSchemes: {
        light: {
          colors: {
            onSurfaceVariant: "#112233",
            outlineVariant: "#445566",
            surface: "#778899",
            primary: "#AA0000",
          },
        },
      },
    }).light;
    expect(custom.palette.text.secondary).toBe("#112233");
    expect(custom.palette.divider).toBe("#445566");
    expect(custom.palette.background.paper).toBe("#778899");
    expect(custom.palette.primary.main).toBe("#AA0000");
  });

  it("rejects a bad role override", () => {
    expect(() =>
      createTheme({
        colorSchemes: { light: { colors: { primaryContainer: "nope" } } },
      }),
    ).toThrow();
  });

  it("keeps a black/white brand grey with partial overrides", () => {
    const bw = createTheme({
      colorSchemes: {
        light: { palette: { primary: { main: "#171717" } } },
        dark: { palette: { primary: { main: "#EDEDED" } } },
      },
    });
    SCHEMES.forEach((scheme) => {
      const { colors } = bw[scheme];
      [colors.primaryContainer, colors.surfaceContainerHighest].forEach((hex) =>
        expect([scheme, hex, spread(hex) <= 2]).toEqual([scheme, hex, true]),
      );
    });
  });

  it("carries an icon-set name", () => {
    expect(theme.light.icons).toBe("material");
    expect(createTheme({ icons: "eva" }).dark.icons).toBe("eva");
  });
});

describe("Proposta A (the default theme)", () => {
  const themes = themeSheet as {
    id: string;
    light: Record<string, string>;
    dark: Record<string, string>;
  }[];
  const crm = themes.find((t) => t.id === "crm")!;

  it("matches the crm entry of docs/design/solaris-themes.json", () => {
    SCHEMES.forEach((scheme) => {
      Object.entries(crm[scheme]).forEach(([key, hex]) => {
        const actual = role(theme[scheme].colors, key);
        expect([scheme, key, actual]).toEqual([scheme, key, hex]);
      });
    });
  });

  it("takes its status colours from the sheet", () => {
    const status = (scheme: "light" | "dark") =>
      ["error", "success", "warning", "info"].map((k) =>
        role(theme[scheme].colors, k),
      );
    expect(status("light")).toEqual([
      "#B00020",
      "#2F7A1B",
      "#A94E08",
      "#0A6C94",
    ]);
    expect(status("dark")).toEqual([
      "#F2B8B5",
      "#61B340",
      "#FCA600",
      "#7CC4E6",
    ]);
  });

  it("lets an app's own colour replace the default's whole family", () => {
    const custom = createTheme({
      colorSchemes: { light: { palette: { primary: { main: "#B00020" } } } },
    }).light.colors;
    expect(custom.primary).toBe("#B00020");
    // Not the default's blue-tinted container, nor its blue-tinted inversePrimary.
    expect(custom.primaryContainer).not.toBe("#E8F0FA");
    expect(custom.onPrimaryContainer).not.toBe("#1D5B9D");
    expect(custom.surfaceTint).toBe("#B00020");
    expect(custom.secondary).toBe("#556579");
  });
});

describe("role overrides that are not colours", () => {
  it("takes boxShadow, which is a CSS shadow and not a colour", () => {
    const shadow = "0px 2px 4px rgba(0, 0, 0, 0.3)";
    const custom = createTheme({
      colorSchemes: { light: { colors: { boxShadow: shadow } } },
    });
    expect(custom.light.colors.boxShadow).toBe(shadow);
  });

  it("accepts a whole scheme's roles spread back in", () => {
    expect(() =>
      createTheme({ colorSchemes: { light: { colors: theme.light.colors } } }),
    ).not.toThrow();
  });
});
