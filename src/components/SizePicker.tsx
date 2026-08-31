import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatarMoeda, numeroSeguro } from "../lib/format";
import { colors, radius, spacing, typography } from "../theme";
import type { ProductGrade } from "../types/product";

interface SizePickerProps {
  grades: ProductGrade[];
  selectedId?: number;
  onSelect: (grade: ProductGrade) => void;
}

export function SizePicker({ grades, selectedId, onSelect }: SizePickerProps) {
  return (
    <View style={styles.wrap}>
      <Text style={typography.heading}>Tamanho</Text>
      <View style={styles.row}>
        {grades.map((grade) => {
          const active = grade.id_produto_grade === selectedId;
          const acrescimo = numeroSeguro(grade.acrescimo, 0);
          return (
            <Pressable
              key={grade.id_produto_grade}
              onPress={() => onSelect(grade)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.pill, active && styles.pillActive]}
            >
              <Text style={[styles.label, active && styles.labelActive]}>{grade.nome}</Text>
              {acrescimo > 0 ? (
                <Text style={[styles.extra, active && styles.labelActive]}>
                  +{formatarMoeda(acrescimo)}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  pill: {
    minWidth: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { fontSize: 14, color: colors.text, fontWeight: "600" },
  labelActive: { color: colors.primaryText },
  extra: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
