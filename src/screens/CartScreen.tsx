import React from "react";

import { EmptyState } from "../components/EmptyState";
import { Screen } from "../components/Screen";

export function CartScreen() {
  return (
    <Screen>
      <EmptyState
        title="Carrinho"
        message="Itens, quantidade, subtotal e checkout chegam na Fase 3."
      />
    </Screen>
  );
}
