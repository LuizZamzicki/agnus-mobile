import { useRouter } from "expo-router";
import React from "react";

import { EmptyState } from "../src/components/EmptyState";
import { Screen } from "../src/components/layout/Screen";

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <Screen>
      <EmptyState
        title="Não encontrado"
        message="A tela que você tentou abrir não existe."
        actionLabel="Voltar ao início"
        onAction={() => router.replace("/")}
      />
    </Screen>
  );
}
