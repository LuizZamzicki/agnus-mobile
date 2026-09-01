import { zodResolver } from "@hookform/resolvers/zod";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { z } from "zod";

import { changePassword } from "../../api/account";
import { ApiError } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/Button";
import { FormBanner } from "../../components/FormBanner";
import { PasswordField } from "../../components/PasswordField";
import { PasswordStrengthMeter } from "../../components/PasswordStrengthMeter";
import { evaluatePasswordStrength } from "../../lib/passwordStrength";
import type { AccountStackParamList } from "../../navigation/types";
import { colors, spacing } from "../../theme";

const schema = z
  .object({
    senhaAtual: z.string().min(1, "Informe a senha atual."),
    novaSenha: z
      .string()
      .refine((v) => evaluatePasswordStrength(v).isValid, "A senha não atende aos requisitos."),
    confirmar: z.string(),
  })
  .refine((data) => data.novaSenha === data.confirmar, {
    path: ["confirmar"],
    message: "As senhas não conferem.",
  })
  .refine((data) => data.novaSenha !== data.senhaAtual, {
    path: ["novaSenha"],
    message: "A nova senha deve ser diferente da atual.",
  });

type PasswordValues = z.infer<typeof schema>;

type Props = NativeStackScreenProps<AccountStackParamList, "ChangePassword">;

export function ChangePasswordScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [banner, setBanner] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { senhaAtual: "", novaSenha: "", confirmar: "" },
  });

  const onSubmit = async (values: PasswordValues) => {
    if (!user) return;
    setBanner(null);
    try {
      await changePassword(user.id_usuario, {
        senhaAtual: values.senhaAtual,
        novaSenha: values.novaSenha,
      });
      navigation.goBack();
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : "Não foi possível trocar a senha.");
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
          name="senhaAtual"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordField
              label="Senha atual"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.senhaAtual?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="novaSenha"
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <PasswordField
                label="Nova senha"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.novaSenha?.message}
              />
              <PasswordStrengthMeter password={value} />
            </View>
          )}
        />
        <Controller
          control={control}
          name="confirmar"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordField
              label="Confirmar nova senha"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirmar?.message}
            />
          )}
        />

        <Button
          title="Trocar senha"
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
  submit: { marginTop: spacing.sm },
});
