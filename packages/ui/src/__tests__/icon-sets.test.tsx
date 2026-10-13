import React from "react";
import { render } from "@testing-library/react-native";

import { createTheme, Icon, ThemeProvider } from "../index";
import {
  EVA_GLYPHS,
  EVA_LICENSE,
} from "../components/icons/evaGlyphs.generated";
import iconMap from "../components/icons/iconMap.json";

const MDI_TO_EVA = iconMap as Record<string, string>;
const eva = createTheme({ icons: "eva" });
const material = createTheme();

const tree = async (ui: React.ReactElement, theme = material) => {
  const { toJSON } = await render(
    <ThemeProvider theme={theme}>{ui}</ThemeProvider>,
  );
  return JSON.stringify(toJSON());
};

/** The twenty-four glyphs of the design sheet, by their Material Design Icons names. */
const SHEET = [
  "phone",
  "email",
  "calendar",
  "account",
  "account-group",
  "bell",
  "magnify",
  "filter-variant",
  "chart-line",
  "cog",
  "menu",
  "plus",
  "close",
  "check",
  "chevron-right",
  "pencil",
  "delete",
  "download",
  "upload",
  "message",
  "clock",
  "map-marker",
  "star",
  "home",
];

describe("icon sets", () => {
  const closePath = EVA_GLYPHS[MDI_TO_EVA.close][0];

  it("draws Material Design Icons under the default theme", async () => {
    expect(await tree(<Icon>close</Icon>)).not.toContain(closePath);
  });

  it("draws Eva under the eva theme, tinted and sized like any icon", async () => {
    const json = await tree(
      <Icon fontSize={30} color="primary">
        close
      </Icon>,
      eva,
    );
    expect(json).toContain(closePath);
    // react-native-svg turns the colour into a number, so compare two tints.
    const other = await tree(
      <Icon fontSize={30} color="error">
        close
      </Icon>,
      eva,
    );
    expect(other).toContain(closePath);
    expect(other).not.toBe(json);
    expect(json).toContain('"width":30');
  });

  it("falls back to Material and warns once for a glyph Eva does not have", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const json = await tree(
        <>
          <Icon>ab-testing</Icon>
          <Icon>ab-testing</Icon>
        </>,
        eva,
      );
      expect(json).not.toBe("null");
      const ours = warn.mock.calls.filter((call) =>
        /no Eva glyph for "ab-testing"/.test(String(call[0])),
      );
      expect(ours).toHaveLength(1);
    } finally {
      warn.mockRestore();
    }
  });

  it("warns when a glyph name is passed as source instead of as children", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    try {
      await tree(<Icon source={"close" as never} />);
      expect(
        warn.mock.calls.some((call) =>
          /pass the glyph as children/.test(String(call[0])),
        ),
      ).toBe(true);
    } finally {
      warn.mockRestore();
    }
  });

  it("maps every glyph of the sheet to a drawing", () => {
    SHEET.forEach((name) => {
      const evaName = MDI_TO_EVA[name];
      expect([name, typeof evaName]).toEqual([name, "string"]);
      expect([name, (EVA_GLYPHS[evaName] ?? []).length > 0]).toEqual([
        name,
        true,
      ]);
    });
  });

  it("draws a filled star and an outlined one differently under eva", async () => {
    expect(MDI_TO_EVA.star).not.toBe(MDI_TO_EVA["star-outline"]);
    expect(EVA_GLYPHS[MDI_TO_EVA.star][0]).not.toBe(
      EVA_GLYPHS[MDI_TO_EVA["star-outline"]][0],
    );
  });
});

describe("icon colour and licence", () => {
  it("lets a colour in style win over the color prop, as on a vector-icons glyph", async () => {
    const both = await tree(
      <Icon color="primary" style={{ color: "#123456" }}>
        close
      </Icon>,
      eva,
    );
    const styleOnly = await tree(
      <Icon style={{ color: "#123456" }}>close</Icon>,
      eva,
    );
    expect(both).toBe(styleOnly);
  });

  it("ships Eva's MIT permission notice with the drawings", () => {
    expect(EVA_LICENSE).toMatch(/akveo/i);
    expect(EVA_LICENSE).toContain("Permission is hereby granted");
  });
});
