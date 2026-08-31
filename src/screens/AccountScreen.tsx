import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Screen } from "../components/Screen";
import type { RootStackParamList, TabsParamList } from "../navigation/types";
import { spacing, typography } from "../theme";

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabsParamList, "Account">,
  NativeStackNavigationProp<RootStackParamList>
>;

export function AccountScreen() {
  const navigation = useNavigation<Nav>();
  const { user, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) {
    return (
      <Screen>
        <EmptyState
          title="Você ainda não entrou"
          message="Entre para acompanhar pedidos, endereços e dados da sua conta."
          actionLabel="Entrar ou cadastrar"
          onAction={() => navigation.navigate("Login")}
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
        Meus dados, endereços, contatos, pedidos e troca de senha chegam na próxima fase.
      </Text>
      <View style={styles.spacer} />
      <Button title="Sair" variant="danger" onPress={signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  spacer: { height: spacing.lg },
});
