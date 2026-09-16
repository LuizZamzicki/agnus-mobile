import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { z } from "zod";

import { Button } from "../../../src/components/Button";
import { FormBanner } from "../../../src/components/FormBanner";
import { TextField } from "../../../src/components/TextField";
import { useAuth } from "../../../src/contexts/AuthContext";
import { ApiError } from "../../../src/lib/api";
import { formatarCPF, validarCPF } from "../../../src/lib/cpf";
import { emailValido } from "../../../src/lib/email";
import { useThemedStyles, type Theme } from "../../../src/theme";

const schema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo."),
  email: z.string().refine(emailValido, "E-mail inválido."),
  cpf: z.string().refine(validarCPF, "CPF inválido."),
});

type ProfileValues = z.infer<typeof schema>;

export default function ProfileScreen() {
  const styles = useThemedStyles(makeStyles);
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

const makeStyles = ({ colors, spacing }: Theme) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, gap: spacing.md },
    submit: { marginTop: spacing.sm },
  });
