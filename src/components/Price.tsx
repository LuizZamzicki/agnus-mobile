import React from "react";
import { StyleSheet, Text, TextStyle } from "react-native";

import { formatarMoeda } from "../lib/format";
import { colors } from "../theme";

interface PriceProps {
  value: unknown;
  /** Prefixa com "a partir de" (produto com variações que somam acréscimo). */
  from?: boolean;
  style?: TextStyle;
}

export function Price({ value, from, style }: PriceProps) {
  return (
    <Text style={[styles.price, style]}>
      {from ? <Text style={styles.from}>a partir de </Text> : null}
      {formatarMoeda(value)}
    </Text>
  );
}

const styles = StyleSheet.create({
  price: { fontSize: 17, fontWeight: "700", color: colors.text },
  from: { fontSize: 12, fontWeight: "400", color: colors.textMuted },
});
