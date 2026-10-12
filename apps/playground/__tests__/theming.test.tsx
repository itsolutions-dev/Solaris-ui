import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@its/solaris-ui";

import Theming from "../app/theming";

// The page sets <head> tags through expo-router, which this test does not mount.
jest.mock("expo-router/head", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("expo-clipboard", () => ({ setStringAsync: jest.fn() }));

const renderPage = () =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 1280, height: 900 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <ThemeProvider>
        <Theming />
      </ThemeProvider>
    </SafeAreaProvider>,
  );

describe("theming page", () => {
  it("renders a gallery of real components", async () => {
    const { getByText } = await renderPage();
    expect(getByText("Components in this theme")).toBeTruthy();
    expect(getByText("Banners follow the theme too.")).toBeTruthy();
  });

  it("re-renders everything from the dark roles when the scheme switches", async () => {
    const { getByText, getAllByText, queryAllByText } = await renderPage();
    expect(getByText("light")).toBeTruthy();
    expect(getAllByText("#1D5B9D").length).toBeGreaterThan(0);

    await fireEvent.press(getByText("Switch scheme"));

    expect(getByText("dark")).toBeTruthy();
    expect(getAllByText("#5893D4").length).toBeGreaterThan(0);
    expect(queryAllByText("#1D5B9D")).toHaveLength(0);
  });
});
