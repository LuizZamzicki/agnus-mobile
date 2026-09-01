import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../components/Button";
import type { RootStackParamList } from "../navigation/types";
import { colors, spacing, typography } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "OrderConfirmation">;

export function OrderConfirmationScreen({ route, navigation }: Props) {
  const { id_pedido } = route.params;

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Ionicons name="checkmark" size={40} color={colors.primaryText} />
        </View>
        <Text style={styles.title} accessibilityRole="header">
          Pedido #{id_pedido} criado
        </Text>
        <Text style={styles.message}>
          Status: <Text style={styles.status}>aguardando pagamento</Text>.{"\n"}
          Este app não processa pagamento — acompanhe o pedido em “Conta → Meus pedidos”.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="Ver meus pedidos"
          variant="secondary"
          onPress={() => navigation.navigate("Tabs", { screen: "Account" })}
        />
        <Button
          title="Voltar à loja"
          onPress={() => navigation.navigate("Tabs", { screen: "Home" })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...typography.title, textAlign: "center" },
  message: { ...typography.body, color: colors.textMuted, textAlign: "center", lineHeight: 21 },
  status: { color: colors.text, fontWeight: "600" },
  footer: { padding: spacing.lg, gap: spacing.sm },
});
