import React from "react";
import {
  ThemeProvider,
  useTheme,
  Typography,
  Paper,
  Button,
  Chip,
  StatusBadge,
  Divider,
  ProgressButton,
} from "@its/solaris-ui";

// ThemeProvider renders no UI of its own — it supplies the Solaris token
// set through useTheme(). These cells read that context and draw the tokens, so
// the card teaches the palette, the type scale and the spacing/shape ramps.
// The provider is already mounted above every card, so useTheme() resolves
// without nesting; the last cell nests one anyway to show the wrap explicitly.

const stack = (gap: number): React.CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap,
  width: 400,
});

// Typography renders as an inline-flex <Text> on react-native-web, so any div
// holding sibling lines needs an explicit column flex.
const lines: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

const Swatch = ({ role, bg, fg }: { role: string; bg: string; fg: string }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      gap: 2,
      height: 64,
      padding: 8,
      borderRadius: 8,
      background: bg,
      border: "1px solid rgba(0,0,0,0.06)",
    }}
  >
    <Typography variant="caption" style={{ color: fg }}>
      {role}
    </Typography>
    <Typography variant="caption" style={{ color: fg }}>
      {bg.toUpperCase()}
    </Typography>
  </div>
);

export const Palette = () => {
  const { theme } = useTheme();
  const c = theme.colors;
  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    width: 400,
  };
  return (
    <div style={stack(12)}>
      <div style={lines}>
        <Typography variant="subtitle1">Accent roles</Typography>
        <Typography variant="caption">
          Every Solaris component reads these from useTheme() — nothing is
          styled without the provider.
        </Typography>
      </div>
      <div style={grid}>
        <Swatch role="primary" bg={c.primary} fg={c.onPrimary} />
        <Swatch
          role="primaryContainer"
          bg={c.primaryContainer}
          fg={c.onPrimaryContainer}
        />
        <Swatch role="secondary" bg={c.secondary} fg={c.onSecondary} />
        <Swatch
          role="secondaryContainer"
          bg={c.secondaryContainer}
          fg={c.onSecondaryContainer}
        />
        <Swatch role="tertiary" bg={c.tertiary} fg={c.onTertiary} />
        <Swatch role="error" bg={c.error} fg={c.onError} />
      </div>
    </div>
  );
};

export const Surfaces = () => {
  const { theme } = useTheme();
  const c = theme.colors;
  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    width: 400,
  };
  return (
    <div style={stack(12)}>
      <div style={lines}>
        <Typography variant="subtitle1">Surface and outline roles</Typography>
        <Typography variant="caption">
          The tonal elevation ramp cards, sheets and app bars are painted with.
        </Typography>
      </div>
      <div style={grid}>
        <Swatch role="surface" bg={c.surface} fg={c.onSurface} />
        <Swatch
          role="surfaceContainerLow"
          bg={c.surfaceContainerLow}
          fg={c.onSurface}
        />
        <Swatch
          role="surfaceContainer"
          bg={c.surfaceContainer}
          fg={c.onSurface}
        />
        <Swatch
          role="surfaceContainerHigh"
          bg={c.surfaceContainerHigh}
          fg={c.onSurface}
        />
        <Swatch
          role="surfaceVariant"
          bg={c.surfaceVariant}
          fg={c.onSurfaceVariant}
        />
        <Swatch role="outlineVariant" bg={c.outlineVariant} fg={c.onSurface} />
      </div>
      <Typography variant="caption" style={{ color: c.onSurfaceVariant }}>
        theme.isDark is {String(theme.isDark)} — the provider follows the OS
        scheme until toggleTheme() overrides it.
      </Typography>
    </div>
  );
};

const TYPE_ROLES = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "subtitle1",
  "subtitle2",
  "body1",
  "body2",
  "button",
  "caption",
  "overline",
] as const;

export const TypeScale = () => {
  const { theme } = useTheme();
  return (
    <div style={stack(10)}>
      <div style={lines}>
        <Typography variant="subtitle1">Type scale</Typography>
        <Typography variant="caption">
          {
            "MUI's thirteen variant names on theme.typography, at the CRM's sizes; Typography takes the step name as its variant."
          }
        </Typography>
      </div>
      <Divider contentSpacing={0} />
      {TYPE_ROLES.map((role) => (
        <div key={role} style={lines}>
          <Typography variant={role}>Renew subscription</Typography>
          <Typography
            variant="caption"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {role} · {theme.typography[role].fontSize}/
            {theme.typography[role].lineHeight}
          </Typography>
        </div>
      ))}
    </div>
  );
};

export const SpacingAndShape = () => {
  const { theme } = useTheme();
  const { colors, shape } = theme;
  return (
    <div style={stack(16)}>
      <div style={lines}>
        <Typography variant="subtitle1">Spacing</Typography>
        <Typography variant="caption">
          theme.spacing(n) is 8 × n, as in MUI — the steps below are the ones
          the library itself uses.
        </Typography>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[0.5, 1, 2, 3, 4].map((step) => (
          <div
            key={step}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <div style={{ width: 120 }}>
              <Typography
                variant="caption"
                style={{ color: colors.onSurfaceVariant }}
              >
                spacing({step}) · {theme.spacing(step)}px
              </Typography>
            </div>
            <div
              style={{
                width: theme.spacing(step) * 6,
                height: 12,
                borderRadius: 6,
                background: colors.primary,
              }}
            />
          </div>
        ))}
      </div>
      <Divider contentSpacing={0} />
      <div style={lines}>
        <Typography variant="subtitle1">Shape</Typography>
        <Typography variant="caption">
          theme.shape — corner radii, from chips through to bottom sheets.
        </Typography>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {(["small", "medium", "large", "extraLarge"] as const).map((key) => (
          <div
            key={key}
            style={{ display: "flex", flexDirection: "column", gap: 4 }}
          >
            <div
              style={{
                width: 76,
                height: 56,
                borderRadius: shape[key],
                background: colors.primaryContainer,
                border: `1px solid ${colors.outlineVariant}`,
              }}
            />
            <Typography
              variant="caption"
              style={{ color: colors.onSurfaceVariant }}
            >
              {key} · {shape[key]}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  );
};

export const WrapsTheApp = () => (
  <div style={stack(12)}>
    <div style={lines}>
      <Typography variant="subtitle1">The wrap</Typography>
      <Typography variant="caption">
        ThemeProvider sits at the root, above AlertProvider. Anything below it
        is themed; anything above it renders with browser defaults.
      </Typography>
    </div>
    <ThemeProvider>
      <Paper outline style={{ padding: 16 }}>
        <div style={lines}>
          <Typography variant="subtitle2">Workspace billing</Typography>
          <Typography variant="caption">
            Every child below picked its colours up from this context — no props
            passed.
          </Typography>
        </div>
        <div style={{ height: 12 }} />
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button mode="filled" onPress={() => {}}>
            Renew
          </Button>
          <Chip label="Annual" mode="tonal" size="small" onPress={() => {}} />
          <StatusBadge label="Active" type="success" />
        </div>
      </Paper>
    </ThemeProvider>
  </div>
);

// The scheme switch. ThemeProvider follows the OS colour scheme; toggleTheme()
// overrides it, and every component below the provider re-renders from the
// other set of roles. Nested provider on purpose: switching here re-themes
// this card only, not the rest of the design system.
const SchemeSwitch = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div style={stack(12)}>
      <div style={lines}>
        <Typography variant="subtitle1">Light and dark</Typography>
        <Typography variant="caption">
          Showing the {theme.isDark ? "dark" : "light"} scheme.
        </Typography>
      </div>
      <Paper outline style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button mode="filled" onPress={toggleTheme}>
            Switch scheme
          </Button>
          <Button mode="tonal" onPress={() => {}}>
            Tonal
          </Button>
          <Chip label="Selected" mode="tonal" selected onPress={() => {}} />
          <ProgressButton status="loading" progress={0.6}>
            Loading
          </ProgressButton>
        </div>
      </Paper>
    </div>
  );
};

export const Schemes = () => (
  <ThemeProvider>
    <SchemeSwitch />
  </ThemeProvider>
);
