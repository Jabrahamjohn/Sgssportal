import api from "~/config/api";

export const listNotifications = async () => {
  const res = await api.get("notifications/");
  return res.data.results || res.data;
};

export const markNotificationsRead = async () => {
  return api.post("notifications/mark-read/");
};
