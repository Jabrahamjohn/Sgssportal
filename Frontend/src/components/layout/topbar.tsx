import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  listNotifications,
  markNotificationsRead,
  type Notification,
} from "~/server/services/notification.service";

export default function TopBar() {
  const [notifs, setNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    listNotifications().then(setNotifs);
  };

  const unread = notifs.filter((n) => !n.is_read).length;

  return (
    <div className="flex justify-end p-3 bg-white shadow">
      <div className="relative">
        <button
          className="relative"
          onClick={() => {
            const unreadIds = notifs.filter((n) => !n.is_read).map((n) => n.id);
            if (unreadIds.length)
              markNotificationsRead(unreadIds).then(refresh);
          }}
        >
          🔔
          {unread > 0 && (
            <span className="absolute text-xs bg-red-600 text-white rounded-full px-1 -top-1 -right-1">
              {unread}
            </span>
          )}
        </button>

        <div className="absolute right-0 mt-3 bg-white border rounded shadow w-80 z-50">
          {notifs.length === 0 && (
            <div className="p-3 text-gray-500 text-sm">No notifications</div>
          )}

          {notifs.map((n) => (
            <div key={n.id} className="p-3 border-b">
              <p className="font-medium">{n.title}</p>
              <p className="text-xs text-gray-500">{n.message}</p>
              {n.link && (
                <NavLink
                  to={n.link}
                  className="text-blue-600 text-sm underline"
                >
                  Open
                </NavLink>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
