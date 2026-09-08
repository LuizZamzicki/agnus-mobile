import { useNavigation } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { MenuRow } from "../../components/MenuRow";
import { Screen } from "../../components/Screen";
import { formatarCPF } from "../../lib/cpf";
import type { AccountStackParamList, RootStackParamList } from "../../navigation/types";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

type Props = NativeStackScreenProps<AccountStackParamList, "AccountHome">;

export function AccountHomeScreen({ navigation }: Props) {
  const { typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <Screen>
        <EmptyState
          title="Você ainda não entrou"
          message="Entre para acompanhar pedidos, endereços e dados da sua conta."
          actionLabel="Entrar ou cadastrar"
          onAction={() => rootNavigation.navigate("Login")}
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
          onPress={() => navigation.navigate("Profile")}
        />
        <MenuRow
          icon="lock-closed-outline"
          label="Trocar senha"
          onPress={() => navigation.navigate("ChangePassword")}
        />
        <MenuRow
          icon="location-outline"
          label="Endereços"
          onPress={() => navigation.navigate("Addresses")}
        />
        <MenuRow
          icon="call-outline"
          label="Contatos"
          onPress={() => navigation.navigate("Contacts")}
        />
        <MenuRow
          icon="receipt-outline"
          label="Meus pedidos"
          onPress={() => navigation.navigate("Orders")}
        />
        <MenuRow
          icon="contrast-outline"
          label="Aparência"
          description="Tema claro, escuro ou do sistema"
          onPress={() => navigation.navigate("Appearance")}
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
