import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Avatar,
  Badge,
  Banner,
  Button,
  Card,
  CardContent,
  CardTitle,
  Checkbox,
  Chip,
  Input,
  NavigationBar,
  Tabs,
  Toggle,
  Typography,
  useTheme,
  type NavigationBarItem,
  type Theme,
  type TypographyVariant,
} from "@its/solaris-ui";
import ChoiceChips from "../site/ChoiceChips";

import { CodeBlock } from "../site/CodeBlock";
import { Page, Section } from "../site/Page";
import { useLayout } from "../site/breakpoints";
import { usePreset } from "../site/ThemePresetContext";
import { PRESETS, parsePresetId } from "../site/themePresets";

/**
 * The colour roles, grouped the way M3 groups them. Tokens the theme has but
 * this list does not are collected into "Other" rather than dropped, so adding
 * a role to the theme makes it appear here without an edit.
 */
const COLOR_GROUPS: { label: string; tokens: string[] }[] = [
  {
    label: "Primary",
    tokens: [
      "primary",
      "onPrimary",
      "primaryContainer",
      "onPrimaryContainer",
      "inversePrimary",
    ],
  },
  {
    label: "Secondary",
    tokens: [
      "secondary",
      "onSecondary",
      "secondaryContainer",
      "onSecondaryContainer",
    ],
  },
  {
    label: "Tertiary",
    tokens: [
      "tertiary",
      "onTertiary",
      "tertiaryContainer",
      "onTertiaryContainer",
    ],
  },
  {
    label: "Error",
    tokens: ["error", "onError", "errorContainer", "onErrorContainer"],
  },
  {
    label: "Warning",
    tokens: ["warning", "onWarning", "warningContainer", "onWarningContainer"],
  },
  {
    label: "Info",
    tokens: ["info", "onInfo", "infoContainer", "onInfoContainer"],
  },
  {
    label: "Success",
    tokens: ["success", "onSuccess", "successContainer", "onSuccessContainer"],
  },
  {
    label: "Surfaces",
    tokens: [
      "background",
      "onBackground",
      "surface",
      "onSurface",
      "surfaceVariant",
      "onSurfaceVariant",
      "surfaceContainerLow",
      "surfaceContainer",
      "surfaceContainerHigh",
      "surfaceContainerHighest",
      "surfaceDim",
      "inverseSurface",
      "inverseOnSurface",
      "surfaceTint",
    ],
  },
  {
    label: "Lines & shadows",
    tokens: ["outline", "outlineVariant", "scrim", "shadow"],
  },
];

/** The spacing steps the library's own components use. */
const SPACING_STEPS = [0.5, 1, 2, 3, 4];

const TYPE_SCALE: TypographyVariant[] = [
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
];

const USAGE = `import { useTheme } from "@its/solaris-ui";
import { StyleSheet } from "react-native";

const Card = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return <View style={styles.card} />;
};

// Styles are rebuilt when the theme changes — never read a token at module scope.
const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      padding: theme.spacing(2),
      borderRadius: theme.shape.large,
      backgroundColor: theme.colors.surfaceContainerLow,
    },
  });`;

const READ_PALETTE = `import { useTheme } from "@its/solaris-ui";

// Code ported from an MUI app reads the palette in MUI's shape…
const Caption = ({ children }: { children: string }) => {
  const { theme } = useTheme();
  return <Text style={{ color: theme.palette.text.secondary }}>{children}</Text>;
};

// …and the Material 3 roles the components paint with are beside it:
// theme.colors.primaryContainer, theme.colors.surfaceContainerHigh, …`;

const CREATE_THEME = `import { createTheme, ThemeProvider } from "@its/solaris-ui";

// MUI's colorSchemes shape. Pass only what differs: everything else stays the
// organization's theme. Create it once, at module scope — a new theme object
// re-styles every component.
const theme = createTheme({
  colorSchemes: {
    light: { palette: { primary: { main: "#00639B" } } },
    dark: { palette: { primary: { main: "#95CCFF" } } },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <Root />
    </ThemeProvider>
  );
}`;

/**
 * `theme.colors` is spelled out token by token in the public `Theme` type — on
 * purpose, so the emitted .d.ts does not import theme.json — which means it has
 * no index signature to read a dynamic token name through.
 */
const colorToken = (theme: Theme, token: string): string | undefined =>
  (theme.colors as unknown as Record<string, string>)[token];

export default function Theming() {
  const { theme, toggleTheme } = useTheme();
  const { preset, setPreset } = usePreset();
  const layout = useLayout();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const known = new Set(COLOR_GROUPS.flatMap((group) => group.tokens));
  const extras = Object.keys(theme.colors).filter(
    (token) =>
      !known.has(token) && typeof colorToken(theme, token) === "string",
  );
  const groups = extras.length
    ? [...COLOR_GROUPS, { label: "Other", tokens: extras }]
    : COLOR_GROUPS;

  return (
    <Page
      eyebrow="Design tokens"
      title="Theming"
      description="Every colour, type step, spacing unit and corner radius in the library comes from one theme, resolved for the light and dark schemes. The components and swatches on this page are rendered with it, live."
    >
      <View style={styles.toggleRow}>
        <Typography
          variant="body2"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Showing the{" "}
          <Text style={styles.strong}>{theme.isDark ? "dark" : "light"}</Text>{" "}
          scheme.
        </Typography>
        <Button
          mode="tonal"
          iconName={theme.isDark ? "weather-sunny" : "weather-night"}
          onPress={toggleTheme}
        >
          Switch scheme
        </Button>
      </View>

      <View style={styles.toggleRow}>
        <Typography
          variant="body2"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Design proposal: the colours, type and radii of the whole site, and
          the icons of its components.
        </Typography>
        <ChoiceChips
          accessibilityLabel="Design proposal"
          options={Object.entries(PRESETS).map(([value, { label }]) => ({
            value,
            label,
          }))}
          value={preset}
          onValueChange={(value) => setPreset(parsePresetId(value))}
        />
      </View>

      <Section
        title="Components in this theme"
        description="Real components, not pictures of them. Switch the scheme and every one of them re-renders from the other set of roles."
      >
        <Gallery />
      </Section>

      {groups.map((group) => (
        <Section key={group.label} title={group.label}>
          <View style={styles.swatchGrid}>
            {group.tokens.map((token) => {
              const value = colorToken(theme, token);
              if (!value) return null;
              return (
                <Swatch
                  key={token}
                  token={token}
                  value={value}
                  columns={
                    layout.atLeast("large")
                      ? 4
                      : layout.atLeast("medium")
                        ? 3
                        : 2
                  }
                />
              );
            })}
          </View>
        </Section>
      ))}

      <Section
        title="Type scale"
        description="MUI's thirteen variant names at the active proposal's sizes, on its font family (Roboto for A and Geist for B on the web; the system font on iOS unless the app embeds the font). Typography takes the step name as its variant."
      >
        <View style={styles.typeList}>
          {TYPE_SCALE.map((variant) => {
            const spec = theme.typography[variant];
            return (
              <View key={variant} style={styles.typeRow}>
                <Typography
                  variant={variant}
                  style={{ color: theme.colors.onSurface }}
                >
                  {variant}
                </Typography>
                <Typography
                  variant="caption"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {spec.fontSize} / {spec.lineHeight} ·{" "}
                  {String(spec.fontWeight)}
                </Typography>
              </View>
            );
          })}
        </View>
      </Section>

      <Section
        title="Spacing"
        description="theme.spacing(n) is 8 × n, as in MUI. These are the steps the library itself uses; fractions and negatives work too."
      >
        <View style={styles.tokenRow}>
          {SPACING_STEPS.map((step) => {
            const value = theme.spacing(step);
            return (
              <View key={step} style={styles.tokenChip}>
                <View
                  style={[styles.spacingBar, { width: value, height: value }]}
                />
                <Typography
                  variant="caption"
                  style={{ color: theme.colors.onSurface }}
                >
                  spacing({step})
                </Typography>
                <Typography
                  variant="caption"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {value}dp
                </Typography>
              </View>
            );
          })}
        </View>
      </Section>

      <Section
        title="Shape"
        description="Corner radii, by role rather than by number: 12 for fields, 16 for cards, 24 for dialogs and sheets, fully rounded for buttons."
      >
        <View style={styles.tokenRow}>
          {Object.entries(theme.shape).map(([name, value]) => (
            <View key={name} style={styles.tokenChip}>
              <View
                style={[styles.shapeSample, { borderRadius: value as number }]}
              />
              <Typography
                variant="caption"
                style={{ color: theme.colors.onSurface }}
              >
                {name}
              </Typography>
              <Typography
                variant="caption"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {String(value)}dp
              </Typography>
            </View>
          ))}
        </View>
      </Section>

      <Section
        title="Reading the theme in your own code"
        description="The pattern every component in the library follows, and MUI's palette shape for code ported from a web app."
      >
        <CodeBlock code={USAGE} title="Card.tsx" />
        <CodeBlock code={READ_PALETTE} title="Caption.tsx" />
      </Section>

      <Section
        title="Your own theme"
        description="createTheme takes MUI's colorSchemes shape. Text on each colour is black or white, whichever reads better, so a new brand colour cannot produce unreadable buttons."
      >
        <CodeBlock code={CREATE_THEME} title="App.tsx" />
      </Section>
    </Page>
  );
}

const noop = () => {};

const GALLERY_TABS = ["Overview", "Activity", "Settings"];

const GALLERY_NAV: NavigationBarItem[] = [
  { id: "home", label: "Home", icon: "home-outline" },
  { id: "contacts", label: "Contacts", icon: "account-group-outline" },
  {
    id: "agenda",
    label: "Agenda",
    icon: "calendar-month-outline",
    badgeCount: 3,
  },
];

/** A static spread of the components a theme change is most visible on. */
const Gallery = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [name, setName] = useState("Mario Rossi");
  const [notify, setNotify] = useState(true);
  const [remember, setRemember] = useState(true);
  const [tab, setTab] = useState(0);
  const [nav, setNav] = useState("home");

  return (
    <View style={styles.gallery}>
      <View style={styles.galleryRow}>
        <Button mode="filled" onPress={noop}>
          Filled
        </Button>
        <Button mode="tonal" onPress={noop}>
          Tonal
        </Button>
        <Button mode="outlined" onPress={noop}>
          Outlined
        </Button>
        <Button mode="text" onPress={noop}>
          Text
        </Button>
      </View>
      <View style={styles.galleryRow}>
        <Button tone="error" onPress={noop}>
          Delete
        </Button>
        <Button tone="success" onPress={noop}>
          Confirm
        </Button>
        <Button mode="tonal" tone="error" onPress={noop}>
          Discard
        </Button>
        <Button disabled onPress={noop}>
          Disabled
        </Button>
      </View>
      <View style={styles.galleryRow}>
        <Chip label="All" mode="outlined" onPress={noop} />
        <Chip label="Selected" mode="tonal" selected onPress={noop} />
      </View>
      <View style={styles.galleryRow}>
        {/* Badge is absolutely positioned: it needs an anchor. */}
        <View>
          <Avatar name="Mario Rossi" />
          <Badge count={5} style={{ top: -2, right: -2 }} />
        </View>
        <Avatar icon="account" variant="rounded" />
        <Toggle value={notify} onValueChange={setNotify} />
        <Checkbox
          checked={remember}
          onValueChange={setRemember}
          label="Remember me"
        />
      </View>
      <Input
        label="Name"
        value={name}
        onChangeText={setName}
        helperText="As it appears on the contract"
      />
      <Card variant="elevated">
        <CardTitle title="Card" subtitle="An elevated surface" />
        <CardContent>
          <Typography
            variant="body2"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Surfaces, outlines and text all come from the neutral roles of the
            theme.
          </Typography>
        </CardContent>
      </Card>
      <Tabs tabs={GALLERY_TABS} activeTab={tab} onChange={setTab} />
      <Banner
        visible
        type="info"
        icon="information-outline"
        message="Banners follow the theme too."
      />
      <NavigationBar items={GALLERY_NAV} activeId={nav} onItemPress={setNav} />
    </View>
  );
};

const Swatch = ({
  token,
  value,
  columns,
}: {
  token: string;
  value: string;
  columns: number;
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View
      style={[
        styles.swatch,
        { flexBasis: `${100 / columns}%`, maxWidth: `${100 / columns}%` },
      ]}
    >
      <View style={[styles.swatchChip, { backgroundColor: value }]} />
      <Typography variant="caption" style={{ color: theme.colors.onSurface }}>
        {token}
      </Typography>
      <Typography
        variant="caption"
        style={{ color: theme.colors.onSurfaceVariant }}
      >
        {value}
      </Typography>
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: theme.spacing(2),
    },
    strong: { fontWeight: "700", color: theme.colors.onSurface },
    gallery: { gap: theme.spacing(2) },
    galleryRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: theme.spacing(1),
    },
    swatchGrid: { flexDirection: "row", flexWrap: "wrap" },
    swatch: {
      gap: 2,
      paddingRight: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
    swatchChip: {
      height: 56,
      borderRadius: theme.shape.medium,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      marginBottom: theme.spacing(0.5),
    },
    typeList: { gap: theme.spacing(2) },
    typeRow: { gap: 2 },
    tokenRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing(2),
      alignItems: "flex-end",
    },
    tokenChip: { alignItems: "center", gap: 2, minWidth: 72 },
    spacingBar: {
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
      marginBottom: theme.spacing(0.5),
    },
    shapeSample: {
      width: 56,
      height: 56,
      backgroundColor: theme.colors.primaryContainer,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      marginBottom: theme.spacing(0.5),
    },
  });
