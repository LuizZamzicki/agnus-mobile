import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme";

interface RatingProps {
  /** Média de 0 a 5. */
  value: number;
  /** Nº de avaliações (opcional). */
  count?: number;
  size?: number;
  showValue?: boolean;
}

export function Rating({ value, count, size = 16, showValue = true }: RatingProps) {
  const rounded = Math.round(value * 2) / 2;

  return (
    <View style={styles.row} accessibilityLabel={`Nota ${value.toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const name = rounded >= i ? "star" : rounded >= i - 0.5 ? "star-half" : "star-outline";
        return <Ionicons key={i} name={name} size={size} color={colors.accent} />;
      })}
      {showValue && value > 0 ? <Text style={styles.text}>{value.toFixed(1)}</Text> : null}
      {typeof count === "number" ? (
        <Text style={styles.text}>
          ({count}
          {count === 1 ? " avaliação" : " avaliações"})
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 2 },
  text: { marginLeft: 4, fontSize: 13, color: colors.textMuted },
});
