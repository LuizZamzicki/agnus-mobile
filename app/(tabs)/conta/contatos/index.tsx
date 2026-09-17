import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import { deleteUserContact } from "../../../../src/actions/account";
import { Button } from "../../../../src/components/Button";
import { ConfirmDialog } from "../../../../src/components/ConfirmDialog";
import { EmptyState } from "../../../../src/components/EmptyState";
import { ErrorState } from "../../../../src/components/ErrorState";
import { FormBanner } from "../../../../src/components/FormBanner";
import { useContacts } from "../../../../src/hooks/contatos";
import { ApiError } from "../../../../src/lib/api";
import { useTheme, useThemedStyles, type Theme } from "../../../../src/theme";
import type { ContactType } from "../../../../src/types/account";

const TYPE_LABEL: Record<ContactType, string> = {
  telefone: "Telefone",
  celular: "Celular",
  email: "E-mail",
  outro: "Outro",
};

export default function ContactsScreen() {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const queryClient = useQueryClient();
  const contacts = useContacts();
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (toDelete === null) return;
    setDeleting(true);
    setBanner(null);
    try {
      await deleteUserContact(toDelete);
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : "Não foi possível excluir o contato.");
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  if (contacts.isError) {
    return <ErrorState error={contacts.error} onRetry={() => contacts.refetch()} />;
  }

  return (
    <View style={styles.container}>
      {banner ? (
        <View style={styles.banner}>
          <FormBanner tone="error" message={banner} />
        </View>
      ) : null}
      <FlatList
        data={contacts.data ?? []}
        keyExtractor={(item) => String(item.id_usuario_contato)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={contacts.isRefetching} onRefresh={() => contacts.refetch()} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.valor}</Text>
              <Text style={typography.caption}>
                {TYPE_LABEL[item.tipo] ?? item.tipo}
                {item.principal === true || item.principal === 1 ? " · principal" : ""}
              </Text>
            </View>
            <View style={styles.cardActions}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/conta/contatos/form",
                    params: { id: String(item.id_usuario_contato) },
                  })
                }
                hitSlop={6}
              >
                <Text style={styles.action}>Editar</Text>
              </Pressable>
              <Pressable onPress={() => setToDelete(item.id_usuario_contato)} hitSlop={6}>
                <Text style={[styles.action, styles.danger]}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          contacts.isPending ? (
            <EmptyState title="Carregando contatos" loading />
          ) : (
            <EmptyState
              title="Nenhum contato"
              message="Cadastre um telefone ou e-mail de contato."
            />
          )
        }
      />

      <View style={styles.footer}>
        <Button title="Adicionar contato" onPress={() => router.push("/conta/contatos/form")} />
      </View>

      <ConfirmDialog
        visible={toDelete !== null}
        title="Excluir contato?"
        confirmLabel="Excluir"
        destructive
        loading={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </View>
  );
}

const makeStyles = ({ colors, typography, spacing, radius }: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    banner: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
    list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.sm,
    },
    cardBody: { flex: 1, gap: 2 },
    cardTitle: { ...typography.body, fontWeight: "600" },
    cardActions: { flexDirection: "row", gap: spacing.md },
    action: { fontSize: 13, fontWeight: "600", color: colors.text },
    danger: { color: colors.danger },
    footer: {
      padding: spacing.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
  });
