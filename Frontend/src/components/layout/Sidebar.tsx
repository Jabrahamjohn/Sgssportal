import React from "react";
import { NavLink } from "react-router-dom";
import { Home, FileText, Pill, User2 } from "lucide-react";

const linkBase =
  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition";
const linkActive =
  "bg-blue-600 text-white shadow-sm";
const linkIdle =
  "text-gray-700 hover:bg-gray-100";

export default function Sidebar() {
  const items = [
    { to: "/dashboard/member", icon: Home, label: "Overview" },
    { to: "/dashboard/member/claims", icon: FileText, label: "My Claims" },
    { to: "/dashboard/member/chronic", icon: Pill, label: "Chronic Requests" },
    { to: "/dashboard/member/profile", icon: User2, label: "Profile" },
  ];

  return (
    <aside className="hidden md:block md:w-64 border-r border-gray-100 bg-white">
      <div className="px-4 py-4">
        <div className="text-xs font-semibold text-gray-500 px-2 mb-2">
          MEMBER MENU
        </div>
        <nav className="space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
              end={it.to === "/dashboard/member"}
            >
              <it.icon className="w-5 h-5" />
              <span>{it.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
