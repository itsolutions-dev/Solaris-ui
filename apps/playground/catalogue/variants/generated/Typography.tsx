// GENERATED — do not edit.
// Source: .design-sync/previews/Typography.tsx
// Regenerate with `npm run variants -w @its/solaris-playground`.
import React from "react";
import { View, type ViewStyle } from "react-native";
import type { Variant } from "../types";
import { Typography } from "@its/solaris-ui";

const stack: ViewStyle = {
  flexDirection: "column",
  gap: 8,
  maxWidth: 560,
};

// MUI's thirteen variant names on the CRM's scale: h4 32/700 down to caption 12.
export const Headings = () => (
  <View style={stack}>
    <Typography variant="h1">h1</Typography>
    <Typography variant="h2">h2</Typography>
    <Typography variant="h3">h3 Solaris</Typography>
    <Typography variant="h4">h4 Billing preferences</Typography>
    <Typography variant="h5">h5 Payment method</Typography>
    <Typography variant="h6">h6 Invoices</Typography>
  </View>
);

export const BodyAndLabels = () => (
  <View style={stack}>
    <Typography variant="subtitle1">subtitle1 — Card ending 4242</Typography>
    <Typography variant="subtitle2">subtitle2 — Default method</Typography>
    <Typography variant="body1">
      body1 — Invoices are issued on the first working day of each month and
      charged to the card on file.
    </Typography>
    <Typography variant="body2">
      body2 — Changing the card mid-cycle applies from the next invoice.
    </Typography>
    <Typography variant="button">button</Typography>
    <Typography variant="caption">caption — Updated 3 minutes ago</Typography>
    <Typography variant="overline">overline</Typography>
  </View>
);

// Colour takes a palette name, a palette path or a raw colour; align, noWrap
// and gutterBottom are MUI's text options.
export const ColourAndLayout = () => (
  <View style={stack}>
    <Typography color="primary">{`color="primary"`}</Typography>
    <Typography color="text.secondary">{`color="text.secondary"`}</Typography>
    <Typography color="error.main">{`color="error.main"`}</Typography>
    <Typography align="center">{`align="center"`}</Typography>
    <Typography noWrap style={{ maxWidth: 260 }}>
      noWrap — a long line that does not fit is cut with an ellipsis
    </Typography>
    <Typography variant="h6" gutterBottom>
      gutterBottom
    </Typography>
    <Typography variant="body2">
      The next paragraph starts after the gutter.
    </Typography>
  </View>
);

export const variants: Variant[] = [
  {
    name: "Headings",
    title: "Headings",
    render: Headings,
  },
  {
    name: "BodyAndLabels",
    title: "Body and labels",
    render: BodyAndLabels,
  },
  {
    name: "ColourAndLayout",
    title: "Colour and layout",
    render: ColourAndLayout,
  },
];
