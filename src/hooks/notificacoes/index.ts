import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppState } from "react-native";

import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../actions/notifications";
import { useAuth } from "../../contexts/AuthContext";
import type { NotificationList } from "../../types/notification";

/** Mesmo intervalo do sino do site. */
const INTERVALO_MS = 60_000;

function useNotificationsKey() {
  const { user } = useAuth();
  return ["notifications", user?.id_usuario ?? 0] as const;
}

/**
 * Notificações não lidas. Atualiza a cada minuto com o app aberto e também ao
 * voltar para o app (o equivalente ao foco da janela no site).
 */
export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const queryKey = useNotificationsKey();

  const query = useQuery({
    queryKey,
    queryFn: getMyNotifications,
    enabled: isAuthenticated,
    refetchInterval: INTERVALO_MS,
    staleTime: 15_000,
  });

  const { refetch } = query;
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refetch();
    });
    return () => sub.remove();
  }, [isAuthenticated, refetch]);

  return query;
}

/**
 * Marca como lida e tira da lista na hora (otimista). Se a chamada falhar, a
 * próxima atualização traz a notificação de volta.
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const queryKey = useNotificationsKey();

  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: (id: number) => {
      queryClient.setQueryData<NotificationList>(queryKey, (atual) =>
        atual
          ? {
              data: atual.data.filter((n) => n.id_notificacao !== id),
              naoLidas: Math.max(0, atual.naoLidas - 1),
            }
          : atual,
      );
    },
    onError: () => queryClient.invalidateQueries({ queryKey }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const queryKey = useNotificationsKey();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: () => {
      queryClient.setQueryData<NotificationList>(queryKey, { data: [], naoLidas: 0 });
    },
    onError: () => queryClient.invalidateQueries({ queryKey }),
  });
}
