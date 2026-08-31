import React from "react";
import { RefreshControlProps, ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "../theme";

interface ScreenProps {
  children: React.ReactNode;
  /** Envolve o conteúdo num ScrollView. */
  scroll?: boolean;
  /** Remove o padding horizontal padrão. */
  flush?: boolean;
  contentContainerStyle?: ViewStyle;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export function Screen({
  children,
  scroll,
  flush,
  contentContainerStyle,
  refreshControl,
}: ScreenProps) {
  const padding = flush
    ? undefined
    : { paddingHorizontal: spacing.lg, paddingVertical: spacing.md };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {scroll ? (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[padding, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, padding, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  fill: { flex: 1 },
});
