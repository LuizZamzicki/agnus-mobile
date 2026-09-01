import { zodResolver } from "@hookform/resolvers/zod";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { z } from "zod";

import { ApiError } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/Button";
import { FormBanner } from "../../components/FormBanner";
import { TextField } from "../../components/TextField";
import { formatarCPF, validarCPF } from "../../lib/cpf";
import { emailValido } from "../../lib/email";
import type { AccountStackParamList } from "../../navigation/types";
import { colors, spacing } from "../../theme";

const schema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo."),
  email: z.string().refine(emailValido, "E-mail inválido."),
  cpf: z.string().refine(validarCPF, "CPF inválido."),
});

type ProfileValues = z.infer<typeof schema>;

type Props = NativeStackScreenProps<AccountStackParamList, "Profile">;

export function ProfileScreen(_props: Props) {
  const { user, updateProfile } = useAuth();
  const [banner, setBanner] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: user?.nome ?? "",
      email: user?.email ?? "",
      cpf: user?.cpf ? formatarCPF(user.cpf) : "",
    },
  });

  const onSubmit = async (values: ProfileValues) => {
    setBanner(null);
    try {
      await updateProfile(values);
      setBanner({ tone: "success", message: "Dados atualizados." });
    } catch (err) {
      setBanner({
        tone: "error",
        message: err instanceof ApiError ? err.message : "Não foi possível salvar.",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {banner ? <FormBanner tone={banner.tone} message={banner.message} /> : null}

        <Controller
          control={control}
          name="nome"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Nome completo"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.nome?.message}
              autoCapitalize="words"
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="E-mail"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}
        />
        <Controller
          control={control}
          name="cpf"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="CPF"
              value={value}
              onChangeText={(t) => onChange(formatarCPF(t))}
              onBlur={onBlur}
              error={errors.cpf?.message}
              keyboardType="number-pad"
              maxLength={14}
            />
          )}
        />

        <Button
          title="Salvar alterações"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={!isDirty}
          style={styles.submit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  submit: { marginTop: spacing.sm },
});
