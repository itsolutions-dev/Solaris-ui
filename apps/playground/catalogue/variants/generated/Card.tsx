// GENERATED — do not edit.
// Source: .design-sync/previews/Card.tsx
// Regenerate with `npm run variants -w @its/solaris-playground`.
import React from "react";
import { View, type ViewStyle } from "react-native";
import type { Variant } from "../types";
import {
  Card,
  CardActions,
  CardContent,
  CardCover,
  CardTitle,
  Typography,
  Divider,
  Avatar,
  Chip,
  Button,
} from "@its/solaris-ui";

const stack: ViewStyle = {
  flexDirection: "column",
  gap: 12,
  width: 380,
};

const spacer = (h: number) => <View style={{ height: h }} />;

// react-native-web renders Typography as an inline-flex <Text>, so sibling lines
// inside a plain <View> need an explicit column flex to stack.
const lines: ViewStyle = {
  flexDirection: "column",
  gap: 2,
};

export const Variants = () => (
  <View style={stack}>
    <Card variant="filled">
      <Typography variant="subtitle2">Filled</Typography>
      <Typography variant="caption">
        Default surface container — the everyday card.
      </Typography>
    </Card>
    <Card variant="outlined">
      <Typography variant="subtitle2">Outlined</Typography>
      <Typography variant="caption">
        A hairline outline instead of a tonal fill.
      </Typography>
    </Card>
    <Card variant="elevated">
      <Typography variant="subtitle2">Elevated</Typography>
      <Typography variant="caption">
        Raised off the background with a shadow.
      </Typography>
    </Card>
    <Card variant="glow">
      <Typography variant="subtitle2">Glow</Typography>
      <Typography variant="caption">
        Accent halo for the primary call to action.
      </Typography>
    </Card>
  </View>
);

export const ProfileCard = () => (
  <View style={{ width: 380 }}>
    <Card variant="elevated">
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <Avatar name="Marta Rossi" size={48} status="online" />
        <View style={{ flexDirection: "column", gap: 2 }}>
          <Typography variant="subtitle1">Marta Rossi</Typography>
          <Typography variant="caption">Lead product designer</Typography>
        </View>
      </View>
      {spacer(12)}
      <Divider contentSpacing={0} />
      {spacer(12)}
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <Chip
          label="Design system"
          size="small"
          mode="tonal"
          onPress={() => {}}
        />
        <Chip
          label="Accessibility"
          size="small"
          mode="tonal"
          onPress={() => {}}
        />
      </View>
    </Card>
  </View>
);

export const Pressable = () => (
  <View style={stack}>
    <Card
      variant="filled"
      onPress={() => {}}
      accessibilityLabel="Open billing settings"
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={lines}>
          <Typography variant="subtitle2">Billing</Typography>
          <Typography variant="caption">
            Visa ending 4021 · renews 12 Oct
          </Typography>
        </View>
        <Chip label="Active" size="small" mode="tonal" />
      </View>
    </Card>
    <Card
      variant="outlined"
      onPress={() => {}}
      accessibilityLabel="Review failed payment"
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={lines}>
          <Typography variant="subtitle2">Payment method</Typography>
          <Typography variant="caption">Last charge was declined</Typography>
        </View>
        <Chip label="Action needed" size="small" mode="tonal" />
      </View>
    </Card>
  </View>
);

export const WithActions = () => (
  <View style={{ width: 380 }}>
    <Card variant="outlined">
      <CardTitle title="Invite your team" subtitle="Workspace · Acme Inc." />
      <CardContent>
        <Typography variant="body2">
          Everyone you invite gets read access to the shared component library.
          You can raise their role later from Settings.
        </Typography>
      </CardContent>
      <CardActions>
        <Button mode="text" onPress={() => {}}>
          Not now
        </Button>
        <Button
          mode="filled"
          iconName="account-plus-outline"
          onPress={() => {}}
        >
          Invite
        </Button>
      </CardActions>
    </Card>
  </View>
);

// A 16:9 band drawn inline so the card has a real cover without a network fetch.
const cover = {
  uri:
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">
         <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0" stop-color="#6750A4"/><stop offset="1" stop-color="#B3261E"/>
         </linearGradient></defs>
         <rect width="320" height="180" fill="url(#g)"/>
       </svg>`,
    ),
};

/** The four Card parts in one composition: cover, header, body, action row. */
export const ComposedFromParts = () => (
  <View style={{ width: 380 }}>
    <Card variant="elevated">
      <CardCover source={cover} alt="Release banner" />
      <CardTitle
        title="Solaris 0.1.0"
        subtitle="Released 9 September"
        left={<Avatar name="Solaris UI" size={40} />}
        right={<Chip label="Stable" size="small" mode="tonal" />}
      />
      <CardContent>
        <Typography variant="body2">
          Layout primitives, a Material 3 date/time picker and 32 new
          components. Dark-mode contrast was corrected across every tonal
          surface.
        </Typography>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Chip label="87 components" mode="tonal" onPress={() => {}} />
          <Chip label="Breaking" mode="outlined" onPress={() => {}} />
        </View>
      </CardContent>
      <CardActions align="space-between">
        <Button mode="text" onPress={() => {}}>
          Changelog
        </Button>
        <Button mode="filled" onPress={() => {}}>
          Update
        </Button>
      </CardActions>
    </Card>
  </View>
);

export const variants: Variant[] = [
  {
    name: "Variants",
    title: "Variants",
    render: Variants,
  },
  {
    name: "ProfileCard",
    title: "Profile card",
    render: ProfileCard,
  },
  {
    name: "Pressable",
    title: "Pressable",
    render: Pressable,
  },
  {
    name: "WithActions",
    title: "With actions",
    render: WithActions,
  },
  {
    name: "ComposedFromParts",
    title: "Composed from parts",
    description:
      "The four Card parts in one composition: cover, header, body, action row.",
    render: ComposedFromParts,
  },
];
