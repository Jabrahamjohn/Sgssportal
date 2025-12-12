// Frontend/src/pages/dashboard/admin/settings/committee.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import Alert from "~/components/controls/alert";
import PageTransition from "~/components/animations/PageTransition";
import Badge from "~/components/controls/badge";
import { 
    UserGroupIcon, 
    InformationCircleIcon, 
    AdjustmentsHorizontalIcon 
} from "@heroicons/react/24/outline";

type CommitteeUser = {
  id: number | string;
  username: string;
  full_name: string;
  email: string;
  is_superuser: boolean;
};

export default function CommitteeSettings() {
  const [members, setMembers] = useState<CommitteeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      // Use the admin/users endpoint which we know exists
      const res = await api.get("admin/users/");
      const allUsers: CommitteeUser[] = res.data.results || res.data || [];
      
      // Filter for users who are likely committee members (e.g. staff or specific role)
      // Since the API might not strictly return "role", we check is_staff or if they are in the group.
      // For now, let's filter by is_staff (Superuser) or if we can identify committee role.
      // Based on the 'users.tsx' page, the user object might have 'role'.
      
      // If the API returns 'role' field:
      const committee = allUsers.filter((u: any) => 
          u.is_superuser || 
          u.role === 'committee' || 
          u.groups?.includes('Committee')
      );
      
      setMembers(committee);
    } catch (e: any) {
      console.error(e);
      setError(
        e.response?.data?.detail || "Failed to load committee members."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <PageTransition className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold text-[var(--sgss-navy)] flex items-center gap-2">
               <UserGroupIcon className="w-6 h-6 text-[var(--sgss-gold)]" />
               Committee Management
           </h2>
           <p className="text-sm text-gray-500 mt-1">View and manage members with access to committee dashboards.</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 text-sm text-blue-800">
          <InformationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
              <p className="font-semibold">Managing Committee Access</p>
              <p className="text-blue-700/80 leading-relaxed">
                  Committee membership is managed via user Groups. To add or remove members:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-xs bg-white/50 p-3 rounded-lg border border-blue-100/50">
                  <li>Go to <strong>Django Admin &gt; Users & groups</strong>.</li>
                  <li>Open the <strong>'Committee'</strong> group.</li>
                  <li>Add users to the group to grant access. Remove them to revoke access.</li>
              </ol>
          </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="sgss-card p-0 overflow-hidden bg-white">
        {loading ? (
             <div className="p-8 text-center text-gray-400">Loading members...</div>
        ) : members.length === 0 ? (
             <div className="p-12 text-center text-gray-400">
                 <UserGroupIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                 <p>No active committee members found.</p>
             </div>
        ) : (
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                         <tr>
                             <th className="px-6 py-4">Full Name</th>
                             <th className="px-6 py-4">Username</th>
                             <th className="px-6 py-4">Email Address</th>
                             <th className="px-6 py-4">System Role</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                         {members.map((m) => (
                             <tr key={m.id} className="hover:bg-blue-50/20 transition-colors">
                                 <td className="px-6 py-4 font-medium text-[var(--sgss-navy)]">
                                     {m.full_name || "—"}
                                 </td>
                                 <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                     @{m.username}
                                 </td>
                                 <td className="px-6 py-4 text-gray-500">
                                     {m.email}
                                 </td>
                                 <td className="px-6 py-4">
                                     {m.is_superuser ? (
                                         <Badge variant="danger">Super Admin</Badge>
                                     ) : (
                                         <Badge variant="warning">Committee Member</Badge>
                                     )}
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
        )}
      </div>
    </PageTransition>
  );
}
