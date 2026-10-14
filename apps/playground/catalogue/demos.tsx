// Stage demos for catalogue entries that need more than `<Component {...props} />`.
// Each is attached to its registry entry as `Demo`; ComponentPreview renders it
// with the panel's live props.
import { useState } from "react";
import { View } from "react-native";
import {
  Button,
  DrawerItem,
  DrawerSection,
  IconButton,
  NavigationDrawer,
  Table,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TopAppBar,
} from "@its/solaris-ui";
import type { DemoProps } from "./types";

const noop = () => {};

const DrawerContent = ({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) => (
  <>
    <DrawerSection>
      {[
        {
          id: "inbox",
          label: "Inbox",
          icon: "inbox-outline" as const,
          badge: 24,
        },
        { id: "sent", label: "Sent", icon: "send-outline" as const },
        {
          id: "drafts",
          label: "Drafts",
          icon: "file-outline" as const,
          badge: 3,
        },
      ].map((item) => (
        <DrawerItem
          key={item.id}
          {...item}
          selected={selected === item.id}
          onPress={() => onSelect(item.id)}
        />
      ))}
    </DrawerSection>
    <DrawerSection title="Labels" showDivider>
      <DrawerItem
        label="Family"
        icon="label-outline"
        selected={selected === "family"}
        onPress={() => onSelect("family")}
      />
      <DrawerItem
        label="Work"
        icon="label-outline"
        selected={selected === "work"}
        onPress={() => onSelect("work")}
      />
    </DrawerSection>
  </>
);

export const NavigationDrawerDemo = ({ props }: DemoProps) => {
  const [selected, setSelected] = useState("inbox");
  const [open, setOpen] = useState(false);

  if (props.variant === "modal") {
    return (
      <>
        <Button mode="tonal" iconName="menu" onPress={() => setOpen(true)}>
          Open drawer
        </Button>
        <NavigationDrawer
          variant="modal"
          visible={open}
          onDismiss={() => setOpen(false)}
          title={props.title}
        >
          <DrawerContent
            selected={selected}
            onSelect={(id) => {
              setSelected(id);
              setOpen(false);
            }}
          />
        </NavigationDrawer>
      </>
    );
  }
  return (
    <View style={{ height: 440, width: "100%", maxWidth: 360 }}>
      <NavigationDrawer title={props.title} width={320}>
        <DrawerContent selected={selected} onSelect={setSelected} />
      </NavigationDrawer>
    </View>
  );
};

export const TopAppBarDemo = ({ props }: DemoProps) => (
  <View style={{ width: "100%", maxWidth: 480 }}>
    <TopAppBar
      title={props.title}
      subtitle={props.subtitle || undefined}
      variant={props.variant}
      elevated={props.elevated}
      safeArea={false}
      leading={
        <IconButton
          icon="arrow-left"
          accessibilityLabel="Back"
          onPress={noop}
        />
      }
      actions={
        <>
          <IconButton
            icon="magnify"
            accessibilityLabel="Search"
            onPress={noop}
          />
          <IconButton
            icon="dots-vertical"
            accessibilityLabel="More"
            onPress={noop}
          />
        </>
      }
    />
  </View>
);

const COLUMNS = [
  { key: "name", label: "Name", width: 180 },
  { key: "role", label: "Role", width: 140 },
  { key: "city", label: "City", width: 140 },
] as const;

const ROWS = [
  { name: "Ada Lovelace", role: "Analyst", city: "London" },
  { name: "Grace Hopper", role: "Engineer", city: "New York" },
  { name: "Katherine Johnson", role: "Mathematician", city: "Hampton" },
];

export const TableDemo = () => (
  <View style={{ maxWidth: "100%" }}>
    <Table>
      <TableHead>
        <TableRow>
          {COLUMNS.map((column) => (
            <TableHeaderCell key={column.key} width={column.width}>
              {column.label}
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHead>
      {ROWS.map((row) => (
        <TableRow key={row.name} style={{ minHeight: 48 }}>
          {COLUMNS.map((column) => (
            <TableCell key={column.key} width={column.width}>
              {row[column.key]}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </Table>
  </View>
);
