// Frontend/src/pages/dashboard/committee/claim.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "~/config/api";
import { useAuth } from "~/store/contexts/AuthContext";
import Skeleton from "~/components/loader/skeleton";
import Button from "~/components/controls/button";
import PageTransition from "~/components/animations/PageTransition";
import Badge from "~/components/controls/badge";
import { Alert } from "~/components/controls";
import dayjs from "dayjs";
import { 
    PaperClipIcon, 
    ChatBubbleLeftRightIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon,
    UserIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentMagnifyingGlassIcon,
    BanknotesIcon
} from "@heroicons/react/24/outline";

type CommitteeClaimResponse = {
  id: string;
  member: {
    name: string;
    username: string;
    email: string;
    membership_type: string | null;
    shif_number: string | null;
  };
  claim: {
    type: string;
    status: string;
    notes: string | null;
    date_of_first_visit: string | null;
    date_of_discharge: string | null;
    total_claimed: string;
    total_payable: string;
    member_payable: string;
    override_amount: string | null;
    submitted_at: string | null;
    created_at: string;
    meeting_links?: {
        meeting_id: string;
        meeting_date: string;
        meeting_status: string;
        decision: string;
    }[];
  };
  items: {
    id: string;
    category: string | null;
    description: string | null;
    amount: string;
    quantity: number;
    line_total: string;
  }[];
  attachments: {
    id: string;
    file: string | null;
    content_type: string | null;
    uploaded_at: string;
    uploaded_by: string | null;
  }[];
};

type AuditEntry = {
  id?: string;
  action?: string;
  note?: string | null;
  role?: string | null;
  created_at?: string;
  actor?: any;
  actor_name?: string;
  [key: string]: any;
};

export default function CommitteeClaimDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { auth } = useAuth();
  const [data, setData] = useState<CommitteeClaimResponse | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = async () => {
    if (!id) return;
    try {
      const [claimRes, auditRes] = await Promise.all([
        api.get(`claims/committee/${id}/`),
        api.get(`claims/${id}/audit/`),
      ]);

      setData(claimRes.data);
      const auditList = auditRes.data?.results || auditRes.data || [];
      setAudit(auditList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const shortId = (id || "").slice(0, 8);

  const formatDateTime = (d?: string | null) =>
    d ? new Date(d).toLocaleString() : "N/A";

  const formatMoney = (v?: string | number | null) => {
    const n = Number(v || 0);
    return `Ksh ${n.toLocaleString()}`;
  };
  
  const statusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "approved" || s === "paid") return "success";
    if (s === "rejected") return "danger";
    if (s === "reviewed") return "warning";
    return "info";
  };

  const handleStatusChange = async (status: string, askNote = false) => {
    if (!id || !data) return;
    let note: string | undefined;

    if (askNote) {
      const input = window.prompt("Enter note / reason (optional):", "");
      if (input !== null) { // only proceed if not cancelled
         note = input.trim();
      } else {
         return; // cancelled
      }
    }

    setActing(true);
    try {
      await api.post(`claims/${id}/set_status/`, {
        status,
        ...(note ? { note } : {}),
      });
      await load(); 
    } catch (e) {
      console.error(e);
      alert("Failed to update status. Please try again.");
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between">
           <Skeleton className="h-8 w-64" />
           <div className="flex gap-2">
             <Skeleton className="h-10 w-24 rounded-lg" />
             <Skeleton className="h-10 w-24 rounded-lg" />
           </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
           <Skeleton className="h-40 w-full rounded-2xl md:col-span-2" />
           <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 m-6">
        <DocumentMagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
        <p className="text-gray-500 mb-4">Claim not found or you do not have permission.</p>
        <Button variant="outline" onClick={() => nav(-1)}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
             Back to Claims
        </Button>
      </div>
    );
  }

  const { member, claim, items, attachments } = data;
  const currentStatus = (claim.status || "").toLowerCase();
  
  const isConflict = auth.user?.username === member.username || auth.user?.email === member.email;
  const isRedacted = claim.notes === "[REDACTED - MEDICAL PRIVACY]";

  return (
    <PageTransition className="space-y-6">
      {/* CONFLICT WARNING */}
      {isConflict && (
        <Alert
          message="Conflict of Interest Warning"
          description="This claim belongs to you or a dependant. You are strictly prohibited from adjudicating or changing the status of this claim."
          type="error"
          showIcon
          icon={<XCircleIcon className="w-6 h-6" />}
          className="rounded-xl border-red-100 shadow-sm"
        />
      )}

      {/* Header + actions */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
               <button onClick={() => nav(-1)} className="mt-1 p-2 hover:bg-white rounded-full transition-colors text-gray-500">
                   <ArrowLeftIcon className="w-5 h-5" />
               </button>
               <div>
                   <div className="flex items-center gap-3">
                       <h2 className="text-2xl font-bold text-[var(--sgss-navy)]">Claim #{shortId}</h2>
                       <Badge variant={statusColor(claim.status)}>{claim.status}</Badge>
                   </div>
                   <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                       <span className="flex items-center gap-1">
                           <CalendarDaysIcon className="w-4 h-4" />
                           Submitted: {formatDateTime(claim.submitted_at)}
                       </span>
                       <span>|</span>
                       <span className="capitalize">Type: {claim.type || "N/A"}</span>
                       {claim.meeting_links?.length ? (
                          <div className="flex gap-2">
                             {claim.meeting_links.map((link: any) => (
                               <Badge key={link.meeting_id} variant={link.meeting_status === 'locked' ? 'success' : 'info'}>
                                  Session: {dayjs(link.meeting_date).format("DD MMM")} ({link.decision})
                               </Badge>
                             ))}
                          </div>
                        ) : (
                          <span className="text-amber-500 font-medium ml-2">Unscheduled</span>
                        )}
                   </div>
               </div>
          </div>
          
          <div className="flex flex-wrap gap-2 sticky top-4 z-20 bg-white/50 backdrop-blur-sm p-2 rounded-xl border border-white/20 shadow-sm">
            <Button
              variant="outline"
              disabled={acting}
              onClick={() => handleStatusChange("reviewed", true)}
              className="border-gray-300 bg-white"
            >
              <DocumentMagnifyingGlassIcon className="w-4 h-4 mr-1.5" />
              Mark Reviewed
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={acting || currentStatus === "approved" || isConflict}
              onClick={() => handleStatusChange("approved", true)}
            >
              <CheckCircleIcon className="w-4 h-4 mr-1.5" />
              Approve
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={acting || currentStatus === "rejected" || isConflict}
              onClick={() => handleStatusChange("rejected", true)}
            >
               <XCircleIcon className="w-4 h-4 mr-1.5" />
              Reject
            </Button>
            <Button
              className="bg-[var(--sgss-navy)] hover:bg-[#04146a] text-white"
              disabled={acting || currentStatus === "paid" || isConflict}
              onClick={() => handleStatusChange("paid", true)}
            >
               <BanknotesIcon className="w-4 h-4 mr-1.5" />
              Mark Paid
            </Button>
          </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT COL */}
          <div className="lg:col-span-2 space-y-6">
             {/* Financials & Summary */}
              <div className="sgss-card bg-white p-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5">
                       <CurrencyDollarIcon className="w-32 h-32 text-[var(--sgss-navy)]" />
                   </div>
                  <h3 className="font-bold text-[var(--sgss-navy)] mb-4 flex items-center gap-2">
                       <CurrencyDollarIcon className="w-5 h-5 text-[var(--sgss-gold)]" />
                       Claim Financials
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-xs text-gray-500 uppercase font-bold">Total Claimed</p>
                          <p className="text-xl font-bold text-[var(--sgss-navy)]">{formatMoney(claim.total_claimed)}</p>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                          <p className="text-xs text-emerald-600 uppercase font-bold">Fund Payable</p>
                          <p className="text-xl font-bold text-emerald-800">{formatMoney(claim.total_payable)}</p>
                      </div>
                       <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                          <p className="text-xs text-orange-600 uppercase font-bold">Member Share</p>
                          <p className="text-xl font-bold text-orange-800">{formatMoney(claim.member_payable)}</p>
                      </div>
                  </div>
                  {claim.override_amount && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm mb-2">
                        <strong>Override Active:</strong> The payable amount was manually set to {formatMoney(claim.override_amount)}.
                    </div>
                  )}
                   {claim.notes && (
                    <div className={`${isRedacted ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-blue-50 border-blue-200 text-blue-800'} border px-4 py-3 rounded-lg text-sm mt-4 relative overflow-hidden`}>
                        {isRedacted && <div className="absolute top-0 right-0 p-2 opacity-10"><DocumentMagnifyingGlassIcon className="w-12 h-12" /></div>}
                        <strong className="block mb-1 text-xs uppercase tracking-wider opacity-70">
                           {isRedacted ? '🔒 Medical Privacy Active' : 'Claim Notes'}
                        </strong> 
                        <span className={isRedacted ? 'font-mono' : ''}>{claim.notes}</span>
                    </div>
                  )}
              </div>

               {/* Items */}
                <div className="sgss-card p-0 overflow-hidden bg-white">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                         <h3 className="font-bold text-[var(--sgss-navy)] text-sm">Line Items Breakdown</h3>
                    </div>
                    {items.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">No line items recorded.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3">Description</th>
                                        <th className="px-6 py-3 text-right">Amount</th>
                                        <th className="px-6 py-3 text-right">Qty</th>
                                        <th className="px-6 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {items.map((i) => (
                                        <tr key={i.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-3">
                                                <p className="font-medium text-gray-800">{i.description || "—"}</p>
                                                <span className="text-xs text-gray-500">{i.category || "Uncategorized"}</span>
                                            </td>
                                            <td className="px-6 py-3 text-right text-gray-600">{formatMoney(i.amount)}</td>
                                            <td className="px-6 py-3 text-right text-gray-600">{i.quantity}</td>
                                            <td className="px-6 py-3 text-right font-bold text-[var(--sgss-navy)]">{formatMoney(i.line_total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Attachments */}
                <div className="sgss-card bg-white p-6">
                    <h3 className="font-bold text-[var(--sgss-navy)] mb-4 flex items-center gap-2">
                       <PaperClipIcon className="w-5 h-5 text-[var(--sgss-gold)]" />
                       Attachments ({attachments.length})
                    </h3>
                     {attachments.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No attachments uploaded for this claim.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {attachments.map((a) => (
                                <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group">
                                     <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                         <br />
                                         <span className="text-[10px] font-bold uppercase truncate max-w-[30px]">{a.content_type?.split('/')[1] || 'FILE'}</span>
                                     </div>
                                     <div className="overflow-hidden flex-1">
                                         <p className="text-sm font-medium text-[var(--sgss-navy)] truncate pr-2">Attachment</p>
                                         <p className="text-[10px] text-gray-500">By {a.uploaded_by || "User"} • {new Date(a.uploaded_at).toLocaleDateString()}</p>
                                     </div>
                                     {a.file && (
                                         <a 
                                            href={a.file} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                            title="View File"
                                         >
                                             <ArrowLeftIcon className="w-4 h-4 rotate-135" />
                                         </a>
                                     )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
          </div>

          {/* RIGHT COL */}
          <div className="space-y-6">
               {/* Member Info Card */}
               <div className="sgss-card bg-[var(--sgss-navy)] text-white p-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                       <UserIcon className="w-32 h-32 text-white" />
                   </div>
                   <h3 className="font-bold mb-4 flex items-center gap-2 relative z-10 text-white/90">
                       <UserIcon className="w-5 h-5" />
                       Member Details
                   </h3>
                   <div className="space-y-3 relative z-10 text-sm">
                       <div>
                           <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-0.5">Full Name</label>
                           <p className="font-semibold text-lg">{member.name}</p>
                       </div>
                       <div>
                           <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-0.5">Email</label>
                           <p className="text-white/80">{member.email}</p>
                       </div>
                       <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 mt-2">
                           <div>
                                <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-0.5">Membership</label>
                                <p className="text-white/90">{member.membership_type || "—"}</p>
                           </div>
                           <div>
                                <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-0.5">SHIF/SHA No.</label>
                                <p className="text-white/90">{member.shif_number || "—"}</p>
                           </div>
                       </div>
                   </div>
               </div>

                {/* Audit Trail - Timeline Style */}
               <div className="sgss-card bg-white p-6">
                   <h3 className="font-bold text-[var(--sgss-navy)] mb-6 flex items-center gap-2">
                       <ChatBubbleLeftRightIcon className="w-5 h-5 text-[var(--sgss-gold)]" />
                       Audit Trail
                   </h3>
                   <div className="space-y-0 relative border-l-2 border-gray-100 ml-3">
                       {audit.map((entry, idx) => {
                           const when = entry.created_at ? new Date(entry.created_at) : null;
                          const who = entry.actor_name || entry.actor?.full_name || entry.actor?.username || "System";
                          const role = entry.role || entry.actor?.role || "";

                           return (
                               <div key={idx} className="relative pl-6 pb-6 last:pb-0">
                                   <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white box-content bg-[var(--sgss-gold)] shadow-sm"></div>
                                   <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-sm">
                                       <div className="flex justify-between items-start mb-1">
                                           <span className="font-semibold text-[var(--sgss-navy)] capitalize">{entry.action?.replace(/_/g, " ") || "Event"}</span>
                                           <span className="text-[10px] text-gray-400">{when ? when.toLocaleDateString() : ""}</span>
                                       </div>
                                       {entry.note && (
                                           <p className="text-gray-600 italic bg-white p-2 rounded border border-gray-100 border-dashed text-xs mb-2">"{entry.note}"</p>
                                       )}
                                       <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                                           <span className="font-medium text-gray-600">{who}</span>
                                           <span>•</span>
                                           <span className="capitalize">{role.toLowerCase()}</span>
                                            <span>•</span>
                                           <span>{when ? when.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}</span>
                                       </div>
                                   </div>
                               </div>
                           )
                       })}
                       {audit.length === 0 && (
                           <div className="pl-6 text-sm text-gray-500 italic">No audit history recorded.</div>
                       )}
                   </div>
               </div>
          </div>
      </div>
    </PageTransition>
  );
}
