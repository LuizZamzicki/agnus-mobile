import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useLayoutEffect } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "../../../src/components/EmptyState";
import { ErrorState } from "../../../src/components/ErrorState";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../../../src/hooks/notificacoes";
import { useTheme, useThemedStyles, type Theme } from "../../../src/theme";
import type { Notification } from "../../../src/types/notification";

// Os títulos vêm de AVISOS_DE_STATUS, no serviço de pedidos. Título desconhecido fica com o sino.
const ICONES: Record<string, keyof typeof Ionicons.glyphMap> = {
  "Pedido aguardando pagamento": "time-outline",
  "Pagamento confirmado": "card-outline",
  "Pedido enviado": "cube-outline",
  "Pedido entregue": "checkmark-circle-outline",
  "Pedido cancelado": "close-circle-outline",
};

function dataCurta(data: string | null): string {
  if (!data) return "";
  const d = new Date(data);
  return Number.isNaN(d.getTime())
    ? ""
    : `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function NotificationsScreen() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const navigation = useNavigation();
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const { mutate: marcarTodas } = useMarkAllNotificationsRead();

  const lista = notifications.data?.data ?? [];
  const naoLidas = notifications.data?.naoLidas ?? 0;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        naoLidas > 0 ? (
          <Pressable onPress={() => marcarTodas()} hitSlop={8} accessibilityRole="button">
            <Text style={styles.headerAction}>Marcar todas</Text>
          </Pressable>
        ) : null,
    });
  }, [navigation, naoLidas, marcarTodas, styles.headerAction]);

  const abrir = (n: Notification) => {
    markRead.mutate(n.id_notificacao);
    router.push({
      pathname: "/conta/pedidos/[id_pedido]",
      params: { id_pedido: String(n.id_pedido) },
    });
  };

  if (notifications.isError && lista.length === 0) {
    return <ErrorState error={notifications.error} onRetry={() => notifications.refetch()} />;
  }

  return (
    <FlatList
      style={styles.list}
      data={lista}
      keyExtractor={(n) => String(n.id_notificacao)}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={notifications.isRefetching}
          onRefresh={() => notifications.refetch()}
        />
      }
      renderItem={({ item }) => <NotificationRow notification={item} onPress={() => abrir(item)} />}
      ListEmptyComponent={
        notifications.isPending ? (
          <EmptyState title="Carregando notificações" loading />
        ) : (
          <EmptyState
            title="Nenhuma notificação no momento"
            message="Quando o status de um pedido mudar, você fica sabendo aqui."
          />
        )
      }
    />
  );
}

function NotificationRow({
  notification,
  onPress,
}: {
  notification: Notification;
  onPress: () => void;
}) {
  const { colors, typography } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const icone = ICONES[notification.titulo] ?? "notifications-outline";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityHint="Abre o pedido e marca a notificação como lida"
    >
      <View style={styles.icon}>
        <Ionicons name={icone} size={20} color={colors.text} />
      </View>
      <View style={styles.texts}>
        <Text style={styles.title}>{notification.titulo}</Text>
        <Text style={typography.body}>{notification.mensagem}</Text>
        <Text style={typography.caption}>{dataCurta(notification.data_criacao)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const makeStyles = ({ colors, typography, spacing, radius }: Theme) =>
  StyleSheet.create({
    list: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, gap: spacing.sm, flexGrow: 1 },
    headerAction: { color: colors.text, fontWeight: "600", fontSize: 14 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    pressed: { opacity: 0.7 },
    icon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    texts: { flex: 1, gap: 2 },
    title: { ...typography.body, fontWeight: "600" },
  });
