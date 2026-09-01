import { useQueryClient } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useLayoutEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";

import { createUserAddress, updateUserAddress } from "../../api/account";
import { ApiError } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { AddressForm } from "../../components/AddressForm";
import { FormBanner } from "../../components/FormBanner";
import { useAddresses } from "../../hooks/account";
import { formatarCEP } from "../../lib/cep";
import type { AccountStackParamList } from "../../navigation/types";
import { colors, spacing } from "../../theme";
import type { AddressInput } from "../../types/account";

type Props = NativeStackScreenProps<AccountStackParamList, "AddressForm">;

export function AddressFormScreen({ route, navigation }: Props) {
  const editingId = route.params?.id;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const addresses = useAddresses();
  const [banner, setBanner] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: editingId ? "Editar endereço" : "Novo endereço" });
  }, [navigation, editingId]);

  const editing = addresses.data?.find((a) => a.id_usuario_endereco === editingId);

  const onSubmit = async (input: AddressInput) => {
    if (!user) return;
    setBanner(null);
    setSaving(true);
    try {
      if (editingId) await updateUserAddress(editingId, input);
      else await createUserAddress(user.id_usuario, input);
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      navigation.goBack();
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
                  estado: editing.estado ?? "",
                  principal: editing.principal === true || editing.principal === 1,
                }
              : undefined
          }
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
});
