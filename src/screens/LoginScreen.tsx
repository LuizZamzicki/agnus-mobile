import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";

import { EmptyState } from "../components/EmptyState";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  return (
    <Screen>
      <EmptyState
        title="Entrar / Cadastrar"
        message="Abas de login e cadastro, força de senha, validação de CPF e deep-link de redirect chegam na Fase 2."
        actionLabel="Voltar"
        onAction={() => navigation.goBack()}
      />
    </Screen>
  );
}
