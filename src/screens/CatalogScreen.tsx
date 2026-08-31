import React from "react";

import { EmptyState } from "../components/EmptyState";
import { Screen } from "../components/Screen";

export function CatalogScreen() {
  return (
    <Screen>
      <EmptyState
        title="Catálogo"
        message="Grade de produtos, filtro por categoria e busca chegam na Fase 1."
      />
    </Screen>
  );
}
