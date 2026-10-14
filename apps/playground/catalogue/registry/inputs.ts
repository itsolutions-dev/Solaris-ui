import {
  Input,
  Select,
  Checkbox,
  Toggle,
  Spinner,
  SearchBar,
  DateTimePicker,
  Autocomplete,
  DatePicker,
} from "@its/solaris-ui";
import type { ComponentMetadata } from "../types";

/**
 * Which surface a DateTimePicker's `mode` puts up. A prop the other surface
 * owns is not merely ignored — the picker never renders the control that reads
 * it — so the panel should not offer it either.
 */
const HAS_CALENDAR = (values: Record<string, any>) => values.mode !== "time";
const HAS_CLOCK = (values: Record<string, any>) => values.mode !== "date";

/** Inputs: 22 catalogue entries. */
export const inputs: Record<string, ComponentMetadata> = {
  Input: {
    name: "Input",
    Component: Input,
    props: {
      label: { type: "text", default: "User Name", label: "Label" },
      placeholder: {
        type: "text",
        default: "Enter name...",
        label: "Placeholder",
      },
      value: { type: "text", default: "", label: "Value" },
      error: { type: "text", default: "", label: "Error Message" },
      helperText: {
        type: "text",
        default: "",
        label: "Helper Text",
        // Every field in the kit hides its helper text while an error shows.
        appliesWhen: (values) => !values.error,
      },
      required: { type: "boolean", default: false, label: "Required" },
      disabled: { type: "boolean", default: false, label: "Disabled" },
    },
  },
  Select: {
    name: "Select",
    Component: Select,
    props: {
      label: { type: "text", default: "Country", label: "Label" },
      value: { type: "text", default: "it", label: "Value" },
      placeholder: { type: "text", default: "Select…", label: "Placeholder" },
      variant: {
        type: "select",
        default: "outlined",
        label: "Variant",
        options: [
          { label: "Outlined", value: "outlined" },
          { label: "Filled", value: "filled" },
        ],
      },
      error: { type: "text", default: "", label: "Error Message" },
      disabled: { type: "boolean", default: false, label: "Disabled" },
    },
  },
  Checkbox: {
    name: "Checkbox",
    Component: Checkbox,
    props: {
      label: { type: "text", default: "Accept terms", label: "Label" },
      checked: { type: "boolean", default: false, label: "Checked" },
      indeterminate: {
        type: "boolean",
        default: false,
        label: "Indeterminate",
      },
      labelPosition: {
        type: "select",
        default: "right",
        label: "Label Position",
        options: [
          { label: "Right", value: "right" },
          { label: "Left", value: "left" },
        ],
      },
      disabled: { type: "boolean", default: false, label: "Disabled" },
      error: { type: "boolean", default: false, label: "Error" },
    },
  },
  Toggle: {
    name: "Toggle",
    Component: Toggle,
    props: {
      value: { type: "boolean", default: true, label: "Value" },
      width: { type: "number", default: 48, label: "Width" },
      height: { type: "number", default: 28, label: "Height" },
      disabled: { type: "boolean", default: false, label: "Disabled" },
    },
  },
  Spinner: {
    name: "Spinner",
    Component: Spinner,
    props: {
      label: { type: "text", default: "Loading...", label: "Label" },
      value: { type: "number", default: 10, label: "Value" },
      min: { type: "number", default: 0, label: "Min" },
      max: { type: "number", default: 100, label: "Max" },
    },
  },
  SearchBar: {
    name: "SearchBar",
    Component: SearchBar,
    props: {
      value: { type: "text", default: "", label: "Value" },
      placeholder: { type: "text", default: "Search", label: "Placeholder" },
      disabled: { type: "boolean", default: false, label: "Disabled" },
    },
  },
  Autocomplete: {
    name: "Autocomplete",
    Component: Autocomplete,
    props: {
      label: { type: "text", default: "Country", label: "Label" },
      placeholder: {
        type: "text",
        default: "Start typing…",
        label: "Placeholder",
      },
      minChars: { type: "number", default: 1, label: "Min Chars" },
      loading: { type: "boolean", default: false, label: "Loading" },
      emptyMessage: {
        type: "text",
        default: "No match",
        label: "Empty Message",
      },
      helperText: {
        type: "text",
        default: "",
        label: "Helper Text",
        // Every field in the kit hides its helper text while an error shows.
        appliesWhen: (values) => !values.error,
      },
      error: { type: "text", default: "", label: "Error Message" },
      disabled: { type: "boolean", default: false, label: "Disabled" },
    },
  },
  DateTimePicker: {
    name: "DateTimePicker",
    Component: DateTimePicker,
    props: {
      label: { type: "text", default: "Pick a date", label: "Label" },
      mode: {
        type: "select",
        default: "date",
        label: "Mode",
        options: [
          { label: "Date", value: "date" },
          { label: "Date & Time", value: "datetime" },
          { label: "Time", value: "time" },
        ],
      },
      selectionMode: {
        type: "select",
        default: "single",
        label: "Selection",
        options: [
          { label: "Single", value: "single" },
          { label: "Range", value: "range" },
          { label: "Multiple", value: "multiple" },
        ],
        // A time picker always collects one instant; the library forces
        // "single" behind your back rather than honouring this.
        appliesWhen: (values) => values.mode !== "time",
      },
      scrollMode: {
        type: "select",
        default: "endless",
        label: "Month scrolling",
        options: [
          { label: "Endless", value: "endless" },
          { label: "Paged", value: "paged" },
        ],
        appliesWhen: HAS_CALENDAR,
      },
      locale: {
        type: "select",
        default: "",
        label: "Locale override",
        options: [
          { label: "Device", value: "" },
          { label: "it-IT", value: "it-IT" },
          { label: "en-US", value: "en-US" },
          { label: "de-DE", value: "de-DE" },
          { label: "ja-JP", value: "ja-JP" },
          { label: "ar-EG", value: "ar-EG" },
        ],
      },
      minuteInterval: {
        type: "select",
        default: 1,
        label: "Minute interval",
        options: [
          { label: "1", value: 1 },
          { label: "5", value: 5 },
          { label: "15", value: 15 },
          { label: "30", value: 30 },
        ],
        appliesWhen: HAS_CLOCK,
      },
      placeholder: {
        type: "text",
        default: "No date selected",
        label: "Placeholder",
      },
      helperText: {
        type: "text",
        default: "",
        label: "Helper Text",
        // Every field in the kit hides its helper text while an error shows.
        appliesWhen: (values) => !values.error,
      },
      error: { type: "text", default: "", label: "Error Message" },
      required: { type: "boolean", default: false, label: "Required" },
      clearable: { type: "boolean", default: true, label: "Clearable" },
      inputEnabled: {
        type: "boolean",
        default: true,
        label: "Typed entry",
        // The keyboard surface is only offered for one plain date.
        appliesWhen: (values) =>
          values.mode === "date" && values.selectionMode === "single",
      },
      use24HourClock: {
        type: "boolean",
        default: false,
        label: "Force 24h clock",
        appliesWhen: HAS_CLOCK,
      },
      limitToThisMonth: {
        type: "boolean",
        default: false,
        label: "Min/max = this month",
        appliesWhen: HAS_CALENDAR,
      },
      noWeekends: {
        type: "boolean",
        default: false,
        label: "Disable weekends",
        appliesWhen: HAS_CALENDAR,
      },
      disabled: { type: "boolean", default: false, label: "Disabled" },
    },
  },
  DatePicker: {
    name: "DatePicker",
    Component: DatePicker,
    props: {
      label: { type: "text", default: "Service date", label: "Label" },
    },
  },
};
