import React from "react";
import { Typography } from "@its/solaris-ui";

const stack: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  maxWidth: 560,
};

// MUI's thirteen steps at MUI's own sizes: h1 96 light down to caption 12.
export const Headings = () => (
  <div style={stack}>
    <Typography variant="h1">h1</Typography>
    <Typography variant="h2">h2</Typography>
    <Typography variant="h3">h3 Solaris</Typography>
    <Typography variant="h4">h4 Billing preferences</Typography>
    <Typography variant="h5">h5 Payment method</Typography>
    <Typography variant="h6">h6 Invoices</Typography>
  </div>
);

export const BodyAndLabels = () => (
  <div style={stack}>
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
  </div>
);

// Colour takes a palette name, a palette path or a raw colour; align, noWrap
// and gutterBottom are MUI's text options.
export const ColourAndLayout = () => (
  <div style={stack}>
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
  </div>
);
