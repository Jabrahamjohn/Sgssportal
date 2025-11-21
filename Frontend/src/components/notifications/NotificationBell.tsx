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

  useEffect(() => {
    api
      .get("notifications/")
      .then((res) => setList(res.data))
      .catch(() => setList([]));
  }, []);

  const unread = list.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
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
        <div className="absolute right-0 mt-2 w-72 bg-white border rounded shadow-lg p-3 z-50">
          <h4 className="font-semibold mb-2">Notifications</h4>
          {list.length === 0 && (
            <p className="text-sm text-gray-500">No notifications.</p>
          )}
          {list.map((n) => (
            <div key={n.id} className="border-b last:border-b-0 py-2">
              <p className="font-medium text-sm">{n.title}</p>
              <p className="text-xs text-gray-600">{n.message}</p>
              {n.link && (
                <a
                  href={n.link}
                  className="text-blue-600 text-xs"
                  target="_blank"
                  rel="noreferrer"
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
