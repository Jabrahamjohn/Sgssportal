// Frontend/src/components/layout/Sidebar.tsx
import React, { useEffect, useState } from "react";
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
import { useAuth } from "~/store/contexts/AuthContext";
import { api } from "~/config/api";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { auth } = useAuth();

  const toggleSidebar = () => setCollapsed((p) => !p);

  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    api.get("auth/me/").then((res) => setMe(res.data));
  }, []);

  const isCommittee =
    me?.role === "Committee" ||
    me?.groups?.includes("Committee") ||
    me?.groups?.includes("Admin") ||
    me?.is_superuser;


  const navItem =
    "flex items-center gap-3 px-4 py-2.5 rounded-xl transition font-medium text-sm";
  const active = "bg-blue-600 text-white shadow-sm";
  const inactive =
    "text-gray-600 hover:bg-blue-50 hover:text-blue-700";

  // 🧭 Menu based on role
  const commonLinks = [
    { to: "/dashboard/member", icon: <Home className="w-5 h-5" />, label: "Dashboard" },
    { to: "/dashboard/member/claims", icon: <FileText className="w-5 h-5" />, label: "Claims" },
    { to: "/dashboard/member/chronic", icon: <Pill className="w-5 h-5" />, label: "Chronic Illness" },
  ];

  const committeeLinks = [
    { to: "/dashboard/committee", icon: <Users className="w-5 h-5" />, label: "Committee" },
  ];

  const adminLinks = [
    { to: "/dashboard/admin/settings", icon: <Settings className="w-5 h-5" />, label: "Settings" },
  ];

  const links = [
    ...commonLinks,
    ...(auth?.role === "committee" || auth?.role === "admin" ? committeeLinks : []),
    ...(auth?.role === "admin" ? adminLinks : []),
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full flex flex-col justify-between bg-white/80 backdrop-blur-xl border-r border-gray-100 transition-all duration-300 ease-in-out shadow-sm ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2
            className={`text-lg font-bold text-gray-800 transition-all ${
              collapsed ? "hidden" : "block"
            }`}
          >
            SGSS
          </h2>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100 transition"
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
        <nav className="mt-6 flex flex-col gap-1">
          {links.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${navItem} ${isActive ? active : inactive}`
              }
              title={collapsed ? label : undefined}
            >
              {icon}
              {!collapsed && <span>{label}</span>}
            </NavLink>
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
