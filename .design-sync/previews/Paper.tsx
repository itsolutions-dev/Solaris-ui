import React from "react";
import { Paper, Typography, Divider, Button, Chip } from "@its/solaris-ui";

const grid: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  width: 380,
};

const tile: React.CSSProperties = { width: 116, display: "flex" };

export const Elevations = () => (
  <div style={grid}>
    {[0, 1, 2, 3, 4, 5].map((e) => (
      <div key={e} style={tile}>
        <Paper elevation={e} style={{ flex: 1 }}>
          <Typography variant="subtitle2">Level {e}</Typography>
          <Typography variant="caption">surface</Typography>
        </Paper>
      </div>
    ))}
  </div>
);

export const Outlined = () => (
  <div style={{ width: 380, display: "flex" }}>
    <Paper elevation={0} outline style={{ flex: 1 }}>
      <Typography variant="subtitle2">API key</Typography>
      <Typography variant="caption">
        Rotates automatically every 90 days.
      </Typography>
      <div style={{ height: 12 }} />
      <Divider contentSpacing={0} />
      <div style={{ height: 12 }} />
      <Typography variant="body2">gl_live_8f2a·····c41d</Typography>
    </Paper>
  </div>
);

export const Glow = () => (
  <div style={{ width: 380, display: "flex" }}>
    <Paper elevation={3} glow style={{ flex: 1 }}>
      <Typography variant="subtitle1">Pro plan</Typography>
      <Typography variant="caption">
        Unlimited seats and priority support.
      </Typography>
      <div style={{ height: 16 }} />
      <Button
        mode="filled"
        iconName="arrow-right"
        iconPosition="right"
        onPress={() => {}}
      >
        Upgrade
      </Button>
    </Paper>
  </div>
);

export const AsPanel = () => (
  <div style={{ width: 380, display: "flex" }}>
    <Paper elevation={2} style={{ flex: 1 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle1">Build #418</Typography>
        <Chip label="Passed" size="small" mode="tonal" />
      </div>
      <div style={{ height: 12 }} />
      <Divider contentSpacing={0} />
      <div style={{ height: 12 }} />
      <Typography variant="body2">master · 75b8c46</Typography>
      <div style={{ height: 4 }} />
      <Typography variant="caption">Finished in 2m 14s · 312 tests</Typography>
    </Paper>
  </div>
);
