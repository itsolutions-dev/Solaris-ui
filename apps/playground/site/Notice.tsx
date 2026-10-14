import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Icon,
  Typography,
  type MaterialCommunityIconsGlyphs,
} from "@its/solaris-ui";

interface NoticeProps {
  icon: MaterialCommunityIconsGlyphs;
  title: string;
  description: string;
  action: {
    label: string;
    iconName: MaterialCommunityIconsGlyphs;
    onPress: () => void;
  };
}

/**
 * The site's "nothing here" block (unknown URL, unknown component). It stands in for the
 * library's EmptyState, which is parked (roadmap v2), with the same props the pages used.
 */
const Notice = ({ icon, title, description, action }: NoticeProps) => (
  <View style={styles.box}>
    <Icon fontSize={48} color="onSurfaceVariant">
      {icon}
    </Icon>
    <Typography variant="h6" align="center">
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary" align="center">
      {description}
    </Typography>
    <Button mode="tonal" iconName={action.iconName} onPress={action.onPress}>
      {action.label}
    </Button>
  </View>
);

export default Notice;

const styles = StyleSheet.create({
  box: { alignItems: "center", gap: 12, paddingVertical: 48 },
});
