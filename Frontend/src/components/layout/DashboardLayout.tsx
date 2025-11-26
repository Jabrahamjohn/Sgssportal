// Frontend/src/components/layout/DashboardLayout.tsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "~/config/api";
import NotificationBell from "../notifications/NotificationBell";
import { useAuth } from "~/store/contexts/AuthContext";

import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  UserCircleIcon,
  ArrowLeftStartOnRectangleIcon,
  UsersIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline";

export default function DashboardLayout({ children }) {
  const [me, setMe] = useState(null);
  const location = useLocation();
  const nav = useNavigate();
  const { logout: clearAuth } = useAuth();

  useEffect(() => {
    api.get("auth/me/").then((res) => setMe(res.data)).catch(() => {});
  }, []);

  const logout = async () => {
    try {
      await api.post("auth/logout/");
    } catch (err) {}

    clearAuth();
    document.cookie = "csrftoken=; expires=Thu, 01 Jan 1970;";
    nav("/login", { replace: true });
  };

  const isCommittee = me?.role === "committee" || me?.role === "admin";
  const isAdmin = me?.role === "admin";

  const active = (path) => location.pathname.startsWith(path);

  return (
    <div className="flex h-screen bg-[var(--sgss-bg)]">
      <aside className="w-64 bg-[var(--sgss-navy)] text-white flex flex-col shadow-xl">
        <div className="px-5 py-6 border-b border-white/10">
          <h1 className="text-2xl font-bold">
            SGSS <span className="text-[var(--sgss-gold)]">Fund</span>
          </h1>
          {me && (
            <p className="mt-2 text-[11px] text-gray-200">
              Logged in as <b>{me.full_name}</b>{" "}
              <span className="text-[var(--sgss-gold)]">({me.role})</span>
            </p>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 overflow-auto space-y-5">
          {/* MEMBER */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-300 mb-2">Member</p>

            <Nav to="/dashboard/member" icon={HomeIcon} active={active("/dashboard/member")} label="Member Dashboard" />
            <Nav to="/dashboard/member/claims" icon={ClipboardDocumentListIcon} active={active("/dashboard/member/claims")} label="My Claims" />
            <Nav to="/dashboard/member/claims/new" icon={ShieldCheckIcon} active={active("/dashboard/member/claims/new")} label="New Claim" />
            <Nav to="/dashboard/member/chronic" icon={ShieldCheckIcon} active={active("/dashboard/member/chronic")} label="Chronic Illness" />
            <Nav to="/dashboard/member/profile" icon={UserCircleIcon} active={active("/dashboard/member/profile")} label="My Profile" />
            <Nav to="/dashboard/member/dependants" icon={UsersIcon} active={active("/dashboard/member/dependants")} label="Dependants" />
          </div>

          {/* COMMITTEE */}
          {isCommittee && (
            <div>
              <div className="border-t border-white/10 my-3" />
              <p className="text-[10px] uppercase tracking-widest text-gray-300 mb-2">Committee</p>

              <Nav to="/dashboard/committee" icon={FolderOpenIcon} active={active("/dashboard/committee")} label="Committee Dashboard" />
              <Nav to="/dashboard/committee/claims" icon={ClipboardDocumentListIcon} active={active("/dashboard/committee/claims")} label="All Claims" />
              <Nav to="/dashboard/committee/pending" icon={ShieldCheckIcon} active={active("/dashboard/committee/pending")} label="Pending Review" />
              <Nav to="/dashboard/committee/members/applications" icon={UsersIcon} active={active("/dashboard/committee/members")} label="Membership Applications" />
              <Nav to="/dashboard/committee/settings" icon={Cog6ToothIcon} active={active("/dashboard/committee/settings")} label="Committee Settings" />
            </div>
          )}

          {/* ADMIN */}
          {isAdmin && (
            <div>
              <div className="border-t border-white/10 my-3" />
              <p className="text-[10px] uppercase tracking-widest text-gray-300 mb-2">Admin</p>

              <Nav to="/dashboard/admin" icon={HomeIcon} active={active("/dashboard/admin")} label="Admin Dashboard" />
              <Nav to="/dashboard/admin/settings" icon={Cog6ToothIcon} active={active("/dashboard/admin/settings")} label="System Settings" />
              <Nav to="/dashboard/admin/settings/memberships" icon={DocumentDuplicateIcon} active={active("/dashboard/admin/settings/memberships")} label="Membership Types" />
              <Nav to="/dashboard/admin/users" icon={UsersIcon} active={active("/dashboard/admin/users")} label="Users & Roles" />
              <Nav to="/dashboard/admin/audit" icon={ShieldCheckIcon} active={active("/dashboard/admin/audit")} label="Audit Logs" />
              <Nav to="/dashboard/admin/reports" icon={ClipboardDocumentListIcon} active={active("/dashboard/admin/reports")} label="Reports" />
            </div>
          )}
        </nav>

        {/* Logout Button */}
        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg"
          >
            <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-[#03045f] via-[#193c74] to-[#caa631] text-white">
          <div>{me ? `Welcome, ${me.full_name}` : "SGSS Medical Fund"}</div>
          <NotificationBell />
        </div>

        <div className="p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
}

function Nav({ to, icon: Icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
        active ? "bg-white/10 border-l-4 border-[var(--sgss-gold)] text-[var(--sgss-gold)]" : "hover:bg-white/10"
      }`}
    >
      <Icon className="w-5 h-5 text-[var(--sgss-gold)]" />
      <span>{label}</span>
    </Link>
  );
}
