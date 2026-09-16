import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "../../../../src/components/EmptyState";
import { ErrorState } from "../../../../src/components/ErrorState";
import { StatusBadge } from "../../../../src/components/StatusBadge";
import { useOrders } from "../../../../src/hooks/pedidos";
import { formatarData, formatarMoeda } from "../../../../src/lib/format";
import { useTheme, useThemedStyles, type Theme } from "../../../../src/theme";

export default function OrdersScreen() {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const orders = useOrders();

  if (orders.isError) {
    return <ErrorState error={orders.error} onRetry={() => orders.refetch()} />;
  }

  const sorted = [...(orders.data ?? [])].sort((a, b) => b.id_pedido - a.id_pedido);

  return (
    <FlatList
      style={styles.list}
      data={sorted}
      keyExtractor={(item) => String(item.id_pedido)}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={orders.isRefetching} onRefresh={() => orders.refetch()} />
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/conta/pedidos/[id_pedido]",
              params: { id_pedido: String(item.id_pedido) },
            })
          }
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Pedido #{item.id_pedido}</Text>
            <Text style={typography.price}>{formatarMoeda(item.valor_total)}</Text>
          </View>
          {item.data_criacao ? (
            <Text style={typography.caption}>{formatarData(item.data_criacao)}</Text>
          ) : null}
          <StatusBadge status={item.status} />
        </Pressable>
      )}
      ListEmptyComponent={
        orders.isPending ? (
          <EmptyState title="Carregando pedidos" loading />
        ) : (
          <EmptyState title="Nenhum pedido" message="Seus pedidos aparecerão aqui." />
        )
      }
    />
  );
}

const makeStyles = ({ colors, typography, spacing, radius }: Theme) =>
  StyleSheet.create({
    list: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
    card: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.xs,
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    cardTitle: { ...typography.body, fontWeight: "600" },
  });
