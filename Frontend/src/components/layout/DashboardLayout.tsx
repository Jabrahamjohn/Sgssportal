// Frontend/src/components/layout/DashboardLayout.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import { Link } from "react-router-dom";
import NotificationBell from "../notifications/NotificationBell";

type Me = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  groups?: string[];
  is_superuser?: boolean;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    api
      .get("auth/me/")
      .then((res) => setMe(res.data))
      .catch(() => setMe(null));
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("auth/logout/");
    } catch (e) {
      // ignore, we'll still redirect
    }
    window.location.href = "/login";
  };

  const isCommittee =
    me?.is_superuser ||
    (me?.groups || []).includes("Committee") ||
    (me?.groups || []).includes("Admin");

  const isAdmin = me?.is_superuser || (me?.groups || []).includes("Admin");

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-4 space-y-4">
        <h2 className="text-xl font-bold mb-4">SGSS Fund</h2>

        <nav className="space-y-2 flex-1">
          {/* Member links */}
          <Link className="block hover:text-purple-300" to="/dashboard/member">
            Dashboard
          </Link>
          <Link className="block hover:text-purple-300" to="/dashboard/member/claims">
            My Claims
          </Link>
          <Link className="block hover:text-purple-300" to="/dashboard/member/claims/new">
            New Claim
          </Link>

          {/* Committee section */}
          {isCommittee && (
            <>
              <div className="border-b border-gray-600 my-3" />
              <p className="uppercase text-[11px] text-gray-400">Committee</p>
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

          {/* Admin section */}
          {isAdmin && (
            <>
              <div className="border-b border-gray-600 my-3" />
              <p className="uppercase text-[11px] text-gray-400">Admin</p>
              <Link className="block hover:text-purple-300" to="/dashboard/admin/users">
                Manage Users
              </Link>
              <Link className="block hover:text-purple-300" to="/dashboard/admin/settings">
                System Settings
              </Link>
            </>
          )}
        </nav>

        {/* Bottom user info in sidebar */}
        {me && (
          <div className="text-xs text-gray-300 border-t border-gray-700 pt-2">
            <div className="font-semibold">{me.full_name}</div>
            <div className="font-mono text-[11px] truncate">{me.email}</div>
          </div>
        )}
      </aside>

      {/* RIGHT SIDE: header + content */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-14 bg-white border-b flex items-center justify-between px-4">
          <div className="text-sm text-gray-700">
            {me ? (
              <>
                Logged in as <span className="font-semibold">{me.full_name}</span>{" "}
                <span className="text-xs text-gray-500 ml-1">
                  ({me.role || "Member"})
                </span>
              </>
            ) : (
              "Loading user…"
            )}
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm rounded bg-gray-900 text-white hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
