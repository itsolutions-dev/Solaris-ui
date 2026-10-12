import { createTheme } from "../index";
import { resolveColor } from "../components/Layout/tokens";

const theme = createTheme().light;

describe("resolveColor", () => {
  it("reads a dotted path into the MUI palette", () => {
    expect(resolveColor(theme, "text.secondary")).toBe("#64748B");
    expect(resolveColor(theme, "primary.main")).toBe("#1D5B9D");
    expect(resolveColor(theme, "background.paper")).toBe("#FFFFFF");
  });

  it("reads a palette colour name as its main", () => {
    expect(resolveColor(theme, "primary")).toBe("#1D5B9D");
    expect(resolveColor(theme, "secondary")).toBe("#61B340");
  });

  it("reads a palette leaf that is itself a colour", () => {
    expect(resolveColor(theme, "divider")).toBe("rgba(0, 0, 0, 0.12)");
  });

  it("still reads a Material 3 role", () => {
    expect(resolveColor(theme, "primaryContainer")).toBe(
      theme.colors.primaryContainer,
    );
  });

  it("passes a raw colour through, even one with dots in it", () => {
    expect(resolveColor(theme, "#123456")).toBe("#123456");
    expect(resolveColor(theme, "rgba(0, 0, 0, 0.5)")).toBe(
      "rgba(0, 0, 0, 0.5)",
    );
    expect(resolveColor(theme, undefined)).toBeUndefined();
  });

  it("treats an empty string as no colour", () => {
    expect(resolveColor(theme, "")).toBeUndefined();
  });
});
