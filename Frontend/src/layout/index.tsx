import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../store/contexts/AuthContext';

export default function AppLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr]">
      <header className="border-b px-6 py-3 flex items-center justify-between bg-white">
        <div className="font-semibold">SGSS Medical Fund</div>
        <nav className="flex gap-4 text-sm">
          {user?.role === 'member' && (
            <>
              <Link to="/dashboard/member">Dashboard</Link>
              <Link to="/dashboard/member/claims">Claims</Link>
              <Link to="/dashboard/member/chronic">Chronic</Link>
            </>
          )}
          {user?.role !== 'member' && <Link to="/dashboard/committee">Committee</Link>}
          {user?.role === 'admin' && <Link to="/dashboard/admin">Admin</Link>}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm">{user?.email}</span>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={logout}>Logout</button>
        </div>
      </header>
      <main className="bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
