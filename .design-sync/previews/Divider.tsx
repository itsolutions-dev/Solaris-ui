import React from "react";
import { Divider, Paper, Typography, Button } from "@its/solaris-ui";

const panel: React.CSSProperties = { width: 380, display: "flex" };

const rowBetween: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: 10,
  paddingBottom: 10,
};

// react-native-web renders Typography as an inline-flex <Text>, so sibling lines
// inside a plain <div> need an explicit column flex to stack.
const stat: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

export const ListSeparators = () => (
  <div style={panel}>
    <Paper elevation={1} outline style={{ flex: 1 }}>
      <Typography variant="subtitle2">Notifications</Typography>
      <div style={rowBetween}>
        <Typography variant="body2">Email digest</Typography>
        <Typography variant="caption">Weekly</Typography>
      </div>
      <Divider contentSpacing={0} />
      <div style={rowBetween}>
        <Typography variant="body2">Mentions</Typography>
        <Typography variant="caption">Instant</Typography>
      </div>
      <Divider contentSpacing={0} />
      <div style={rowBetween}>
        <Typography variant="body2">Product updates</Typography>
        <Typography variant="caption">Off</Typography>
      </div>
    </Paper>
  </div>
);

export const WithLabel = () => (
  <div
    style={{ width: 380, display: "flex", flexDirection: "column", gap: 16 }}
  >
    <Button mode="filled" fullWidth onPress={() => {}}>
      Sign in with email
    </Button>
    <Divider contentSpacing={12}>OR</Divider>
    <Button mode="outlined" fullWidth iconName="fingerprint" onPress={() => {}}>
      Use a passkey
    </Button>
    <Divider contentSpacing={12} inset={24}>
      Yesterday
    </Divider>
  </div>
);

export const Thickness = () => (
  <div
    style={{ width: 380, display: "flex", flexDirection: "column", gap: 14 }}
  >
    <Typography variant="caption">
      thickness 1 — default hairline rule
    </Typography>
    <Divider contentSpacing={0} />
    <Typography variant="caption">thickness 2</Typography>
    <Divider contentSpacing={0} thickness={2} />
    <Typography variant="caption">thickness 4 — section break</Typography>
    <Divider contentSpacing={0} thickness={4} />
  </div>
);

export const Vertical = () => (
  <div style={panel}>
    <Paper elevation={2} style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "stretch", height: 56 }}>
        <div style={stat}>
          <Typography variant="subtitle1">128</Typography>
          <Typography variant="caption">Components</Typography>
        </div>
        <Divider orientation="vertical" />
        <div style={stat}>
          <Typography variant="subtitle1">42</Typography>
          <Typography variant="caption">Tokens</Typography>
        </div>
        <Divider orientation="vertical" />
        <div style={stat}>
          <Typography variant="subtitle1">7</Typography>
          <Typography variant="caption">Groups</Typography>
        </div>
      </div>
    </Paper>
  </div>
);
