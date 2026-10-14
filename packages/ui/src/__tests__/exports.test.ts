import * as Solaris from "../index";

// Roadmap v2 (docs/superpowers/specs/2026-10-14-solaris-roadmap-v2-design.md): these are
// parked in packages/ui/parked or kept only as internals, so the barrel must not export them.
const NOT_EXPORTED = [
  // parked
  "AnimatedFAB",
  "AppBar",
  "AspectRatio",
  "BottomSheet",
  "ButtonGroup",
  "Carousel",
  "Center",
  "ChipGroup",
  "DatePickerInput",
  "DateRangePicker",
  "EmptyState",
  "FormControl",
  "HStack",
  "LinearProgress",
  "NavigationRail",
  "Pagination",
  "PinInput",
  "ProgressButton",
  "RadioButton",
  "RadioGroup",
  "Rating",
  "SideSheet",
  "Slider",
  "Spacer",
  "SplitButton",
  "Stat",
  "StatusBadge",
  "TabContent",
  "TimePicker",
  "ToggleButton",
  "ToggleButtonGroup",
  "Toolbar",
  "VStack",
  // internal
  "Calendar",
  "CircularProgress",
  "ClockDial",
  "ClockPicker",
  "Collapse",
  "HelperText",
  "Image",
  "ListSubheader",
  "Popover",
  "TouchableRipple",
];

describe("public API", () => {
  it("exports none of the parked or internal components", () => {
    const exported = NOT_EXPORTED.filter((name) => name in Solaris);
    expect(exported).toEqual([]);
  });
});
