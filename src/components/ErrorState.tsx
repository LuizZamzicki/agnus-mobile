import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { ApiError } from "../api/client";
import { colors, spacing, typography } from "../theme";

import { Button } from "./Button";

interface ErrorStateProps {
  error?: unknown;
  onRetry?: () => void;
  title?: string;
}

function messageFor(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return "Sem conexão com o servidor. Verifique sua internet e a API.";
    if (error.status === 404) return "Não encontramos o que você procura.";
    if (error.status >= 500) return "O servidor teve um problema. Tente de novo em instantes.";
    return error.message;
  }
  return "Algo deu errado ao carregar. Tente novamente.";
}

export function ErrorState({ error, onRetry, title = "Não deu para carregar" }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{messageFor(error)}</Text>
      {onRetry ? (
        <View style={styles.action}>
          <Button title="Tentar de novo" onPress={onRetry} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: { ...typography.heading, textAlign: "center" },
  message: { ...typography.caption, textAlign: "center" },
  action: { marginTop: spacing.md },
});
