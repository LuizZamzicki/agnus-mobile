import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

import { colors, radius } from "../theme";

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
}

export function Checkbox({ checked, onToggle, label }: CheckboxProps) {
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={[styles.box, checked && styles.boxChecked]}
    >
      {checked ? <Ionicons name="checkmark" size={16} color={colors.primaryText} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
});
