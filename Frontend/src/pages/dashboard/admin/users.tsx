// Frontend/src/pages/dashboard/admin/users.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import PageTransition from "~/components/animations/PageTransition";
import Button from "~/components/controls/button";
import Badge from "~/components/controls/badge";
import { 
    MagnifyingGlassIcon, 
    UserIcon, 
    ShieldCheckIcon, 
    UserGroupIcon, 
    FunnelIcon,
    EllipsisVerticalIcon
} from "@heroicons/react/24/outline";

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [q, setQ] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setActiveMenu(null);
    } catch (e) {
      console.error(e);
      alert("Failed to update role. Please try again.");
    }
  };

  const toggleActive = async (user: AdminUser) => {
    if (!window.confirm(user.is_active ? `Deactivate ${user.username}?` : `Activate ${user.username}?`)) return;
    try {
      const res = await api.post(`admin/users/${user.id}/active/`, {
        is_active: !user.is_active,
      });
      const updated: AdminUser = res.data;
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );
      setActiveMenu(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMenuClick = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveMenu(activeMenu === id ? null : id);
  }

  // Close menus when clicking outside
  useEffect(() => {
      const close = () => setActiveMenu(null);
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
  }, []);

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
              <h1 className="text-2xl font-bold text-[var(--sgss-navy)] tracking-tight">Users & Roles</h1>
              <p className="text-sm text-gray-500 mt-1">Manage user access and permissions for functionality.</p>
          </div>
      </div>

       <div className="sgss-card p-0 overflow-hidden bg-white">
          <div className="bg-gray-50/80 p-4 border-b border-gray-100">
             <form onSubmit={applySearch} className="flex flex-col md:flex-row gap-3">
                 <div className="flex-1 relative">
                     <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                     <input
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--sgss-gold)]/20 focus:border-[var(--sgss-gold)] transition-all"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by name, username, or email..."
                      />
                 </div>
                 <div className="flex items-center gap-2 min-w-[200px]">
                     <FunnelIcon className="w-5 h-5 text-gray-400" />
                     <select
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--sgss-navy)] bg-white"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                      >
                         <option value="">All Roles</option>
                        <option value="admin">Admins</option>
                        <option value="committee">Committee Members</option>
                        <option value="member">Standard Members</option>
                      </select>
                 </div>
                 <Button type="submit" className="bg-[var(--sgss-navy)] hover:bg-[var(--sgss-gold)] text-white px-6">
                     Search
                 </Button>
             </form>
          </div>

        {loading ? (
          <div className="p-8 space-y-4">
                 {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />)}
             </div>
        ) : users.length === 0 ? (
           <div className="py-16 text-center text-gray-500 flex flex-col items-center">
              <UserGroupIcon className="w-12 h-12 text-gray-200 mb-3" />
              <p>No users found matching your criteria.</p>
           </div>
        ) : (
          <div className="overflow-x-auto min-h-[400px]">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-white text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role(s)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => {
                    const isAdmin = u.is_superuser || u.groups.includes("Admin");
                    const isCommittee = u.groups.includes("Committee");

                    return (
                    <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-bold">
                                    {u.first_name ? u.first_name[0] : u.username[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium text-[var(--sgss-navy)]">
                                        {u.first_name || u.last_name
                                            ? `${u.first_name} ${u.last_name}`.trim()
                                            : u.username}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {u.email}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                                {isAdmin && <Badge variant="warning" className="gap-1 pl-1.5"><ShieldCheckIcon className="w-3 h-3" /> Admin</Badge>}
                                {isCommittee && <Badge variant="info" className="gap-1 pl-1.5"><UserGroupIcon className="w-3 h-3" /> Committee</Badge>}
                                {!isAdmin && !isCommittee && <Badge variant="neutral" className="gap-1 pl-1.5"><UserIcon className="w-3 h-3" /> Member</Badge>}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                             <Badge variant={u.is_active ? "success" : "neutral"}>{u.is_active ? "Active" : "Disabled"}</Badge>
                        </td>
                        <td className="px-6 py-4 text-center relative">
                            <button 
                                onClick={(e) => handleMenuClick(u.id, e)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[var(--sgss-navy)] transition-colors"
                            >
                                <EllipsisVerticalIcon className="w-5 h-5" />
                            </button>
                            
                            {activeMenu === u.id && (
                                <div className="absolute right-8 top-8 z-50 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 text-left animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-3 py-2 border-b border-gray-50 text-[10px] uppercase text-gray-400 font-semibold tracking-wider">
                                        Manage Roles
                                    </div>
                                    <button 
                                        onClick={() => updateRoles(u, { admin: !isAdmin })} 
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                                    >
                                        <ShieldCheckIcon className="w-4 h-4 text-gray-400" />
                                        {isAdmin ? "Remove Admin" : "Make Admin"}
                                    </button>
                                     <button 
                                        onClick={() => updateRoles(u, { committee: !isCommittee, member: true })} 
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                                    >
                                        <UserGroupIcon className="w-4 h-4 text-gray-400" />
                                        {isCommittee ? "Remove Committee" : "Make Committee"}
                                    </button>
                                    <div className="border-t border-gray-50 my-1"></div>
                                    <button 
                                        onClick={() => toggleActive(u)}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 flex items-center gap-2 ${u.is_active ? "text-red-600" : "text-green-600"}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${u.is_active ? "bg-red-500" : "bg-green-500"}`}></div>
                                        {u.is_active ? "Disable Account" : "Activate Account"}
                                    </button>
                                </div>
                            )}
                        </td>
                    </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
