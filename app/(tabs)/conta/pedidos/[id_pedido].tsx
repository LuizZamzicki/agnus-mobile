import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { EmptyState } from "../../../../src/components/EmptyState";
import { ErrorState } from "../../../../src/components/ErrorState";
import { StatusBadge } from "../../../../src/components/StatusBadge";
import { useAddresses } from "../../../../src/hooks/enderecos";
import { useOrder, useOrderItems } from "../../../../src/hooks/pedidos";
import { formatarData, formatarMoeda, numeroSeguro } from "../../../../src/lib/format";
import { useTheme, useThemedStyles, type Theme } from "../../../../src/theme";

export default function OrderDetailScreen() {
  const { colors, typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { id_pedido: idParam } = useLocalSearchParams<{ id_pedido: string }>();
  const id_pedido = Number(idParam);
  const orderQuery = useOrder(id_pedido);
  const addresses = useAddresses();
  const items = useOrderItems(id_pedido);

  const order = orderQuery.data;
  // Como no site: só o pedido entregue libera a avaliação das peças.
  const entregue = order?.status === "entregue";
  const address = addresses.data?.find((a) => a.id_usuario_endereco === order?.id_usuario_endereco);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={items.isRefetching || orderQuery.isRefetching}
          onRefresh={() => {
            items.refetch();
            orderQuery.refetch();
          }}
        />
      }
    >
      {order ? (
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={typography.title}>Pedido #{order.id_pedido}</Text>
            <StatusBadge status={order.status} />
          </View>
          {order.data_criacao ? (
            <Text style={typography.caption}>Feito em {formatarData(order.data_criacao)}</Text>
          ) : null}
        </View>
      ) : null}

      {address ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entrega</Text>
          <Text style={typography.body}>
            {[address.logradouro, address.numero].filter(Boolean).join(", ")}
          </Text>
          <Text style={typography.caption}>
            {[address.bairro, [address.cidade, address.estado].filter(Boolean).join("/")]
              .filter(Boolean)
              .join(" · ")}
          </Text>
          <Text style={typography.caption}>CEP {address.cep}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Itens</Text>
        {items.isPending ? (
          <ActivityIndicator color={colors.primary} style={styles.loading} />
        ) : items.isError ? (
          <ErrorState error={items.error} onRetry={() => items.refetch()} />
        ) : (items.data ?? []).length === 0 ? (
          <EmptyState title="Sem itens" />
        ) : (
          <View style={styles.items}>
            {(items.data ?? []).map((item, index) => {
              const subtotal = numeroSeguro(
                item.subtotal,
                numeroSeguro(item.preco_unitario, 0) * item.quantidade,
              );
              const variantes = [item.cor?.nome, item.grade?.nome].filter(Boolean).join(" · ");
              return (
                <View
                  key={`${item.id_produto_cor}-${item.id_produto_grade}-${index}`}
                  style={styles.itemRow}
                >
                  <View style={styles.itemInfo}>
                    <Text style={typography.body} numberOfLines={1}>
                      {item.quantidade}× {item.produto?.nome ?? "Produto"}
                    </Text>
                    {variantes ? <Text style={typography.caption}>{variantes}</Text> : null}
                    {entregue && item.produto?.id_produto ? (
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: "/avaliar/[id_produto]",
                            params: { id_produto: String(item.produto?.id_produto) },
                          })
                        }
                        hitSlop={6}
                        accessibilityRole="button"
                        accessibilityLabel={`Avaliar ${item.produto.nome}`}
                      >
                        <Text style={styles.reviewLink}>Avaliar peça</Text>
                      </Pressable>
                    ) : null}
                  </View>
                  <Text style={typography.body}>{formatarMoeda(subtotal)}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {order ? (
        <View style={styles.totalRow}>
          <Text style={typography.heading}>Total</Text>
          <Text style={typography.price}>{formatarMoeda(order.valor_total)}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const makeStyles = ({ colors, typography, spacing, radius }: Theme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, gap: spacing.lg },
    section: { gap: spacing.xs },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    sectionTitle: { ...typography.heading },
    loading: { paddingVertical: spacing.lg },
    items: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.sm,
    },
    itemRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
    itemInfo: { flex: 1, gap: 2 },
    reviewLink: { color: colors.text, fontWeight: "600", fontSize: 13, marginTop: 2 },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingTop: spacing.md,
    },
  });
