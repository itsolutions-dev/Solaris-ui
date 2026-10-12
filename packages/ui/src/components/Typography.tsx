import React from "react";
import { Text, type TextProps } from "react-native";

import { useTheme, type TypographyVariant } from "../providers/ThemeProvider";
import { resolveColor } from "./Layout/tokens";

export interface TypographyProps extends TextProps {
  children: React.ReactNode;
  /** MUI type-scale step. Defaults to `"body1"`. */
  variant?: TypographyVariant;
  /**
   * A palette name (`"primary"`), a palette path (`"text.secondary"`), a
   * Material 3 role or any raw colour. Defaults to `"text.primary"`.
   */
  color?: string;
  align?: "left" | "center" | "right" | "justify";
  /** One line, truncated with an ellipsis. */
  noWrap?: boolean;
  /** Adds MUI's 0.35em bottom margin. */
  gutterBottom?: boolean;
}

/**
 * Text in one of MUI's type-scale steps. Every other `Text` prop —
 * `numberOfLines`, `selectable`, `accessibilityRole`, `testID` — is forwarded.
 */
const Typography = ({
  children,
  variant = "body1",
  color = "text.primary",
  align,
  noWrap = false,
  gutterBottom = false,
  numberOfLines,
  ellipsizeMode,
  style,
  ...rest
}: TypographyProps) => {
  const { theme } = useTheme();
  const scale = theme.typography[variant];

  return (
    <Text
      {...rest}
      numberOfLines={noWrap ? 1 : numberOfLines}
      ellipsizeMode={noWrap ? "tail" : ellipsizeMode}
      style={[
        scale,
        { color: resolveColor(theme, color) ?? theme.palette.text.primary },
        align ? { textAlign: align } : null,
        gutterBottom ? { marginBottom: 0.35 * (scale.fontSize ?? 16) } : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export default Typography;
