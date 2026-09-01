import { useQuery } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createUserAddress, getUserAddresses } from "../api/account";
import { ApiError } from "../api/client";
import { createOrder, createOrderItem } from "../api/orders";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import { AddressForm } from "../components/AddressForm";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { FormBanner } from "../components/FormBanner";
import { formatarMoeda, numeroSeguro } from "../lib/format";
import type { RootStackParamList } from "../navigation/types";
import { colors, radius, spacing, typography } from "../theme";
import type { AddressInput, UserAddress } from "../types/account";

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

export function CheckoutScreen({ route, navigation }: Props) {
  const { itemIds } = route.params;
  const { user } = useAuth();
  const userId = user?.id_usuario ?? 0;
  const cart = useCart();

  const items = useMemo(
    () => cart.items.filter((item) => itemIds.includes(item.id_carrinho_item)),
    [cart.items, itemIds],
  );
  const total = items.reduce(
    (sum, item) =>
      sum + numeroSeguro(item.subtotal, numeroSeguro(item.preco_unitario, 0) * item.quantidade),
    0,
  );

  const addresses = useQuery({
    queryKey: ["addresses", userId],
    queryFn: () => getUserAddresses(userId),
    enabled: userId > 0,
  });

  const list = useMemo(() => addresses.data ?? [], [addresses.data]);
  const defaultAddressId = (list.find((a) => a.principal === true || a.principal === 1) ?? list[0])
    ?.id_usuario_endereco;

  const [pickedAddressId, setPickedAddressId] = useState<number>();
  const [formOpen, setFormOpen] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAddressId = pickedAddressId ?? defaultAddressId;
  const showForm = formOpen || (addresses.isSuccess && list.length === 0);

  const saveAddress = async (input: AddressInput) => {
    setError(null);
    setSavingAddress(true);
    try {
      const created = await createUserAddress(userId, input);
      await addresses.refetch();
      setPickedAddressId(created.id_usuario_endereco);
      setFormOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar o endereço.");
    } finally {
      setSavingAddress(false);
    }
  };

  const placeOrder = async () => {
    if (!selectedAddressId || items.length === 0) return;
    setError(null);
    setPlacing(true);
    try {
      const order = await createOrder({
        id_usuario: userId,
        id_usuario_endereco: selectedAddressId,
        valor_total: Number(total.toFixed(2)),
      });
      // Sequencial e não-transacional: se um item falhar, o carrinho é preservado.
      for (const item of items) {
        await createOrderItem({
          id_pedido: order.id_pedido,
          id_produto_cor: item.id_produto_cor,
          id_produto_grade: item.id_produto_grade,
          quantidade: item.quantidade,
        });
      }
      await cart.removeItems(items.map((item) => item.id_carrinho_item));
      navigation.replace("OrderConfirmation", { id_pedido: order.id_pedido });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? `Não foi possível concluir o pedido: ${err.message}. Seu carrinho foi mantido.`
          : "Não foi possível concluir o pedido. Seu carrinho foi mantido.",
      );
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
        <EmptyState
          title="Nada para finalizar"
          message="Volte ao carrinho e selecione os itens da compra."
          actionLabel="Voltar ao carrinho"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Endereço de entrega</Text>

        {addresses.isPending ? (
          <ActivityIndicator color={colors.primary} style={styles.loading} />
        ) : addresses.isError ? (
          <ErrorState error={addresses.error} onRetry={() => addresses.refetch()} />
        ) : showForm ? (
          <View style={styles.formWrap}>
            {list.length > 0 ? (
              <Pressable onPress={() => setFormOpen(false)}>
                <Text style={styles.link}>← Usar um endereço salvo</Text>
              </Pressable>
            ) : (
              <Text style={typography.caption}>
                Você ainda não tem endereços. Cadastre um para continuar.
              </Text>
            )}
            <AddressForm
              submitLabel="Usar este endereço"
              submitting={savingAddress}
              onSubmit={saveAddress}
            />
          </View>
        ) : (
          <View style={styles.addressList}>
            {list.map((address) => (
              <AddressOption
                key={address.id_usuario_endereco}
                address={address}
                selected={selectedAddressId === address.id_usuario_endereco}
                onSelect={() => setPickedAddressId(address.id_usuario_endereco)}
              />
            ))}
            <Pressable onPress={() => setFormOpen(true)}>
              <Text style={styles.link}>+ Adicionar outro endereço</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.sectionTitle}>Itens</Text>
        <View style={styles.items}>
          {items.map((item) => (
            <View key={item.id_carrinho_item} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.quantidade}× {item.produto?.nome ?? "Produto"}
              </Text>
              <Text style={styles.itemValue}>
                {formatarMoeda(
                  numeroSeguro(
                    item.subtotal,
                    numeroSeguro(item.preco_unitario, 0) * item.quantidade,
                  ),
                )}
              </Text>
            </View>
          ))}
        </View>

        {error ? <FormBanner tone="error" message={error} /> : null}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={typography.body}>Total (frete grátis)</Text>
          <Text style={typography.price}>{formatarMoeda(total)}</Text>
        </View>
        <Button
          title="Confirmar pedido"
          onPress={placeOrder}
          loading={placing}
          disabled={!selectedAddressId || showForm}
        />
        <Text style={styles.disclaimer}>
          O pedido nasce como “aguardando pagamento” — não há cobrança neste app.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function AddressOption({
  address,
  selected,
  onSelect,
}: {
  address: UserAddress;
  selected: boolean;
  onSelect: () => void;
}) {
  const linha1 = [address.logradouro, address.numero].filter(Boolean).join(", ");
  const linha2 = [address.bairro, [address.cidade, address.estado].filter(Boolean).join("/")]
    .filter(Boolean)
    .join(" · ");

  return (
    <Pressable
      onPress={onSelect}
      style={[styles.addressCard, selected && styles.addressCardActive]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View style={[styles.radio, selected && styles.radioActive]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <View style={styles.addressText}>
        <Text style={styles.addressLine1}>{linha1 || "Endereço"}</Text>
        {linha2 ? <Text style={typography.caption}>{linha2}</Text> : null}
        <Text style={typography.caption}>CEP {address.cep}</Text>
      </View>
      {address.principal === true || address.principal === 1 ? (
        <Text style={styles.badge}>Principal</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  sectionTitle: { ...typography.heading, marginTop: spacing.md },
  loading: { paddingVertical: spacing.xl },
  formWrap: { gap: spacing.sm },
  link: { color: colors.text, fontWeight: "600", fontSize: 13, paddingVertical: spacing.xs },
  addressList: { gap: spacing.sm },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  addressCardActive: { borderColor: colors.primary, backgroundColor: colors.background },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  addressText: { flex: 1, gap: 2 },
  addressLine1: { ...typography.body, fontWeight: "600" },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.accent,
    textTransform: "uppercase",
  },
  items: { gap: spacing.xs },
  itemRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  itemName: { ...typography.body, flex: 1, color: colors.textMuted },
  itemValue: { ...typography.body },
  footer: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  disclaimer: { ...typography.caption, textAlign: "center" },
});
