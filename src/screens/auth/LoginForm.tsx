import { zodResolver } from "@hookform/resolvers/zod";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { TextInput, View } from "react-native";
import { z } from "zod";

import { useAuth } from "../../auth/AuthContext";
import { AdminNotAllowedError } from "../../auth/errors";
import { ApiError } from "../../api/client";
import { Button } from "../../components/Button";
import { FormBanner } from "../../components/FormBanner";
import { PasswordField } from "../../components/PasswordField";
import { TextField } from "../../components/TextField";
import { emailValido } from "../../lib/email";
import { spacing } from "../../theme";

const schema = z.object({
  email: z.string().refine(emailValido, "E-mail inválido."),
  senha: z.string().min(1, "Informe a senha."),
});

type LoginValues = z.infer<typeof schema>;

interface LoginFormProps {
  initialEmail?: string;
  onSuccess: () => void;
}

export function LoginForm({ initialEmail, onSuccess }: LoginFormProps) {
  const { signIn } = useAuth();
  const [banner, setBanner] = useState<string | null>(null);
  const senhaRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: initialEmail ?? "", senha: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setBanner(null);
    try {
      await signIn(values);
      onSuccess();
    } catch (err) {
      if (err instanceof AdminNotAllowedError) setBanner(err.message);
      else if (err instanceof ApiError) setBanner(err.message);
      else setBanner("Não foi possível entrar. Tente novamente.");
    }
  };

  return (
    <View style={styles.form}>
      {banner ? <FormBanner tone="error" message={banner} /> : null}

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
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => senhaRef.current?.focus()}
          />
        )}
      />

      <Controller
        control={control}
        name="senha"
        render={({ field: { onChange, onBlur, value } }) => (
          <PasswordField
            ref={senhaRef}
            label="Senha"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.senha?.message}
            returnKeyType="go"
            onSubmitEditing={handleSubmit(onSubmit)}
          />
        )}
      />

      <Button
        title="Entrar"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        style={styles.submit}
      />
    </View>
  );
}

const styles = {
  form: { gap: spacing.md },
  submit: { marginTop: spacing.sm },
} as const;
