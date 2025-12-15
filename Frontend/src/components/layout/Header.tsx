import { Bell, LogOut, User } from "lucide-react";
import { useAuth } from "~/store/contexts/AuthContext";
import  Button  from "~/components/controls/button";

export default function Header() {
  const { auth, logout } = useAuth();
  const roleColor =
  auth?.role === "admin"
    ? "text-red-600"
    : auth?.role === "committee"
    ? "text-blue-600"
    : "text-gray-700";


  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm flex items-center justify-between px-6 py-3">
      {/* 🔹 Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <img
          src="/vite.svg"
          alt="SGSS Logo"
          className="w-7 h-7 object-contain"
        />
        <h1 className="text-[15px] md:text-lg font-semibold text-gray-800 tracking-tight">
          SGSS Medical Fund Portal
        </h1>
      </div>

      {/* 🔹 Right: User info + actions */}
      <div className="flex items-center gap-5">
        {/* Notification Bell */}
        <button
          type="button"
          className="relative text-gray-600 hover:text-blue-600 transition"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] px-1 shadow-sm">
            3
          </span>
        </button>

        {/* User Info */}
        <div className="hidden sm:flex items-center gap-2 text-sm border-l pl-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-gray-800">
              {auth?.user?.full_name || auth?.user?.username || "User"}
            </div>
            <div className={`text-xs capitalize ${roleColor}`}>
              {auth?.role || "member"}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium rounded-lg border border-red-200 transition"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
