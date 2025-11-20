// Frontend/src/components/layout/DashboardLayout.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import { Link } from "react-router-dom";
import NotificationBell from "../notifications/NotificationBell";

export default function DashboardLayout({ children }: any) {
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    api.get("auth/me/").then(res => setMe(res.data));
  }, []);

  const isCommittee = me?.groups?.includes("Committee") || me?.is_superuser;
  const isAdmin = me?.groups?.includes("Admin") || me?.is_superuser;

  return (
    <div className="flex h-screen">
      <div className="flex items-center gap-4">
        <NotificationBell />
      </div>

      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4 space-y-4">
        <h2 className="text-xl font-bold mb-5">SGSS Fund</h2>

        {/* Always for Members */}
        <nav className="space-y-2">
          <Link className="block hover:text-purple-300" to="/dashboard/member">
            Dashboard
          </Link>

          <Link className="block hover:text-purple-300" to="/dashboard/member/claims">
            My Claims
          </Link>

          <Link className="block hover:text-purple-300" to="/dashboard/member/claims/new">
            New Claim
          </Link>
        </nav>

        {/* Committee Only */}
        {isCommittee && (
          <>
            <div className="border-b border-gray-600 my-3"></div>
            <p className="uppercase text-xs text-gray-400">Committee</p>

            <Link className="block hover:text-purple-300" to="/dashboard/committee">
              Committee Dashboard
            </Link>

            <Link className="block hover:text-purple-300" to="/dashboard/committee/claims">
              All Claims
            </Link>

            <Link className="block hover:text-purple-300" to="/dashboard/committee/reports">
              Reports
            </Link>
          </>
        )}

        {/* Admin Only */}
        {isAdmin && (
          <>
            <div className="border-b border-gray-600 my-3"></div>
            <p className="uppercase text-xs text-gray-400">Admin</p>

            <Link className="block hover:text-purple-300" to="/dashboard/admin/users">
              Manage Users
            </Link>

            <Link className="block hover:text-purple-300" to="/dashboard/admin/settings">
              System Settings
            </Link>
          </>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-100">{children}</main>
    </div>
  );
}
