import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { radius, useTheme } from "../theme";
import type { OrderStatus } from "../types/account";

const LABELS: Record<OrderStatus, string> = {
  aguardando_calculo_frete: "Calculando frete",
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { colors } = useTheme();
  const tone: Record<OrderStatus, string> = {
    aguardando_calculo_frete: colors.textMuted,
    aguardando_pagamento: colors.accent,
    pago: colors.success,
    enviado: colors.success,
    entregue: colors.success,
    cancelado: colors.danger,
  };
  const color = tone[status] ?? colors.textMuted;
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{LABELS[status] ?? status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  text: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 },
});
