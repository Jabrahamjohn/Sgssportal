import api from "~/config/api";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await api.post("auth/logout/");
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/login";
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Logout
    </button>
  );
}
