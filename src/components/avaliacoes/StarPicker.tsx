import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useTheme, useThemedStyles, type Theme } from "../../theme";

interface StarPickerProps {
  value: number;
  onChange: (nota: number) => void;
  size?: number;
}

/**
 * Nota de 0,5 a 5. Cada estrela tem duas metades tocáveis: a esquerda vale meia,
 * como no formulário do site.
 */
export function StarPicker({ value, onChange, size = 36 }: StarPickerProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const nota = Math.round(value * 2) / 2;

  return (
    <View style={styles.row} accessibilityRole="adjustable" accessibilityLabel="Nota">
      {[1, 2, 3, 4, 5].map((n) => {
        const name = nota >= n ? "star" : nota >= n - 0.5 ? "star-half" : "star-outline";
        return (
          <View key={n} style={{ width: size, height: size }}>
            <Ionicons name={name} size={size} color={colors.accent} />
            <View style={StyleSheet.absoluteFill}>
              <View style={styles.halves}>
                {[n - 0.5, n].map((opcao) => (
                  <Pressable
                    key={opcao}
                    style={styles.half}
                    onPress={() => onChange(opcao)}
                    accessibilityRole="button"
                    accessibilityLabel={`${String(opcao).replace(".", ",")} de 5 estrelas`}
                    accessibilityState={{ selected: opcao === nota }}
                  />
                ))}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const makeStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    row: { flexDirection: "row", gap: spacing.xs },
    halves: { flex: 1, flexDirection: "row" },
    half: { flex: 1 },
  });
