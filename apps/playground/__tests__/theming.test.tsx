import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";

import Theming from "../app/theming";
import { PresetProvider } from "../site/ThemePresetContext";

// The page sets <head> tags through expo-router, which this test does not mount.
jest.mock("expo-router/head", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("expo-clipboard", () => ({ setStringAsync: jest.fn() }));
jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual(
    "@react-native-async-storage/async-storage/jest/async-storage-mock",
  ),
);

const PRESET_KEY = "solaris.site.preset";

const renderPage = () =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 1280, height: 900 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <PresetProvider>
        <Theming />
      </PresetProvider>
    </SafeAreaProvider>,
  );

/** Lets the stored preset (async on every platform) land. */
const hydrated = () => act(async () => {});

beforeEach(async () => {
  await AsyncStorage.clear();
});

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
    expect(getAllByText("#F0F2F5").length).toBeGreaterThan(0);

    await fireEvent.press(getByText("Switch scheme"));

    expect(getByText("dark")).toBeTruthy();
    expect(getAllByText("#5893D4").length).toBeGreaterThan(0);
    // #1D5B9D is still on the page: it is the dark scheme's inversePrimary.
    // The light page background is not.
    expect(queryAllByText("#F0F2F5")).toHaveLength(0);
  });

  it("switches the whole theme between Proposta A and B", async () => {
    const { getByText, getAllByText, queryAllByText } = await renderPage();
    await hydrated();

    await fireEvent.press(getByText("Proposta B"));
    expect(getAllByText("#171717").length).toBeGreaterThan(0);
    expect(queryAllByText("#1D5B9D")).toHaveLength(0);
    expect(await AsyncStorage.getItem(PRESET_KEY)).toBe('"b"');

    await fireEvent.press(getByText("Proposta A"));
    expect(getAllByText("#1D5B9D").length).toBeGreaterThan(0);
    expect(queryAllByText("#171717")).toHaveLength(0);
  });

  it("keeps the preset when the scheme toggles", async () => {
    const { getByText, getAllByText } = await renderPage();
    await hydrated();

    await fireEvent.press(getByText("Proposta B"));
    await fireEvent.press(getByText("Switch scheme"));

    expect(getByText("dark")).toBeTruthy();
    expect(getAllByText("#EDEDED").length).toBeGreaterThan(0);
  });

  it("restores a stored preset", async () => {
    await AsyncStorage.setItem(PRESET_KEY, JSON.stringify("b"));
    const { getAllByText } = await renderPage();
    await waitFor(() =>
      expect(getAllByText("#171717").length).toBeGreaterThan(0),
    );
  });

  it("falls back to Proposta A for a stored id this build does not know", async () => {
    await AsyncStorage.setItem(PRESET_KEY, JSON.stringify("c"));
    const { getAllByText, queryAllByText } = await renderPage();
    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalled());
    await hydrated();

    expect(getAllByText("#1D5B9D").length).toBeGreaterThan(0);
    expect(queryAllByText("#171717")).toHaveLength(0);
  });
});
