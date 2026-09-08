import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useTheme, useThemedStyles, type Theme } from "../theme";

import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  message?: string;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, loading, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button title={actionLabel} onPress={onAction} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = ({ typography, spacing }: Theme) =>
  StyleSheet.create({
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
