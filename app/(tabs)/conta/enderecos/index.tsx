import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { deleteUserAddress, setMainAddress } from "../../../../src/actions/account";
import { Button } from "../../../../src/components/Button";
import { ConfirmDialog } from "../../../../src/components/ConfirmDialog";
import { EmptyState } from "../../../../src/components/EmptyState";
import { ErrorState } from "../../../../src/components/ErrorState";
import { FormBanner } from "../../../../src/components/FormBanner";
import { useAddresses } from "../../../../src/hooks/enderecos";
import { ApiError } from "../../../../src/lib/api";
import { useTheme, useThemedStyles, type Theme } from "../../../../src/theme";
import type { UserAddress } from "../../../../src/types/account";

export default function AddressesScreen() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const queryClient = useQueryClient();
  const addresses = useAddresses();
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [settingMainId, setSettingMainId] = useState<number | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (toDelete === null) return;
    setDeleting(true);
    setBanner(null);
    try {
      await deleteUserAddress(toDelete);
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : "Não foi possível excluir o endereço.");
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  const handleSetMain = async (id: number) => {
    setBanner(null);
    setSettingMainId(id);
    try {
      await setMainAddress(id);
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
    } catch (err) {
      setBanner(
        err instanceof ApiError
          ? err.message
          : "Não foi possível definir o endereço como principal.",
      );
    } finally {
      setSettingMainId(null);
    }
  };

  if (addresses.isError) {
    return <ErrorState error={addresses.error} onRetry={() => addresses.refetch()} />;
  }

  return (
    <View style={styles.container}>
      {banner ? (
        <View style={styles.banner}>
          <FormBanner tone="error" message={banner} />
        </View>
      ) : null}
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
            settingMain={settingMainId === item.id_usuario_endereco}
            onEdit={() =>
              router.push({
                pathname: "/conta/enderecos/form",
                params: { id: String(item.id_usuario_endereco) },
              })
            }
            onDelete={() => setToDelete(item.id_usuario_endereco)}
            onSetMain={() => handleSetMain(item.id_usuario_endereco)}
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
        <Button title="Adicionar endereço" onPress={() => router.push("/conta/enderecos/form")} />
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
  settingMain,
  onEdit,
  onDelete,
  onSetMain,
}: {
  address: UserAddress;
  settingMain: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetMain: () => void;
}) {
  const { colors, typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const linha1 = [address.logradouro, address.numero].filter(Boolean).join(", ");
  const linha2 = [address.bairro, [address.cidade, address.estado].filter(Boolean).join("/")]
    .filter(Boolean)
    .join(" · ");
  const isPrincipal = address.principal === true || address.principal === 1;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{linha1 || "Endereço"}</Text>
          {linha2 ? <Text style={typography.caption}>{linha2}</Text> : null}
          <Text style={typography.caption}>CEP {address.cep}</Text>
          {isPrincipal ? <Text style={styles.badge}>Principal</Text> : null}
        </View>
        <Pressable
          onPress={onSetMain}
          disabled={isPrincipal || settingMain}
          hitSlop={8}
          style={styles.mainButton}
          accessibilityRole="button"
          accessibilityLabel={isPrincipal ? "Endereço principal" : "Tornar endereço principal"}
        >
          {settingMain ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Ionicons
              name={isPrincipal ? "star" : "star-outline"}
              size={22}
              color={isPrincipal ? colors.accent : colors.textMuted}
            />
          )}
        </Pressable>
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

const makeStyles = ({ colors, typography, spacing, radius }: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    banner: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
    list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
    card: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.sm,
    },
    cardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
    cardBody: { flex: 1, gap: 2 },
    mainButton: { padding: spacing.xs },
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
