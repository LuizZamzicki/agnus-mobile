/** Linha de `notificacoes` (serviço de notificações). */
export interface Notification {
  id_notificacao: number;
  id_usuario: number;
  id_pedido: number;
  titulo: string;
  mensagem: string;
  lida: boolean;
  data_criacao: string | null;
}

/** `GET /notifications/me`: só as não lidas (até 30) e o total de não lidas. */
export interface NotificationList {
  data: Notification[];
  naoLidas: number;
}
