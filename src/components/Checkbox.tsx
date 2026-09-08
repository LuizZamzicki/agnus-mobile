import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

import { useTheme, useThemedStyles, type Theme } from "../theme";

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
}

export function Checkbox({ checked, onToggle, label }: CheckboxProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
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

const makeStyles = ({ colors, radius }: Theme) =>
  StyleSheet.create({
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
