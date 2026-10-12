import React from "react";
import { StyleSheet, type TextStyle } from "react-native";
import { render } from "@testing-library/react-native";

import { createTheme, ThemeProvider, Typography } from "../index";

const theme = createTheme().light;
const flat = (node: { props: { style?: unknown } }) =>
  StyleSheet.flatten(node.props.style as TextStyle);

const renderText = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe("Typography", () => {
  it("defaults to body1 in the primary text colour", async () => {
    const { getByText } = await renderText(<Typography>Hi</Typography>);
    const style = flat(getByText("Hi"));
    expect(style.fontSize).toBe(16);
    expect(style.color).toBe(theme.palette.text.primary);
  });

  it("takes a palette path as its colour", async () => {
    const { getByText } = await renderText(
      <Typography color="text.secondary">Muted</Typography>,
    );
    expect(flat(getByText("Muted")).color).toBe("#64748B");
  });

  it("sets button text in uppercase", async () => {
    const { getByText } = await renderText(
      <Typography variant="button">Save</Typography>,
    );
    expect(flat(getByText("Save")).textTransform).toBe("uppercase");
  });

  it("aligns, adds a bottom gutter and truncates on noWrap", async () => {
    const { getByText } = await renderText(
      <Typography align="center" gutterBottom noWrap>
        Long
      </Typography>,
    );
    const node = getByText("Long");
    const style = flat(node);
    expect(style.textAlign).toBe("center");
    expect(style.marginBottom).toBeCloseTo(0.35 * 16);
    expect(node.props.numberOfLines).toBe(1);
    expect(node.props.ellipsizeMode).toBe("tail");
  });

  it("keeps the caller's numberOfLines when noWrap is off", async () => {
    const { getByText } = await renderText(
      <Typography numberOfLines={3}>Para</Typography>,
    );
    expect(getByText("Para").props.numberOfLines).toBe(3);
  });

  it("falls back to the primary text colour when the colour is cleared", async () => {
    const { getByText } = await renderText(
      <Typography color="">Cleared</Typography>,
    );
    expect(flat(getByText("Cleared")).color).toBe(theme.palette.text.primary);
  });

  it("lets style override the colour", async () => {
    const { getByText } = await renderText(
      <Typography color="primary" style={{ color: "#010203" }}>
        Override
      </Typography>,
    );
    expect(flat(getByText("Override")).color).toBe("#010203");
  });
});
