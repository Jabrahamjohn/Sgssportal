import api from "~/config/api";

export type Notification = {
  id: string;
  title: string;
  message: string;
  link?: string | null;
  is_read: boolean;
  created_at: string;
};

export const listNotifications = async (): Promise<Notification[]> => {
  const { data } = await api.get("notifications/");
  return Array.isArray(data) ? data : data.results || [];
};

export const markNotificationsRead = async (ids: string[]): Promise<void> => {
  await Promise.all(
    ids.map((id) => api.patch(`notifications/${id}/`, { is_read: true }))
  );
};
