import { useQueryClient } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import { deleteUserAddress } from "../../api/account";
import { Button } from "../../components/Button";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { useAddresses } from "../../hooks/account";
import type { AccountStackParamList } from "../../navigation/types";
import { colors, radius, spacing, typography } from "../../theme";
import type { UserAddress } from "../../types/account";

type Props = NativeStackScreenProps<AccountStackParamList, "Addresses">;

export function AddressesScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const addresses = useAddresses();
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (toDelete === null) return;
    setDeleting(true);
    try {
      await deleteUserAddress(toDelete);
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  if (addresses.isError) {
    return <ErrorState error={addresses.error} onRetry={() => addresses.refetch()} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={addresses.data ?? []}
        keyExtractor={(item) => String(item.id_usuario_endereco)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={addresses.isRefetching}
            onRefresh={() => addresses.refetch()}
          />
        }
        renderItem={({ item }) => (
          <AddressCard
            address={item}
            onEdit={() => navigation.navigate("AddressForm", { id: item.id_usuario_endereco })}
            onDelete={() => setToDelete(item.id_usuario_endereco)}
          />
        )}
        ListEmptyComponent={
          addresses.isPending ? (
            <EmptyState title="Carregando endereços" loading />
          ) : (
            <EmptyState title="Nenhum endereço" message="Cadastre um endereço de entrega." />
          )
        }
      />

      <View style={styles.footer}>
        <Button title="Adicionar endereço" onPress={() => navigation.navigate("AddressForm")} />
      </View>

      <ConfirmDialog
        visible={toDelete !== null}
        title="Excluir endereço?"
        confirmLabel="Excluir"
        destructive
        loading={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </View>
  );
}

function AddressCard({
  address,
  onEdit,
  onDelete,
}: {
  address: UserAddress;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const linha1 = [address.logradouro, address.numero].filter(Boolean).join(", ");
  const linha2 = [address.bairro, [address.cidade, address.estado].filter(Boolean).join("/")]
    .filter(Boolean)
    .join(" · ");

  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{linha1 || "Endereço"}</Text>
        {linha2 ? <Text style={typography.caption}>{linha2}</Text> : null}
        <Text style={typography.caption}>CEP {address.cep}</Text>
        {address.principal === true || address.principal === 1 ? (
          <Text style={styles.badge}>Principal</Text>
        ) : null}
      </View>
      <View style={styles.cardActions}>
        <Pressable onPress={onEdit} hitSlop={6}>
          <Text style={styles.action}>Editar</Text>
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={6}>
          <Text style={[styles.action, styles.danger]}>Excluir</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardBody: { gap: 2 },
  cardTitle: { ...typography.body, fontWeight: "600" },
  badge: { fontSize: 11, fontWeight: "700", color: colors.accent, textTransform: "uppercase" },
  cardActions: { flexDirection: "row", gap: spacing.lg },
  action: { fontSize: 13, fontWeight: "600", color: colors.text },
  danger: { color: colors.danger },
  footer: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
