import type { NotificationList } from "../types/notification";

import { request } from "../lib/api";

/** `GET /notifications/me` — não lidas de quem está logado, da mais nova à mais antiga. */
export function getMyNotifications(): Promise<NotificationList> {
  return request<NotificationList>("/notifications/me");
}

/** `PATCH /notifications/:id/read` (204). */
export async function markNotificationRead(id: number): Promise<void> {
  await request<void>(`/notifications/${id}/read`, { method: "PATCH" });
}

/** `PATCH /notifications/read-all` (204). */
export async function markAllNotificationsRead(): Promise<void> {
  await request<void>("/notifications/read-all", { method: "PATCH" });
}
