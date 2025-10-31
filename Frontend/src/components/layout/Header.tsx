import React from "react";
import { useAuth } from "~/store/contexts/AuthContext";
import Button from "~/components/controls/button";
import { Bell, LogOut, User2 } from "lucide-react";

export default function Header() {
  const { auth, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-100 flex items-center justify-between px-6 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <img
          src="/vite.svg"
          alt="SGSS Logo"
          className="w-8 h-8 rounded-full"
        />
        <h1 className="font-semibold text-gray-800 text-lg">
          SGSS Medical Fund Portal
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative p-2 rounded-full hover:bg-gray-100 transition"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 block w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 border-l pl-4">
          <div className="flex flex-col text-right leading-tight">
            <span className="text-sm font-medium text-gray-700">
              {auth?.user?.full_name || "Member"}
            </span>
            <span className="text-xs text-gray-400 capitalize">
              {auth?.role || "member"}
            </span>
          </div>

          <User2 className="w-6 h-6 text-gray-500" />

          <Button
            variant="outline"
            className="!text-red-500 border-red-400 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-1 inline" /> Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
