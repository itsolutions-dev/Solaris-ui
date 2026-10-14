import { Button, Chip, FAB, SpeedDial, IconButton } from "@its/solaris-ui";
import type { ComponentMetadata } from "../types";

/** Actions: 12 catalogue entries. */
export const actions: Record<string, ComponentMetadata> = {
  Button: {
    name: "Button",
    Component: Button,
    props: {
      children: { type: "text", default: "Click Me", label: "Label" },
      mode: {
        type: "select",
        default: "filled",
        label: "Mode",
        options: [
          { label: "Filled", value: "filled" },
          { label: "Tonal", value: "tonal" },
          { label: "Outlined", value: "outlined" },
          { label: "Text", value: "text" },
        ],
      },
      iconName: { type: "text", default: "plus", label: "Icon Name" },
      iconPosition: {
        type: "select",
        default: "left",
        label: "Icon Position",
        options: [
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ],
      },
      fullWidth: { type: "boolean", default: false, label: "Full Width" },
      disabled: { type: "boolean", default: false, label: "Disabled" },
      loading: { type: "boolean", default: false, label: "Loading" },
    },
  },
  IconButton: {
    name: "IconButton",
    Component: IconButton,
    props: {
      icon: { type: "text", default: "heart-outline", label: "Icon" },
      mode: {
        type: "select",
        default: "standard",
        label: "Mode",
        options: [
          { label: "Standard", value: "standard" },
          { label: "Filled", value: "filled" },
          { label: "Tonal", value: "tonal" },
          { label: "Outlined", value: "outlined" },
        ],
      },
      size: {
        type: "select",
        default: "medium",
        label: "Size",
        options: [
          { label: "Small", value: "small" },
          { label: "Medium", value: "medium" },
          { label: "Large", value: "large" },
        ],
      },
      selected: { type: "boolean", default: false, label: "Selected" },
      loading: { type: "boolean", default: false, label: "Loading" },
      disabled: { type: "boolean", default: false, label: "Disabled" },
    },
  },
  Chip: {
    name: "Chip",
    Component: Chip,
    props: {
      label: { type: "text", default: "React Native", label: "Label" },
      selected: { type: "boolean", default: false, label: "Selected" },
      mode: {
        type: "select",
        default: "filled",
        label: "Mode",
        options: [
          { label: "Filled", value: "filled" },
          { label: "Tonal", value: "tonal" },
          { label: "Outlined", value: "outlined" },
        ],
      },
      size: {
        type: "select",
        default: "medium",
        label: "Size",
        options: [
          { label: "Medium", value: "medium" },
          { label: "Small", value: "small" },
        ],
      },
      disabled: { type: "boolean", default: false, label: "Disabled" },
    },
  },
  FAB: {
    name: "FAB",
    Component: FAB,
    props: {
      icon: { type: "text", default: "plus", label: "Icon" },
      label: { type: "text", default: "Create", label: "Label (extended)" },
      size: {
        type: "select",
        default: "regular",
        label: "Size",
        options: [
          { label: "Small", value: "small" },
          { label: "Regular", value: "regular" },
          { label: "Large", value: "large" },
          { label: "Extended", value: "extended" },
        ],
      },
      position: {
        type: "select",
        default: "bottom-right",
        label: "Position",
        options: [
          { label: "Bottom Right", value: "bottom-right" },
          { label: "Bottom Left", value: "bottom-left" },
          { label: "Top Right", value: "top-right" },
          { label: "Top Left", value: "top-left" },
        ],
      },
      disabled: { type: "boolean", default: false, label: "Disabled" },
    },
  },
  SpeedDial: {
    name: "SpeedDial",
    Component: SpeedDial,
    props: {
      mainIcon: { type: "text", default: "plus", label: "Main Icon" },
      position: {
        type: "select",
        default: "bottom-right",
        label: "Position",
        options: [
          { label: "Bottom Right", value: "bottom-right" },
          { label: "Bottom Left", value: "bottom-left" },
          { label: "Top Right", value: "top-right" },
          { label: "Top Left", value: "top-left" },
        ],
      },
    },
  },
};
