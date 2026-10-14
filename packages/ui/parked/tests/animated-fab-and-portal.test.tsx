// Parked with their components (roadmap v2, 2026-10-14). Not run, not maintained.
import React from "react";
import { Text, View } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  AnimatedFAB,
  Autocomplete,
  Portal,
  ThemeProvider,
  Tooltip,
} from "../index";

// SafeAreaProvider is part of the kit's provider contract — FAB, AnimatedFAB,
// AppBar and SpeedDial all read insets and throw without it, same as in App.tsx.
const Providers = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider
    initialMetrics={{
      frame: { x: 0, y: 0, width: 390, height: 844 },
      insets: { top: 47, left: 0, right: 0, bottom: 34 },
    }}
  >
    <ThemeProvider>{children}</ThemeProvider>
  </SafeAreaProvider>
);

const HostedProviders = ({ children }: { children: React.ReactNode }) => (
  <Providers>
    <Portal.Host>{children}</Portal.Host>
  </Providers>
);

const wrap = (ui: React.ReactElement) => render(<Providers>{ui}</Providers>);

const wrapHosted = (ui: React.ReactElement) =>
  render(<HostedProviders>{ui}</HostedProviders>);

describe("AnimatedFAB", () => {
  it("renders the label and fires onPress", async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await wrap(
      <AnimatedFAB icon="plus" label="New ticket" onPress={onPress} />,
    );

    const fab = getByLabelText("New ticket");
    await fireEvent.press(fab);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("reports its expanded state for assistive tech", async () => {
    const { getByLabelText, rerender } = await wrapHosted(
      // duration={0} lets the collapse settle inside the test instead of
      // updating Animated after teardown.
      <AnimatedFAB
        icon="plus"
        label="Add"
        onPress={() => {}}
        extended
        duration={0}
      />,
    );
    expect(getByLabelText("Add").props.accessibilityState).toMatchObject({
      expanded: true,
    });

    await rerender(
      <HostedProviders>
        <AnimatedFAB
          icon="plus"
          label="Add"
          onPress={() => {}}
          extended={false}
          duration={0}
        />
      </HostedProviders>,
    );
    // waitFor runs inside act, which lets the collapse animation the rerender
    // kicked off settle instead of updating after the test body.
    await waitFor(() =>
      expect(getByLabelText("Add").props.accessibilityState).toMatchObject({
        expanded: false,
      }),
    );
  });

  it("does not fire onPress while disabled", async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await wrap(
      <AnimatedFAB icon="plus" label="Disabled" onPress={onPress} disabled />,
    );

    await fireEvent.press(getByLabelText("Disabled"));
    expect(onPress).not.toHaveBeenCalled();
  });
});

