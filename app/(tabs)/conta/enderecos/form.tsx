import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useLayoutEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";

import { createUserAddress, updateUserAddress } from "../../../../src/actions/account";
import { AddressForm } from "../../../../src/components/conta/AddressForm";
import { FormBanner } from "../../../../src/components/FormBanner";
import { useAuth } from "../../../../src/contexts/AuthContext";
import { useAddresses } from "../../../../src/hooks/enderecos";
import { ApiError } from "../../../../src/lib/api";
import { formatarCEP } from "../../../../src/lib/cep";
import { useThemedStyles, type Theme } from "../../../../src/theme";
import type { AddressInput } from "../../../../src/types/account";

export default function AddressFormScreen() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editingId = id ? Number(id) : undefined;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const addresses = useAddresses();
  const [banner, setBanner] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: editingId ? "Editar endereço" : "Novo endereço" });
  }, [navigation, editingId]);

  const editing = addresses.data?.find((a) => a.id_usuario_endereco === editingId);
  const isFirstAddress = !editingId && !addresses.isPending && (addresses.data?.length ?? 0) === 0;

  const onSubmit = async (input: AddressInput) => {
    if (!user) return;
    setBanner(null);
    setSaving(true);
    try {
      if (editingId) await updateUserAddress(editingId, input);
      else await createUserAddress(user.id_usuario, input);
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      router.back();
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : "Não foi possível salvar o endereço.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {banner ? <FormBanner tone="error" message={banner} /> : null}
        <AddressForm
          key={editing?.id_usuario_endereco ?? "new"}
          submitLabel={editingId ? "Salvar alterações" : "Adicionar endereço"}
          submitting={saving}
          firstAddress={isFirstAddress}
          onSubmit={onSubmit}
          defaultValues={
            editing
              ? {
                  cep: formatarCEP(editing.cep),
                  logradouro: editing.logradouro,
                  numero: editing.numero ?? "",
                  complemento: editing.complemento ?? "",
                  bairro: editing.bairro ?? "",
                  cidade: editing.cidade ?? "",
                  estado: (editing.estado ?? "").toUpperCase(),
                  principal: editing.principal === true || editing.principal === 1,
                }
              : { principal: isFirstAddress }
          }
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = ({ colors, spacing }: Theme) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, gap: spacing.md },
  });
