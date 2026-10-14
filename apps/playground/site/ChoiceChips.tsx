import React from "react";
import { StyleSheet, View } from "react-native";
import { Chip, type MaterialCommunityIconsGlyphs } from "@its/solaris-ui";

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  icon?: MaterialCommunityIconsGlyphs;
}

interface ChoiceChipsProps<T extends string> {
  accessibilityLabel: string;
  options: ChoiceOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
}

/**
 * The site's single-choice control (stage width, catalogue layout, design proposal): a row of
 * chips announced as a radio group. It replaced ToggleButtonGroup when that was parked.
 */
const ChoiceChips = <T extends string>({
  accessibilityLabel,
  options,
  value,
  onValueChange,
}: ChoiceChipsProps<T>) => (
  <View
    accessibilityRole="radiogroup"
    accessibilityLabel={accessibilityLabel}
    style={styles.row}
  >
    {options.map((option) => (
      <Chip
        key={option.value}
        label={option.label}
        icon={option.icon}
        mode="outlined"
        selected={option.value === value}
        accessibilityRole="radio"
        onPress={() => onValueChange(option.value)}
      />
    ))}
  </View>
);

export default ChoiceChips;

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
