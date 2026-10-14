# Parked components

Solaris's roadmap v2 (`docs/superpowers/specs/2026-10-14-solaris-roadmap-v2-design.md`) keeps only
the components on the owner's list. These are the others, kept as they were on 2026-10-14 and
**not maintained**: nothing builds, type-checks, lints or tests this folder, and as the library's
API moves on they stop compiling. The roadmap's last group decides, one by one, which come back.

- `components/`: the source, at the same paths it had under `src/components`.
- `previews/`: their design-sync previews (and those of the components that stayed as internals).
- `tests/`: the tests that exercised only these components.
- `components.md`: their documentation, cut from `src/components/components.md`.

To bring one back: move its files back under `src/components` (and its preview back to
`.design-sync/previews`), export it from `src/index.ts`, restore its docs-site entries (registry,
categories, catalogue test, `ComponentPreview`, demos, manual variants) from the commit before the
one that added this README (`git log --diff-filter=A -- packages/ui/parked/README.md`), then
migrate it to the MUI API like the rest.

| Component | Was in `src/components/` |
|---|---|
| AnimatedFAB | `AnimatedFAB.tsx` |
| AppBar (react-navigation header adapter) | `AppBar.tsx` |
| AspectRatio | `Layout/AspectRatio.tsx` |
| BottomSheet | `BottomSheet.tsx` |
| ButtonGroup | `ButtonGroup.tsx` |
| Carousel | `Carousel.tsx` |
| Center | `Layout/Center.tsx` |
| ChipGroup | `ChipGroup.tsx` |
| DatePickerInput | `DatePickerInput.tsx` |
| DateRangePicker | `DateRangePicker.tsx` |
| EmptyState | `EmptyState.tsx` |
| FormControl | `FormControl.tsx` |
| HStack, VStack | `Layout/Stack.tsx` (the parked copy still has them) |
| LinearProgress | `Progress/LinearProgress.tsx` |
| NavigationRail | `NavigationRail.tsx` |
| Pagination | `Pagination.tsx` |
| PinInput | `PinInput.tsx` |
| ProgressButton | `ProgressButton.tsx` |
| RadioButton, RadioGroup | `RadioButton.tsx` |
| Rating | `Rating.tsx` |
| SideSheet | `SideSheet.tsx` |
| Slider | `Slider.tsx` |
| Spacer | `Layout/Spacer.tsx` |
| SplitButton | `SplitButton.tsx` |
| Stat | `Stat.tsx` |
| StatusBadge | `StatusBadge.tsx` |
| TabContent | `Tab/TabContent.tsx` |
| TimePicker | `TimePicker.tsx` |
| ToggleButton | `ToggleButton/ToggleButton.tsx` |
| ToggleButtonGroup | `ToggleButton/ToggleButtonGroup.tsx` |
| Toolbar | `Toolbar.tsx` |
| (helper) | `internal/selection.ts`, used only by the components above |

The components that a kept component still needs did **not** move: CircularProgress, Calendar,
ClockPicker, ClockDial, Collapse, HelperText, Image, Popover, ListSubheader and TouchableRipple
stay in `src/components` as internals (not exported, no docs page). Only their previews are here.
