import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { StyleSheet, Switch, Text, View } from "react-native";
import { z } from "zod";

import { useMunicipios } from "../hooks/localidades";
import { cepValido, formatarCEP } from "../lib/cep";
import { UFS, filtrarMunicipios, municipioExato, ufValida } from "../lib/localidade";
import { spacing, useTheme } from "../theme";
import type { AddressInput } from "../types/account";

import { Autocomplete } from "./Autocomplete";
import { Button } from "./Button";
import { Select } from "./Select";
import { TextField } from "./TextField";

const schema = z.object({
  cep: z.string().refine(cepValido, "CEP inválido."),
  logradouro: z.string().trim().min(3, "Informe o logradouro."),
  numero: z.string().trim().optional(),
  complemento: z.string().trim().optional(),
  bairro: z.string().trim().optional(),
  estado: z.string().refine(ufValida, "Selecione a UF."),
  cidade: z.string().trim().min(1, "Selecione a cidade."),
  principal: z.boolean(),
});

type AddressFormValues = z.infer<typeof schema>;

interface AddressFormProps {
  defaultValues?: Partial<AddressFormValues>;
  submitLabel?: string;
  submitting?: boolean;
  /** true quando é o primeiro endereço do usuário: entra como principal e trava o toggle. */
  firstAddress?: boolean;
  onSubmit: (input: AddressInput) => void | Promise<void>;
}

const UF_OPTIONS = UFS.map((u) => ({ label: `${u.sigla} — ${u.nome}`, value: u.sigla }));

export function AddressForm({
  defaultValues,
  submitLabel = "Salvar endereço",
  submitting,
  firstAddress,
  onSubmit,
}: AddressFormProps) {
  const { typography } = useTheme();
  const {
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      estado: "",
      cidade: "",
      principal: false,
      ...defaultValues,
    },
  });

  const estado = useWatch({ control, name: "estado" });
  const municipiosQuery = useMunicipios(estado);
  const municipios = useMemo(() => municipiosQuery.data ?? [], [municipiosQuery.data]);

  // Primeiro endereço: força "principal" (o valor pode chegar depois da query de endereços).
  useEffect(() => {
    if (firstAddress) setValue("principal", true);
  }, [firstAddress, setValue]);

  // Trocar a UF invalida a cidade escolhida — mas não no primeiro render nem ao abrir em edição.
  const ufAnterior = useRef(estado);
  useEffect(() => {
    if (ufAnterior.current !== estado) {
      if (ufAnterior.current) {
        setValue("cidade", "");
        clearErrors("cidade");
      }
      ufAnterior.current = estado;
    }
  }, [estado, setValue, clearErrors]);

  const filtrarCidades = useCallback(
    (query: string) => filtrarMunicipios(municipios, query, 5),
    [municipios],
  );

  const submit = handleSubmit((values) => {
    // Cidade tem que existir na lista da UF (quando a lista carregou).
    if (municipios.length > 0) {
      const canonica = municipioExato(municipios, values.cidade);
      if (!canonica) {
        setError("cidade", { message: "Cidade inválida. Escolha uma da lista." });
        return;
      }
      values.cidade = canonica;
    }
    onSubmit({
      cep: values.cep,
      logradouro: values.logradouro,
      numero: values.numero || undefined,
      complemento: values.complemento || undefined,
      bairro: values.bairro || undefined,
      cidade: values.cidade,
      estado: values.estado.toUpperCase(),
      principal: values.principal,
    });
  });

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
      <Controller
        control={control}
        name="estado"
        render={({ field: { onChange, value } }) => (
          <Select
            label="UF"
            value={value ?? ""}
            options={UF_OPTIONS}
            onChange={onChange}
            placeholder="Selecione o estado"
            error={errors.estado?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="cidade"
        render={({ field: { onChange, value } }) => (
          <Autocomplete
            label="Cidade"
            value={value ?? ""}
            disabled={!ufValida(estado)}
            loading={municipiosQuery.isFetching}
            error={errors.cidade?.message}
            hint={
              !ufValida(estado)
                ? "Selecione a UF primeiro"
                : municipiosQuery.isError
                  ? "Não foi possível carregar as cidades — verifique a conexão"
                  : "Digite e escolha uma cidade da lista"
            }
            filter={filtrarCidades}
            onChangeText={(text) => {
              // Nome completo digitado corretamente já seleciona a cidade.
              const canonica = municipioExato(municipios, text);
              onChange(canonica ?? text);
              if (canonica) clearErrors("cidade");
            }}
            onSelect={(cidade) => {
              onChange(cidade);
              clearErrors("cidade");
            }}
          />
        )}
      />
      <Controller
        control={control}
        name="principal"
        render={({ field: { onChange, value } }) => (
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={typography.body}>Usar como endereço principal</Text>
              {firstAddress ? (
                <Text style={typography.caption}>
                  Seu primeiro endereço fica como principal automaticamente.
                </Text>
              ) : null}
            </View>
            <Switch value={value} onValueChange={onChange} disabled={firstAddress} />
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
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  switchText: { flex: 1, gap: 2 },
  submit: { marginTop: spacing.xs },
});
