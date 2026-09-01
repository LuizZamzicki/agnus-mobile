import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius } from "../theme";

interface QtyStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QtyStepper({ value, onChange, min = 1, max = 99, disabled }: QtyStepperProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <Step icon="remove" onPress={dec} disabled={disabled || value <= min} label="Diminuir" />
      <Text style={styles.value}>{value}</Text>
      <Step icon="add" onPress={inc} disabled={disabled || value >= max} label="Aumentar" />
    </View>
  );
}

function Step({
  icon,
  onPress,
  disabled,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.step, pressed && !disabled && styles.pressed]}
    >
      <Ionicons name={icon} size={16} color={disabled ? colors.textMuted : colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  disabled: { opacity: 0.6 },
  step: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  pressed: { backgroundColor: colors.surfaceAlt },
  value: { minWidth: 28, textAlign: "center", fontSize: 15, fontWeight: "600", color: colors.text },
});
