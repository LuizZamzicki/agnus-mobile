import React from "react";

import { EmptyState } from "../components/EmptyState";
import { Screen } from "../components/Screen";

export function HomeScreen() {
  return (
    <Screen>
      <EmptyState
        title="Início"
        message="Banner, mais vendidos e destaques do catálogo chegam na Fase 1."
      />
    </Screen>
  );
}
