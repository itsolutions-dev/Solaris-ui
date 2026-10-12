import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Icons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme, Theme } from "../providers/ThemeProvider";
import Typography from "./Typography";
import Button from "./Button";
import { MaterialCommunityIconsGlyphs } from "./types";

interface EmptyStateAction {
  label: string;
  onPress: () => void;
  iconName?: MaterialCommunityIconsGlyphs;
}

export interface EmptyStateProps {
  icon?: MaterialCommunityIconsGlyphs;
  title: string;
  description?: string;
  action?: EmptyStateAction;
}

const EmptyState = ({
  icon = "inbox-outline",
  title,
  description,
  action,
}: EmptyStateProps) => {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Icons name={icon} size={40} color={theme.colors.onSurfaceVariant} />
      </View>

      <Typography variant="subtitle1" style={styles.title}>
        {title}
      </Typography>

      {!!description && (
        <Typography variant="body2" style={styles.description}>
          {description}
        </Typography>
      )}

      {action && (
        <Button
          mode="tonal"
          onPress={action.onPress}
          iconName={action.iconName}
          style={styles.actionButton}
        >
          {action.label}
        </Button>
      )}
    </View>
  );
};

export default EmptyState;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing(4),
      paddingHorizontal: theme.spacing(3),
      width: "100%",
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceContainerHigh,
      marginBottom: theme.spacing(2),
    },
    title: {
      color: theme.colors.onSurface,
      textAlign: "center",
      marginBottom: theme.spacing(0.5),
    },
    description: {
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
      maxWidth: 360,
      marginBottom: theme.spacing(2),
    },
    actionButton: {
      marginTop: theme.spacing(0.5),
    },
  });
