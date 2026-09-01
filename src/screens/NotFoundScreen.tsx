import { useNavigation } from "@react-navigation/native";
import React from "react";

import { EmptyState } from "../components/EmptyState";
import { Screen } from "../components/Screen";

export function NotFoundScreen() {
  const navigation = useNavigation();
  return (
    <Screen>
      <EmptyState
        title="Não encontrado"
        message="A tela que você tentou abrir não existe."
        actionLabel="Voltar ao início"
        onAction={() => navigation.getParent()?.navigate("Tabs" as never)}
      />
    </Screen>
  );
}
