// Frontend/src/components/notifications/NotificationBell.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";

type Notification = {
  id: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
};

export default function NotificationBell() {
  const [list, setList] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    try {
      const res = await api.get<Notification[]>("notifications/");
      setList(res.data);
    } catch {
      setList([]);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unread = list.filter((n) => !n.read).length;

  const handleToggleOpen = async () => {
    const newOpen = !open;
    setOpen(newOpen);

    if (!newOpen) return;

    // When opening: mark all as read (backend) and update local state
    try {
      await api.post("notifications/mark_all_read/");
      setList((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error("Failed to mark notifications read", e);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggleOpen}
        className="relative p-2 hover:bg-gray-100 rounded-full"
      >
        <span role="img" aria-label="notifications">
          🔔
        </span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full px-1">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg p-3 z-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Notifications</h4>
            {loading && (
              <span className="text-xs text-gray-400">Refreshing…</span>
            )}
          </div>

          {list.length === 0 && (
            <p className="text-sm text-gray-500">No notifications.</p>
          )}

          {list.map((n) => (
            <div
              key={n.id}
              className={`border-b last:border-b-0 py-2 ${
                !n.read ? "bg-purple-50" : ""
              }`}
            >
              <p className="font-medium text-sm">{n.title}</p>
              <p className="text-xs text-gray-600">{n.message}</p>
              {n.link && (
                <a
                  href={n.link}
                  className="text-[var(--sgss-navy)] text-xs font-semibold mt-1 inline-block hover:text-[var(--sgss-gold)]"
                >
                  View →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
