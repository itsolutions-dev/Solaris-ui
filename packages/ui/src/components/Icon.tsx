import React, { useMemo } from "react";
import {
  Image,
  ImageSourcePropType,
  StyleProp,
  I18nManager,
  ImageStyle,
} from "react-native";
import Icons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "../providers/ThemeProvider";
import { resolveColor } from "./Layout/tokens";
import { MaterialCommunityIconsGlyphs } from "./types";

/** Props handed to a render-function icon source. */
export interface IconRenderProps {
  size: number;
  color: string;
}

/**
 * Anything a component can accept where an icon is expected:
 * a MaterialCommunityIcons glyph name, a bitmap (`require(...)` / `{ uri }`),
 * a render function, or a ready-made element (an SVG, a custom glyph set).
 *
 * The union widens the kit beyond MaterialCommunityIcons without every call
 * site having to branch on the source type.
 */
export type IconSource =
  | MaterialCommunityIconsGlyphs
  | ImageSourcePropType
  | ((props: IconRenderProps) => React.ReactNode)
  | React.ReactElement;

const FONT_SIZES = { small: 20, medium: 24, large: 35 } as const;

export interface IconProps {
  /** A MaterialCommunityIcons glyph name, as MUI's Icon takes its ligature: `<Icon>plus</Icon>`. */
  children?: string;
  /** A bitmap, a render function or a ready-made element, when the icon is not a glyph. */
  source?:
    | ImageSourcePropType
    | ((props: IconRenderProps) => React.ReactNode)
    | React.ReactElement;
  /** MUI's sizes: small 20, medium 24, large 35 — or any number. */
  fontSize?: keyof typeof FONT_SIZES | number;
  /** A palette name, a palette path, a Material 3 role or any raw colour. */
  color?: string;
  /** Mirror the glyph when the layout direction is RTL (arrows, chevrons). */
  flipForRTL?: boolean;
  style?: StyleProp<ImageStyle>;
  testID?: string;
}

const isImageSource = (source: unknown): source is ImageSourcePropType =>
  typeof source === "number" ||
  (typeof source === "object" &&
    source !== null &&
    !React.isValidElement(source) &&
    ("uri" in (source as object) || Array.isArray(source)));

/**
 * Renders an icon from any supported source.
 *
 * ```tsx
 * <Icon>camera</Icon>
 * <Icon fontSize="large" color="primary">camera</Icon>
 * <Icon source={require("./logo.png")} />
 * <Icon source={({ size, color }) => <MySvg width={size} fill={color} />} />
 * ```
 */
const Icon = ({
  children,
  source,
  fontSize = "medium",
  color,
  flipForRTL = false,
  style,
  testID,
}: IconProps) => {
  const { theme } = useTheme();
  const size = typeof fontSize === "number" ? fontSize : FONT_SIZES[fontSize];
  const tint = resolveColor(theme, color) ?? theme.colors.onSurface;

  const transform = useMemo(
    () => (flipForRTL && I18nManager.isRTL ? [{ scaleX: -1 }] : undefined),
    [flipForRTL],
  );

  if (children !== undefined) {
    return (
      <Icons
        testID={testID}
        name={children as MaterialCommunityIconsGlyphs}
        size={size}
        color={tint}
        style={[
          transform ? { transform } : null,
          style as StyleProp<ImageStyle>,
        ]}
      />
    );
  }

  if (typeof source === "function") {
    return <>{source({ size, color: tint })}</>;
  }

  if (React.isValidElement(source)) {
    return source;
  }

  if (isImageSource(source)) {
    return (
      <Image
        testID={testID}
        source={source}
        resizeMode="contain"
        style={[{ width: size, height: size, transform }, style]}
        // A tint only makes sense on a monochrome glyph; callers pass a
        // full-colour bitmap by leaving `color` unset.
        tintColor={color ? tint : undefined}
      />
    );
  }

  // A glyph arrives only as `children`; nothing else is left to draw.
  return null;
};

export default Icon;
