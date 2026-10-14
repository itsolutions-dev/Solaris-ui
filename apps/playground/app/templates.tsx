import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardTitle,
  Checkbox,
  Chip,
  DataGrid,
  Input,
  Link,
  ListItem,
  ListSection,
  Select,
  Toggle,
  useTheme,
  type Theme,
} from "@its/solaris-ui";
import StatFigure from "../site/StatFigure";

import { DemoErrorBoundary } from "../site/ErrorBoundary";
import { Page, Section } from "../site/Page";
import { useLayout } from "../site/breakpoints";

/**
 * Whole screens assembled from the kit.
 *
 * The component reference answers "what does this prop do"; this page answers
 * "what does a screen built out of these look like" — hierarchy, density and
 * spacing at the scale of a page rather than a widget. Everything here is
 * generic on purpose: the playground carries no product code, no API client and
 * no domain model, so these are shapes to copy, not an app to run.
 */
export default function Templates() {
  return (
    <Page
      eyebrow="Composition"
      title="Templates"
      description="Three screens built only from Solaris components and theme tokens — the level at which spacing, hierarchy and surface choices actually get decided."
    >
      <Section
        title="Sign in"
        description="Form controls, validation copy and the action row. Each field carries its own label, helper text and error line, so no screen re-invents them."
      >
        <TemplateFrame maxWidth={420} label="Sign in">
          <SignInTemplate />
        </TemplateFrame>
      </Section>

      <Section
        title="Settings"
        description="A grouped list. ListSection gives the group its heading and dividers; the trailing slot is where a Toggle or a value goes."
      >
        <TemplateFrame maxWidth={520} label="Settings">
          <SettingsTemplate />
        </TemplateFrame>
      </Section>

      <Section
        title="Dashboard"
        description="Stat tiles over a data table. The tiles carry the numbers a reader scans for; the grid carries the rows they drill into."
      >
        <TemplateFrame maxWidth={880} label="Dashboard">
          <DashboardTemplate />
        </TemplateFrame>
      </Section>
    </Page>
  );
}

/** A neutral surface to put a screen on, capped at the width it was designed for. */
const TemplateFrame = ({
  children,
  maxWidth,
  label,
}: {
  children: React.ReactNode;
  maxWidth: number;
  label: string;
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.frame}>
      <View style={[styles.frameInner, { maxWidth }]}>
        <DemoErrorBoundary label={label}>{children}</DemoErrorBoundary>
      </View>
    </View>
  );
};

const SignInTemplate = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const emailError =
    email.length > 0 && !email.includes("@") ? "Enter a valid address" : "";

  return (
    <Card variant="outlined">
      <CardTitle
        title="Welcome back"
        subtitle="Sign in to continue"
        left={<Avatar name="Solaris" size={40} />}
      />
      <CardContent>
        <View style={styles.formGap}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            leadingIcon="email-outline"
            placeholder="you@example.com"
            error={emailError}
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leadingIcon="lock-outline"
            helperText="At least 8 characters"
          />
          <View style={styles.row}>
            <Checkbox
              checked={remember}
              onValueChange={setRemember}
              label="Remember me"
            />
            <Link href="#" onPress={() => {}}>
              Forgot password?
            </Link>
          </View>
        </View>
      </CardContent>
      <CardActions align="end">
        <Button mode="text" onPress={() => {}}>
          Create account
        </Button>
        <Button mode="filled" iconName="login" onPress={() => {}}>
          Sign in
        </Button>
      </CardActions>
    </Card>
  );
};

const SettingsTemplate = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [notifications, setNotifications] = useState(true);
  const [digest, setDigest] = useState(false);
  const [locale, setLocale] = useState("en");

  return (
    <View style={styles.card}>
      <ListSection title="Account" divider>
        <ListItem
          leading={<Avatar name="Ada Lovelace" size={36} status="online" />}
          secondary="ada@example.com"
          trailing={<Chip label="Admin" size="small" mode="tonal" />}
          onPress={() => {}}
        >
          Ada Lovelace
        </ListItem>
        <ListItem secondary="Last changed 3 months ago" onPress={() => {}}>
          Password
        </ListItem>
      </ListSection>

      <ListSection title="Notifications" divider>
        <ListItem
          secondary="Push alerts on this device"
          trailing={
            <Toggle value={notifications} onValueChange={setNotifications} />
          }
        >
          Push notifications
        </ListItem>
        <ListItem
          secondary="One email every Monday"
          trailing={<Toggle value={digest} onValueChange={setDigest} />}
        >
          Weekly digest
        </ListItem>
      </ListSection>

      <ListSection title="Preferences">
        <View style={styles.inlineControl}>
          <Select
            label="Language"
            value={locale}
            onSelect={setLocale}
            options={[
              { id: "en", label: "English", value: "en" },
              { id: "it", label: "Italiano", value: "it" },
              { id: "fr", label: "Français", value: "fr" },
            ]}
          />
        </View>
      </ListSection>
    </View>
  );
};

const ROWS = [
  { id: 1, project: "Atlas", owner: "Ada", status: "On track", progress: 0.82 },
  {
    id: 2,
    project: "Beacon",
    owner: "Grace",
    status: "At risk",
    progress: 0.41,
  },
  {
    id: 3,
    project: "Cascade",
    owner: "Alan",
    status: "On track",
    progress: 0.66,
  },
  {
    id: 4,
    project: "Delta",
    owner: "Katherine",
    status: "Blocked",
    progress: 0.12,
  },
];

const DashboardTemplate = () => {
  const { theme } = useTheme();
  const layout = useLayout();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const columns = useMemo(
    () => [
      { id: "project", label: "Project", width: 160 },
      { id: "owner", label: "Owner", width: 140 },
      { id: "status", label: "Status", width: 140 },
    ],
    [],
  );

  return (
    <View style={styles.dashboard}>
      <View style={[styles.tiles, layout.isCompact && styles.tilesStacked]}>
        <View style={styles.tile}>
          <StatFigure
            label="Active projects"
            value="12"
            icon="folder-outline"
            helpText="+2 this month"
          />
        </View>
        <View style={styles.tile}>
          <StatFigure label="On track" value="8" icon="check-circle-outline" />
        </View>
        <View style={styles.tile}>
          <StatFigure
            label="At risk"
            value="3"
            icon="alert-circle-outline"
            helpText="-1 this month"
          />
        </View>
      </View>

      <Card variant="outlined">
        <CardTitle
          title="Delivery"
          subtitle="This quarter"
          right={<Chip label="Live" size="small" mode="tonal" />}
        />
        <CardContent>
          <View style={styles.formGap}>
            <DataGrid data={ROWS} columns={columns} density="dense" />
          </View>
        </CardContent>
      </Card>
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    frame: {
      alignItems: "center",
      padding: theme.spacing(3),
      borderRadius: theme.shape.large,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainerLow,
    },
    frameInner: { width: "100%" },
    card: {
      borderRadius: theme.shape.large,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surface,
      overflow: "hidden",
    },
    formGap: { gap: theme.spacing(2) },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: theme.spacing(1),
    },
    inlineControl: { padding: theme.spacing(2) },
    dashboard: { gap: theme.spacing(2) },
    tiles: { flexDirection: "row", gap: theme.spacing(2) },
    tilesStacked: { flexDirection: "column" },
    tile: { flexGrow: 1, flexBasis: 160 },
  });
