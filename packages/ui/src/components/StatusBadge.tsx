import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Icons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "../providers/ThemeProvider";

export interface StatusBadgeProps {
  label: string;
  icon?: string;
  type?: "success" | "error" | "warning";
}

const ICONS = {
  success: "check-circle",
  error: "alert-circle",
  warning: "alert",
} as const;

const StatusBadge = ({ label, icon, type = "success" }: StatusBadgeProps) => {
  const { theme } = useTheme();
  // Container roles from the theme, so a badge follows the scheme instead of a
  // hand-picked hex pair per mode.
  const { bg, on } = useMemo(() => {
    const c = theme.colors;
    if (type === "error") {
      return { bg: c.errorContainer, on: c.onErrorContainer };
    }
    if (type === "warning") {
      return { bg: c.warningContainer, on: c.onWarningContainer };
    }
    return { bg: c.successContainer, on: c.onSuccessContainer };
  }, [type, theme]);

  return (
    <View
      style={[styles.statusContainer, { backgroundColor: bg }]}
      accessibilityRole="text"
      accessibilityLabel={`${type}: ${label}`}
    >
      <Icons name={(icon || ICONS[type]) as any} size={14} color={on} />
      <Text style={[styles.statusText, { color: on }]}>{label}</Text>
    </View>
  );
};
export default StatusBadge;

const styles = StyleSheet.create({
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
