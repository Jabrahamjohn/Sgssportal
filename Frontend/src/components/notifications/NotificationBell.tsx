// frontend
import React, { useEffect, useState } from "react";
import api from "~/config/api";

export default function NotificationBell() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api.get("notifications/").then(res => setList(res.data));
  }, []);

  const unread = list.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-gray-200 rounded-full"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border rounded shadow-lg p-3 z-50">
          <h4 className="font-semibold mb-2">Notifications</h4>
          {list.map((n) => (
            <div key={n.id} className="border-b py-2">
              <p className="font-medium">{n.title}</p>
              <p className="text-sm text-gray-600">{n.message}</p>
              {n.link && (
                <a href={n.link} className="text-blue-600 text-sm">
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
