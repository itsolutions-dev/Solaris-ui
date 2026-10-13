import { PRESETS, parsePresetId } from "../site/themePresets";

const SCHEMES = ["light", "dark"] as const;
const spread = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return Math.max(r, g, b) - Math.min(r, g, b);
};

describe("theme presets", () => {
  it("offers Proposta A and B, A being the library default", () => {
    expect(Object.keys(PRESETS)).toEqual(["a", "b"]);
    expect(PRESETS.a.theme.light.colors.primary).toBe("#1D5B9D");
  });

  it("draws Material icons in A and Eva icons in B", () => {
    expect(PRESETS.a.theme.light.icons).toBe("material");
    expect(PRESETS.b.theme.light.icons).toBe("eva");
    expect(PRESETS.b.theme.dark.icons).toBe("eva");
  });

  it("B takes its roles from the siti sheet", () => {
    const { light, dark } = PRESETS.b.theme;
    expect(light.colors.primary).toBe("#171717");
    expect(dark.colors.primary).toBe("#EDEDED");
    expect(light.colors.primaryContainer).toBe("#EBEBEB");
    expect(dark.colors.primaryContainer).toBe("#1F1F1F");
    expect(light.colors.background).toBe("#FAFAFA");
    expect(dark.colors.background).toBe("#000000");
    expect(light.colors.secondary).toBe("#1D5B9C");
    expect(light.colors.tertiary).toBe("#62B241");
  });

  it("B has its status colours and radii", () => {
    SCHEMES.forEach((scheme) => {
      const { colors } = PRESETS.b.theme[scheme];
      expect([
        colors.info,
        colors.warning,
        colors.success,
        colors.error,
      ]).toEqual(["#0072F5", "#FFB224", "#45A557", "#E5484D"]);
    });
    const { shape } = PRESETS.b.theme.light;
    expect([shape.small, shape.medium, shape.large, shape.extraLarge]).toEqual([
      12, 12, 24, 24,
    ]);
    expect(shape.full).toBe(9999);
  });

  it("B has its type scale: -2% headings, sentence-case button", () => {
    const t = PRESETS.b.theme.light.typography;
    expect([t.h1.fontSize, t.h1.fontWeight, t.h1.lineHeight]).toEqual([
      56,
      "500",
      67,
    ]);
    expect(t.h1.letterSpacing).toBeCloseTo(-1.12, 5);
    expect([t.h5.fontSize, t.h5.fontWeight, t.h5.lineHeight]).toEqual([
      20,
      "600",
      28,
    ]);
    expect([
      t.button.fontSize,
      t.button.fontWeight,
      t.button.lineHeight,
    ]).toEqual([14, "500", 20]);
    expect(t.button.textTransform).toBe("none");
    expect(t.body1.letterSpacing).toBe(0);
  });

  it("B keeps its neutrals grey, not tinted by the primary", () => {
    SCHEMES.forEach((scheme) => {
      const { colors } = PRESETS.b.theme[scheme];
      [colors.surfaceContainer, colors.surfaceContainerHighest].forEach((hex) =>
        expect([scheme, hex, spread(hex) <= 2]).toEqual([scheme, hex, true]),
      );
    });
  });

  it("parsePresetId falls back to a", () => {
    expect(parsePresetId("b")).toBe("b");
    expect(parsePresetId("a")).toBe("a");
    ["c", undefined, 42, null, ""].forEach((raw) =>
      expect(parsePresetId(raw)).toBe("a"),
    );
  });
});
