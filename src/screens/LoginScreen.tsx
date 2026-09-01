import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FormBanner } from "../components/FormBanner";
import { SegmentedTabs } from "../components/SegmentedTabs";
import type { RootStackParamList } from "../navigation/types";
import { colors, spacing, typography } from "../theme";

import { LoginForm } from "./auth/LoginForm";
import { SignupForm } from "./auth/SignupForm";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;
type Mode = "login" | "signup";

export function LoginScreen({ navigation }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [prefillEmail, setPrefillEmail] = useState<string | undefined>();
  const [justRegistered, setJustRegistered] = useState(false);

  const finish = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate("Tabs");
  };

  const onRegistered = (email: string) => {
    setPrefillEmail(email);
    setJustRegistered(true);
    setMode("login");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Text style={styles.title}>
            {mode === "login" ? "Entrar na sua conta" : "Criar uma conta"}
          </Text>
          <Text style={styles.subtitle}>
            {mode === "login"
              ? "Use seu e-mail e senha para acessar o carrinho e seus pedidos."
              : "Leva menos de um minuto."}
          </Text>

          <View style={styles.tabs}>
            <SegmentedTabs
              options={[
                { value: "login", label: "Entrar" },
                { value: "signup", label: "Cadastrar" },
              ]}
              value={mode}
              onChange={(next) => {
                setMode(next);
                setJustRegistered(false);
              }}
            />
          </View>

          {justRegistered && mode === "login" ? (
            <View style={styles.banner}>
              <FormBanner tone="success" message="Conta criada! Agora é só entrar." />
            </View>
          ) : null}

          {mode === "login" ? (
            <LoginForm initialEmail={prefillEmail} onSuccess={finish} />
          ) : (
            <SignupForm onSuccess={onRegistered} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  title: { ...typography.title },
  subtitle: { ...typography.caption, marginBottom: spacing.sm },
  tabs: { marginBottom: spacing.md },
  banner: { marginBottom: spacing.sm },
});
