import { zodResolver } from "@hookform/resolvers/zod";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { TextInput, View } from "react-native";
import { z } from "zod";

import { ApiError } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/Button";
import { FormBanner } from "../../components/FormBanner";
import { PasswordField } from "../../components/PasswordField";
import { PasswordStrengthMeter } from "../../components/PasswordStrengthMeter";
import { TextField } from "../../components/TextField";
import { formatarCPF, validarCPF } from "../../lib/cpf";
import { emailValido } from "../../lib/email";
import { evaluatePasswordStrength } from "../../lib/passwordStrength";
import { spacing } from "../../theme";

const schema = z
  .object({
    nome: z.string().trim().min(3, "Informe seu nome completo."),
    email: z.string().refine(emailValido, "E-mail inválido."),
    cpf: z.string().refine(validarCPF, "CPF inválido."),
    senha: z
      .string()
      .refine((v) => evaluatePasswordStrength(v).isValid, "A senha não atende aos requisitos."),
    confirmar: z.string(),
  })
  .refine((data) => data.senha === data.confirmar, {
    path: ["confirmar"],
    message: "As senhas não conferem.",
  });

type SignupValues = z.infer<typeof schema>;

interface SignupFormProps {
  onSuccess: (email: string) => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const { signUp } = useAuth();
  const [banner, setBanner] = useState<string | null>(null);
  const emailRef = useRef<TextInput>(null);
  const cpfRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);
  const confirmarRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "", email: "", cpf: "", senha: "", confirmar: "" },
  });

  const onSubmit = async (values: SignupValues) => {
    setBanner(null);
    try {
      await signUp({
        nome: values.nome,
        email: values.email,
        cpf: values.cpf,
        senha: values.senha,
      });
      onSuccess(values.email.trim());
    } catch (err) {
      if (err instanceof ApiError) setBanner(err.message);
      else setBanner("Não foi possível criar a conta. Tente novamente.");
    }
  };

  return (
    <View style={styles.form}>
      {banner ? <FormBanner tone="error" message={banner} /> : null}

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
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            ref={emailRef}
            label="E-mail"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => cpfRef.current?.focus()}
          />
        )}
      />

      <Controller
        control={control}
        name="cpf"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            ref={cpfRef}
            label="CPF"
            value={value}
            onChangeText={(text) => onChange(formatarCPF(text))}
            onBlur={onBlur}
            error={errors.cpf?.message}
            keyboardType="number-pad"
            maxLength={14}
            returnKeyType="next"
            onSubmitEditing={() => senhaRef.current?.focus()}
          />
        )}
      />

      <Controller
        control={control}
        name="senha"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.passwordBlock}>
            <PasswordField
              ref={senhaRef}
              label="Senha"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.senha?.message}
              returnKeyType="next"
              onSubmitEditing={() => confirmarRef.current?.focus()}
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
            ref={confirmarRef}
            label="Confirmar senha"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.confirmar?.message}
            returnKeyType="go"
            onSubmitEditing={handleSubmit(onSubmit)}
          />
        )}
      />

      <Button
        title="Criar conta"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        style={styles.submit}
      />
    </View>
  );
}

const styles = {
  form: { gap: spacing.md },
  passwordBlock: { gap: 0 },
  submit: { marginTop: spacing.sm },
} as const;
