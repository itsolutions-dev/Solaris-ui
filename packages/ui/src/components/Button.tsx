import { useMemo } from "react";
import {
  useTheme,
  Theme,
  getStateColor,
  getGlowStyles,
} from "../providers/ThemeProvider";

import {
  Pressable,
  Text,
  View,
  StyleSheet,
  Platform,
  type StyleProp,
  type TextStyle,
} from "react-native";
import Icon from "./Icon";
import CircularProgress from "./Progress/CircularProgress";
import { MaterialCommunityIconsGlyphs, PressableState } from "./types";

export type ButtonMode = "filled" | "tonal" | "outlined" | "text";
export type ButtonTone = "primary" | "error" | "success";

/** The colours a button resolves to for a mode and a tone. */
export interface ButtonColors {
  /** Surface fill; `"transparent"` for outlined and text. */
  bg: string;
  /** Label and icon colour. */
  on: string;
  /** Outline colour, outlined mode only. */
  border?: string;
  /** What a state layer is drawn over: `bg`, or `surface` for the transparent modes. */
  underlay: string;
}

/**
 * Resolves a mode and a tone to colours, exactly as `Button` paints them.
 * Exported for components built on `Button` that draw inside its surface.
 */
export const getButtonColors = (
  theme: Theme,
  mode: ButtonMode,
  tone: ButtonTone,
): ButtonColors => {
  const c = theme.colors;
  const [accent, onAccent, container, onContainer] =
    tone === "success"
      ? [c.success, c.onSuccess, c.successContainer, c.onSuccessContainer]
      : tone === "error"
        ? [c.error, c.onError, c.errorContainer, c.onErrorContainer]
        : [c.primary, c.onPrimary, c.primaryContainer, c.onPrimaryContainer];

  const surface = theme.colors.surface;
  switch (mode) {
    case "tonal":
      return { bg: container, on: onContainer, underlay: container };
    case "outlined":
      return {
        bg: "transparent",
        on: accent,
        border: tone === "primary" ? theme.colors.outline : accent,
        underlay: surface,
      };
    case "text":
      return { bg: "transparent", on: accent, underlay: surface };
    case "filled":
    default:
      return { bg: accent, on: onAccent, underlay: accent };
  }
};

export interface ButtonProps {
  onPress?: () => void;
  iconName?: MaterialCommunityIconsGlyphs;
  size?: number;
  mode?: ButtonMode;
  /**
   * Colour role. `error` is the destructive treatment (delete, discard);
   * `success` is confirmation feedback, from a fixed green kept off the seed.
   */
  tone?: ButtonTone;
  style?: object;
  iconStyle?: object;
  disabled?: boolean;
  loading?: boolean;
  /**
   * Blocks presses and announces the button as busy, but — unlike `loading` —
   * keeps the label, the icon and the full-strength colours on screen.
   */
  busy?: boolean;
  /**
   * Drawn behind the label across the whole surface, clipped to its shape:
   * a progress fill, a state animation. It receives no touches.
   */
  underlay?: React.ReactNode;
  /** Applied to the label text, after the theme's type style. */
  labelStyle?: StyleProp<TextStyle>;
  /** Stretch to fill the parent width. */
  fullWidth?: boolean;
  /** Icon side relative to the label. */
  iconPosition?: "left" | "right";
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  children?: React.ReactNode;
}

const noop = () => {};

/** Icon size when `size` is not given: a pixel size, not a theme radius. */
const ICON_SIZE = 12;

const Button = ({
  onPress,
  iconName,
  size,
  mode = "filled",
  tone = "primary",
  disabled = false,
  style = {},
  iconStyle = {},
  loading = false,
  busy = false,
  underlay,
  labelStyle,
  fullWidth = false,
  iconPosition = "left",
  accessibilityLabel,
  accessibilityHint,
  testID,
  children,
}: ButtonProps) => {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const {
    bg,
    on,
    border,
    underlay: stateBase,
  } = useMemo(() => getButtonColors(theme, mode, tone), [theme, mode, tone]);

  const isInteractive = !disabled && !loading && !busy;

  return (
    <Pressable
      accessibilityLabel={
        accessibilityLabel ||
        (typeof children === "string" ? children : undefined)
      }
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading || busy }}
      // react-native-web does not map accessibilityState.busy to the DOM.
      aria-busy={loading || busy}
      testID={testID}
      // A no-op rather than undefined while busy: the Pressable stays enabled,
      // and an undefined handler leaves the press free to be answered by
      // whatever is listening further up.
      onPress={isInteractive ? onPress : noop}
      // A busy button stays focusable — `disabled` would drop it from the tab
      // order and announce it as unavailable, when it is working — so it only
      // stops answering presses.
      disabled={disabled || loading}
      style={({ hovered, pressed }: PressableState) => {
        let currentBg = bg;

        if (isInteractive && pressed) {
          currentBg = getStateColor(stateBase, on, "press");
        } else if (isInteractive && hovered) {
          currentBg = getStateColor(stateBase, on, "hover");
        }

        const glow =
          (hovered || pressed) && isInteractive
            ? getGlowStyles(theme, true)
            : {
                borderWidth: mode === "outlined" ? 1 : 0,
                borderColor: border || "transparent",
              };

        return [
          styles.buttonContainer,
          {
            backgroundColor: currentBg,
            ...glow,
            opacity: disabled ? 0.38 : 1,
          },
          fullWidth && styles.fullWidth,
          underlay != null && styles.clipped,
          style,
        ];
      }}
      {...(Platform.OS === "android" && {
        android_ripple: { color: getStateColor(bg, on, "press") },
      })}
    >
      {underlay != null && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {underlay}
        </View>
      )}
      <View style={styles.itemsContainer}>
        {loading ? (
          // We use a smaller size to fit inside the button height
          <CircularProgress size={20} strokeWidth={2.5} color={on} />
        ) : (
          <>
            {!!iconName && iconPosition === "left" && (
              <Icon
                fontSize={size || ICON_SIZE}
                style={[styles.icon, { color: on }, iconStyle]}
              >
                {iconName}
              </Icon>
            )}
            {children != null && children !== "" && (
              <Text style={[styles.buttonText, { color: on }, labelStyle]}>
                {children}
              </Text>
            )}
            {!!iconName && iconPosition === "right" && (
              <Icon
                fontSize={size || ICON_SIZE}
                style={[styles.icon, { color: on }, iconStyle]}
              >
                {iconName}
              </Icon>
            )}
          </>
        )}
      </View>
    </Pressable>
  );
};

export default Button;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    buttonContainer: {
      marginTop: theme.spacing(0.5),
      marginBottom: theme.spacing(0.5),
      marginLeft: theme.spacing(0.5),
      marginRight: theme.spacing(0.5),
      padding: theme.spacing(2),
      borderRadius: theme.shape.full,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      ...Platform.select({
        web: { cursor: "pointer" },
      }),
    },
    buttonText: {
      color: theme.colors.onPrimary,
      ...theme.typography.button,
      marginLeft: theme.spacing(0.5),
      marginRight: theme.spacing(0.5),
    },
    itemsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    clipped: {
      overflow: "hidden",
    },
    fullWidth: {
      alignSelf: "stretch",
      width: "auto",
    },
    icon: {},
  });
