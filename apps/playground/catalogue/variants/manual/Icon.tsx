import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import {
  createTheme,
  Icon,
  Paper,
  ThemeProvider,
  Typography,
} from "@its/solaris-ui";
import type { Variant } from "../types";
import { demo } from "./shared";

// Hand-written rather than generated: the authored preview draws its custom
// sources as browser `<svg>` elements, and react-native-svg's equivalents are
// components, not intrinsics — there is nothing for the rewriter to map them to.

const GLYPHS = [
  "camera",
  "bell-outline",
  "cog-outline",
  "heart-outline",
  "map-marker-outline",
] as const;

const SIZES = [16, 20, 24, 32, 48];

const Glyphs = () => (
  <View style={demo.row}>
    {GLYPHS.map((name) => (
      <View key={name} style={demo.cell}>
        <Icon fontSize={28}>{name}</Icon>
        <Typography variant="caption">{name}</Typography>
      </View>
    ))}
  </View>
);

const Sizes = () => (
  <View style={demo.row}>
    {SIZES.map((size) => (
      <View key={size} style={demo.cell}>
        <Icon fontSize={size}>wrench-outline</Icon>
        <Typography variant="caption">{`${size}px`}</Typography>
      </View>
    ))}
  </View>
);

const CustomSources = () => (
  <View style={demo.panel}>
    <Typography variant="caption">
      A render function receives the resolved size and colour
    </Typography>
    <Paper elevation={1} outline>
      <View style={demo.row}>
        <Icon
          fontSize={32}
          source={({ size, color }) => (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
              <Path d="M12 2 3 20h18L12 2Zm0 5 5.5 11h-11L12 7Z" />
            </Svg>
          )}
        />
        <Icon
          fontSize={32}
          source={({ size, color }) => (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
              <Circle cx="12" cy="12" r="9" />
            </Svg>
          )}
        />
        <Typography variant="caption">SVG source, themed colour</Typography>
      </View>
    </Paper>
  </View>
);

const eva = createTheme({ icons: "eva" });

// The same glyph names, drawn by the theme's icon set. Nested providers on
// purpose: only these rows change set, the page around them keeps its own.
const IconSets = () => (
  <View style={demo.panel}>
    {(
      [
        ["Material (default)", undefined],
        ['Eva (createTheme({ icons: "eva" }))', eva],
      ] as const
    ).map(([label, theme]) => (
      <View key={label} style={demo.panel}>
        <Typography variant="caption">{label}</Typography>
        <ThemeProvider theme={theme}>
          <View style={demo.row}>
            {[
              "phone",
              "email",
              "bell-outline",
              "magnify",
              "cog",
              "delete",
              "star",
              "home",
            ].map((name) => (
              <Icon key={name} fontSize={28}>
                {name}
              </Icon>
            ))}
          </View>
        </ThemeProvider>
      </View>
    ))}
  </View>
);

export const variants: Variant[] = [
  { name: "Glyphs", title: "Glyphs", render: Glyphs },
  { name: "Sizes", title: "Sizes", render: Sizes },
  {
    name: "IconSets",
    title: "Icon sets",
    description:
      'The glyph name never changes; the theme picks the drawing. Material Design Icons by default, Eva Icons under createTheme({ icons: "eva" }).',
    render: IconSets,
  },
  {
    name: "CustomSources",
    title: "Custom sources",
    description:
      "The point of the primitive: the source does not have to be a glyph name. A render function gets the resolved size and colour and can draw anything.",
    render: CustomSources,
  },
];
