import { Stack } from "expo-router";
import React from "react";

import { NotificationBell } from "../../../src/components/notificacoes/NotificationBell";

export default function AccountStackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Conta", headerRight: () => <NotificationBell /> }}
      />
      <Stack.Screen name="perfil" options={{ title: "Meus dados" }} />
      <Stack.Screen name="senha" options={{ title: "Trocar senha" }} />
      <Stack.Screen name="enderecos/index" options={{ title: "Endereços" }} />
      <Stack.Screen name="enderecos/form" options={{ title: "Endereço" }} />
      <Stack.Screen name="contatos/index" options={{ title: "Contatos" }} />
      <Stack.Screen name="contatos/form" options={{ title: "Contato" }} />
      <Stack.Screen name="pedidos/index" options={{ title: "Meus pedidos" }} />
      <Stack.Screen name="pedidos/[id_pedido]" options={{ title: "Pedido" }} />
      <Stack.Screen name="notificacoes" options={{ title: "Notificações" }} />
      <Stack.Screen name="aparencia" options={{ title: "Aparência" }} />
    </Stack>
  );
}
