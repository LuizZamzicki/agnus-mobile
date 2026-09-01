import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "../theme";

import { Button } from "./Button";

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/** Captura erros de render para não deixar o app numa tela branca. */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    if (__DEV__) console.error("ErrorBoundary:", error);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.title} accessibilityRole="header">
          Algo quebrou por aqui
        </Text>
        <Text style={styles.message}>
          Feche e abra o app de novo. Se continuar, avise o time de desenvolvimento.
        </Text>
        <Button title="Tentar novamente" onPress={() => this.setState({ error: null })} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  title: { ...typography.title, textAlign: "center" },
  message: { ...typography.body, color: colors.textMuted, textAlign: "center" },
});
