// Parked with their components (roadmap v2, 2026-10-14). Not run, not maintained.
import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";
import {
  Banner,
  Button,
  Card,
  Chip,
  ConfirmDialog,
  createTheme,
  HelperText,
  Icon,
  Input,
  ListItem,
  ListSection,
  Modal,
  Portal,
  Snackbar,
  ThemeProvider,
  ToggleButtonGroup,
  TouchableRipple,
  useTheme,
} from "../index";

const wrap = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe("ToggleButtonGroup", () => {
  const options = [
    { label: "Giorno", value: "day" },
    { label: "Settimana", value: "week" },
    { label: "Mese", value: "month", disabled: true },
  ];

  it("announces a single-select group as a radio group", async () => {
    const { getByLabelText } = await wrap(
      <ToggleButtonGroup
        options={options}
        value="day"
        onValueChange={() => {}}
        accessibilityLabel="Periodo"
      />,
    );

    expect(getByLabelText("Periodo").props.accessibilityRole).toBe(
      "radiogroup",
    );
  });

  it("marks the selected segment and the disabled option", async () => {
    const { getByLabelText } = await wrap(
      <ToggleButtonGroup
        options={options}
        value="week"
        onValueChange={() => {}}
      />,
    );

    expect(getByLabelText("Settimana").props.accessibilityState).toMatchObject({
      selected: true,
    });
    expect(getByLabelText("Mese").props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  it("does not report a press on a disabled segment", async () => {
    const onValueChange = jest.fn();
    const { getByLabelText } = await wrap(
      <ToggleButtonGroup
        options={options}
        value="day"
        onValueChange={onValueChange}
      />,
    );

    await fireEvent.press(getByLabelText("Mese"));
    expect(onValueChange).not.toHaveBeenCalled();

    await fireEvent.press(getByLabelText("Settimana"));
    expect(onValueChange).toHaveBeenCalledWith("week");
  });
});

