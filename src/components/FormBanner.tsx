import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../theme";

type Tone = "error" | "success";

const TONES: Record<Tone, { bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  error: { bg: "#fdecea", fg: colors.danger, icon: "alert-circle" },
  success: { bg: "#e7f4e8", fg: colors.success, icon: "checkmark-circle" },
};

export function FormBanner({ tone, message }: { tone: Tone; message: string }) {
  const t = TONES[tone];
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
