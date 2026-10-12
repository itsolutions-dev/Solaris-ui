import React from "react";
import { Modal, Typography, Button, Divider } from "@its/solaris-ui";

// Modal renders through react-native-web's Modal, which is a real portal into
// document.body with a position: fixed scrim — so it fills the capture
// viewport rather than the card. Needs cfg.overrides
// { cardMode: "single", viewport: "560x440" }.
//
// RNW's Modal focus-traps and focuses the first focusable child on open, so
// the sheets show a focus ring on it. That is the product's real open state.
const backdrop: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  width: 460,
};

const lines: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

export const Dialog = () => (
  <div style={backdrop}>
    <Typography variant="h5">Component library</Typography>
    <Typography variant="body2">
      34 components · last synced 4 minutes ago
    </Typography>
    <Modal visible title="Publish 0.1.0" closeText="Close" onClose={() => {}}>
      Publishing makes every component in this library available to the Solaris
      playground and to any workspace that depends on it.
    </Modal>
  </div>
);

export const RichContent = () => (
  <div style={backdrop}>
    <Typography variant="h5">Team</Typography>
    <Typography variant="body2">3 members · 2 pending invites</Typography>
    <Modal visible title="Invite your team">
      <div style={lines}>
        <Typography variant="body2">
          Everyone you invite gets read access to the shared component library.
          You can raise their role later from Settings.
        </Typography>
        <div style={{ height: 12 }} />
        <Typography variant="subtitle2">Invitees</Typography>
        <Typography variant="caption">marta@itsol.it · Viewer</Typography>
        <Typography variant="caption">luca@itsol.it · Viewer</Typography>
        <div style={{ height: 12 }} />
        <Divider contentSpacing={0} />
        <div style={{ height: 12 }} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button mode="text" onPress={() => {}}>
            Not now
          </Button>
          <Button
            mode="filled"
            iconName="account-plus-outline"
            onPress={() => {}}
          >
            Send invites
          </Button>
        </div>
      </div>
    </Modal>
  </div>
);

export const Untitled = () => (
  <div style={backdrop}>
    <Typography variant="h5">Release notes</Typography>
    <Typography variant="body2">@its/solaris-ui 0.1.0</Typography>
    <Modal visible closeText="Got it" onClose={() => {}}>
      Dark mode contrast was corrected across every tonal surface.
    </Modal>
  </div>
);
