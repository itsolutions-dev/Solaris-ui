import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Button, ThemeProvider } from "../index";

const wrap = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe("Button busy", () => {
  it("blocks presses and reports busy while keeping its label", async () => {
    const onPress = jest.fn();
    const { getByRole, getByText } = await wrap(
      <Button busy onPress={onPress}>
        Send
      </Button>,
    );

    // `loading` swaps the label for a spinner; `busy` must not.
    expect(getByText("Send")).toBeTruthy();
    const button = getByRole("button");
    expect(button.props.accessibilityState).toMatchObject({ busy: true });
    // Busy is not disabled: it must stay in the tab order and read as working.
    expect(button.props.accessibilityState.disabled).toBe(false);

    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
