import React from "react";
import { useAuth } from "~/store/contexts/AuthContext";
import { Button } from "~/components/controls/button";
import { Bell } from "lucide-react";

export default function Header() {
  const { auth, logout } = useAuth();
  const name =
    auth?.user?.full_name ||
    auth?.user?.username ||
    (auth?.user ? "Member" : "");

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="mx-auto max-w-7xl h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-lg font-semibold tracking-tight">
            SGSS • Member Portal
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="relative inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex text-sm text-gray-600">
            Hi, <span className="ml-1 font-medium text-gray-800">{name}</span>
          </div>
          <Button
            onClick={logout}
            className="ml-1 rounded-xl bg-gray-900 text-white hover:bg-black px-3 py-1.5"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
