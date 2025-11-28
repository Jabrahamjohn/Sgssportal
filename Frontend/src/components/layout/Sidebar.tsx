// Frontend/src/components/layout/Sidebar.tsx
import React, { useEffect, useState } from "react";
import { NavLink as RouterLink } from "react-router-dom";
import { useAuth } from "~/store/contexts/AuthContext";
import api from "~/config/api";

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
  const { auth } = useAuth();
  const [me, setMe] = useState<any>(null);

  const toggleSidebar = () => setCollapsed((p) => !p);

  useEffect(() => {
    api.get("auth/me/").then((res) => setMe(res.data));
  }, []);

  const isCommittee =
    me?.role?.toLowerCase() === "committee" ||
    me?.role?.toLowerCase() === "admin";

  const isAdmin = me?.role?.toLowerCase() === "admin";

  const navItem =
    "flex items-center gap-3 px-4 py-2.5 rounded-xl transition font-medium text-sm";
  const active = "bg-blue-600 text-white shadow-sm";
  const inactive = "text-gray-600 hover:bg-blue-50 hover:text-blue-700";

  // Menu sets
  const commonLinks = [
    { to: "/dashboard/member", icon: Home, label: "Dashboard" },
    { to: "/dashboard/member/claims", icon: FileText, label: "Claims" },
    { to: "/dashboard/member/chronic", icon: Pill, label: "Chronic Illness" },
  ];

  const committeeLinks = [
    { to: "/dashboard/committee", icon: Users, label: "Committee" },
  ];

  const adminLinks = [
    { to: "/dashboard/admin/settings", icon: Settings, label: "Settings" },
  ];

  const links = [
    ...commonLinks,
    ...(isCommittee ? committeeLinks : []),
    ...(isAdmin ? adminLinks : []),
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full flex flex-col justify-between bg-white/80 backdrop-blur-xl border-r border-gray-100 transition-all duration-300 ease-in-out shadow-sm ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div>
        <div className="sgss-sidebar bg-sgss-navy text-white w-full py-6 px-4 flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-lg font-bold text-white">SGSS</h2>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100 transition bg-white"
            title={collapsed ? "Expand menu" : "Collapse menu"}
          >
            {collapsed ? (
              <Menu className="w-5 h-5 text-gray-700" />
            ) : (
              <X className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="mt-4 flex flex-col gap-1 px-2">
          {links.map(({ to, icon: Icon, label }) => (
            <RouterLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${navItem} ${isActive ? active : inactive}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span>{label}</span>}
            </RouterLink>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <footer className="p-4 text-xs text-gray-400 border-t border-gray-100 text-center">
        {!collapsed ? (
          <>
            © {new Date().getFullYear()} SGSS <br />
            <span className="text-[11px] text-gray-300">Medical Fund</span>
          </>
        ) : (
          <span className="block text-[10px] text-gray-300">©SGSS</span>
        )}
      </footer>
    </aside>
  );
}
