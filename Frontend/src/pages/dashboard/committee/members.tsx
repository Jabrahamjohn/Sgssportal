// Frontend/src/pages/dashboard/committee/members.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
    CalendarIcon,
    UserCircleIcon,
    XCircleIcon,
    TrashIcon,
    EyeIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";

type MemberRow = {
  id: string;
  user_full_name?: string;
  email?: string;
  user?: {
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };
  membership_type?: number | null;
  membership_type_details?: {
    id: number;
    name: string;
    annual_limit: number;
  } | null;
  status: string;
  shif_number?: string | null;
  mailing_address?: string | null;
  phone_mobile?: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
  benefits_from?: string | null;
};

export default function CommitteeMembersPage() {
  const { id: highlightId } = useParams();

  const [statusFilter, setStatusFilter] = useState<"pending" | "active" | "all">("all");
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [actingId, setActingId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== "all") params.status = statusFilter;
      
      const res = await api.get("members/", { params });
      setMembers(Array.isArray(res.data) ? res.data : (res.data.results || []));
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
      alert("Member approved successfully!");
    } catch (err) {
      console.error("Approval failed:", err);
      alert("Unable to approve member.");
    } finally {
      setActingId(null);
    }
  };

  const reject = async (memberId: string) => {
    const reason = window.prompt("Reason for rejection (optional):");
    if (reason === null) return; // User cancelled
    setActingId(memberId);
    try {
      await api.post(`members/${memberId}/reject/`, { reason });
      await load();
      alert("Member rejected.");
    } catch (err) {
      console.error("Rejection failed:", err);
      alert("Unable to reject member.");
    } finally {
      setActingId(null);
    }
  };

  const revoke = async (memberId: string) => {
    const reason = window.prompt("Reason for revocation:");
    if (!reason) return;
    if (!window.confirm("Are you sure you want to revoke this membership? This action cannot be undone.")) return;
    setActingId(memberId);
    try {
      await api.post(`members/${memberId}/revoke/`, { reason });
      await load();
      alert("Membership revoked.");
    } catch (err) {
      console.error("Revocation failed:", err);
      alert("Unable to revoke membership.");
    } finally {
      setActingId(null);
    }
  };

  const statusColor = (status: string): "gray" | "blue" | "green" | "red" | "yellow" => {
      const s = String(status).toLowerCase();
      if (s === 'active') return 'green';
      if (s === 'rejected') return 'red';
      if (s === 'pending') return 'yellow';
      return 'gray';
  }

  const getFullName = (m: MemberRow) => {
    return (
      m.user_full_name ||
      m.user?.full_name ||
      `${m.user?.first_name || ""} ${m.user?.last_name || ""}`.trim() ||
      m.user?.username ||
      "Unknown User"
    );
  };

  const filteredMembers = members.filter(m => {
      if(!q) return true;
      const term = q.toLowerCase();
      const name = getFullName(m).toLowerCase();
      const email = (m.email || m.user?.email || "").toLowerCase();
      const shif = (m.shif_number || "").toLowerCase();
      return name.includes(term) || email.includes(term) || shif.includes(term);
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
                        placeholder="Search members by name, email, or SHIF/SHA..."
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
                             <th className="px-6 py-4 text-center">Actions</th>
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
                                                {formatInitials(getFullName(m))}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[var(--sgss-navy)]">{getFullName(m)}</p>
                                                <p className="text-xs text-gray-400">{m.email || m.user?.email || "No Email"}</p>
                                                {m.shif_number && <p className="text-[10px] text-gray-400 mt-0.5 font-mono">SHIF/SHA: {m.shif_number}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-700">{m.membership_type_details?.name || "Standard"}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge color={statusColor(m.status)}>{m.status}</Badge>
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
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => setSelectedMember(m)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                                                <EyeIcon className="w-4 h-4 text-gray-600" />
                                            </button>
                                            {m.status === "pending" && (
                                                <>
                                                    <Button 
                                                        disabled={actingId === m.id}
                                                        onClick={() => approve(m.id)}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 text-xs"
                                                    >
                                                        {actingId === m.id ? "..." : "Approve"}
                                                    </Button>
                                                    <Button 
                                                        disabled={actingId === m.id}
                                                        onClick={() => reject(m.id)}
                                                        className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 text-xs"
                                                    >
                                                        {actingId === m.id ? "..." : "Reject"}
                                                    </Button>
                                                </>
                                            )}
                                            {(m.status === 'active' || m.status === 'approved') && (
                                                <Button 
                                                    disabled={actingId === m.id}
                                                    onClick={() => revoke(m.id)}
                                                    className="bg-orange-600 hover:bg-orange-700 text-white py-1.5 px-3 text-xs"
                                                >
                                                    {actingId === m.id ? "..." : "Revoke"}
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                 </tr>
                             )
                         })}
                     </tbody>
                 </table>
             </div>
          )}
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMember(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--sgss-navy)]">Member Details</h2>
              <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">{getFullName(selectedMember)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{selectedMember.email || selectedMember.user?.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Mobile Phone</p>
                    <p className="font-medium text-gray-900">{selectedMember.phone_mobile || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">SHIF/SHA Number</p>
                    <p className="font-medium text-gray-900 font-mono">{selectedMember.shif_number || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Mailing Address</p>
                    <p className="font-medium text-gray-900">{selectedMember.mailing_address || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Membership Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Membership Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Membership Type</p>
                    <p className="font-medium text-gray-900">{selectedMember.membership_type_details?.name || "Standard"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Annual Limit</p>
                    <p className="font-medium text-gray-900">KSh {selectedMember.membership_type_details?.annual_limit?.toLocaleString() || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge color={statusColor(selectedMember.status)}>{selectedMember.status}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Benefits From</p>
                    <p className="font-medium text-gray-900">{selectedMember.benefits_from ? new Date(selectedMember.benefits_from).toLocaleDateString() : "—"}</p>
                  </div>
                  {selectedMember.valid_from && (
                    <>
                      <div>
                        <p className="text-xs text-gray-500">Valid From</p>
                        <p className="font-medium text-gray-900">{new Date(selectedMember.valid_from).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Valid To</p>
                        <p className="font-medium text-gray-900">{selectedMember.valid_to ? new Date(selectedMember.valid_to).toLocaleDateString() : "Indefinite"}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                {selectedMember.status === "pending" && (
                  <>
                    <Button onClick={() => { approve(selectedMember.id); setSelectedMember(null); }} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                      <CheckCircleIcon className="w-5 h-5 mr-2" /> Approve Membership
                    </Button>
                    <Button onClick={() => { reject(selectedMember.id); setSelectedMember(null); }} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                      <XCircleIcon className="w-5 h-5 mr-2" /> Reject Application
                    </Button>
                  </>
                )}
                {(selectedMember.status === 'active' || selectedMember.status === 'approved') && (
                  <Button onClick={() => { revoke(selectedMember.id); setSelectedMember(null); }} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
                    <TrashIcon className="w-5 h-5 mr-2" /> Revoke Membership
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}

function formatInitials(name: string) {
    if(!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}
