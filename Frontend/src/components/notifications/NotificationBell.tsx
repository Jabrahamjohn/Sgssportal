// src/components/notifications/NotificationBell.tsx
import React, { useEffect, useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import api from "~/config/api";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("notifications/");
      setList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const unreadCount = list.filter(n => !n.read).length;

  const markAllRead = async () => {
    await api.post("notifications/mark-read/");
    setList(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markOneRead = async (id: string) => {
    await api.post(`notifications/${id}/mark_read/`);
    setList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="relative p-2 rounded-full hover:bg-white/20 transition"
      >
        <BellIcon className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-xs font-bold text-white rounded-full px-1.5 py-0.5">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-100 z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h4 className="text-sm font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto">
            {loading && <p className="p-3 text-sm text-gray-500">Loading...</p>}
            {!loading && list.length === 0 && (
              <p className="p-3 text-sm text-gray-500">No notifications yet.</p>
            )}
            {list.map(n => (
              <div
                key={n.id}
                onClick={() => markOneRead(n.id)}
                className={`p-3 text-sm border-b cursor-pointer hover:bg-gray-50 ${
                  n.read ? "text-gray-500" : "font-medium text-gray-900 bg-yellow-50"
                }`}
              >
                <div className="font-semibold">{n.title}</div>
                <div className="text-xs text-gray-600">{n.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
