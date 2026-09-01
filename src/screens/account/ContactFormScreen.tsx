import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useLayoutEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { z } from "zod";

import { createUserContact, updateUserContact } from "../../api/account";
import { ApiError } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/Button";
import { FormBanner } from "../../components/FormBanner";
import { SegmentedTabs } from "../../components/SegmentedTabs";
import { TextField } from "../../components/TextField";
import { useContacts } from "../../hooks/account";
import { emailValido } from "../../lib/email";
import type { AccountStackParamList } from "../../navigation/types";
import { colors, spacing, typography } from "../../theme";
import type { ContactType } from "../../types/account";

const schema = z
  .object({
    tipo: z.enum(["celular", "telefone", "email", "outro"]),
    valor: z.string().trim().min(1, "Informe o contato."),
    principal: z.boolean(),
  })
  .refine((data) => data.tipo !== "email" || emailValido(data.valor), {
    path: ["valor"],
    message: "E-mail inválido.",
  });

type ContactValues = z.infer<typeof schema>;

const TYPE_OPTIONS: { value: ContactType; label: string }[] = [
  { value: "celular", label: "Celular" },
  { value: "telefone", label: "Telefone" },
  { value: "email", label: "E-mail" },
  { value: "outro", label: "Outro" },
];

type Props = NativeStackScreenProps<AccountStackParamList, "ContactForm">;

export function ContactFormScreen({ route, navigation }: Props) {
  const editingId = route.params?.id;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const contacts = useContacts();
  const [banner, setBanner] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: editingId ? "Editar contato" : "Novo contato" });
  }, [navigation, editingId]);

  const editing = contacts.data?.find((c) => c.id_usuario_contato === editingId);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(schema),
    values: {
      tipo: editing?.tipo ?? "celular",
      valor: editing?.valor ?? "",
      principal: editing ? editing.principal === true || editing.principal === 1 : false,
    },
  });

  const onSubmit = async (data: ContactValues) => {
    if (!user) return;
    setBanner(null);
    try {
      if (editingId) await updateUserContact(editingId, data);
      else await createUserContact(user.id_usuario, data);
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
      navigation.goBack();
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : "Não foi possível salvar o contato.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {banner ? <FormBanner tone="error" message={banner} /> : null}

        <Controller
          control={control}
          name="tipo"
          render={({ field: { onChange, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Tipo</Text>
              <SegmentedTabs options={TYPE_OPTIONS} value={value} onChange={onChange} />
            </View>
          )}
        />

        <Controller
          control={control}
          name="valor"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Contato"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.valor?.message}
              keyboardType="default"
              autoCapitalize="none"
            />
          )}
        />

        <Controller
          control={control}
          name="principal"
          render={({ field: { onChange, value } }) => (
            <View style={styles.switchRow}>
              <Text style={typography.body}>Usar como contato principal</Text>
              <Switch value={value} onValueChange={onChange} />
            </View>
          )}
        />

        <Button
          title={editingId ? "Salvar alterações" : "Adicionar contato"}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          style={styles.submit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  field: { gap: 6 },
  label: { ...typography.caption, color: colors.text, fontWeight: "600" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  submit: { marginTop: spacing.sm },
});
