// Frontend/src/components/layout/DashboardLayout.tsx
import React from "react";
import { Link } from "react-router-dom";
import NotificationBell from "../notifications/NotificationBell";
import { useAuth } from "~/store/contexts/AuthContext";

export default function DashboardLayout({ children }: any) {
  const { auth, logout } = useAuth();
  const user = auth.user;
  const groups = auth.groups || [];

  const isCommittee = groups.includes("committee") || user?.is_superuser;
  const isAdmin = groups.includes("admin") || user?.is_superuser;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* ======================= SIDEBAR ======================= */}
      <aside className="w-64 bg-[#03045f] text-white flex flex-col">
        <div className="px-4 py-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold tracking-wide">
            SGSS <span className="text-[#caa631]">Fund</span>
          </h1>
          {user && (
            <>
              <p className="text-sm text-gray-200 mt-1">
                Logged in as{" "}
                <span className="font-semibold">{user.full_name}</span>
              </p>
              <p className="text-xs text-[#caa631]">
                ({auth.role || "member"})
              </p>
            </>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-auto text-sm">
          {/* Member section */}
          <Link className="block hover:text-[#caa631]" to="/dashboard/member">
            Dashboard
          </Link>
          <Link
            className="block hover:text-[#caa631]"
            to="/dashboard/member/claims"
          >
            My Claims
          </Link>
          <Link
            className="block hover:text-[#caa631]"
            to="/dashboard/member/claims/new"
          >
            New Claim
          </Link>

          {/* Committee section */}
          {isCommittee && (
            <>
              <div className="border-b border-gray-700 my-3" />
              <p className="uppercase text-xs text-gray-200">Committee</p>

              <Link
                className="block hover:text-[#caa631]"
                to="/dashboard/committee"
              >
                Committee Dashboard
              </Link>
              <Link
                className="block hover:text-[#caa631]"
                to="/dashboard/committee/claims"
              >
                All Claims
              </Link>
              <Link
                className="block hover:text-[#caa631]"
                to="/dashboard/committee/reports"
              >
                Reports
              </Link>
            </>
          )}

          {/* Admin section */}
          {isAdmin && (
            <>
              <div className="border-b border-gray-700 my-3" />
              <p className="uppercase text-xs text-gray-200">Admin</p>

              <Link
                className="block hover:text-[#caa631]"
                to="/dashboard/admin"
              >
                Manage Users
              </Link>
              <Link
                className="block hover:text-[#caa631]"
                to="/dashboard/admin/settings"
              >
                System Settings
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ======================= MAIN AREA ======================= */}
      <main className="flex-1 overflow-auto">
        <div className="flex items-center justify-end p-3 bg-white border-b shadow-sm">
          <NotificationBell />
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
