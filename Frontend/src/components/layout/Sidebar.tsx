import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  FileText,
  Pill,
  Settings,
  Users,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);

  const navItem =
    "flex items-center gap-3 px-4 py-2.5 rounded-xl transition font-medium text-sm";
  const active =
    "bg-blue-600 text-white shadow-md";
  const inactive =
    "text-gray-600 hover:bg-blue-50 hover:text-blue-700";

  return (
    <aside
      className={`h-screen fixed left-0 top-0 flex flex-col justify-between bg-white/80 backdrop-blur-xl border-r border-gray-100 transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2
            className={`text-lg font-bold text-gray-800 transition ${
              collapsed ? "hidden" : "block"
            }`}
          >
            SGSS
          </h2>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            {collapsed ? (
              <Menu className="w-5 h-5 text-gray-700" />
            ) : (
              <X className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-1">
          <NavLink
            to="/dashboard/member"
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : inactive}`
            }
          >
            <Home className="w-5 h-5" />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink
            to="/dashboard/member/claims"
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : inactive}`
            }
          >
            <FileText className="w-5 h-5" />
            {!collapsed && <span>Claims</span>}
          </NavLink>

          <NavLink
            to="/dashboard/member/chronic"
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : inactive}`
            }
          >
            <Pill className="w-5 h-5" />
            {!collapsed && <span>Chronic Illness</span>}
          </NavLink>

          <NavLink
            to="/dashboard/admin/settings"
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : inactive}`
            }
          >
            <Settings className="w-5 h-5" />
            {!collapsed && <span>Settings</span>}
          </NavLink>

          <NavLink
            to="/dashboard/committee"
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : inactive}`
            }
          >
            <Users className="w-5 h-5" />
            {!collapsed && <span>Committee</span>}
          </NavLink>
        </nav>
      </div>

      <footer className="p-4 text-xs text-gray-400 border-t border-gray-100 text-center">
        {!collapsed && "© 2025 SGSS Medical Fund"}
      </footer>
    </aside>
  );
}
