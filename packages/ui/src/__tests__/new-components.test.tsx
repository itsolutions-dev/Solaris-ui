import React from "react";
import { StyleSheet, Text } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  DataGrid,
  DrawerItem,
  DrawerSection,
  IconButton,
  Modal,
  NavigationDrawer,
  Table,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  ThemeProvider,
  TopAppBar,
  Typography,
} from "../index";
import CircularProgress from "../components/Progress/CircularProgress";

const wrap = (ui: React.ReactElement) =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 1024, height: 768 },
        insets: { top: 20, left: 0, right: 0, bottom: 10 },
      }}
    >
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );

describe("NavigationDrawer", () => {
  it("renders sections and items inline", async () => {
    const onPress = jest.fn();
    const { getByText, getByRole } = await wrap(
      <NavigationDrawer title="Mail">
        <DrawerSection title="Folders">
          <DrawerItem
            label="Inbox"
            icon="inbox-outline"
            selected
            badge={24}
            onPress={() => {}}
          />
          <DrawerItem label="Sent" icon="send-outline" onPress={onPress} />
        </DrawerSection>
      </NavigationDrawer>,
    );
    expect(getByText("Folders")).toBeTruthy();
    expect(getByText("24")).toBeTruthy();
    expect(
      getByRole("link", { name: "Inbox" }).props.accessibilityState,
    ).toMatchObject({
      selected: true,
    });
    await fireEvent.press(getByRole("link", { name: "Sent" }));
    expect(onPress).toHaveBeenCalled();
  });

  it("modal: renders nothing closed, dismisses from the scrim open", async () => {
    const onDismiss = jest.fn();
    const drawer = (visible: boolean) => (
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 1024, height: 768 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <ThemeProvider>
          <NavigationDrawer
            variant="modal"
            visible={visible}
            onDismiss={onDismiss}
            testID="nav"
          >
            <DrawerItem label="Inbox" onPress={() => {}} />
          </NavigationDrawer>
        </ThemeProvider>
      </SafeAreaProvider>
    );
    const { queryByText, getByTestId, rerender } = await render(drawer(false));
    expect(queryByText("Inbox")).toBeNull();

    await rerender(drawer(true));
    // The scrim sits beside the modal panel, so it is hidden from assistive
    // tech; the query has to include hidden elements to reach it.
    await fireEvent.press(
      getByTestId("nav-scrim", { includeHiddenElements: true }),
    );
    expect(onDismiss).toHaveBeenCalled();
  });
});

describe("TopAppBar and AppBar", () => {
  it.each(["small", "center", "medium", "large"] as const)(
    "renders the %s variant with a header title",
    async (variant) => {
      const { getByRole } = await wrap(
        <TopAppBar
          title="Orders"
          variant={variant}
          leading={
            <IconButton
              icon="menu"
              accessibilityLabel="Menu"
              onPress={() => {}}
            />
          }
        />,
      );
      expect(getByRole("header", { name: "Orders" })).toBeTruthy();
    },
  );

  it("gives the large variant a bigger title than the medium one", async () => {
    const size = async (variant: "medium" | "large") => {
      const { getByRole } = await wrap(
        <TopAppBar title={variant} variant={variant} />,
      );
      return StyleSheet.flatten(
        getByRole("header", { name: variant }).props.style,
      ).fontSize as number;
    };
    expect(await size("large")).toBeGreaterThan(await size("medium"));
  });
});

describe("Modal fullScreen", () => {
  it("puts close, title and actions in a header", async () => {
    const onDismiss = jest.fn();
    const { getByRole, getByText } = await wrap(
      <Modal
        visible
        fullScreen
        title="New event"
        onDismiss={onDismiss}
        actions={<Text>Save</Text>}
      >
        <Text>Form</Text>
      </Modal>,
    );
    expect(getByRole("header", { name: "New event" })).toBeTruthy();
    expect(getByText("Save")).toBeTruthy();
    await fireEvent.press(getByRole("button", { name: "Close" }));
    expect(onDismiss).toHaveBeenCalled();
  });
});

describe("CircularProgress", () => {
  it("determinate: reports its value", async () => {
    const { getByRole } = await wrap(<CircularProgress progress={0.42} />);
    expect(getByRole("progressbar").props.accessibilityValue).toMatchObject({
      min: 0,
      max: 100,
      now: 42,
    });
  });

  it("indeterminate: still a labelled progressbar", async () => {
    const { getByRole } = await wrap(<CircularProgress />);
    expect(getByRole("progressbar", { name: "Loading" })).toBeTruthy();
  });
});

describe("Table primitives", () => {
  it("compose a table", async () => {
    const { getByText } = await wrap(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableRow>
          <TableCell>Ada</TableCell>
        </TableRow>
      </Table>,
    );
    expect(getByText("Name")).toBeTruthy();
    expect(getByText("Ada")).toBeTruthy();
  });

  it("DataGrid still renders its rows on them", async () => {
    const { getByText } = await wrap(
      <DataGrid
        columns={[{ id: "name", label: "Name" }]}
        data={[{ id: 1, name: "Grace" }]}
      />,
    );
    expect(getByText("Grace")).toBeTruthy();
  });
});

describe("Typography", () => {
  it("forwards Text props", async () => {
    const { getByTestId } = await wrap(
      <Typography variant="body2" numberOfLines={2} testID="t">
        Long text
      </Typography>,
    );
    expect(getByTestId("t").props.numberOfLines).toBe(2);
  });
});
