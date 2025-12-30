// src/components/notifications/NotificationBell.tsx
import { useEffect, useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import api from "~/config/api";
import { NavLink } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  message: string;
  link?: string | null;
  created_at: string;
  read: boolean;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("notifications/unread-count/");
      setUnread(res.data.unread || 0);
    } catch (_e) {
      // ignore
    }
  };

  // Fetch full list
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("notifications/");
      setItems(res.data.results || res.data);
    } catch (_e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Poll unread count
  useEffect(() => {
    fetchUnreadCount();
    const id = setInterval(fetchUnreadCount, 20000);
    return () => clearInterval(id);
  }, []);

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      fetchNotifications();
    }
  };

  const markOneRead = async (id: string) => {
    try {
      await api.post(`notifications/${id}/mark_read/`);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnread((u) => Math.max(0, u - 1));
    } catch (_e) {
      //ignore
    }
  };

  const markAllRead = async () => {
    try {
      await api.post("notifications/mark-read/");
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch (_e) {
      // ignore
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleOpen}
        className="relative rounded-full p-2 hover:bg-white/10 transition"
      >
        <BellIcon className="w-6 h-6" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 z-[999]">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h3 className="text-sm font-semibold">Notifications</h3>
            <button
              onClick={markAllRead}
              className="text-xs text-blue-600 hover:underline"
            >
              Mark all as read
            </button>
          </div>

          {loading ? (
            <div className="p-4 text-sm text-gray-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No notifications.</div>
          ) : (
            <ul className="divide-y text-sm">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={`relative hover:bg-gray-50 transition-colors ${
                    !n.read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex flex-col p-4 gap-1">
                    <div className="flex items-center justify-between gap-2 relative z-10">
                      <span className="font-semibold text-[13px]">{n.title}</span>
                      {!n.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            markOneRead(n.id);
                          }}
                          className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700 transition-colors"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-gray-400 mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>

                  {n.link && (
                    <NavLink
                      to={n.link}
                      onClick={() => setOpen(false)}
                      className="absolute inset-0 z-0"
                      aria-label="View details"
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
