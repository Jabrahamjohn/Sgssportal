// Frontend/src/pages/dashboard/committee/claims.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "~/config/api";
import PageTransition from "~/components/animations/PageTransition";
import Button from "~/components/controls/button";
import Badge from "~/components/controls/badge";
import { 
    FunnelIcon, 
    MagnifyingGlassIcon, 
    ArrowRightIcon, 
    ClipboardDocumentListIcon 
} from "@heroicons/react/24/outline";

interface CommitteeClaim {
  id: string;
  member_name: string;
  membership_type: string | null;
  claim_type: string;
  status: string;
  total_claimed: string;
  total_payable: string;
  member_payable: string;
  created_at: string;
  submitted_at: string | null;
}

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "reviewed", label: "Reviewed" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "paid", label: "Paid" },
];

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "outpatient", label: "Outpatient" },
  { value: "inpatient", label: "Inpatient" },
  { value: "chronic", label: "Chronic" },
];

export default function CommitteeClaimsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [claims, setClaims] = useState<CommitteeClaim[]>([]);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [cType, setCType] = useState(searchParams.get("type") || "");
  const [q, setQ] = useState(searchParams.get("q") || "");

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await api.get("claims/committee/", {
        params: {
          status: status || undefined,
          type: cType || undefined,
          q: q || undefined,
        },
      });
      // Handle potential pagination response structure
      const data = res.data.results || res.data;
      setClaims(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, cType]); // Auto-fetch on drop-down change

  const submitFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const params: any = {};
    if (status) params.status = status;
    if (cType) params.type = cType;
    if (q) params.q = q;
    setSearchParams(params, { replace: true });
    fetchClaims();
  };

  const statusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "approved" || s === "paid") return "success";
    if (s === "rejected") return "danger";
    if (s === "reviewed") return "warning";
    return "info";
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-[var(--sgss-navy)] tracking-tight flex items-center gap-2">
               <ClipboardDocumentListIcon className="w-6 h-6 text-[var(--sgss-gold)]" />
               Claims Registry
           </h1>
           <p className="text-sm text-gray-500 mt-1">Browse and filter all member claims for review.</p>
        </div>
      </div>

      <div className="sgss-card p-0 overflow-hidden bg-white">
          <div className="bg-gray-50/80 p-4 border-b border-gray-100">
             <form onSubmit={submitFilters} className="flex flex-col md:flex-row gap-3">
                 <div className="flex-1 relative">
                     <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                     <input
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--sgss-gold)]/20 focus:border-[var(--sgss-gold)] transition-all"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by member name, SHIF/SHA, or Reference ID..."
                      />
                 </div>
                 <div className="flex items-center gap-2 min-w-[200px]">
                     <FunnelIcon className="w-5 h-5 text-gray-400" />
                     <select
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--sgss-navy)] bg-white"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        {statusOptions.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                 </div>
                 <div className="min-w-[160px]">
                      <select
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--sgss-navy)] bg-white"
                        value={cType}
                        onChange={(e) => setCType(e.target.value)}
                      >
                        {typeOptions.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                 </div>
                 <Button type="submit" className="bg-[var(--sgss-navy)] hover:bg-[var(--sgss-gold)] text-white px-6">
                     Apply
                 </Button>
             </form>
          </div>

        {loading ? (
             <div className="p-8 space-y-4">
                 {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />)}
             </div>
        ) : claims.length === 0 ? (
           <div className="py-16 text-center text-gray-500 flex flex-col items-center">
              <ClipboardDocumentListIcon className="w-12 h-12 text-gray-200 mb-3" />
              <p>No claims match your current filters.</p>
              {(status || cType || q) && (
                  <button 
                    onClick={() => { setStatus(""); setCType(""); setQ(""); }}
                    className="text-[var(--sgss-navy)] text-sm font-medium mt-2 hover:underline"
                  >
                      Clear all filters
                  </button>
              )}
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-white text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Ref</th>
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Claim Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-right">Fund Payable</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {claims.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      #{c.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--sgss-navy)]">{c.member_name}</div>
                      <div className="text-[11px] text-gray-400">
                        {c.membership_type || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">{c.claim_type}</td>
                    <td className="px-6 py-4">
                       <Badge variant={statusColor(c.status)}>{c.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-700">Ksh {Number(c.total_claimed || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-700">Ksh {Number(c.total_payable || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {c.submitted_at
                        ? new Date(c.submitted_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/dashboard/committee/claims/${c.id}`}
                        className="p-2 inline-flex rounded-lg hover:bg-[var(--sgss-bg)] text-gray-400 hover:text-[var(--sgss-navy)] transition-colors"
                      >
                        <ArrowRightIcon className="w-5 h-5" />
                      </Link>
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
