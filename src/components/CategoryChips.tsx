import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { colors, radius, spacing } from "../theme";
import type { Category } from "../types/product";

interface CategoryChipsProps {
  categories: Category[];
  selectedId?: number;
  onSelect: (id?: number) => void;
}

export function CategoryChips({ categories, selectedId, onSelect }: CategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <Chip label="Todas" active={selectedId === undefined} onPress={() => onSelect(undefined)} />
      {categories.map((cat) => (
        <Chip
          key={cat.id_categoria}
          label={cat.nome}
          active={selectedId === cat.id_categoria}
          onPress={() => onSelect(cat.id_categoria)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.sm, paddingVertical: spacing.xs, paddingRight: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.text },
  chipTextActive: { color: colors.primaryText, fontWeight: "600" },
});
