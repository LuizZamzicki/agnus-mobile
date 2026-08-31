import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";

import { EmptyState } from "../components/EmptyState";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Product">;

export function ProductScreen({ route }: Props) {
  return (
    <Screen>
      <EmptyState
        title={`Produto #${route.params.id}`}
        message="Carrossel, cor/tamanho, avaliações e 'Adicionar ao carrinho' chegam na Fase 1."
      />
    </Screen>
  );
}
