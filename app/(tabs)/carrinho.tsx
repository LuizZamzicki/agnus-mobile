import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../src/components/Button";
import { CartItemRow } from "../../src/components/carrinho/CartItemRow";
import { ConfirmDialog } from "../../src/components/ConfirmDialog";
import { EmptyState } from "../../src/components/EmptyState";
import { ErrorState } from "../../src/components/ErrorState";
import { useAuth } from "../../src/contexts/AuthContext";
import { useCart } from "../../src/contexts/CartContext";
import { formatarMoeda, numeroSeguro } from "../../src/lib/format";
import { useTheme, useThemedStyles, type Theme } from "../../src/theme";

export default function CartScreen() {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const cart = useCart();

  const [toRemove, setToRemove] = useState<number | null>(null);

  // O checkout compra a sacola inteira, como no site: quem não quer uma peça, remove.
  const subtotal = cart.items.reduce(
    (total, item) =>
      total + numeroSeguro(item.subtotal, numeroSeguro(item.preco_unitario, 0) * item.quantidade),
    0,
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe} edges={["left", "right"]}>
        <EmptyState
          title="Seu carrinho espera por você"
          message="Entre para adicionar produtos e finalizar a compra."
          actionLabel="Entrar ou cadastrar"
          onAction={() => router.push("/login")}
        />
      </SafeAreaView>
    );
  }

  if (cart.isError) {
    return (
      <SafeAreaView style={styles.safe} edges={["left", "right"]}>
        <ErrorState onRetry={cart.refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => String(item.id_carrinho_item)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={cart.isLoading && cart.items.length > 0}
            onRefresh={cart.refetch}
          />
        }
        renderItem={({ item }) => (
          <CartItemRow
            item={item}
            disabled={cart.isMutating}
            onChangeQuantity={(qty) => cart.setQuantity(item.id_carrinho_item, qty)}
            onRemove={() => setToRemove(item.id_carrinho_item)}
          />
        )}
        ListEmptyComponent={
          cart.isLoading ? (
            <EmptyState title="Carregando carrinho" loading />
          ) : (
            <EmptyState
              title="Carrinho vazio"
              message="Explore o catálogo e adicione produtos."
              actionLabel="Ir ao catálogo"
              onAction={() => router.push("/catalogo")}
            />
          )
        }
      />

      {cart.items.length > 0 ? (
        <View style={styles.footer}>
          <View style={styles.summaryRow}>
            <Text style={typography.body}>
              Subtotal ({cart.count} {cart.count === 1 ? "peça" : "peças"})
            </Text>
            <Text style={typography.price}>{formatarMoeda(subtotal)}</Text>
          </View>
          <Button
            title="Finalizar compra"
            onPress={() => router.push("/checkout")}
            disabled={cart.isMutating}
          />
        </View>
      ) : null}

      <ConfirmDialog
        visible={toRemove !== null}
        title="Remover item?"
        message="Ele sai do seu carrinho."
        confirmLabel="Remover"
        destructive
        loading={cart.isMutating}
        onCancel={() => setToRemove(null)}
        onConfirm={async () => {
          if (toRemove !== null) await cart.removeItem(toRemove);
          setToRemove(null);
        }}
      />
    </SafeAreaView>
  );
}

const makeStyles = ({ colors, spacing }: Theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    list: { paddingHorizontal: spacing.lg, flexGrow: 1 },
    footer: {
      padding: spacing.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
      gap: spacing.sm,
    },
    summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  });
