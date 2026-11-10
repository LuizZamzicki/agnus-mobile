import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../hooks/notificacoes";
import { useTheme, useThemedStyles, type Theme } from "../../theme";

/** Sino do cabeçalho com o total de não lidas. Abre a tela de notificações. */
export function NotificationBell() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data } = useNotifications();

  if (!isAuthenticated) return null;

  const naoLidas = data?.naoLidas ?? 0;

  return (
    <Pressable
      onPress={() => router.push("/conta/notificacoes")}
      hitSlop={8}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={naoLidas ? `Notificações, ${naoLidas} não lidas` : "Notificações"}
    >
      <Ionicons name="notifications-outline" size={22} color={colors.text} />
      {naoLidas > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{naoLidas > 99 ? "99+" : naoLidas}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const makeStyles = ({ colors, spacing }: Theme) =>
  StyleSheet.create({
    button: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
    badge: {
      position: "absolute",
      top: 0,
      right: spacing.sm,
      minWidth: 16,
      height: 16,
      paddingHorizontal: 4,
      borderRadius: 8,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeText: { color: colors.primaryText, fontSize: 10, fontWeight: "700" },
  });
