import { useQueryClient } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import { deleteUserContact } from "../../api/account";
import { Button } from "../../components/Button";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { useContacts } from "../../hooks/account";
import type { AccountStackParamList } from "../../navigation/types";
import { colors, radius, spacing, typography } from "../../theme";
import type { ContactType } from "../../types/account";

const TYPE_LABEL: Record<ContactType, string> = {
  telefone: "Telefone",
  celular: "Celular",
  email: "E-mail",
  outro: "Outro",
};

type Props = NativeStackScreenProps<AccountStackParamList, "Contacts">;

export function ContactsScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const contacts = useContacts();
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (toDelete === null) return;
    setDeleting(true);
    try {
      await deleteUserContact(toDelete);
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
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
                onPress={() => navigation.navigate("ContactForm", { id: item.id_usuario_contato })}
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
        <Button title="Adicionar contato" onPress={() => navigation.navigate("ContactForm")} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
