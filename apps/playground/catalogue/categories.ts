// Grouped catalogue for the navigator. Every registry key lives in exactly
// one group, and the flat order drives the "NN / total" counter.
import type { Category } from "./types";

export const CATEGORIES: Category[] = [
  {
    label: "Foundations",
    icon: "cube-outline",
    items: [
      "Typography",
      "Divider",
      "Paper",
      "Card",
      "CardTitle",
      "CardContent",
      "CardCover",
      "CardActions",
      "Icon",
    ],
  },
  {
    label: "Actions",
    icon: "cursor-default-click-outline",
    items: ["Button", "IconButton", "Chip", "FAB", "SpeedDial"],
  },
  {
    label: "Inputs",
    icon: "form-textbox",
    items: [
      "Input",
      "Select",
      "Checkbox",
      "Toggle",
      "Spinner",
      "SearchBar",
      "Autocomplete",
      "DateTimePicker",
      "DatePicker",
    ],
  },
  {
    label: "Data Display",
    icon: "view-grid-outline",
    items: [
      "Avatar",
      "Badge",
      "DataGrid",
      "Table",
      "ListItem",
      "ListSection",
      "Tooltip",
      "Accordion",
      "Link",
    ],
  },
  {
    label: "Feedback",
    icon: "message-alert-outline",
    items: [
      "Snackbar",
      "Banner",
      "Modal",
      "ConfirmDialog",
      "Menu",
      "Skeleton",
      "Toast",
      "Portal",
    ],
  },
  {
    label: "Navigation",
    icon: "compass-outline",
    items: [
      "TopAppBar",
      "NavigationBar",
      "NavigationDrawer",
      "Tabs",
      "Breadcrumbs",
      "Stepper",
    ],
  },
  {
    label: "Layout",
    icon: "view-dashboard-outline",
    items: ["Box", "Stack", "Grid"],
  },
];

// Not catalogued, and deliberately so: `AppBar` takes a navigator's
// `navigation`/`route`/`options`, `DrawerNavigation` and `StackNavigation` need a
// NavigationContainer plus a route array, and `StatusBar` wraps expo-status-bar
// and paints nothing of its own. Faking a navigator to fill the grid would
// preview a stub, not the component.

// Flat ordered list + reverse lookup, derived once.
export const FLAT_ORDER: string[] = CATEGORIES.flatMap((c) => c.items);
export const TOTAL_COUNT = FLAT_ORDER.length;
export const CATEGORY_OF: Record<string, string> = {};
CATEGORIES.forEach((c) => c.items.forEach((i) => (CATEGORY_OF[i] = c.label)));
