import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { corDeFundo } from "../lib/produtos";
import { colors, radius, spacing, typography } from "../theme";
import type { ProductColor } from "../types/product";

interface ColorPickerProps {
  colors: ProductColor[];
  selectedId?: number;
  onSelect: (color: ProductColor) => void;
}

export function ColorPicker({ colors: options, selectedId, onSelect }: ColorPickerProps) {
  const selected = options.find((c) => c.id_produto_cor === selectedId);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={typography.heading}>Cor</Text>
        {selected ? <Text style={styles.selectedName}>{selected.nome}</Text> : null}
      </View>
      <View style={styles.row}>
        {options.map((color) => {
          const active = color.id_produto_cor === selectedId;
          return (
            <Pressable
              key={color.id_produto_cor}
              onPress={() => onSelect(color)}
              accessibilityRole="button"
              accessibilityLabel={`Cor ${color.nome}`}
              accessibilityState={{ selected: active }}
              style={[styles.swatchWrap, active && styles.swatchWrapActive]}
            >
              <View style={[styles.swatch, { backgroundColor: corDeFundo(color) }]}>
                {active ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  header: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm },
  selectedName: { ...typography.caption },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  swatchWrap: {
    padding: 3,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: "transparent",
  },
  swatchWrapActive: { borderColor: colors.primary },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
});
