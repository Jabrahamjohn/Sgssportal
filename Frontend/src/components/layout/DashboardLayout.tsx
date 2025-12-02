// Frontend/src/components/layout/DashboardLayout.tsx

import React, { useEffect, useState } from "react";
import { NavLink as RouterLink, useLocation, useNavigate } from "react-router-dom";
import api from "~/config/api";
import NotificationBell from "../notifications/NotificationBell";
import { useAuth } from "~/store/contexts/AuthContext";

import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  ArrowLeftStartOnRectangleIcon,
  UsersIcon,
  FolderOpenIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<any>(null);
  const location = useLocation();
  const nav = useNavigate();
  const { logout: clearAuth } = useAuth();

  useEffect(() => {
    api.get("auth/me/")
      .then((res) => setMe(res.data))
      .catch(() => {});
  }, []);

  const logout = async () => {
    try {
      await api.post("auth/logout/");
    } catch (_e) {}

    clearAuth();
    document.cookie = "csrftoken=; expires=Thu, 01 Jan 1970; path=/;";
    nav("/login", { replace: true });
  };

  const role = me?.role?.toLowerCase();
  const isCommittee = role === "committee" || role === "admin";
  const isAdmin = role === "admin";

  // highlight based on route path
  const active = (path: string) => location.pathname.startsWith(path);
  console.log("Router context:", useLocation());


  return (
    <div className="flex h-screen bg-[var(--sgss-bg)]">

      {/* SIDEBAR */}
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
          
          {/* MEMBER MENU */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-300 mb-2">
              Member
            </p>

            <Nav to="/dashboard/member" icon={HomeIcon} label="Member Dashboard"
              active={active("/dashboard/member") && !active("/dashboard/member/claims")}
            />

            <Nav to="/dashboard/member/claims" icon={ClipboardDocumentListIcon}
              label="My Claims" active={active("/dashboard/member/claims")}
            />

            <Nav to="/dashboard/member/claims/new" icon={ShieldCheckIcon}
              label="New Claim" active={active("/dashboard/member/claims/new")}
            />

            <Nav to="/dashboard/member/chronic" icon={ShieldCheckIcon}
              label="Chronic Illness" active={active("/dashboard/member/chronic")}
            />

            <Nav to="/dashboard/member/profile" icon={UserCircleIcon}
              label="My Profile" active={active("/dashboard/member/profile")}
            />

            <Nav to="/dashboard/member/dependants" icon={UsersIcon}
              label="Dependants" active={active("/dashboard/member/dependants")}
            />
          </div>

          {/* COMMITTEE MENU */}
          {isCommittee && (
            <div>
              <div className="border-t border-white/10 my-3" />
              <p className="text-[10px] uppercase tracking-widest text-gray-300 mb-2">
                Committee
              </p>

              <Nav to="/dashboard/committee" icon={FolderOpenIcon}
                label="Committee Dashboard"
                active={active("/dashboard/committee") && !active("/dashboard/committee/claims")}
              />

              <Nav to="/dashboard/committee/claims" icon={ClipboardDocumentListIcon}
                label="All Claims" active={active("/dashboard/committee/claims")}
              />

              <Nav to="/dashboard/committee/claims?status=submitted"
                icon={ShieldCheckIcon}
                label="Pending Review"
                active={
                  active("/dashboard/committee/claims") &&
                  location.search.includes("status=submitted")
                }
              />

              <Nav to="/dashboard/committee/members" icon={UsersIcon}
                label="Members" active={active("/dashboard/committee/members")}
              />
            </div>
          )}

          {/* ADMIN MENU */}
          {isAdmin && (
            <div>
              <div className="border-t border-white/10 my-3" />
              <p className="text-[10px] uppercase tracking-widest text-gray-300 mb-2">
                Admin
              </p>

              <Nav to="/dashboard/admin" icon={HomeIcon}
                label="Admin Dashboard"
                active={active("/dashboard/admin") && !active("/dashboard/admin/settings")}
              />

              <Nav to="/dashboard/admin/users" icon={UsersIcon}
                label="Users & Roles"
                active={active("/dashboard/admin/users")}
              />

              <Nav to="/dashboard/admin/settings" icon={Cog6ToothIcon}
                label="System Settings"
                active={active("/dashboard/admin/settings")}
              />

              <Nav to="/dashboard/admin/audit" icon={ShieldCheckIcon}
                label="Audit Logs" active={active("/dashboard/admin/audit")}
              />
            </div>
          )}

        </nav>

        {/* LOGOUT */}
        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-medium"
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

        <div className="p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}


/* --------------------------------------------------
   CUSTOM <Nav /> WRAPPER — FIXES YOUR CRASH
-------------------------------------------------- */
function Nav({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  active: boolean;
}) {
  return (
    <RouterLink
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
        active
          ? "bg-white/10 border-l-4 border-[var(--sgss-gold)] text-[var(--sgss-gold)]"
          : "hover:bg-white/10 text-white"
      }`}
    >
      <Icon className="w-5 h-5 text-[var(--sgss-gold)]" />
      <span>{label}</span>
    </RouterLink>
  );
}
