import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { radius, spacing, useTheme } from "../theme";

type Tone = "error" | "success";

export function FormBanner({ tone, message }: { tone: Tone; message: string }) {
  const { colors, scheme } = useTheme();
  const dark = scheme === "dark";
  const tones: Record<Tone, { bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }> = {
    error: { bg: dark ? "#3a1f1d" : "#fdecea", fg: colors.danger, icon: "alert-circle" },
    success: { bg: dark ? "#1e2f1f" : "#e7f4e8", fg: colors.success, icon: "checkmark-circle" },
  };
  const t = tones[tone];
  return (
    <View style={[styles.wrap, { backgroundColor: t.bg }]}>
      <Ionicons name={t.icon} size={18} color={t.fg} />
      <Text style={[styles.text, { color: t.fg }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  text: { flex: 1, fontSize: 13 },
});
