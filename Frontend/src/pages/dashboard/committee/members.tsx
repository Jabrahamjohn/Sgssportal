// Frontend/src/pages/dashboard/committee/members.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "~/config/api";
import Button from "~/components/controls/button";
import Skeleton from "~/components/loader/skeleton";
import PageTransition from "~/components/animations/PageTransition";
import Badge from "~/components/controls/badge";
import { 
    UsersIcon, 
    MagnifyingGlassIcon, 
    FunnelIcon, 
    CheckCircleIcon,
    ExclamationCircleIcon,
    CalendarIcon,
    UserCircleIcon
} from "@heroicons/react/24/outline";

type MemberRow = {
  id: string;
  user: {
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };
  membership_type?: {
    name: string;
    key: string;
  } | null;
  status: string;
  nhif_number?: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
};

export default function CommitteeMembersPage() {
  const { id: highlightId } = useParams();
  const nav = useNavigate();

  const [statusFilter, setStatusFilter] = useState<"pending" | "active" | "all">("all");
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [actingId, setActingId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== "all") params.status = statusFilter;
      
      const res = await api.get("members/", { params });
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading members:", err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const approve = async (memberId: string) => {
    if (!window.confirm("Approve this membership?")) return;
    setActingId(memberId);
    try {
      await api.post(`members/${memberId}/approve/`);
      await load();
    } catch (err) {
      console.error("Approval failed:", err);
      alert("Unable to approve member.");
    } finally {
      setActingId(null);
    }
  };

  const statusColor = (status: string) => {
      const s = String(status).toLowerCase();
      if (s === 'active') return 'success';
      if (s === 'rejected') return 'danger';
      if (s === 'pending') return 'warning';
      return 'neutral';
  }

  const getFullName = (u: MemberRow["user"]) => {
    return (
      u?.full_name ||
      `${u?.first_name || ""} ${u?.last_name || ""}`.trim() ||
      u?.username ||
      "Unknown User"
    );
  };

  const filteredMembers = members.filter(m => {
      if(!q) return true;
      const term = q.toLowerCase();
      const name = getFullName(m.user).toLowerCase();
      const email = (m.user.email || "").toLowerCase();
      const nhif = (m.nhif_number || "").toLowerCase();
      return name.includes(term) || email.includes(term) || nhif.includes(term);
  });

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
              <h1 className="text-2xl font-bold text-[var(--sgss-navy)] flex items-center gap-2">
                  <UsersIcon className="w-6 h-6 text-[var(--sgss-gold)]" />
                  Membership Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">Review registrations and manage member statuses.</p>
          </div>
          <div className="flex gap-2">
               {/* Quick Stats or Actions could go here */}
          </div>
      </div>

      {/* Filters & Search */}
      <div className="sgss-card p-0 overflow-hidden bg-white">
          <div className="bg-gray-50/80 p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4">
               <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--sgss-gold)]/20 focus:border-[var(--sgss-gold)] transition-all bg-white"
                        placeholder="Search members by name, email, or NHIF..."
                        value={q}
                        onChange={e => setQ(e.target.value)}
                    />
               </div>
               <div className="flex items-center gap-2 min-w-[200px]">
                    <FunnelIcon className="w-5 h-5 text-gray-400" />
                    <select
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--sgss-navy)] bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending Approval</option>
                        <option value="active">Active Members</option>
                    </select>
               </div>
          </div>

          {loading ? (
             <div className="p-6 space-y-4">
                 {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
             </div>
          ) : filteredMembers.length === 0 ? (
             <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                 <UserCircleIcon className="w-16 h-16 text-gray-200 mb-3" />
                 <h3 className="text-lg font-medium text-gray-700">No members found</h3>
                 <p className="text-sm">Try adjusting your filters or search terms.</p>
             </div>
          ) : (
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                     <thead className="bg-white text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                         <tr>
                             <th className="px-6 py-4">Member Details</th>
                             <th className="px-6 py-4">Membership Type</th>
                             <th className="px-6 py-4">Status</th>
                             <th className="px-6 py-4">Validity Period</th>
                             <th className="px-6 py-4 text-center">Action</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                         {filteredMembers.map((m) => {
                             const highlight = highlightId === m.id;
                             return (
                                 <tr key={m.id} className={`hover:bg-blue-50/30 transition-colors group ${highlight ? 'bg-yellow-50/50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                                                {formatInitials(getFullName(m.user))}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[var(--sgss-navy)]">{getFullName(m.user)}</p>
                                                <p className="text-xs text-gray-400">{m.user?.email || "No Email"}</p>
                                                {m.nhif_number && <p className="text-[10px] text-gray-400 mt-0.5 font-mono">NHIF: {m.nhif_number}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-700">{m.membership_type?.name || "Standard Membership"}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={statusColor(m.status)}>{m.status}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        {m.valid_from ? (
                                            <div className="flex flex-col gap-1">
                                                <span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> {new Date(m.valid_from).toLocaleDateString()}</span>
                                                <span className="text-gray-400 pl-5">to {m.valid_to ? new Date(m.valid_to).toLocaleDateString() : "Indefinite"}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">Not valid yet</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {m.status === "pending" ? (
                                            <Button 
                                                disabled={actingId === m.id}
                                                onClick={() => approve(m.id)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 py-1.5 px-3 text-xs"
                                            >
                                                {actingId === m.id ? "..." : "Approve"}
                                                <CheckCircleIcon className="w-4 h-4 ml-1.5" />
                                            </Button>
                                        ) : m.status === 'active' ? (
                                            <span className="text-xs text-emerald-600 font-medium flex items-center justify-center gap-1">
                                                <CheckCircleIcon className="w-4 h-4" /> Active
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">—</span>
                                        )}
                                    </td>
                                 </tr>
                             )
                         })}
                     </tbody>
                 </table>
             </div>
          )}
      </div>
    </PageTransition>
  );
}

function formatInitials(name: string) {
    if(!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}
