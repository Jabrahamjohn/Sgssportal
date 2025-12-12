// Frontend/src/components/layout/DashboardLayout.tsx

import React, { useEffect, useState } from "react";
import { NavLink as RouterLink, useLocation, useNavigate } from "react-router-dom";
import api from "~/config/api";
import NotificationBell from "../notifications/NotificationBell";
import { useAuth } from "~/store/contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  ArrowLeftStartOnRectangleIcon,
  UsersIcon,
  FolderOpenIcon,
  Cog6ToothIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile state
  const location = useLocation();
  const nav = useNavigate();
  const { logout: clearAuth } = useAuth();
  
  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

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

  const active = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex h-screen bg-[var(--sgss-bg)] font-sans antialiased overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 glass-sidebar text-white flex flex-col shadow-2xl transition-transform duration-300 transform 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="px-6 py-8 border-b border-white/10 relative overflow-hidden flex justify-between items-center">
          {/* Subtle gradient blobmp behind logo */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-[var(--sgss-gold)] opacity-20 blur-3xl rounded-full pointer-events-none"></div>

          <div className="relative z-10">
             <h1 className="text-3xl font-bold tracking-tight">
               SGSS <span className="text-[var(--sgss-gold)]">Fund</span>
             </h1>
             {me && (
               <p className="mt-2 text-xs text-gray-300 font-medium tracking-wide flex items-center gap-1.5 ">
                 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                 {me.full_name?.split(" ")[0]} <span className="text-white/40">|</span> <span className="text-[var(--sgss-gold)] uppercase">{me.role}</span>
               </p>
             )}
          </div>
          
          {/* Close Button Mobile */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-8 scrollbar-hide">
          
          {/* MEMBER MENU */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
              Personal
            </p>

            <Nav to="/dashboard/member" icon={HomeIcon} label="Dashboard"
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
              label="Profile" active={active("/dashboard/member/profile")}
            />

            <Nav to="/dashboard/member/dependants" icon={UsersIcon}
              label="Dependants" active={active("/dashboard/member/dependants")}
            />
          </div>

          {/* COMMITTEE MENU */}
          {isCommittee && (
            <div className="space-y-1">
              <div className="border-t border-white/5 my-4 mx-2" />
              <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
                Management
              </p>

              <Nav to="/dashboard/committee" icon={FolderOpenIcon}
                label="Overview"
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
                label="Member Directory" active={active("/dashboard/committee/members")}
              />
            </div>
          )}

          {/* ADMIN MENU */}
          {isAdmin && (
            <div className="space-y-1">
              <div className="border-t border-white/5 my-4 mx-2" />
              <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
                System
              </p>

              <Nav to="/dashboard/admin" icon={HomeIcon}
                label="Admin Overview"
                active={active("/dashboard/admin") && !active("/dashboard/admin/settings")}
              />

              <Nav to="/dashboard/admin/users" icon={UsersIcon}
                label="Access Control"
                active={active("/dashboard/admin/users")}
              />

              <Nav to="/dashboard/admin/settings" icon={Cog6ToothIcon}
                label="Configuration"
                active={active("/dashboard/admin/settings")}
              />

              <Nav to="/dashboard/admin/audit" icon={ShieldCheckIcon}
                label="Audit Trail" active={active("/dashboard/admin/audit")}
              />
            </div>
          )}

        </nav>

        {/* LOGOUT */}
        <div className="px-6 py-6 border-t border-white/10 bg-black/10 backdrop-blur-sm">
          <button
            onClick={logout}
            className="group w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5 transition-all text-red-100 py-3 rounded-xl text-sm font-semibold border border-red-500/20"
          >
            <ArrowLeftStartOnRectangleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--sgss-bg)] relative">
        {/* Background blobs for depth */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200 opacity-30 blur-[100px] rounded-full pointer-events-none mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-100 opacity-40 blur-[80px] rounded-full pointer-events-none mix-blend-multiply"></div>

        <header className="flex items-center justify-between px-4 lg:px-8 py-5 glass-panel z-10 mx-4 lg:mx-6 mt-4 lg:mt-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
             {/* Mobile Menu Button */}
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="lg:hidden p-2 text-[var(--sgss-navy)] hover:bg-black/5 rounded-lg transition-colors"
             >
               <Bars3BottomLeftIcon className="w-6 h-6" />
             </button>

             <div>
               <h2 className="text-lg lg:text-xl font-bold text-[var(--sgss-navy)] tracking-tight line-clamp-1">
                 {me ? (
                   <span>Hi, <span className="text-[var(--sgss-navy-light)]">{me.first_name || me.username}</span></span>
                 ) : (
                   "Dash."
                 )}
               </h2>
               <p className="text-xs text-gray-500 font-medium mt-0.5 hidden sm:block">
                  {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
               </p>
             </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
             <div className="h-8 w-px bg-gray-200 mx-1 hidden lg:block"></div>
             <NotificationBell />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-6 scroll-smooth z-10">
          <div className="max-w-7xl mx-auto pb-10 fade-in-up">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}


/* --------------------------------------------------
   CUSTOM <Nav /> WRAPPER — MODERN STYLE
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
      className={`sgss-sidebar-link flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
        active
          ? "bg-white/10 text-white shadow-lg shadow-black/5 active"
          : "text-gray-300 hover:text-white"
      }`}
    >
      <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${active ? "text-[var(--sgss-gold)]" : "text-gray-400 group-hover:text-white"}`} />
      <span className="relative z-10">{label}</span>
      
      {/* Active Indicator Dot */}
      {active && (
         <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[var(--sgss-gold)] shadow-[0_0_8px_var(--sgss-gold)]"></span>
      )}
    </RouterLink>
  );
}
