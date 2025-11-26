// Frontend/src/pages/dashboard/admin/users.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  groups: string[];
  is_superuser: boolean;
  is_active: boolean;
}

const roleLabel = (u: AdminUser) => {
  if (u.is_superuser || u.groups.includes("Admin")) return "Admin";
  if (u.groups.includes("Committee")) return "Committee";
  if (u.groups.includes("Member")) return "Member";
  return "User";
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [q, setQ] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("admin/users/", {
        params: {
          role: roleFilter || undefined,
          q: q || undefined,
        },
      });
      setUsers(res.data.results || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const updateRoles = async (
    user: AdminUser,
    options: { admin?: boolean; committee?: boolean; member?: boolean }
  ) => {
    try {
      const res = await api.post(`admin/users/${user.id}/roles/`, {
        make_admin: options.admin ?? (user.is_superuser || user.groups.includes("Admin")),
        make_committee: options.committee ?? user.groups.includes("Committee"),
        make_member: options.member ?? user.groups.includes("Member"),
      });
      const updated: AdminUser = res.data;
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const toggleActive = async (user: AdminUser) => {
    try {
      const res = await api.post(`admin/users/${user.id}/active/`, {
        is_active: !user.is_active,
      });
      const updated: AdminUser = res.data;
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users & Roles</h1>
      </div>

      <form
        onSubmit={applySearch}
        className="bg-white rounded-xl shadow-sm border p-4 flex flex-wrap gap-3 text-sm"
      >
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">
            Role
          </label>
          <select
            className="border rounded-lg px-2 py-2"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="admin">Admin</option>
            <option value="committee">Committee</option>
            <option value="member">Member</option>
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[11px] text-gray-500 mb-1">
            Search
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Name, username, email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#03045f] text-white text-sm"
          >
            Apply
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm border overflow-auto">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Loading…</div>
        ) : users.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No users found.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-2">
                    <div className="font-medium">
                      {u.first_name || u.last_name
                        ? `${u.first_name} ${u.last_name}`.trim()
                        : u.username}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      @{u.username}
                    </div>
                  </td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{roleLabel(u)}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] ${
                        u.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {u.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button
                      onClick={() =>
                        updateRoles(u, {
                          admin: !(
                            u.is_superuser || u.groups.includes("Admin")
                          ),
                        })
                      }
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {u.is_superuser || u.groups.includes("Admin")
                        ? "Remove Admin"
                        : "Make Admin"}
                    </button>
                    <button
                      onClick={() =>
                        updateRoles(u, {
                          committee: !u.groups.includes("Committee"),
                          member: true,
                        })
                      }
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      {u.groups.includes("Committee")
                        ? "Remove Committee"
                        : "Make Committee"}
                    </button>
                    <button
                      onClick={() => toggleActive(u)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      {u.is_active ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
