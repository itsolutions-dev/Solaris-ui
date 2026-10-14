import {
  NavigationBar,
  Breadcrumbs,
  Stepper,
  Tabs,
  NavigationDrawer,
  TopAppBar,
} from "@its/solaris-ui";
import type { ComponentMetadata } from "../types";
import { NavigationDrawerDemo, TopAppBarDemo } from "../demos";

/** Navigation: 10 catalogue entries. */
export const navigation: Record<string, ComponentMetadata> = {
  NavigationBar: {
    name: "NavigationBar",
    Component: NavigationBar,
    props: {
      activeId: { type: "text", default: "home", label: "Active Id" },
      showLabels: {
        type: "select",
        default: "always",
        label: "Show Labels",
        options: [
          { label: "Always", value: "always" },
          { label: "Selected", value: "selected" },
        ],
      },
    },
  },
  Tabs: {
    name: "Tabs",
    Component: Tabs,
    props: {
      activeTab: { type: "number", default: 0, label: "Active Tab" },
    },
  },
  Breadcrumbs: {
    name: "Breadcrumbs",
    Component: Breadcrumbs,
    props: {
      maxItems: { type: "number", default: 0, label: "Max Items (0 = all)" },
    },
  },
  Stepper: {
    name: "Stepper",
    Component: Stepper,
    props: {
      activeStep: { type: "number", default: 1, label: "Active Step" },
    },
  },
  TopAppBar: {
    name: "TopAppBar",
    Component: TopAppBar,
    Demo: TopAppBarDemo,
    props: {
      title: { type: "text", default: "Orders", label: "Title" },
      subtitle: { type: "text", default: "", label: "Subtitle" },
      variant: {
        type: "select",
        default: "small",
        label: "Variant",
        options: [
          { label: "Small", value: "small" },
          { label: "Center-aligned", value: "center" },
          { label: "Medium", value: "medium" },
          { label: "Large", value: "large" },
        ],
      },
      elevated: {
        type: "boolean",
        default: false,
        label: "Elevated (scrolled)",
      },
    },
  },
  NavigationDrawer: {
    name: "NavigationDrawer",
    Component: NavigationDrawer,
    Demo: NavigationDrawerDemo,
    props: {
      variant: {
        type: "select",
        default: "standard",
        label: "Variant",
        options: [
          { label: "Standard", value: "standard" },
          { label: "Modal", value: "modal" },
        ],
      },
      title: { type: "text", default: "Mail", label: "Title" },
    },
  },
};
