import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";
import {
  Button,
  Card,
  ConfirmDialog,
  createTheme,
  HelperText,
  Icon,
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

describe("Icon", () => {
  const glyphOf = (node: { props: { children?: unknown } }) =>
    String(node.props.children);

  it("renders the glyph named by its children", async () => {
    const { getByTestId } = await wrap(
      <>
        <Icon testID="plus">plus</Icon>
        <Icon testID="minus">minus</Icon>
      </>,
    );
    expect(glyphOf(getByTestId("plus"))).not.toBe("");
    expect(glyphOf(getByTestId("plus"))).not.toBe(
      glyphOf(getByTestId("minus")),
    );
  });

  it("sizes by MUI's fontSize names and colours by palette name", async () => {
    const palette = createTheme().light.palette;
    const { getByTestId } = await wrap(
      <>
        <Icon testID="small" fontSize="small" color="primary">
          plus
        </Icon>
        <Icon testID="large" fontSize="large">
          plus
        </Icon>
        <Icon testID="raw" fontSize={18}>
          plus
        </Icon>
      </>,
    );
    const style = (id: string) =>
      StyleSheet.flatten(
        getByTestId(id).props.style as ViewStyle & {
          fontSize?: number;
          color?: string;
        },
      );
    expect(style("small").fontSize).toBe(20);
    expect(style("small").color).toBe(palette.primary.main);
    expect(style("large").fontSize).toBe(35);
    expect(style("raw").fontSize).toBe(18);
  });

  it("renders an unknown glyph name without throwing", async () => {
    const { toJSON } = await wrap(<Icon>not-a-glyph</Icon>);
    expect(toJSON()).toBeTruthy();
  });

  it("renders a render-function source with the resolved size and colour", async () => {
    const spy = jest.fn(() => <View testID="custom-glyph" />);
    const { getByTestId } = await wrap(
      <Icon source={spy} fontSize={32} color="#123456" />,
    );

    expect(getByTestId("custom-glyph")).toBeTruthy();
    expect(spy).toHaveBeenCalledWith({ size: 32, color: "#123456" });
  });

  it("renders a bitmap source as an image", async () => {
    const { getByTestId } = await wrap(
      <Icon source={{ uri: "https://example.test/a.png" }} testID="bitmap" />,
    );
    expect(getByTestId("bitmap")).toBeTruthy();
  });
});

describe("HelperText", () => {
  it("shows the message", async () => {
    const { getByText } = await wrap(
      <HelperText>Massimo 8 caratteri</HelperText>,
    );
    expect(getByText("Massimo 8 caratteri")).toBeTruthy();
  });

  it("keeps a hidden message mounted but out of the accessibility tree", async () => {
    const { getByText, queryByText, root } = await wrap(
      <HelperText visible={false}>Nascosto</HelperText>,
    );

    // It fades rather than unmounting, so the field height doesn't jump —
    // hence `includeHiddenElements`, which is also the proof it is hidden.
    expect(getByText("Nascosto", { includeHiddenElements: true })).toBeTruthy();
    expect(queryByText("Nascosto")).toBeNull();
    expect(root?.props.importantForAccessibility).toBe("no-hide-descendants");
  });
});

describe("TouchableRipple", () => {
  it("fires onPress", async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await wrap(
      <TouchableRipple onPress={onPress} accessibilityLabel="Tocca">
        <Text>Tocca</Text>
      </TouchableRipple>,
    );

    await fireEvent.press(getByLabelText("Tocca"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire onPress while disabled", async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await wrap(
      <TouchableRipple onPress={onPress} accessibilityLabel="Disabled" disabled>
        <Text>Disabled</Text>
      </TouchableRipple>,
    );

    await fireEvent.press(getByLabelText("Disabled"));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe("Portal", () => {
  it("renders children inline when no host is mounted", async () => {
    const { getByText } = await wrap(
      <Portal>
        <Text>No host</Text>
      </Portal>,
    );
    expect(getByText("No host")).toBeTruthy();
  });

  it("renders children through a mounted host", async () => {
    const { getByText } = await wrap(
      <Portal.Host>
        <Text>Content</Text>
        <Portal>
          <Text>In overlay</Text>
        </Portal>
      </Portal.Host>,
    );

    expect(getByText("Content")).toBeTruthy();
    expect(getByText("In overlay")).toBeTruthy();
  });

  it("does not re-render the host subtree when a portal mounts", async () => {
    // The host holds the portal list in state, so mounting a portal re-renders
    // it. Its `children` prop keeps the same element identity across those
    // re-renders, so React bails out of the subtree — otherwise the portal's
    // mount effect would see new children and loop.
    let renders = 0;
    const Child = () => {
      renders++;
      return <Text>Content</Text>;
    };

    await wrap(
      <Portal.Host>
        <Child />
        <Portal>
          <Text>In overlay</Text>
        </Portal>
      </Portal.Host>,
    );

    expect(renders).toBe(1);
  });

  it("removes the portal content when the portal unmounts", async () => {
    const Host = ({ open }: { open: boolean }) => (
      <Portal.Host>
        <Text>Content</Text>
        {open && (
          <Portal>
            <Text>In overlay</Text>
          </Portal>
        )}
      </Portal.Host>
    );

    const { queryByText, rerender } = await wrap(<Host open />);
    expect(queryByText("In overlay")).toBeTruthy();

    await rerender(
      <ThemeProvider>
        <Host open={false} />
      </ThemeProvider>,
    );
    expect(queryByText("In overlay")).toBeNull();
  });
});

describe("Card compound parts", () => {
  it("renders title, subtitle, body and actions", async () => {
    const { getByText } = await wrap(
      <Card variant="elevated">
        <Card.Title title="Impianto 4" subtitle="Manutenzione" />
        <Card.Content>
          <Text>Next service</Text>
        </Card.Content>
        <Card.Actions>
          <Text>Confirm</Text>
        </Card.Actions>
      </Card>,
    );

    expect(getByText("Impianto 4")).toBeTruthy();
    expect(getByText("Manutenzione")).toBeTruthy();
    expect(getByText("Next service")).toBeTruthy();
    expect(getByText("Confirm")).toBeTruthy();
  });
});

describe("ListSection", () => {
  it("renders its title as a heading above the rows", async () => {
    const { getByText } = await wrap(
      <ListSection title="Notifications">
        <ListItem>Email</ListItem>
      </ListSection>,
    );

    expect(getByText("Notifications").props.accessibilityRole).toBe("header");
    expect(getByText("Email")).toBeTruthy();
  });
});

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

describe("theme roles", () => {
  it("exposes the M3 inverse and scrim roles", async () => {
    const seen: string[] = [];
    const Probe = () => {
      const { theme } = useTheme();
      seen.push(
        theme.colors.inverseSurface,
        theme.colors.inverseOnSurface,
        theme.colors.inversePrimary,
        theme.colors.surfaceTint,
        theme.colors.scrim,
      );
      return null;
    };

    await wrap(<Probe />);
    expect(seen).toHaveLength(5);
    seen.forEach((value) => expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/));
  });
});

describe("Modal", () => {
  it("dismisses on a scrim press", async () => {
    const onDismiss = jest.fn();
    const { getByTestId } = await wrap(
      <Modal visible title="Title" onDismiss={onDismiss}>
        Corpo
      </Modal>,
    );

    await fireEvent.press(
      getByTestId("modal-scrim", {
        includeHiddenElements: true,
      }),
    );
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("does not dismiss on a scrim press when dismissable is false", async () => {
    const onDismiss = jest.fn();
    const { getByTestId } = await wrap(
      <Modal visible title="Title" onDismiss={onDismiss} dismissable={false}>
        Corpo
      </Modal>,
    );

    await fireEvent.press(
      getByTestId("modal-scrim", {
        includeHiddenElements: true,
      }),
    );
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("renders the actions slot instead of the single close button", async () => {
    const { getByText, queryByText } = await wrap(
      <Modal
        visible
        title="Title"
        onClose={() => {}}
        closeText="Close"
        actions={<Text>Save</Text>}
      >
        Corpo
      </Modal>,
    );

    expect(getByText("Save")).toBeTruthy();
    expect(queryByText("Close")).toBeNull();
  });
});

describe("ConfirmDialog", () => {
  it("wires confirm and cancel", async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const { getByText } = await wrap(
      <ConfirmDialog
        visible
        title="Eliminare l'intervento?"
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    await fireEvent.press(getByText("Delete"));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    await fireEvent.press(getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe("organization shapes", () => {
  it("draws Button as a pill and Card at the large radius", async () => {
    const shape = createTheme().light.shape;
    const { getByTestId, getByText } = await wrap(
      <>
        <Button testID="pill" onPress={() => {}}>
          Go
        </Button>
        <Card>
          <Text>Body</Text>
        </Card>
      </>,
    );
    const radiusOf = (node: { props: { style?: unknown } }) =>
      StyleSheet.flatten(node.props.style as ViewStyle)?.borderRadius;
    expect(radiusOf(getByTestId("pill"))).toBe(shape.full);
    // The Card's surface is the nearest ancestor that carries a radius.
    let node = getByText("Body").parent;
    while (node && radiusOf(node) === undefined) node = node.parent;
    expect(node && radiusOf(node)).toBe(shape.large);
  });
});

describe("Snackbar", () => {
  it("paints a success message with the success roles, not a brand colour", async () => {
    const colors = createTheme().light.colors;
    const { getByText } = await wrap(
      <Snackbar visible message="Saved" type="success" onDismiss={() => {}} />,
    );
    const fill = (node: { props: { style?: unknown } }) =>
      StyleSheet.flatten(node.props.style as ViewStyle)?.backgroundColor;
    // The message's surface is the nearest ancestor with a fill.
    let node = getByText("Saved").parent;
    while (node && fill(node) === undefined) node = node.parent;
    expect(node && fill(node)).toBe(colors.successContainer);
  });
});

describe("ThemeProvider", () => {
  it("renders the theme it is given instead of the organization's", async () => {
    const custom = createTheme({
      colorSchemes: {
        light: { palette: { primary: { main: "#B00020" } } },
        dark: { palette: { primary: { main: "#B00020" } } },
      },
    });
    const { getByTestId } = await render(
      <ThemeProvider theme={custom}>
        <Button testID="branded" onPress={() => {}}>
          Go
        </Button>
      </ThemeProvider>,
    );
    const fill = StyleSheet.flatten(
      getByTestId("branded").props.style as ViewStyle,
    )?.backgroundColor;
    expect(fill).toBe("#B00020");
  });
});
