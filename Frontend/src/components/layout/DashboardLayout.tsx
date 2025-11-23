// Frontend/src/components/layout/DashboardLayout.tsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "~/config/api";
import NotificationBell from "../notifications/NotificationBell";

import {
  HomeIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function DashboardLayout({ children }: any) {
  const [me, setMe] = useState<any>(null);
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api
      .get("auth/me/")
      .then((res) => setMe(res.data))
      .catch(() => setMe(null));
  }, []);

  const logout = async () => {
    try {
      await api.post("auth/logout/");
    } catch (e) {
      console.warn("Logout failed", e);
    } finally {
      location.href = "/login";
    }
  };

  const isCommittee = me?.groups?.includes("Committee") || me?.is_superuser;
  const isAdmin = me?.groups?.includes("Admin") || me?.is_superuser;

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex h-screen bg-[var(--sgss-bg)]">
      {/* ====================== SIDEBAR ====================== */}
      <aside className="w-64 bg-[var(--sgss-navy)] text-white flex flex-col shadow-xl">
        {/* Logo + user */}
        <div className="px-5 py-6 border-b border-white/10">
          <h1 className="text-2xl font-bold tracking-wide">
            SGSS <span className="text-[var(--sgss-gold)]">Fund</span>
          </h1>
          {me && (
            <p className="text-xs text-gray-200 mt-2 leading-snug">
              Logged in as{" "}
              <span className="font-semibold">{me.full_name}</span>
              <span className="ml-1 text-[var(--sgss-gold)]">
                ({me.role || "Member"})
              </span>
            </p>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 overflow-auto space-y-5 sgss-sidebar">
          {/* MEMBER SECTION */}
          <div>
            <p className="uppercase text-[10px] tracking-[0.15em] text-gray-300 mb-2">
              Member
            </p>
            <NavItem
              to="/dashboard/member"
              icon={HomeIcon}
              label="Member Dashboard"
              active={isActive("/dashboard/member") && !isActive("/dashboard/member/claims")}
            />
            <NavItem
              to="/dashboard/member/claims"
              icon={ClipboardDocumentListIcon}
              label="My Claims"
              active={isActive("/dashboard/member/claims") && !isActive("/dashboard/member/claims/new")}
            />
            <NavItem
              to="/dashboard/member/claims/new"
              icon={ShieldCheckIcon}
              label="New Claim"
              active={isActive("/dashboard/member/claims/new")}
            />
          </div>

          {/* COMMITTEE SECTION */}
          {isCommittee && (
            <div>
              <div className="border-b border-white/10 my-3" />
              <p className="uppercase text-[10px] tracking-[0.15em] text-gray-300 mb-2">
                Committee
              </p>
              <NavItem
                to="/dashboard/committee"
                icon={ClipboardDocumentListIcon}
                label="Committee Dashboard"
                active={isActive("/dashboard/committee")}
              />
            </div>
          )}

          {/* ADMIN SECTION */}
          {isAdmin && (
            <div>
              <div className="border-b border-white/10 my-3" />
              <p className="uppercase text-[10px] tracking-[0.15em] text-gray-300 mb-2">
                Admin
              </p>
              <NavItem
                to="/dashboard/admin"
                icon={UserCircleIcon}
                label="Admin Dashboard"
                active={isActive("/dashboard/admin")}
              />
              <NavItem
                to="/dashboard/admin/settings"
                icon={Cog6ToothIcon}
                label="System Settings"
                active={isActive("/dashboard/admin/settings")}
              />
            </div>
          )}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* ======================================================
          MAIN CONTENT + TOP BAR
      ====================================================== */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-[#03045f] via-[#082e68] to-[#caa631] text-white shadow-sm">
          <div className="text-sm font-medium">
            {me ? `Welcome, ${me.full_name}` : "SGSS Medical Fund Portal"}
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </div>

        {/* Page content */}
        <div className="p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

type NavItemProps = {
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  active?: boolean;
};

function NavItem({ to, icon: Icon, label, active }: NavItemProps) {
  return (
    <Link
      to={to}
      className={`sgss-sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
        active
          ? "bg-white/10 font-semibold border-l-4 border-[var(--sgss-gold)]"
          : "hover:bg-white/10"
      }`}
    >
      <Icon className="w-5 h-5 text-[var(--sgss-gold)]" />
      <span>{label}</span>
    </Link>
  );
}
