import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Icon,
  Typography,
  type MaterialCommunityIconsGlyphs,
} from "@its/solaris-ui";

interface StatFigureProps {
  label: string;
  value: string;
  icon: MaterialCommunityIconsGlyphs;
  helpText?: string;
}

/**
 * One figure on the overview page. It stands in for the library's Stat, which is parked
 * (roadmap v2), with the same props the page used.
 */
const StatFigure = ({ label, value, icon, helpText }: StatFigureProps) => (
  <View style={styles.figure}>
    <View style={styles.label}>
      <Icon fontSize="small" color="primary">
        {icon}
      </Icon>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
    </View>
    <Typography variant="h4">{value}</Typography>
    {!!helpText && (
      <Typography variant="caption" color="text.secondary">
        {helpText}
      </Typography>
    )}
  </View>
);

export default StatFigure;

const styles = StyleSheet.create({
  figure: { gap: 4 },
  label: { flexDirection: "row", alignItems: "center", gap: 8 },
});
