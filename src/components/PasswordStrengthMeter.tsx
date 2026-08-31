import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { evaluatePasswordStrength, type StrengthLabel } from "../lib/passwordStrength";
import { colors, radius, spacing } from "../theme";

const LABELS: Record<StrengthLabel, string> = {
  muito_fraca: "Muito fraca",
  fraca: "Fraca",
  media: "Média",
  forte: "Forte",
  muito_forte: "Muito forte",
};

const BAR_COLOR: Record<StrengthLabel, string> = {
  muito_fraca: colors.danger,
  fraca: colors.danger,
  media: colors.accent,
  forte: colors.success,
  muito_forte: colors.success,
};

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const result = evaluatePasswordStrength(password);
  const color = BAR_COLOR[result.label];

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${result.percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.label, { color }]}>{LABELS[result.label]}</Text>
      <View style={styles.checks}>
        {result.checks
          .filter((check) => check.id !== "longLength")
          .map((check) => (
            <View key={check.id} style={styles.checkRow}>
              <Ionicons
                name={check.passed ? "checkmark-circle" : "ellipse-outline"}
                size={14}
                color={check.passed ? colors.success : colors.textMuted}
              />
              <Text style={[styles.checkText, check.passed && styles.checkTextDone]}>
                {check.label}
              </Text>
            </View>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs, marginTop: spacing.xs },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: radius.pill },
  label: { fontSize: 12, fontWeight: "600" },
  checks: { gap: 2, marginTop: 2 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  checkText: { fontSize: 12, color: colors.textMuted },
  checkTextDone: { color: colors.text },
});
