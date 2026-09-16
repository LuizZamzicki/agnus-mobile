import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FormBanner } from "../src/components/FormBanner";
import { SegmentedTabs } from "../src/components/SegmentedTabs";
import { LoginForm } from "../src/components/auth/LoginForm";
import { SignupForm } from "../src/components/auth/SignupForm";
import { useThemedStyles, type Theme } from "../src/theme";

type Mode = "login" | "signup";

export default function LoginScreen() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [prefillEmail, setPrefillEmail] = useState<string | undefined>();
  const [justRegistered, setJustRegistered] = useState(false);

  const finish = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
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

const makeStyles = ({ colors, typography, spacing }: Theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
    title: { ...typography.title },
    subtitle: { ...typography.caption, marginBottom: spacing.sm },
    tabs: { marginBottom: spacing.md },
    banner: { marginBottom: spacing.sm },
  });
