import React, { useEffect } from "react";
import { act, render } from "@testing-library/react-native";
import { ThemeProvider, useTheme } from "@its/solaris-ui";

import { SolarisLogo } from "../site/SolarisLogo";

/** Renders nothing: it only hands the test the provider's scheme switch. */
const Capture = ({ onReady }: { onReady: (toggle: () => void) => void }) => {
  const { toggleTheme } = useTheme();
  useEffect(() => onReady(toggleTheme), [onReady, toggleTheme]);
  return null;
};

const renderLogo = (
  height?: number,
  onReady: (toggle: () => void) => void = () => {},
) =>
  render(
    <ThemeProvider>
      <Capture onReady={onReady} />
      <SolarisLogo height={height} />
    </ThemeProvider>,
  );

describe("SolarisLogo", () => {
  it("is labelled for assistive tech and keeps the designers' aspect ratio", async () => {
    const { getByLabelText, toJSON } = await renderLogo(32);
    expect(getByLabelText("Solaris")).toBeTruthy();
    const json = JSON.stringify(toJSON());
    expect(json).toContain('"height":32');
    // 32 * 755 / 224
    expect(json).toContain('"width":107.857');
  });

  it("is inked differently on the light and the dark theme", async () => {
    let toggle = () => {};
    const { toJSON } = await renderLogo(undefined, (fn) => {
      toggle = fn;
    });
    const light = JSON.stringify(toJSON());

    await act(async () => toggle());
    const dark = JSON.stringify(toJSON());

    expect(dark).not.toBe(light);
  });
});
