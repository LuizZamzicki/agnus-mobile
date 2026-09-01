import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Switch, Text, View } from "react-native";
import { z } from "zod";

import { cepValido, formatarCEP } from "../lib/cep";
import { spacing, typography } from "../theme";
import type { AddressInput } from "../types/account";

import { Button } from "./Button";
import { TextField } from "./TextField";

const schema = z.object({
  cep: z.string().refine(cepValido, "CEP inválido."),
  logradouro: z.string().trim().min(3, "Informe o logradouro."),
  numero: z.string().trim().optional(),
  complemento: z.string().trim().optional(),
  bairro: z.string().trim().optional(),
  cidade: z.string().trim().optional(),
  estado: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || v.length === 2, "Use a sigla (2 letras)."),
  principal: z.boolean(),
});

type AddressFormValues = z.infer<typeof schema>;

interface AddressFormProps {
  defaultValues?: Partial<AddressFormValues>;
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: (input: AddressInput) => void | Promise<void>;
}

export function AddressForm({
  defaultValues,
  submitLabel = "Salvar endereço",
  submitting,
  onSubmit,
}: AddressFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      principal: false,
      ...defaultValues,
    },
  });

  const submit = handleSubmit((values) =>
    onSubmit({
      cep: values.cep,
      logradouro: values.logradouro,
      numero: values.numero || undefined,
      complemento: values.complemento || undefined,
      bairro: values.bairro || undefined,
      cidade: values.cidade || undefined,
      estado: values.estado ? values.estado.toUpperCase() : undefined,
      principal: values.principal,
    }),
  );

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="cep"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="CEP"
            value={value}
            onChangeText={(t) => onChange(formatarCEP(t))}
            onBlur={onBlur}
            error={errors.cep?.message}
            keyboardType="number-pad"
            maxLength={9}
          />
        )}
      />
      <Controller
        control={control}
        name="logradouro"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Logradouro"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.logradouro?.message}
          />
        )}
      />
      <View style={styles.row}>
        <View style={styles.rowItemSmall}>
          <Controller
            control={control}
            name="numero"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Número"
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="number-pad"
              />
            )}
          />
        </View>
        <View style={styles.rowItem}>
          <Controller
            control={control}
            name="complemento"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Complemento"
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
        </View>
      </View>
      <Controller
        control={control}
        name="bairro"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField label="Bairro" value={value ?? ""} onChangeText={onChange} onBlur={onBlur} />
        )}
      />
      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Controller
            control={control}
            name="cidade"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Cidade"
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
        </View>
        <View style={styles.rowItemSmall}>
          <Controller
            control={control}
            name="estado"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="UF"
                value={value ?? ""}
                onChangeText={(t) => onChange(t.toUpperCase())}
                onBlur={onBlur}
                error={errors.estado?.message}
                autoCapitalize="characters"
                maxLength={2}
              />
            )}
          />
        </View>
      </View>
      <Controller
        control={control}
        name="principal"
        render={({ field: { onChange, value } }) => (
          <View style={styles.switchRow}>
            <Text style={typography.body}>Usar como endereço principal</Text>
            <Switch value={value} onValueChange={onChange} />
          </View>
        )}
      />
      <Button title={submitLabel} onPress={submit} loading={submitting} style={styles.submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.sm },
  rowItem: { flex: 1 },
  rowItemSmall: { width: 100 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  submit: { marginTop: spacing.xs },
});
