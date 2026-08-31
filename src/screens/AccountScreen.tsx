import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Screen } from "../components/Screen";
import { useAuth } from "../auth/AuthContext";
import { spacing, typography } from "../theme";

export function AccountScreen() {
  const { user, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) {
    return (
      <Screen>
        <EmptyState
          title="Conta"
          message="Entre para ver seus dados, endereços, contatos e pedidos. Fluxo completo na Fase 2 e Fase 4."
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={typography.title}>Olá, {user?.nome?.split(" ")[0] ?? "cliente"}</Text>
      <Text style={typography.caption}>{user?.email}</Text>
      <View style={styles.spacer} />
      <Text style={typography.caption}>
        Meus dados, endereços, contatos, pedidos e troca de senha chegam na Fase 4.
      </Text>
      <View style={styles.spacer} />
      <Button title="Sair" variant="danger" onPress={signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  spacer: { height: spacing.lg },
});
