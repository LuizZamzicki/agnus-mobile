import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "../../../src/components/Button";
import { EmptyState } from "../../../src/components/EmptyState";
import { MenuRow } from "../../../src/components/conta/MenuRow";
import { Screen } from "../../../src/components/layout/Screen";
import { useAuth } from "../../../src/contexts/AuthContext";
import { formatarCPF } from "../../../src/lib/cpf";
import { useTheme, useThemedStyles, type Theme } from "../../../src/theme";

export default function AccountHomeScreen() {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <Screen>
        <EmptyState
          title="Você ainda não entrou"
          message="Entre para acompanhar pedidos, endereços e dados da sua conta."
          actionLabel="Entrar ou cadastrar"
          onAction={() => router.push("/login")}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={typography.title} accessibilityRole="header">
          {user.nome}
        </Text>
        <Text style={typography.caption}>{user.email}</Text>
        {user.cpf ? <Text style={typography.caption}>CPF {formatarCPF(user.cpf)}</Text> : null}
      </View>

      <View style={styles.menu}>
        <MenuRow
          icon="person-outline"
          label="Meus dados"
          description="Nome, e-mail e CPF"
          onPress={() => router.push("/conta/perfil")}
        />
        <MenuRow
          icon="lock-closed-outline"
          label="Trocar senha"
          onPress={() => router.push("/conta/senha")}
        />
        <MenuRow
          icon="location-outline"
          label="Endereços"
          onPress={() => router.push("/conta/enderecos")}
        />
        <MenuRow
          icon="call-outline"
          label="Contatos"
          onPress={() => router.push("/conta/contatos")}
        />
        <MenuRow
          icon="receipt-outline"
          label="Meus pedidos"
          onPress={() => router.push("/conta/pedidos")}
        />
        <MenuRow
          icon="contrast-outline"
          label="Aparência"
          description="Tema claro, escuro ou do sistema"
          onPress={() => router.push("/conta/aparencia")}
        />
      </View>

      <Button title="Sair" variant="danger" onPress={signOut} style={styles.signOut} />
    </Screen>
  );
}

const makeStyles = ({ colors, spacing }: Theme) =>
  StyleSheet.create({
    header: { gap: 2, paddingBottom: spacing.md },
    menu: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
    signOut: { marginTop: spacing.xl },
  });
