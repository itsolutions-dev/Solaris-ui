import React from "react";
import { Accordion, Typography, Divider, Chip } from "@its/solaris-ui";

const panel: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: 380,
};

export const CollapsedAndExpanded = () => (
  <div style={panel}>
    <Accordion title="Shipping address" startExpanded>
      Orders ship from the Milan warehouse within one business day. Tracking
      details arrive by email as soon as the courier scans the parcel.
    </Accordion>
    <Accordion title="Payment methods">Hidden until expanded.</Accordion>
    <Accordion title="Returns and refunds">Hidden until expanded.</Accordion>
  </div>
);

export const RichContent = () => (
  <div style={panel}>
    <Accordion title="Deployment status" startExpanded>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2">api-gateway</Typography>
          <Chip label="Live" size="small" mode="tonal" />
        </div>
        <Divider contentSpacing={0} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2">billing-worker</Typography>
          <Chip label="Rolling out" size="small" mode="tonal" />
        </div>
        <Divider contentSpacing={0} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2">report-exporter</Typography>
          <Chip label="Failed" size="small" mode="tonal" />
        </div>
      </div>
    </Accordion>
  </div>
);

export const FaqGroup = () => (
  <div style={panel}>
    <Accordion title="How do I reset my password?">
      Open Settings, choose Security, then Reset password. A one-time link is
      sent to your work email and stays valid for 30 minutes.
    </Accordion>
    <Accordion title="Can I invite external collaborators?" startExpanded>
      Workspace owners can invite guests from the Members tab. Guests see only
      the projects they are added to and never appear in billing seats.
    </Accordion>
    <Accordion title="Where is my data stored?">
      All workspace data lives in the EU (Frankfurt) region.
    </Accordion>
  </div>
);
