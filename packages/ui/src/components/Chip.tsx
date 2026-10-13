import { useMemo, useState } from "react";
import { Pressable, Text, StyleSheet, View, Platform } from "react-native";
import Icon from "./Icon";

import {
  useTheme,
  Theme,
  getStateColor,
  getGlowStyles,
} from "../providers/ThemeProvider";
import { MaterialCommunityIconsGlyphs, PressableState } from "./types";

export interface ChipProps {
  label: string;
  onPress?: () => void;
  onClose?: () => void;
  icon?: MaterialCommunityIconsGlyphs;
  disabled?: boolean;
  selected?: boolean;
  mode?: "filled" | "tonal" | "outlined";
  /** "small" renders a compact 24px chip. */
  size?: "small" | "medium";
  /**
   * Overrides the role of a pressable chip (`"button"`). A chip that toggles
   * inside a group is a `"radio"` or a `"checkbox"`, and then reports
   * `selected` as checked.
   */
  accessibilityRole?: "button" | "radio" | "checkbox";
  style?: object;
}

const Chip = ({
  label,
  onPress,
  onClose,
  icon,
  selected = false,
  disabled = false,
  mode = "filled",
  size = "medium",
  accessibilityRole,
  style = {},
}: ChipProps) => {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const { bg, on, border, rippleColor } = useMemo(() => {
    let backgroundColor, onColor, borderColor, androidRippleColor;
    switch (mode) {
      case "filled":
        // Selected is the neutral container: tertiary is the brand green now,
        // not a selection colour (selection follows primary, and primary is
        // already the unselected fill).
        backgroundColor = selected
          ? theme.colors.secondaryContainer
          : theme.colors.primaryContainer;
        onColor = selected
          ? theme.colors.onSecondaryContainer
          : theme.colors.onPrimaryContainer;
        androidRippleColor = theme.colors.onPrimary; // A common ripple for filled
        break;
      case "tonal":
        backgroundColor = theme.colors.primaryContainer;
        onColor = theme.colors.onPrimaryContainer;
        androidRippleColor = theme.colors.onPrimaryContainer;
        break;
      case "outlined":
        backgroundColor = "transparent";
        onColor = theme.colors.primary;
        borderColor = theme.colors.outlineVariant;
        androidRippleColor = theme.colors.primary; // Or theme.colors.onSurface
        break;
      default: // Fallback for any unexpected mode, though TypeScript should prevent this
        backgroundColor = theme.colors.surface;
        onColor = theme.colors.onSurface;
        androidRippleColor = theme.colors.primary;
    }
    return {
      bg: backgroundColor,
      on: onColor,
      border: borderColor,
      rippleColor: androidRippleColor,
    };
  }, [mode, selected, theme.colors]);

  const [bodyHovered, setBodyHovered] = useState(false);
  const [bodyPressed, setBodyPressed] = useState(false);

  let currentBg = bg;
  if (bodyPressed) {
    currentBg = getStateColor(
      bg === "transparent" ? theme.colors.surface : bg,
      on,
      "press",
    );
  } else if (bodyHovered) {
    currentBg = getStateColor(
      bg === "transparent" ? theme.colors.surface : bg,
      on,
      "hover",
    );
  }

  const glow =
    (bodyHovered || bodyPressed) && !disabled
      ? getGlowStyles(theme, true)
      : {
          borderWidth: mode === "outlined" ? 1 : 0,
          borderColor: border || theme.colors.outlineVariant,
        };

  const iconSize = size === "small" ? theme.shape.medium : theme.shape.large;

  return (
    // Plain container: keeps the close icon a SIBLING of the body press target
    // instead of a descendant, so react-native-web never nests <button> in <button>.
    <View
      style={[
        styles.container,
        size === "small" && styles.containerSmall,
        style,
        {
          backgroundColor: currentBg,
          ...glow,
          opacity: disabled ? 0.38 : 1,
        },
      ]}
    >
      <Pressable
        onPress={() => !disabled && onPress && onPress()}
        onHoverIn={() => setBodyHovered(true)}
        onHoverOut={() => setBodyHovered(false)}
        onPressIn={() => setBodyPressed(true)}
        onPressOut={() => setBodyPressed(false)}
        disabled={disabled}
        accessibilityRole={
          onPress ? (accessibilityRole ?? "button") : undefined
        }
        accessibilityLabel={label}
        accessibilityState={
          accessibilityRole === "radio" || accessibilityRole === "checkbox"
            ? { disabled, checked: selected }
            : { disabled, selected }
        }
        style={styles.content}
        {...(Platform.OS === "android" && {
          android_ripple: { color: rippleColor },
        })}
      >
        {!!icon && (
          <Icon
            fontSize={iconSize}
            color={on}
            style={[styles.icon, disabled && styles.disabledText]}
          >
            {icon}
          </Icon>
        )}
        <Text
          style={[
            styles.label,
            size === "small" && styles.labelSmall,
            disabled && styles.disabledText,
          ]}
        >
          {label}
        </Text>
        {selected && (
          <Icon
            fontSize={iconSize}
            color={on}
            style={[styles.checkIcon, disabled && styles.disabledText]}
          >
            check
          </Icon>
        )}
      </Pressable>
      {onClose && (
        <Pressable
          onPress={() => (!disabled && onClose ? onClose() : null)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`Close ${label}`}
          style={({ hovered, pressed }: PressableState) => [
            { opacity: disabled ? 0.38 : pressed ? 0.7 : hovered ? 0.5 : 1 },
          ]}
        >
          <Icon
            fontSize={iconSize}
            color={on}
            style={[styles.closeIcon, disabled && styles.disabledText]}
          >
            close
          </Icon>
        </Pressable>
      )}
    </View>
  );
};

export default Chip;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginTop: theme.spacing(0.5),
      marginBottom: theme.spacing(0.5),
      marginLeft: theme.spacing(0.5),
      marginRight: theme.spacing(0.5),
      flexDirection: "row",
      height: 32,
      borderRadius: theme.shape.medium,
      paddingHorizontal: 12,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "flex-start",
      ...Platform.select({
        web: { transition: "all 200ms ease-in-out" },
      }),
    },
    containerSmall: {
      height: 24,
      paddingHorizontal: theme.spacing(1),
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
    },
    label: {
      ...theme.typography.subtitle2,
      color: theme.colors.primary,
    },
    labelSmall: {
      ...theme.typography.caption,
    },
    icon: {
      marginRight: theme.spacing(1),
      color: theme.colors.primary,
    },
    checkIcon: {
      marginLeft: theme.spacing(0.5),
      color: theme.colors.primary,
    },
    closeIcon: {
      marginLeft: theme.spacing(0.5),
      color: theme.colors.primary,
    },
    disabledText: {
      color: theme.colors.onSurfaceVariant, // "#79747E",
    },
  });
