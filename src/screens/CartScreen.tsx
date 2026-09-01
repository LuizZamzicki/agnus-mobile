import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import { Button } from "../components/Button";
import { CartItemRow } from "../components/CartItemRow";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { formatarMoeda, numeroSeguro } from "../lib/format";
import type { RootStackParamList, TabsParamList } from "../navigation/types";
import { colors, spacing, typography } from "../theme";

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabsParamList, "Cart">,
  NativeStackNavigationProp<RootStackParamList>
>;

export function CartScreen() {
  const navigation = useNavigation<Nav>();
  const { isAuthenticated } = useAuth();
  const cart = useCart();

  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [toRemove, setToRemove] = useState<number | null>(null);

  const isSelected = (id: number) => selected[id] ?? true;
  const toggle = (id: number) => setSelected((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));

  const selectedItems = useMemo(
    () => cart.items.filter((item) => selected[item.id_carrinho_item] ?? true),
    [cart.items, selected],
  );
  const subtotal = selectedItems.reduce(
    (total, item) =>
      total + numeroSeguro(item.subtotal, numeroSeguro(item.preco_unitario, 0) * item.quantidade),
    0,
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <EmptyState
          title="Seu carrinho espera por você"
          message="Entre para adicionar produtos e finalizar a compra."
          actionLabel="Entrar ou cadastrar"
          onAction={() => navigation.navigate("Login")}
        />
      </SafeAreaView>
    );
  }

  if (cart.isError) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ErrorState onRetry={cart.refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
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
            selected={isSelected(item.id_carrinho_item)}
            disabled={cart.isMutating}
            onToggleSelected={() => toggle(item.id_carrinho_item)}
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
              onAction={() => navigation.navigate("Catalog")}
            />
          )
        }
      />

      {cart.items.length > 0 ? (
        <View style={styles.footer}>
          <View style={styles.summaryRow}>
            <Text style={typography.body}>
              Subtotal ({selectedItems.length} {selectedItems.length === 1 ? "item" : "itens"})
            </Text>
            <Text style={typography.price}>{formatarMoeda(subtotal)}</Text>
          </View>
          <Button
            title="Finalizar compra"
            onPress={() =>
              navigation.navigate("Checkout", {
                itemIds: selectedItems.map((item) => item.id_carrinho_item),
              })
            }
            disabled={selectedItems.length === 0 || cart.isMutating}
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

const styles = StyleSheet.create({
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
